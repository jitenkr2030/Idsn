'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Star, 
  Award, 
  TrendingUp, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Share2,
  Calendar,
  MapPin,
  Users,
  Monitor,
  Wifi,
  BookOpen,
  Lightbulb,
  ArrowRight,
  FileText,
  Eye,
  Shield,
  Trophy
} from 'lucide-react'

interface AuditReport {
  submission: {
    id: string
    status: string
    submittedAt: string
    totalScore: number
    maxScore: number
    overallPercentage: number
    starRating: number
    grade: string
  }
  school: {
    id: string
    name: string
    address: string
    city: string
    state: string
    membershipTier: string
    idsnRating: number
    studentCount: number
    teacherCount: number
  }
  categoryScores: {
    [key: string]: {
      score: number
      maxScore: number
      percentage: number
    }
  }
  recommendations: string[]
  items: Array<{
    id: string
    category: string
    title: string
    description: string
    evidenceType: string
    response: string
    evidenceUrl: string
    score: number
    maxScore: number
    isCompleted: boolean
    notes: string
  }>
}

export default function AuditReport({ submissionId }: { submissionId: string }) {
  const [report, setReport] = useState<AuditReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (submissionId) {
      fetchAuditReport()
    }
  }, [submissionId])

  const fetchAuditReport = async () => {
    try {
      const response = await fetch(`/api/audit/report?submissionId=${submissionId}`)
      const data = await response.json()
      
      if (data.success) {
        setReport(data.report)
      } else {
        setError(data.error || 'Failed to fetch audit report')
      }
    } catch (error) {
      setError('Failed to fetch audit report')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'INFRASTRUCTURE':
        return <Monitor className="w-5 h-5 text-blue-500" />
      case 'CAPABILITY':
        return <Users className="w-5 h-5 text-green-500" />
      case 'ADOPTION':
        return <Target className="w-5 h-5 text-purple-500" />
      case 'INNOVATION':
        return <Lightbulb className="w-5 h-5 text-orange-500" />
      default:
        return <Shield className="w-5 h-5 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'INFRASTRUCTURE':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'CAPABILITY':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'ADOPTION':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'INNOVATION':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600'
    if (grade.startsWith('B')) return 'text-blue-600'
    if (grade.startsWith('C')) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800'
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const downloadReport = () => {
    if (!report) return
    
    // Create a simple text report
    const reportText = `
IDSN Digital Infrastructure Audit Report
=====================================

School: ${report.school.name}
Address: ${report.school.address}, ${report.school.city}, ${report.school.state}
Membership: ${report.school.membershipTier}
IDSN Rating: ${report.school.idsnRating}/5
Students: ${report.school.studentCount}
Teachers: ${report.school.teacherCount}

Audit Results
==============
Overall Score: ${report.submission.totalScore}/${report.submission.maxScore}
Percentage: ${report.submission.overallPercentage}%
Grade: ${report.submission.grade}
Star Rating: ${report.submission.starRating}/5
Status: ${report.submission.status}
Submitted: ${new Date(report.submission.submittedAt).toLocaleDateString()}

Category Scores
===============
${Object.entries(report.categoryScores).map(([category, scores]) => 
  `${category}: ${scores.score}/${scores.maxScore} (${scores.percentage}%)`
).join('\n')}

Recommendations
===============
${report.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

Generated on: ${new Date().toLocaleDateString()}
IDSN Portal - Indian Digital School Network
    `.trim()

    // Create and download the file
    const blob = new Blob([reportText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `IDSN-Audit-Report-${report.school.name.replace(/\s+/g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Report</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No report data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Digital Infrastructure Audit Report</h1>
          <p className="text-gray-600">
            Comprehensive evaluation of {report.school.name}'s digital readiness
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={downloadReport}>
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* School Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-blue-500" />
            <span>School Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">School Name</p>
              <p className="font-medium">{report.school.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{report.school.city}, {report.school.state}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Membership</p>
              <Badge variant="outline">{report.school.membershipTier}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">IDSN Rating</p>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < report.school.idsnRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-1 text-sm font-medium">
                  {report.school.idsnRating}/5
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-500">Student Count</p>
              <p className="font-medium">{report.school.studentCount?.toLocaleString() || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Teacher Count</p>
              <p className="font-medium">{report.school.teacherCount?.toLocaleString() || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Overall Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {report.submission.totalScore}/{report.submission.maxScore}
              </div>
              <p className="text-sm text-gray-500">Total Score</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {report.submission.overallPercentage}%
              </div>
              <p className="text-sm text-gray-500">Percentage</p>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getGradeColor(report.submission.grade)}`}>
                {report.submission.grade}
              </div>
              <p className="text-sm text-gray-500">Grade</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < report.submission.starRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500">Star Rating</p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-500">{report.submission.overallPercentage}%</span>
            </div>
            <Progress value={report.submission.overallPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-500" />
            <span>Category Breakdown</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(report.categoryScores).map(([category, scores]) => (
              <div key={category} className={`p-4 rounded-lg border ${getCategoryColor(category)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(category)}
                    <span className="font-medium">{category}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {scores.percentage}%
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Score</span>
                  <span className="text-sm font-medium">
                    {scores.score}/{scores.maxScore}
                  </span>
                </div>
                <Progress value={scores.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-orange-500" />
            <span>Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gray-500" />
            <span>Detailed Audit Items</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Items</TabsTrigger>
              {Object.keys(report.categoryScores).map((category) => (
                <TabsTrigger key={category} value={category.toLowerCase()}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {report.items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                        {item.isCompleted && (
                          <Badge className="text-xs" variant="default">
                            ✓ Completed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      {item.response && (
                        <div className="mb-2">
                          <p className="text-sm font-medium">Response:</p>
                          <p className="text-sm text-gray-700">{item.response}</p>
                        </div>
                      )}
                      {item.evidenceUrl && (
                        <div className="mb-2">
                          <p className="text-sm font-medium">Evidence:</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(item.evidenceUrl, '_blank')}
                            className="mt-1"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Evidence
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">
                        {item.score}/{item.maxScore} points
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < (item.score / item.maxScore) * 5
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
            
            {Object.keys(report.categoryScores).map((category) => (
              <TabsContent key={category} value={category.toLowerCase()} className="space-y-4">
                {report.items
                  .filter(item => item.category === category)
                  .map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{item.title}</h4>
                            {item.isCompleted && (
                              <Badge className="text-xs" variant="default">
                                ✓ Completed
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          {item.response && (
                            <div className="mb-2">
                              <p className="text-sm font-medium">Response:</p>
                              <p className="text-sm text-gray-700">{item.response}</p>
                            </div>
                          )}
                          {item.evidenceUrl && (
                            <div className="mb-2">
                              <p className="text-sm font-medium">Evidence:</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(item.evidenceUrl, '_blank')}
                                className="mt-1"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Evidence
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-1">
                            {item.score}/{item.maxScore} points
                          </div>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < (item.score / item.maxScore) * 5
                                    ? 'bg-green-500'
                                    : 'bg-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}