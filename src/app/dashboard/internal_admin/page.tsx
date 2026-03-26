'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Users, 
  School, 
  BarChart3, 
  FileText, 
  BookOpen,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Settings,
  LogOut,
  Plus,
  Eye,
  AlertTriangle,
  Zap,
  Globe,
  Award
} from 'lucide-react'
import Link from 'next/link'

export default function InternalAdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API calls
    setTimeout(() => {
      setUser({
        id: '3',
        name: 'Admin User',
        email: 'admin@idsn.edu',
        role: 'INTERNAL_ADMIN',
        department: 'Platform Management'
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
                <Shield className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">IDSN Portal</span>
              </div>
              <Badge variant="outline" className="text-red-600 border-red-600">
                Internal Admin
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
            <Link href="/dashboard/internal_admin" className="flex items-center space-x-2 px-3 py-2 rounded-md bg-blue-50 text-blue-600">
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link href="/dashboard/internal_admin/schools" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50">
              <School className="w-5 h-5" />
              <span>Schools</span>
            </Link>
            <Link href="/dashboard/internal_admin/users" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50">
              <Users className="w-5 h-5" />
              <span>Users</span>
            </Link>
            <Link href="/dashboard/internal_admin/certifications" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50">
              <Award className="w-5 h-5" />
              <span>Certifications</span>
            </Link>
            <Link href="/dashboard/internal_admin/courses" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50">
              <BookOpen className="w-5 h-5" />
              <span>Courses</span>
            </Link>
            <Link href="/dashboard/internal_admin/analytics" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50">
              <TrendingUp className="w-5 h-5" />
              <span>Analytics</span>
            </Link>
            <Link href="/dashboard/internal_admin/settings" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Admin Overview */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Platform management and oversight</p>
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                <School className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">10,234</div>
                <p className="text-xs text-gray-500">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">52,456</div>
                <p className="text-xs text-gray-500">+8% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Certificates</CardTitle>
                <Award className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-gray-500">+15% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <Zap className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹25.6L</div>
                <p className="text-xs text-gray-500">+20% from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">Add School</CardTitle>
                  <CardDescription>Register a new school</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add School
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">Create Course</CardTitle>
                  <CardDescription>Add new training content</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">View Reports</CardTitle>
                  <CardDescription>Generate platform reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">System Settings</CardTitle>
                  <CardDescription>Configure platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* System Health */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Database
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status</span>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Uptime</span>
                      <span>99.9%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Response Time</span>
                      <span>45ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    API Server
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status</span>
                      <Badge className="bg-green-100 text-green-800">Operational</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Requests/min</span>
                      <span>1,234</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Error Rate</span>
                      <span>0.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Storage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Used</span>
                      <span>78.5%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Available</span>
                      <span>21.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activities */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activities</h2>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200">
                  <div className="p-4 flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <School className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New school registered: St. Mary's School, Mumbai</p>
                      <p className="text-xs text-gray-500">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center space-x-4">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Award className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Digital Excellence Certificate issued to Delhi Public School</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center space-x-4">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Bulk user import completed: 250 educators added</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center space-x-4">
                    <div className="p-2 bg-red-100 rounded-full">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">System backup completed with warnings</p>
                      <p className="text-xs text-gray-500">3 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}