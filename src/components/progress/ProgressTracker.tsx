'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Award, 
  BookOpen, 
  Clock, 
  Target,
  Download,
  Search,
  Filter,
  FileText,
  Video,
  Image,
  File,
  Monitor,
  Calendar,
  Star,
  Zap,
  Loader2,
  Trophy,
  CheckCircle
} from 'lucide-react'

interface ProgressData {
  overview: {
    totalCourses: number
    completedCourses: number
    totalProgress: number
    totalPoints: number
    totalStudyTime: number
    certificates: number
    achievements: number
  }
  progressByCategory: Record<string, {
    totalCourses: number
    completedCourses: number
    averageProgress: number
    totalPoints: number
  }>
  enrollments: Array<{
    id: string
    course: {
      id: string
      title: string
      category: string
      level: string
      duration: number
      points: number
    }
    progress: number
    startedAt: string
    completedAt?: string
    lastActivity: number
  }>
  certificates: Array<{
    id: string
    title: string
    type: string
    rating?: number
    issuedDate: string
  }>
  achievements: Array<{
    id: string
    title: string
    type: string
    points: number
    earnedAt: string
  }>
  recentActivity: Array<{
    type: string
    title: string
    date: string
    icon: string
  }>
}

interface Resource {
  id: string
  title: string
  description: string
  category: string
  type: 'DOCUMENT' | 'VIDEO' | 'TEMPLATE' | 'WHITEPAPER' | 'LESSON_PLAN' | 'POLICY_GUIDE' | 'SOFTWARE_TOOL'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  isPublic: boolean
  isPremium: boolean
  downloadCount: number
  createdAt: string
}

export default function ProgressTracker() {
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [progressRes, resourcesRes] = await Promise.all([
        fetch('/api/progress'),
        fetch('/api/resources')
      ])

      if (progressRes.ok) {
        const progressData = await progressRes.json()
        setProgressData(progressData.progress)
      }

      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json()
        setResources(resourcesData.resources)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (resourceId: string, fileUrl?: string) => {
    setDownloading(resourceId)
    try {
      // In a real implementation, you would handle file download properly
      // For now, we'll simulate the download
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update download count
      setResources(prev => prev.map(r => 
        r.id === resourceId 
          ? { ...r, downloadCount: r.downloadCount + 1 }
          : r
      ))
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setDownloading(null)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'DOCUMENT': return <FileText className="w-4 h-4" />
      case 'VIDEO': return <Video className="w-4 h-4" />
      case 'TEMPLATE': return <File className="w-4 h-4" />
      case 'WHITEPAPER': return <FileText className="w-4 h-4" />
      case 'LESSON_PLAN': return <BookOpen className="w-4 h-4" />
      case 'POLICY_GUIDE': return <Monitor className="w-4 h-4" />
      case 'SOFTWARE_TOOL': return <Monitor className="w-4 h-4" />
      default: return <File className="w-4 h-4" />
    }
  }

  const getActivityIcon = (icon: string) => {
    switch (icon) {
      case 'book': return <BookOpen className="w-4 h-4" />
      case 'award': return <Award className="w-4 h-4" />
      case 'trophy': return <Trophy className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  const categories = [
    'Digital Infrastructure',
    'Teaching Resources',
    'Assessment Tools',
    'Policy Templates',
    'Training Materials',
    'Case Studies',
    'Best Practices',
    'Technical Guides'
  ]

  const types = [
    'DOCUMENT', 'VIDEO', 'TEMPLATE', 'WHITEPAPER', 
    'LESSON_PLAN', 'POLICY_GUIDE', 'SOFTWARE_TOOL'
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
          <h2 className="text-2xl font-bold">Progress & Resources</h2>
          <p className="text-muted-foreground">
            Track your learning journey and access exclusive resources
          </p>
        </div>
      </div>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList>
          <TabsTrigger value="progress">My Progress</TabsTrigger>
          <TabsTrigger value="resources">Resource Library</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          {progressData && (
            <>
              {/* Overview Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{progressData.overview.totalProgress}%</div>
                    <p className="text-xs text-muted-foreground">
                      {progressData.overview.completedCourses} of {progressData.overview.totalCourses} courses
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">ID Points</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{progressData.overview.totalPoints.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      Lifetime earnings
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Study Time</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatDuration(progressData.overview.totalStudyTime)}</div>
                    <p className="text-xs text-muted-foreground">
                      Total learning time
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{progressData.overview.achievements}</div>
                    <p className="text-xs text-muted-foreground">
                      Badges earned
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Progress by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Progress by Category</CardTitle>
                  <CardDescription>
                    Your learning progress across different subject areas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(progressData.progressByCategory).map(([category, data]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{category}</span>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(data.averageProgress)}% • {data.completedCourses}/{data.totalCourses} courses
                          </span>
                        </div>
                        <Progress value={data.averageProgress} className="w-full" />
                      </div>
                    ))}
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
                    {progressData.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          {getActivityIcon(activity.icon)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Search & Filter</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ').toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('')
                  setSelectedType('')
                }}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resources Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {resource.description}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-1">
                        {getResourceIcon(resource.type)}
                      </div>
                      {resource.isPremium && (
                        <Badge variant="destructive" className="text-xs">Premium</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Badge variant="outline">{resource.category}</Badge>
                    <Badge variant="secondary">{resource.type.replace('_', ' ')}</Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Resource Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Download className="w-3 h-3" />
                        <span>{resource.downloadCount} downloads</span>
                      </div>
                      <span>{formatFileSize(resource.fileSize)}</span>
                    </div>

                    {/* Action Button */}
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handleDownload(resource.id, resource.fileUrl)}
                      disabled={downloading === resource.id}
                    >
                      {downloading === resource.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}