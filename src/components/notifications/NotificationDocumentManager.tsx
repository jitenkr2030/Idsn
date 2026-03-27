'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Bell, 
  Upload, 
  Search, 
  FileText, 
  Download, 
  Trash2, 
  Eye,
  Calendar,
  Filter,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info,
  Award,
  BookOpen,
  Users,
  Settings
} from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'SYSTEM' | 'CERTIFICATION' | 'COURSE_UPDATE' | 'ACHIEVEMENT' | 'REMINDER' | 'ANNOUNCEMENT' | 'ALERT'
  isRead: boolean
  actionUrl?: string
  metadata?: string
  createdAt: string
}

interface DocumentItem {
  id: string
  title: string
  description?: string
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
  category: string
  isPublic: boolean
  createdAt: string
  submission?: {
    id: string
    status: string
    submittedAt: string
  }
}

export default function NotificationDocumentManager() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [notificationsRes, documentsRes] = await Promise.all([
        fetch('/api/notifications'),
        fetch('/api/documents')
      ])

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json()
        setNotifications(notificationsData.notifications)
        setUnreadCount(notificationsData.unreadCount)
      }

      if (documentsRes.ok) {
        const documentsData = await documentsRes.json()
        setDocuments(documentsData.documents)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationIds?: string[]) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationIds,
          markAll: !notificationIds
        })
      })

      // Refresh notifications
      fetchData()
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('title', file.name)
      formData.append('category', 'General')
      formData.append('file', file)
      formData.append('isPublic', 'false')

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        fetchData()
      } else {
        console.error('Failed to upload document')
      }
    } catch (error) {
      console.error('Error uploading document:', error)
    } finally {
      setUploading(false)
    }
  }

  const deleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId))
      } else {
        console.error('Failed to delete document')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SYSTEM': return <Settings className="w-4 h-4" />
      case 'CERTIFICATION': return <Award className="w-4 h-4" />
      case 'COURSE_UPDATE': return <BookOpen className="w-4 h-4" />
      case 'ACHIEVEMENT': return <Award className="w-4 h-4" />
      case 'REMINDER': return <Calendar className="w-4 h-4" />
      case 'ANNOUNCEMENT': return <Info className="w-4 h-4" />
      case 'ALERT': return <AlertTriangle className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ALERT': return 'border-red-200 bg-red-50'
      case 'ACHIEVEMENT': return 'border-green-200 bg-green-50'
      case 'CERTIFICATION': return 'border-blue-200 bg-blue-50'
      case 'REMINDER': return 'border-yellow-200 bg-yellow-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`
  }

  const categories = [
    'General', 'Certification', 'Training', 'Policy', 'Templates', 'Reports'
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notifications & Documents</h2>
          <p className="text-muted-foreground">
            Stay updated and manage your important documents
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="flex items-center space-x-1">
              <Bell className="w-3 h-3" />
              <span>{unreadCount} unread</span>
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="documents">Document Vault</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          {/* Notification Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => markAsRead()}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark All as Read
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {notifications.length} total notifications
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                  <p className="text-muted-foreground">
                    You're all caught up! Check back later for updates.
                  </p>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`${getNotificationColor(notification.type)} ${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm">{notification.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        {notification.actionUrl && (
                          <Button variant="outline" size="sm" className="mt-2">
                            View Details
                          </Button>
                        )}
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          {/* Document Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Upload Document</span>
              </CardTitle>
              <CardDescription>
                Upload important documents for safe keeping and easy access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button 
                  asChild 
                  variant="outline"
                  disabled={uploading}
                >
                  <label htmlFor="file-upload" className="cursor-pointer flex items-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
                  </label>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Search & Filter</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('')
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <div className="space-y-4">
            {documents.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
                  <p className="text-muted-foreground">
                    Upload your first document to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              documents.map((document) => (
                <Card key={document.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{document.title}</h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>{formatFileSize(document.fileSize)}</span>
                            <span>•</span>
                            <span>{document.category}</span>
                            <span>•</span>
                            <span>{new Date(document.createdAt).toLocaleDateString()}</span>
                          </div>
                          {document.description && (
                            <p className="text-sm text-gray-600 mt-1">{document.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteDocument(document.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}