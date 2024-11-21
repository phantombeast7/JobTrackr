'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ResumeViewerModalProps {
  resumeUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ResumeViewerModal({ resumeUrl, isOpen, onClose }: ResumeViewerModalProps) {
  // Convert Google Drive file ID to embedded viewer URL
  const embedUrl = `https://drive.google.com/file/d/${resumeUrl}/preview`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] h-[80vh] bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Resume Preview</DialogTitle>
        </DialogHeader>
        <div className="flex-1 w-full h-full min-h-[500px] rounded-lg overflow-hidden">
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            allow="autoplay"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 