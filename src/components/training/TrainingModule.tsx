'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  BookOpen, 
  Search, 
  Clock, 
  Users, 
  Star,
  Play,
  CheckCircle,
  Award,
  TrendingUp,
  Loader2,
  Filter,
  Calendar,
  Target,
  Zap
} from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  category: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  duration: number
  thumbnail?: string
  isRequired: boolean
  points: number
  isPublished: boolean
  isEnrolled: boolean
  userProgress: number
  modules: Array<{
    id: string
    title: string
    duration: number
    _count: {
      lessons: number
      quizzes: number
    }
  }>
  _count: {
    enrollments: number
  }
}

interface Enrollment {
  id: string
  status: string
  progress: number
  startedAt: string
  completedAt?: string
  course: Course & {
    modules: Array<{
      id: string
      title: string
      duration: number
    }>
    _count: {
      modules: number
    }
  }
}

export default function TrainingModule() {
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchData()
  }, [currentPage, searchTerm, selectedLevel, selectedCategory])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [coursesRes, enrollmentsRes] = await Promise.all([
        fetch(`/api/courses?page=${currentPage}&limit=12&search=${searchTerm}&level=${selectedLevel}&category=${selectedCategory}`),
        fetch('/api/enrollments')
      ])

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        setCourses(coursesData.courses)
        setTotalPages(coursesData.pagination.pages)
      }

      if (enrollmentsRes.ok) {
        const enrollmentsData = await enrollmentsRes.json()
        setEnrollments(enrollmentsData.enrollments)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId)
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseId })
      })

      if (response.ok) {
        const data = await response.json()
        // Refresh courses to update enrollment status
        fetchData()
      } else {
        const errorData = await response.json()
        console.error('Enrollment failed:', errorData.error)
      }
    } catch (error) {
      console.error('Error enrolling in course:', error)
    } finally {
      setEnrolling(null)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'bg-green-100 text-green-800'
      case 'INTERMEDIATE': return 'bg-blue-100 text-blue-800'
      case 'ADVANCED': return 'bg-purple-100 text-purple-800'
      case 'EXPERT': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const categories = [
    'AI in Education',
    'Digital Ethics',
    'Interactive Teaching',
    'Assessment Tools',
    'Classroom Management',
    'Educational Technology',
    'Curriculum Development',
    'Student Engagement'
  ]

  const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Training & Pedagogy</h2>
          <p className="text-muted-foreground">
            Enhance your teaching skills with our comprehensive course library
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          <span>{courses.length} available courses</span>
        </div>
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList>
          <TabsTrigger value="courses">Course Library</TabsTrigger>
          <TabsTrigger value="my-learning">My Learning</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
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
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0) + level.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

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

                <Button variant="outline" onClick={() => {
                  setSearchTerm('')
                  setSelectedLevel('')
                  setSelectedCategory('')
                }}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Course Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                          <CardDescription className="line-clamp-2 mt-1">
                            {course.description}
                          </CardDescription>
                        </div>
                        {course.thumbnail && (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg ml-4 flex-shrink-0">
                            <img 
                              src={course.thumbnail} 
                              alt={course.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 pt-2">
                        <Badge className={getLevelColor(course.level)}>
                          {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
                        </Badge>
                        <Badge variant="outline">{course.category}</Badge>
                        {course.isRequired && (
                          <Badge variant="destructive">Required</Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        {/* Course Stats */}
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span>{formatDuration(course.duration)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BookOpen className="w-3 h-3 text-gray-500" />
                            <span>{course.modules.length} modules</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3 text-gray-500" />
                            <span>{course._count.enrollments}</span>
                          </div>
                        </div>

                        {/* Progress for enrolled courses */}
                        {course.isEnrolled && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Your Progress</span>
                              <span>{Math.round(course.userProgress)}%</span>
                            </div>
                            <Progress value={course.userProgress} className="w-full" />
                          </div>
                        )}

                        {/* Points */}
                        {course.points > 0 && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Zap className="w-3 h-3 text-yellow-500" />
                            <span className="font-medium">{course.points} ID Points</span>
                          </div>
                        )}

                        {/* Action Button */}
                        <Button 
                          className="w-full" 
                          variant={course.isEnrolled ? "outline" : "default"}
                          onClick={() => course.isEnrolled ? 
                            window.location.href = `/courses/${course.id}` : 
                            handleEnroll(course.id)
                          }
                          disabled={enrolling === course.id}
                        >
                          {enrolling === course.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Enrolling...
                            </>
                          ) : course.isEnrolled ? (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Continue Learning
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-4 h-4 mr-2" />
                              Enroll Now
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="my-learning" className="space-y-6">
          {enrollments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your learning journey by enrolling in our courses.
                </p>
                <Button onClick={() => window.location.hash = 'courses'}>
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{enrollment.course.title}</CardTitle>
                        <CardDescription>{enrollment.course.description}</CardDescription>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getLevelColor(enrollment.course.level)}>
                            {enrollment.course.level.charAt(0) + enrollment.course.level.slice(1).toLowerCase()}
                          </Badge>
                          <Badge variant="outline">{enrollment.course.category}</Badge>
                          <Badge variant={
                            enrollment.status === 'COMPLETED' ? 'default' : 'secondary'
                          }>
                            {enrollment.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {Math.round(enrollment.progress)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Complete</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{Math.round(enrollment.progress)}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="w-full" />
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-3 h-3 text-gray-500" />
                          <span>{enrollment.course._count.modules} modules</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span>{formatDuration(enrollment.course.duration)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          <span>Started {new Date(enrollment.startedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => window.location.href = `/courses/${enrollment.course.id}`}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {enrollment.status === 'COMPLETED' ? 'Review' : 'Continue'}
                        </Button>
                        {enrollment.status === 'COMPLETED' && (
                          <Button size="sm" variant="outline">
                            <Award className="w-4 h-4 mr-2" />
                            Certificate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}