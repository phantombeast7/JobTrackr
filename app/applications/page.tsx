'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { AddApplicationModal } from '@/components/AddApplicationModal'
import { ApplicationsTable } from '@/components/ApplicationsTable'
import { getUserApplications } from '@/lib/firebase/applications'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { JobApplication } from "@/lib/firebase/applications"
import { motion } from 'framer-motion'

export default function ApplicationsPage() {
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
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full space-y-6"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Applications</h1>
            <AddApplicationModal onApplicationAdded={handleApplicationAdded} />
          </div>

          <Card className="bg-gray-800 border-gray-700 w-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search applications..."
                    className="pl-8 bg-gray-700 text-white border-gray-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <ApplicationsTable applications={filteredApplications} onUpdate={handleApplicationAdded} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 