'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Home, 
  Award, 
  BookOpen, 
  Users, 
  Settings, 
  LogOut,
  School,
  Star,
  TrendingUp,
  Calendar,
  Bell
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import CertificationModule from '@/components/certification/CertificationModule'
import MembershipManagement from '@/components/membership/MembershipManagement'
import TrainingModule from '@/components/training/TrainingModule'
import ProgressTracker from '@/components/progress/ProgressTracker'
import NotificationDocumentManager from '@/components/notifications/NotificationDocumentManager'

interface DashboardProps {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  const navigation = [
    { id: 'overview', label: 'Overview', icon: <Home className="w-4 h-4" /> },
    { id: 'certification', label: 'Certification', icon: <Award className="w-4 h-4" /> },
    { id: 'training', label: 'Training', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'membership', label: 'Membership', icon: <Users className="w-4 h-4" /> },
    { id: 'progress', label: 'Progress', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ]

  const stats = [
    {
      title: "IDSN Rating",
      value: "4 Stars",
      icon: <Star className="w-5 h-5 text-yellow-500" />,
      change: "+1 from last year"
    },
    {
      title: "Courses Completed",
      value: "12",
      icon: <BookOpen className="w-5 h-5 text-blue-500" />,
      change: "+3 this month"
    },
    {
      title: "ID Points",
      value: "2,450",
      icon: <TrendingUp className="w-5 h-5 text-green-500" />,
      change: "+150 this week"
    },
    {
      title: "Next Renewal",
      value: "Mar 2025",
      icon: <Calendar className="w-5 h-5 text-orange-500" />,
      change: "In 5 months"
    }
  ]

  const recentActivity = [
    {
      title: "Completed Digital Infrastructure Audit",
      date: "2 days ago",
      type: "certification"
    },
    {
      title: "Enrolled in AI in Classroom course",
      date: "1 week ago",
      type: "training"
    },
    {
      title: "Achieved Silver Membership",
      date: "2 weeks ago",
      type: "achievement"
    },
    {
      title: "Joined Educator Network",
      date: "1 month ago",
      type: "network"
    }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'certification':
        return <CertificationModule />
      
      case 'training':
        return <TrainingModule />
      
      case 'membership':
        return <MembershipManagement />
      
      case 'progress':
        return <ProgressTracker />
      
      case 'notifications':
        return <NotificationDocumentManager />
      
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {user?.name}!
              </h2>
              <p className="text-muted-foreground">
                Here's what's happening with your IDSN certification journey.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    {stat.icon}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Get started with these common tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Button 
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    variant="outline"
                    onClick={() => setActiveTab('certification')}
                  >
                    <Award className="w-8 h-8" />
                    <span>Start Certification</span>
                  </Button>
                  <Button 
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    variant="outline"
                    onClick={() => setActiveTab('training')}
                  >
                    <BookOpen className="w-8 h-8" />
                    <span>Browse Courses</span>
                  </Button>
                  <Button 
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    variant="outline"
                    onClick={() => setActiveTab('network')}
                  >
                    <Users className="w-8 h-8" />
                    <span>Find Educators</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.date}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <School className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">IDSN Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">{user?.name}</span>
                <Badge variant="secondary">{user?.role.replace('_', ' ')}</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}