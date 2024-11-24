'use client'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { addApplication } from '@/lib/firebase/applications'
import { auth } from '@/lib/firebase'
import { Plus } from 'lucide-react'
import { tokenStorage } from '@/lib/tokenStorage'
import { Progress } from '@/components/ui/progress'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export function AddApplicationModal({ onApplicationAdded }: { onApplicationAdded: () => void }) {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [driveAuthorized, setDriveAuthorized] = useState(() => tokenStorage.isAuthorized())
  const [authWindow, setAuthWindow] = useState<Window | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setDriveAuthorized(tokenStorage.isAuthorized())
  }, [])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'GOOGLE_DRIVE_AUTH_SUCCESS') {
        const tokens = event.data.tokens;
        const expiryDate = Date.now() + (tokens.expires_in || 3600) * 1000;
        tokenStorage.setTokens({ ...tokens, expiry_date: expiryDate });
        setDriveAuthorized(true);
        authWindow?.close();
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [authWindow])

  const handleDriveAuth = async () => {
    if (tokenStorage.isAuthorized()) {
      setDriveAuthorized(true);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('/api/auth/google-drive/authorize', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        cache: 'no-store', // Prevent caching
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.authUrl) {
        throw new Error('No authorization URL received');
      }

      // Log the auth URL for debugging (remove in production)
      console.log('Auth URL:', data.authUrl);

      const width = 600;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        data.authUrl,
        'Google Drive Authorization',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        throw new Error('Popup was blocked. Please allow popups for this site.');
      }

      setAuthWindow(popup);
    } catch (error) {
      let errorMessage = 'Failed to initiate Google Drive authorization';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      console.error('Error initiating Google Drive auth:', error);
      toast.error(errorMessage);
      setDriveAuthorized(false);
    }
  };

  const resetForm = () => {
    setResumeFile(null)
    setIsOpen(false)
    setProgress(0)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error('User not authenticated.');
      return;
    }

    if (resumeFile && !driveAuthorized) {
      await handleDriveAuth();
      return;
    }

    setLoading(true);
    setProgress(20); // Start progress
    const formData = new FormData(e.currentTarget);
    
    try {
      let resumeUrl = '';
      if (resumeFile && driveAuthorized) {
        const tokens = tokenStorage.getTokens();
        if (!tokens) {
          throw new Error('No Google Drive tokens found');
        }

        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', resumeFile);
          uploadFormData.append('companyName', formData.get('companyName') as string);
          uploadFormData.append('userId', auth.currentUser.uid);
          uploadFormData.append('accessToken', tokens.access_token);

          const uploadResponse = await fetch('/api/google-drive/upload', {
            method: 'POST',
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || 'Upload failed');
          }
          
          const { fileId } = await uploadResponse.json();
          if (fileId) {
            resumeUrl = fileId;
            setProgress(60); // Update progress after successful upload
          } else {
            console.warn('File uploaded but no fileId received');
          }
        } catch (uploadError) {
          // Log the upload error but continue with application submission
          console.warn('Resume upload error:', uploadError);
          toast.warn('Resume upload failed, but continuing with application submission');
        }
      }

      setProgress(80); // Progress before final submission

      const applicationData = {
        userId: auth.currentUser.uid,
        companyName: formData.get('companyName') as string,
        jobTitle: formData.get('jobTitle') as string,
        status: formData.get('status') as 'Applied' | 'Interviewing' | 'Offered' | 'Rejected',
        applicationDate: (formData.get('applicationDate') as string) || new Date().toISOString().split('T')[0],
        salary: Number(formData.get('salary')) || undefined,
        notes: formData.get('notes') as string,
        resumeUrl,
        location: formData.get('location') as string,
      };

      // Validate required fields
      if (!applicationData.companyName || !applicationData.jobTitle || !applicationData.status) {
        throw new Error('Please fill in all required fields');
      }

      await addApplication(applicationData);
      
      setProgress(100); // Complete progress
      toast.success('Application added successfully!');
      onApplicationAdded();
      resetForm();
      e.currentTarget.reset();
    } catch (error) {
      let errorMessage = 'Error adding application';
      if (error instanceof Error) {
        if (error.message.includes('authorization')) {
          setDriveAuthorized(false);
          tokenStorage.clearTokens();
          errorMessage = 'Google Drive authorization expired. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      console.warn('Error in submission:', error); // Changed from console.error to console.warn
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
          onClick={() => setIsOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Application
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Add New Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Progress value={progress} className="mb-4" />
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="Enter company name"
              required
              className="bg-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobTitle">Position</Label>
            <Input
              id="jobTitle"
              name="jobTitle"
              placeholder="Enter job position"
              required
              className="bg-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue="Applied" required>
              <SelectTrigger className="bg-gray-700">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Applied">Applied</SelectItem>
                <SelectItem value="Interviewing">Interviewing</SelectItem>
                <SelectItem value="Offered">Offered</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicationDate">Date Applied</Label>
            <Input
              id="applicationDate"
              name="applicationDate"
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              required
              className="bg-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="Enter job location"
              className="bg-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">Salary</Label>
            <Input
              id="salary"
              name="salary"
              type="number"
              placeholder="Enter salary (optional)"
              className="bg-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Add any notes about this application"
              className="bg-gray-700 min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  setResumeFile(e.target.files?.[0] || null)
                }}
                className="bg-gray-700"
              />
              {resumeFile && !driveAuthorized && (
                <Button
                  type="button"
                  onClick={handleDriveAuth}
                  variant="outline"
                  className="whitespace-nowrap text-yellow-400 border-yellow-400 hover:bg-yellow-400/10"
                >
                  Authorize Drive
                </Button>
              )}
              {resumeFile && driveAuthorized && (
                <span className="text-sm text-green-400">
                  ✓ Ready
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Supported formats: PDF, DOC, DOCX
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={loading || Boolean(resumeFile && !driveAuthorized)}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900"
          >
            {loading ? 'Adding...' : 'Add Application'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 