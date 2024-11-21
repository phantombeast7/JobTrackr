'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, Edit2, FileText, Flag, Trash2 } from 'lucide-react'
import { AddApplicationModal } from '@/components/AddApplicationModal'
import { ApplicationsTable } from '@/components/ApplicationsTable'
import { getUserApplications } from '@/lib/firebase/applications'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { JobApplication } from "@/lib/firebase/applications"

export default function Applications() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/')
        return
      }

      try {
        const userApplications = await getUserApplications(user.uid)
        setApplications(userApplications)
      } catch (error) {
        console.error('Error fetching applications:', error)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleApplicationAdded = async () => {
    if (auth.currentUser) {
      const updatedApplications = await getUserApplications(auth.currentUser.uid)
      setApplications(updatedApplications)
    }
  }

  const filteredApplications = applications.filter(app => 
    app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Applications</h1>
        <AddApplicationModal onApplicationAdded={handleApplicationAdded} />
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search applications..."
                className="pl-8 bg-gray-700 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ApplicationsTable applications={filteredApplications} onUpdate={handleApplicationAdded} />
        </CardContent>
      </Card>
    </>
  )
} 