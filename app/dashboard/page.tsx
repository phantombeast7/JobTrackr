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
import { StatsCard } from '@/components/StatsCard'
import { EmptyState } from '@/components/EmptyState'

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
    <div className="min-h-screen w-full overflow-x-hidden bg-black">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">Track your job application progress</p>
          </div>
          <AddJobModal onApplicationAdded={handleApplicationAdded} />
        </div>

        {/* Stats Grid - Responsive for all screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Stats Cards */}
          <StatsCard
            title="Total Applications"
            value={stats.total}
            icon={<Briefcase className="h-5 w-5" />}
            progress={monthlyProgress}
            subtitle={`${monthlyProgress}% of monthly goal`}
            gradient="from-blue-500 to-purple-500"
          />
          <StatsCard
            title="Applied"
            value={stats.applied}
            icon={<PieChart className="h-5 w-5" />}
            metric={`${((stats.applied / stats.total) * 100).toFixed(1)}%`}
            subtitle="Success Rate"
            gradient="from-emerald-500 to-teal-500"
          />
          <StatsCard
            title="Interviews"
            value={stats.interviewing}
            icon={<Users className="h-5 w-5" />}
            metric={`${((stats.interviewing / stats.applied) * 100).toFixed(1)}%`}
            subtitle="Conversion Rate"
            gradient="from-orange-500 to-amber-500"
          />
          <StatsCard
            title="Offers"
            value={stats.offered}
            icon={<BarChart className="h-5 w-5" />}
            metric={`${((stats.offered / stats.interviewing) * 100).toFixed(1)}%`}
            subtitle="Success Rate"
            gradient="from-pink-500 to-rose-500"
          />
        </div>

        {/* Charts and Tables Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Recent Applications */}
          <Card className="bg-black border border-[#1a1a1a] hover:border-[#333333] transition-colors overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl text-white">Recent Applications</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-[#333333] text-white hover:bg-[#1a1a1a] backdrop-blur-sm"
                  onClick={() => router.push('/applications')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {applications.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
                  </div>
                ) : (
                  <JobApplicationsTable applications={applications.slice(0, 5)} />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Application Status Chart */}
          <Card className="bg-black border border-[#1a1a1a] hover:border-[#333333] transition-colors overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-white">Application Status</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="h-[300px] sm:h-[400px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="80%"
                      fill="#ffffff"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            index === 0 ? '#3B82F6' : // blue-500
                            index === 1 ? '#10B981' : // emerald-500
                            index === 2 ? '#F59E0B' : // amber-500
                            '#EC4899'                 // pink-500
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: '#000000', 
                        border: '1px solid #1a1a1a', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#ffffff' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => <span style={{ color: '#ffffff' }}>{value}</span>}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Salary Chart */}
          <Card className="bg-black border border-[#1a1a1a] hover:border-[#333333] transition-colors overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10" />
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-white">Salary Insights</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="h-[300px] sm:h-[400px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={barChartData}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#666666"
                      tick={{ fill: '#ffffff', fontSize: 12 }}
                      tickLine={{ stroke: '#333333' }}
                    />
                    <YAxis 
                      stroke="#666666"
                      tick={{ fill: '#ffffff', fontSize: 12 }}
                      tickLine={{ stroke: '#333333' }}
                      tickFormatter={(value) => `$${value/1000}k`}
                    />
                    <Tooltip 
                      cursor={{ fill: '#1a1a1a' }}
                      contentStyle={{ 
                        background: '#000000', 
                        border: '1px solid #1a1a1a',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#ffffff' }}
                    />
                    <Bar 
                      dataKey="Salary" 
                      fill="url(#barGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#1D4ED8" />
                      </linearGradient>
                    </defs>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Application Trend */}
          <Card className="bg-black border border-[#1a1a1a] hover:border-[#333333] transition-colors overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10" />
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-white">Application Trends</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="h-[300px] sm:h-[400px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={applicationTrendData}>
                    <XAxis 
                      dataKey="date" 
                      stroke="#666666"
                      tick={{ fill: '#ffffff', fontSize: 12 }}
                      tickLine={{ stroke: '#333333' }}
                    />
                    <YAxis 
                      stroke="#666666"
                      tick={{ fill: '#ffffff', fontSize: 12 }}
                      tickLine={{ stroke: '#333333' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#000000', 
                        border: '1px solid #1a1a1a',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#ffffff' }}
                    />
                    <Legend formatter={(value) => <span style={{ color: '#ffffff' }}>{value}</span>} />
                    <RechartsLine 
                      type="monotone" 
                      dataKey="applications" 
                      stroke="url(#lineGradient1)"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6' }}
                    />
                    <RechartsLine 
                      type="monotone" 
                      dataKey="interviews" 
                      stroke="url(#lineGradient2)"
                      strokeWidth={2}
                      dot={{ fill: '#10B981' }}
                    />
                    <defs>
                      <linearGradient id="lineGradient1" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#1D4ED8" />
                      </linearGradient>
                      <linearGradient id="lineGradient2" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 