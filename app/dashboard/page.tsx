'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Briefcase, 
  Home, 
  PieChart, 
  Settings, 
  Users, 
  Plus, 
  TrendingUp, 
  Calendar,
  BarChart3 as BarChart
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { auth } from '@/lib/firebase'
import { getUserApplications, type JobApplication } from '@/lib/firebase/applications'
import { 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  LineChart as RechartsLineChart, 
  Line as RechartsLine
} from 'recharts'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { AddJobModal } from '@/components/AddJobModal'
import { JobApplicationsTable } from '@/components/JobApplicationsTable'

export default function Dashboard() {
  const router = useRouter()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [monthlyProgress, setMonthlyProgress] = useState(0)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
    const calculateMonthlyProgress = () => {
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth()
      const currentYear = currentDate.getFullYear()
      
      const monthlyApplications = applications.filter(app => {
        const appDate = new Date(app.applicationDate)
        return appDate.getMonth() === currentMonth && 
               appDate.getFullYear() === currentYear
      })

      // Assuming a monthly goal of 15 applications
      const monthlyGoal = 15
      const progress = Math.min((monthlyApplications.length / monthlyGoal) * 100, 100)
      setMonthlyProgress(Math.round(progress))
    }

    calculateMonthlyProgress()
  }, [applications])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const stats = {
    total: applications.length,
    applied: applications.filter(job => job.status === 'Applied').length,
    interviewing: applications.filter(job => job.status === 'Interviewing').length,
    offered: applications.filter(job => job.status === 'Offered').length,
    rejected: applications.filter(job => job.status === 'Rejected').length,
  }

  const getInsights = () => {
    if (applications.length === 0) return []

    const totalActive = stats.applied + stats.interviewing + stats.offered
    const interviewRate = totalActive > 0 ? (stats.interviewing + stats.offered) / totalActive * 100 : 0
    const offerRate = totalActive > 0 ? stats.offered / totalActive * 100 : 0
    
    const positionCounts = applications.reduce((acc, job) => {
      acc[job.jobTitle] = (acc[job.jobTitle] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const mostApplied = Object.entries(positionCounts)
      .sort((a, b) => b[1] - a[1])[0]

    return [
      { title: 'Interview Rate', value: `${interviewRate.toFixed(1)}%`, icon: Users },
      { title: 'Offer Rate', value: `${offerRate.toFixed(1)}%`, icon: Briefcase },
      { title: 'Most Applied Role', value: mostApplied ? mostApplied[0] : 'N/A', icon: TrendingUp },
      { title: 'Active Applications', value: totalActive.toString(), icon: Calendar },
    ]
  }

  const pieChartData = [
    { name: 'Applied', value: stats.applied },
    { name: 'Interviewing', value: stats.interviewing },
    { name: 'Offered', value: stats.offered },
    { name: 'Rejected', value: stats.rejected }
  ]

  const barChartData = applications
    .filter(app => app.salary)
    .map(app => ({
      name: app.companyName,
      "Salary": app.salary
    }))
    .slice(0, 5)

  const applicationTrendData = applications.reduce((acc: any[], app) => {
    const date = new Date(app.applicationDate)
    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' })
    
    const existingMonth = acc.find(item => item.date === monthYear)
    if (existingMonth) {
      existingMonth.applications++
      if (app.status === 'Interviewing' || app.status === 'Offered') {
        existingMonth.interviews++
      }
    } else {
      acc.push({
        date: monthYear,
        applications: 1,
        interviews: (app.status === 'Interviewing' || app.status === 'Offered') ? 1 : 0
      })
    }
    
    return acc.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [])

  const handleApplicationAdded = async () => {
    if (auth.currentUser) {
      const updatedApplications = await getUserApplications(auth.currentUser.uid)
      setApplications(updatedApplications)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <AddJobModal onApplicationAdded={handleApplicationAdded} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Applications */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Total Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <Progress value={monthlyProgress} className="mt-2" />
            <p className="text-xs text-gray-400 mt-2">
              {monthlyProgress}% of your monthly goal
            </p>
          </CardContent>
        </Card>

        {/* Applied */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Applied</CardTitle>
            <PieChart className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.applied}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-gray-400">Success Rate</p>
              <p className="text-sm font-medium text-green-400">
                {((stats.applied / stats.total) * 100).toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Interviews */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Interviews</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.interviewing}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-gray-400">Conversion Rate</p>
              <p className="text-sm font-medium text-blue-400">
                {((stats.interviewing / stats.applied) * 100).toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Offers */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Offers</CardTitle>
            <BarChart className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.offered}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-gray-400">Success Rate</p>
              <p className="text-sm font-medium text-yellow-400">
                {((stats.offered / stats.interviewing) * 100).toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Applications Table and Status Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Applications */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Last Job Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                No applications yet. Click "Add Job" to get started!
              </p>
            ) : (
              <JobApplicationsTable applications={applications.slice(0, 5)} />
            )}
          </CardContent>
        </Card>

        {/* Application Status Chart */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          index === 0 ? '#10B981' : // emerald-500 for Applied
                          index === 1 ? '#3B82F6' : // blue-500 for Interviewing
                          index === 2 ? '#F59E0B' : // amber-500 for Offered
                          '#EF4444'                 // rose-500 for Rejected
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [value, 'Applications']}
                    contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#F9FAFB' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span style={{ color: '#F9FAFB' }}>{value}</span>}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Third Row: Salary and Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Salary Comparison */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Average Salary Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={barChartData}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF"
                    tick={{ fill: '#F9FAFB' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tick={{ fill: '#F9FAFB' }}
                    tickFormatter={(value) => 
                      new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(value)
                    }
                  />
                  <Tooltip 
                    formatter={(value: number) => 
                      new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(value)
                    }
                    contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#F9FAFB' }}
                  />
                  <Legend 
                    formatter={(value) => <span style={{ color: '#F9FAFB' }}>{value}</span>}
                  />
                  <Bar 
                    dataKey="Salary" 
                    fill="#EAB308"
                    radius={[4, 4, 0, 0]}
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Application Trend */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Application vs Interview Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={applicationTrendData}>
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    tick={{ fill: '#F9FAFB' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tick={{ fill: '#F9FAFB' }}
                  />
                  <Tooltip 
                    contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#F9FAFB' }}
                  />
                  <Legend 
                    formatter={(value) => <span style={{ color: '#F9FAFB' }}>{value}</span>}
                  />
                  <RechartsLine 
                    type="monotone" 
                    dataKey="applications" 
                    stroke="#10B981" 
                    strokeWidth={2}
                  />
                  <RechartsLine 
                    type="monotone" 
                    dataKey="interviews" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
} 