'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  Star,
  Camera,
  Video,
  FileImage,
  Monitor,
  Type,
  AlertCircle,
  Loader2,
  Award
} from 'lucide-react'

interface AuditChecklist {
  id: string
  category: string
  title: string
  description?: string
  weight: number
  isRequired: boolean
  items: AuditItem[]
}

interface AuditItem {
  id: string
  title: string
  description?: string
  points: number
  evidenceType: 'PHOTO' | 'VIDEO' | 'DOCUMENT' | 'SPEED_TEST' | 'SCREENSHOT' | 'TEXT'
  isRequired: boolean
}

interface AuditSubmission {
  id: string
  status: string
  totalScore: number
  maxScore: number
  rating?: number
  submittedAt?: string
  reviewedAt?: string
  feedback?: string
  items: SubmissionItem[]
}

interface SubmissionItem {
  id: string
  auditItemId: string
  response?: string
  evidenceUrl?: string
  evidenceType: string
  score: number
  isCompleted: boolean
  notes?: string
  auditItem: AuditItem
}

export default function CertificationModule() {
  const [checklists, setChecklists] = useState<AuditChecklist[]>([])
  const [submissions, setSubmissions] = useState<AuditSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [generatingCertificate, setGeneratingCertificate] = useState<string | null>(null)
  const [selectedChecklist, setSelectedChecklist] = useState<AuditChecklist | null>(null)
  const [currentSubmission, setCurrentSubmission] = useState<Record<string, any>>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [checklistsRes, submissionsRes] = await Promise.all([
        fetch('/api/audit/checklists'),
        fetch('/api/audit/submissions')
      ])

      if (checklistsRes.ok) {
        const checklistsData = await checklistsRes.json()
        setChecklists(checklistsData.checklists)
      }

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json()
        setSubmissions(submissionsData.submissions)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleItemChange = (itemId: string, field: string, value: any) => {
    setCurrentSubmission(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }))
  }

  const calculateProgress = () => {
    if (!selectedChecklist) return 0
    const items = selectedChecklist.items
    const completedItems = items.filter(item => 
      currentSubmission[item.id]?.isCompleted
    ).length
    return items.length > 0 ? (completedItems / items.length) * 100 : 0
  }

  const calculateScore = () => {
    if (!selectedChecklist) return { total: 0, max: 0 }
    let total = 0
    let max = 0

    selectedChecklist.items.forEach(item => {
      const submission = currentSubmission[item.id]
      if (submission?.isCompleted) {
        total += item.points
      }
      max += item.points
    })

    return { total, max }
  }

  const handleSubmit = async () => {
    if (!selectedChecklist) return

    setSubmitting(true)
    try {
      const items = selectedChecklist.items.map(item => ({
        auditItemId: item.id,
        response: currentSubmission[item.id]?.response || '',
        evidenceUrl: currentSubmission[item.id]?.evidenceUrl || '',
        evidenceType: item.evidenceType,
        score: currentSubmission[item.id]?.isCompleted ? item.points : 0,
        isCompleted: currentSubmission[item.id]?.isCompleted || false,
        notes: currentSubmission[item.id]?.notes || '',
        maxPoints: item.points
      }))

      const response = await fetch('/api/audit/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          schoolId: 'temp-school-id', // This would come from user profile
          items
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSubmissions(prev => [data.submission, ...prev])
        setSelectedChecklist(null)
        setCurrentSubmission({})
      } else {
        console.error('Failed to submit audit')
      }
    } catch (error) {
      console.error('Error submitting audit:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const generateCertificate = async (submissionId: string) => {
    setGeneratingCertificate(submissionId)
    try {
      const submission = submissions.find(s => s.id === submissionId)
      if (!submission) return

      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'SCHOOL_CERTIFICATION',
          title: 'IDSN Digital Excellence Certification',
          description: `Certified for achieving ${submission.rating} star rating in digital infrastructure assessment`,
          score: submission.totalScore,
          maxScore: submission.maxScore,
          schoolId: 'temp-school-id', // This would come from user profile
          auditSubmissionId: submissionId
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Open certificate in new tab
        window.open(`/verify/${data.certificate.certificateId}`, '_blank')
      } else {
        console.error('Failed to generate certificate')
      }
    } catch (error) {
      console.error('Error generating certificate:', error)
    } finally {
      setGeneratingCertificate(null)
    }
  }

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'PHOTO': return <Camera className="w-4 h-4" />
      case 'VIDEO': return <Video className="w-4 h-4" />
      case 'DOCUMENT': return <FileText className="w-4 h-4" />
      case 'SPEED_TEST': return <Monitor className="w-4 h-4" />
      case 'SCREENSHOT': return <FileImage className="w-4 h-4" />
      case 'TEXT': return <Type className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="secondary">Draft</Badge>
      case 'SUBMITTED': return <Badge variant="default">Submitted</Badge>
      case 'UNDER_REVIEW': return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>
      case 'APPROVED': return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'REJECTED': return <Badge variant="destructive">Rejected</Badge>
      case 'REVISION_REQUIRED': return <Badge className="bg-orange-100 text-orange-800">Revision Required</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">School Certification</h2>
          <p className="text-muted-foreground">
            Complete the digital infrastructure audit to get your IDSN certification
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="audit" className="w-full">
        <TabsList>
          <TabsTrigger value="audit">Digital Audit</TabsTrigger>
          <TabsTrigger value="submissions">My Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-6">
          {!selectedChecklist ? (
            <div className="grid gap-4">
              {checklists.map((checklist) => (
                <Card key={checklist.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{checklist.title}</CardTitle>
                        <CardDescription>{checklist.description}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{checklist.category}</Badge>
                        {checklist.isRequired && (
                          <Badge variant="destructive">Required</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {checklist.items.length} items • Max {checklist.items.reduce((sum, item) => sum + item.points, 0)} points
                      </p>
                      <Button
                        onClick={() => setSelectedChecklist(checklist)}
                        size="sm"
                      >
                        Start Audit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Audit Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedChecklist.title}</CardTitle>
                      <CardDescription>{selectedChecklist.description}</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedChecklist(null)}
                    >
                      Back to Checklists
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(calculateProgress())}%</span>
                    </div>
                    <Progress value={calculateProgress()} className="w-full" />
                    <div className="flex items-center justify-between text-sm">
                      <span>Current Score</span>
                      <span className="font-semibold">
                        {calculateScore().total} / {calculateScore().max} points
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audit Items */}
              <div className="space-y-4">
                {selectedChecklist.items.map((item) => {
                  const submission = currentSubmission[item.id] || {}
                  return (
                    <Card key={item.id} className={submission.isCompleted ? 'border-green-200 bg-green-50' : ''}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <CardTitle className="text-base">{item.title}</CardTitle>
                              {item.isRequired && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                {getEvidenceIcon(item.evidenceType)}
                                <span>{item.evidenceType.replace('_', ' ')}</span>
                              </div>
                            </div>
                            {item.description && (
                              <CardDescription>{item.description}</CardDescription>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{item.points} pts</Badge>
                            {submission.isCompleted && (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Response Input */}
                        <div>
                          <label className="text-sm font-medium">Response</label>
                          <textarea
                            className="w-full mt-1 p-2 border rounded-md"
                            rows={3}
                            placeholder="Provide your response here..."
                            value={submission.response || ''}
                            onChange={(e) => handleItemChange(item.id, 'response', e.target.value)}
                          />
                        </div>

                        {/* Evidence Upload */}
                        <div>
                          <label className="text-sm font-medium">Evidence</label>
                          <div className="mt-1 flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center space-x-2"
                            >
                              <Upload className="w-4 h-4" />
                              <span>Upload {item.evidenceType.replace('_', ' ')}</span>
                            </Button>
                            {submission.evidenceUrl && (
                              <span className="text-sm text-green-600">File uploaded</span>
                            )}
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="text-sm font-medium">Notes (Optional)</label>
                          <textarea
                            className="w-full mt-1 p-2 border rounded-md"
                            rows={2}
                            placeholder="Any additional notes..."
                            value={submission.notes || ''}
                            onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)}
                          />
                        </div>

                        {/* Complete Checkbox */}
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`complete-${item.id}`}
                            checked={submission.isCompleted || false}
                            onChange={(e) => handleItemChange(item.id, 'isCompleted', e.target.checked)}
                            className="rounded"
                          />
                          <label htmlFor={`complete-${item.id}`} className="text-sm">
                            Mark as completed
                          </label>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Submit Button */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        Final Score: {calculateScore().total} / {calculateScore().max} points
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round((calculateScore().total / calculateScore().max) * 100)}% completion
                      </p>
                    </div>
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || calculateProgress() < 100}
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Audit'
                      )}
                    </Button>
                  </div>
                  {calculateProgress() < 100 && (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please complete all required items before submitting.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                <p className="text-muted-foreground">
                  Start your first digital audit to see your submissions here.
                </p>
              </CardContent>
            </Card>
          ) : (
            submissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Digital Audit Submission
                      </CardTitle>
                      <CardDescription>
                        Submitted {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(submission.status)}
                      {submission.rating && (
                        <div className="flex items-center space-x-1">
                          {getStarRating(submission.rating)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Score:</span>
                      <span className="font-semibold">
                        {submission.totalScore} / {submission.maxScore} points
                      </span>
                    </div>
                    {submission.rating && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">IDSN Rating:</span>
                        <div className="flex items-center space-x-1">
                          {getStarRating(submission.rating)}
                          <span className="font-semibold">{submission.rating} Stars</span>
                        </div>
                      </div>
                    )}
                    {submission.feedback && (
                      <div>
                        <span className="text-sm font-medium">Feedback:</span>
                        <p className="text-sm text-muted-foreground mt-1">{submission.feedback}</p>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 pt-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {submission.status === 'APPROVED' && (
                        <Button 
                          size="sm"
                          onClick={() => generateCertificate(submission.id)}
                          disabled={generatingCertificate === submission.id}
                        >
                          {generatingCertificate === submission.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Award className="w-4 h-4 mr-2" />
                              Generate Certificate
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}