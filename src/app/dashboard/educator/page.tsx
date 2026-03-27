'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BookOpen, 
  Users, 
  Award, 
  BarChart3, 
  FileText, 
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Settings,
  LogOut,
  Play,
  Download,
  Calendar,
  Target,
  Zap
} from 'lucide-react'
import Link from 'next/link'

export default function EducatorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API calls
    setTimeout(() => {
      setUser({
        id: '2',
        name: 'Priya Sharma',
        email: 'priya@school.edu',
        role: 'EDUCATOR',
        school: {
          name: 'Delhi Public School',
          city: 'New Delhi'
        },
        isCertified: true,
        completedCourses: 12,
        totalPoints: 850
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
                <BookOpen className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">IDSN Portal</span>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Educator
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
            <Link href="/dashboard/educator" className="flex items-center space-x-2 px-3 py-2 rounded-md bg-blue-50 text-blue-600">
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link href="/dashboard/educator/courses" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50">
              <BookOpen className="w-5 h-5" />
              <span>My Courses</span>
            </Link>
            <Link href="/dashboard/educator/certificates" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50">
              <Award className="w-5 h-5" />
              <span>Certificates</span>
            </Link>
            <Link href="/dashboard/educator/resources" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50">
              <FileText className="w-5 h-5" />
              <span>Resources</span>
            </Link>
            <Link href="/dashboard/educator/progress" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50">
              <TrendingUp className="w-5 h-5" />
              <span>Progress</span>
            </Link>
            <Link href="/dashboard/educator/settings" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* User Overview */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
                <p className="text-gray-600">{user?.school?.name} • {user?.school?.city}</p>
              </div>
              <div className="flex items-center space-x-2">
                {user?.isCertified && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Certified Educator
                  </Badge>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Points</CardTitle>
                  <Zap className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user?.totalPoints}</div>
                  <p className="text-xs text-gray-500">Total earned</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user?.completedCourses}</div>
                  <p className="text-xs text-gray-500">Completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Certificates</CardTitle>
                  <Award className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-gray-500">Earned</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rank</CardTitle>
                  <Star className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Gold</div>
                  <p className="text-xs text-gray-500">Current level</p>
                </CardContent>
              </Card>
            </div>

            {/* Continue Learning */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Continue Learning</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Digital Literacy Fundamentals</CardTitle>
                      <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                    </div>
                    <CardDescription>Master essential digital skills for modern education</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                      <Button className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Continue Learning
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Technology Integration</CardTitle>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>
                    <CardDescription>Learn to integrate technology effectively in teaching</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                      <Button variant="outline" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download Certificate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recommended Courses */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">AI in Education</CardTitle>
                    <CardDescription>Explore artificial intelligence in teaching</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-purple-100 text-purple-800">Advanced</Badge>
                      <span className="text-sm text-gray-500">8 weeks</span>
                    </div>
                    <Button className="w-full mt-4">
                      <Target className="w-4 h-4 mr-2" />
                      Enroll Now
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">Assessment Strategies</CardTitle>
                    <CardDescription>Modern assessment techniques for educators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-100 text-green-800">Intermediate</Badge>
                      <span className="text-sm text-gray-500">6 weeks</span>
                    </div>
                    <Button className="w-full mt-4">
                      <Target className="w-4 h-4 mr-2" />
                      Enroll Now
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">Digital Classroom Management</CardTitle>
                    <CardDescription>Manage your digital classroom effectively</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-100 text-blue-800">Beginner</Badge>
                      <span className="text-sm text-gray-500">4 weeks</span>
                    </div>
                    <Button className="w-full mt-4">
                      <Target className="w-4 h-4 mr-2" />
                      Enroll Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Upcoming Events */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200">
                    <div className="p-4 flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Digital Teaching Workshop</p>
                        <p className="text-xs text-gray-500">March 25, 2024 • 2:00 PM</p>
                      </div>
                      <Button size="sm" variant="outline">Register</Button>
                    </div>
                    <div className="p-4 flex items-center space-x-4">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Calendar className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">AI in Education Webinar</p>
                        <p className="text-xs text-gray-500">March 28, 2024 • 3:00 PM</p>
                      </div>
                      <Button size="sm" variant="outline">Register</Button>
                    </div>
                    <div className="p-4 flex items-center space-x-4">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Calendar className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Certification Exam</p>
                        <p className="text-xs text-gray-500">April 1, 2024 • 10:00 AM</p>
                      </div>
                      <Button size="sm" variant="outline">Register</Button>
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