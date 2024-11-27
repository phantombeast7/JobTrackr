'use client'
import { useState, useEffect, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Briefcase, RefreshCw, Activity, Trophy, Users } from 'lucide-react'
import { ApplicationsTable } from '@/components/ApplicationsTable'
import { getUserApplications } from '@/lib/firebase/applications'
import { auth } from '@/lib/firebase'
import { useRouter, useSearchParams } from 'next/navigation'
import { JobApplication } from "@/lib/firebase/applications"
import { motion } from 'framer-motion'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { AddApplicationModal } from '@/components/AddApplicationModal'

// Create a wrapper component that uses searchParams
function ApplicationsPageContent() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const searchParams = useSearchParams()

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

  useEffect(() => {
    if (searchParams.get('openAddModal') === 'true') {
      setIsAddModalOpen(true)
    }
  }, [searchParams])

  const handleApplicationAdded = async () => {
    if (auth.currentUser) {
      const updatedApplications = await getUserApplications(auth.currentUser.uid)
      setApplications(updatedApplications)
    }
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
  }

  const filteredApplications = applications.filter((app: JobApplication) => {
    const matchesSearch = 
      app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = 
      statusFilter === 'all' || 
      app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-black">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full space-y-6"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Applications</h1>
                <p className="text-gray-400 mt-1">Track and manage your job applications</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-black border border-[#1a1a1a] hover:border-[#333333] transition-colors overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400">Total Applications</p>
                    <Briefcase className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">{applications.length}</p>
                </CardContent>
              </Card>

              <Card className="bg-black border border-[#1a1a1a] hover:border-[#333333] transition-colors overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10" />
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400">Active Applications</p>
                    <Activity className="h-5 w-5 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">
                    {applications.filter(app => app.status !== 'Rejected').length}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black border border-[#1a1a1a] hover:border-[#333333] transition-colors overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10" />
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400">Interviews</p>
                    <Users className="h-5 w-5 text-orange-400" />
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">
                    {applications.filter(app => app.status === 'Interviewing').length}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black border border-[#1a1a1a] hover:border-[#333333] transition-colors overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10" />
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400">Offers</p>
                    <Trophy className="h-5 w-5 text-pink-400" />
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">
                    {applications.filter(app => app.status === 'Offered').length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="bg-black border border-[#1a1a1a] hover:border-[#333333] transition-colors overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
            <CardHeader className="border-b border-[#1a1a1a]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search by company or position..."
                    className="pl-10 bg-[#1a1a1a] border-[#333333] text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-[180px] bg-[#1a1a1a] border-[#333333] text-white">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Applied">Applied</SelectItem>
                      <SelectItem value="Interviewing">Interviewing</SelectItem>
                      <SelectItem value="Offered">Offered</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline"
                    size="icon"
                    className="border-[#333333] text-white hover:bg-[#1a1a1a]"
                    onClick={handleResetFilters}
                    title="Reset filters"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <ApplicationsTable 
                  applications={filteredApplications} 
                  onUpdate={handleApplicationAdded}
                  loading={loading}
                />
              </div>
            </CardContent>
          </Card>

          <AddApplicationModal 
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onApplicationAdded={handleApplicationAdded}
          />
        </motion.div>
      </div>
    </div>
  )
}

// Main component with Suspense
export default function ApplicationsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    }>
      <ApplicationsPageContent />
    </Suspense>
  )
} 