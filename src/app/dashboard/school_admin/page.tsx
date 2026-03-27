'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  School, 
  Users, 
  Award, 
  BarChart3, 
  BookOpen,
  CheckCircle,
  Star,
  TrendingUp,
  Settings,
  LogOut
} from 'lucide-react'
import Link from 'next/link'

export default function SchoolAdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [school, setSchool] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API calls
    setTimeout(() => {
      setUser({
        id: '1',
        name: 'Rajesh Kumar',
        email: 'rajesh@school.edu',
        role: 'SCHOOL_ADMIN'
      })
      
      setSchool({
        id: '1',
        name: 'Delhi Public School',
        city: 'New Delhi',
        state: 'Delhi',
        membershipTier: 'GOLD',
        idsnRating: 4,
        isVerified: true,
        studentCount: 2500,
        teacherCount: 150
      })
      setLoading(false)
    }, 1000)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('auth-token')
    localStorage.removeItem('user-role')
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <School className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">IDSN Portal</span>
              </div>
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                School Admin
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white h-screen border-r border-gray-200 p-4">
          <nav className="space-y-2">
            <Link href="/dashboard/school_admin" className="flex items-center space-x-2 px-3 py-2 rounded-md bg-blue-50 text-blue-600">
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link href="/dashboard/school_admin/certification" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50">
              <Award className="w-5 h-5" />
              <span>Certification</span>
            </Link>
            <Link href="/dashboard/school_admin/training" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50">
              <BookOpen className="w-5 h-5" />
              <span>Training</span>
            </Link>
            <Link href="/dashboard/school_admin/staff" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50">
              <Users className="w-5 h-5" />
              <span>Staff Management</span>
            </Link>
            <Link href="/dashboard/school_admin/analytics" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50">
              <TrendingUp className="w-5 h-5" />
              <span>Analytics</span>
            </Link>
            <Link href="/dashboard/school_admin/settings" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* School Overview */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{school?.name}</h1>
                <p className="text-gray-600">{school?.city}, {school?.state}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
                <Badge className="bg-purple-100 text-purple-800">
                  {school?.membershipTier} Member
                </Badge>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">IDSN Rating</CardTitle>
                  <Star className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{school?.idsnRating}/5</div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < (school?.idsnRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Students</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{school?.studentCount.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">Total enrolled</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Teachers</CardTitle>
                  <Users className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{school?.teacherCount}</div>
                  <p className="text-xs text-gray-500">Total staff</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Membership</CardTitle>
                  <Award className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{school?.membershipTier}</div>
                  <p className="text-xs text-gray-500">Current tier</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">Start Certification</CardTitle>
                    <CardDescription>Begin your digital school assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <Award className="w-4 h-4 mr-2" />
                      Get Certified
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">Enroll Staff</CardTitle>
                    <CardDescription>Add teachers to training programs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Staff
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">View Progress</CardTitle>
                    <CardDescription>Track your digital transformation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200">
                    <div className="p-4 flex items-center space-x-4">
                      <div className="p-2 bg-green-100 rounded-full">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">School verification completed</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="p-4 flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Award className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Digital Excellence Certificate earned</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                    <div className="p-4 flex items-center space-x-4">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Users className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">5 teachers enrolled in training</p>
                        <p className="text-xs text-gray-500">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}