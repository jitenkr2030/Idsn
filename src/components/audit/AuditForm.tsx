'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  FileText, 
  Image, 
  Video, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Send,
  Save,
  Eye,
  Download,
  Camera,
  Monitor,
  Wifi,
  Shield,
  Target,
  TrendingUp,
  Award
} from 'lucide-react'

interface AuditChecklist {
  id: string
  category: string
  title: string
  description: string
  weight: number
  isRequired: boolean
  isActive: boolean
  items: AuditItem[]
}

interface AuditItem {
  id: string
  title: string
  description: string
  points: number
  evidenceType: 'PHOTO' | 'VIDEO' | 'DOCUMENT' | 'SPEED_TEST' | 'SCREENSHOT' | 'TEXT'
  isActive: boolean
  order: number
}

interface AuditSubmission {
  id: string
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUIRED'
  totalScore: number
  maxScore: number
  submittedAt?: string
  reviewedAt?: string
  feedback?: string
}

export default function AuditForm() {
  const [checklists, setChecklists] = useState<AuditChecklist[]>([])
  const [selectedChecklist, setSelectedChecklist] = useState<AuditChecklist | null>(null)
  const [submission, setSubmission] = useState<AuditSubmission | null>(null)
  const [activeTab, setActiveTab] = useState('infrastructure')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [formData, setFormData] = useState<{ [key: string]: any }>({})

  useEffect(() => {
    fetchChecklists()
  }, [])

  const fetchChecklists = async () => {
    try {
      const response = await fetch('/api/audit/checklists')
      const data = await response.json()
      setChecklists(data.checklists)
      
      // Select first checklist by default
      if (data.checklists.length > 0) {
        setSelectedChecklist(data.checklists[0])
        initializeFormData(data.checklists[0])
      }
    } catch (error) {
      console.error('Failed to fetch checklists:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializeFormData = (checklist: AuditChecklist) => {
    const initialData: { [key: string]: any } = {}
    
    checklist.items.forEach(item => {
      initialData[item.id] = {
        response: '',
        evidenceUrl: '',
        evidenceType: item.evidenceType,
        isCompleted: false,
        score: 0,
        notes: ''
      }
    })
    
    setFormData(initialData)
  }

  const handleChecklistChange = (checklistId: string) => {
    const checklist = checklists.find(c => c.id === checklistId)
    if (checklist) {
      setSelectedChecklist(checklist)
      initializeFormData(checklist)
      setSubmission(null)
      setError('')
      setSuccess('')
    }
  }

  const handleInputChange = (itemId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }))
  }

  const handleFileUpload = async (itemId: string, file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // In a real implementation, upload to a storage service
      // For now, we'll simulate the upload
      const fileUrl = `/uploads/${file.name}`
      
      handleInputChange(itemId, 'evidenceUrl', fileUrl)
      
      setSuccess(`File "${file.name}" uploaded successfully`)
    } catch (error) {
      setError(`Failed to upload file: ${error}`)
    }
  }

  const calculateScore = (itemId: string, isCompleted: boolean, response: string) => {
    const item = selectedChecklist?.items.find(i => i.id === itemId)
    if (!item || !isCompleted) return 0
    
    // Simple scoring logic - can be enhanced
    if (response && response.length > 10) {
      return item.points
    }
    
    return Math.floor(item.points * 0.5) // Partial score
  }

  const handleItemComplete = (itemId: string, isCompleted: boolean) => {
    const currentData = formData[itemId]
    const score = calculateScore(itemId, isCompleted, currentData?.response || '')
    
    handleInputChange(itemId, 'isCompleted', isCompleted)
    handleInputChange(itemId, 'score', score)
  }

  const saveDraft = async () => {
    if (!selectedChecklist) return
    
    setSaving(true)
    setError('')
    
    try {
      const items = Object.entries(formData).map(([itemId, data]) => ({
        auditItemId: itemId,
        response: data.response,
        evidenceUrl: data.evidenceUrl,
        evidenceType: data.evidenceType,
        score: data.score,
        isCompleted: data.isCompleted,
        notes: data.notes
      }))

      const response = await fetch('/api/audit/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checklistId: selectedChecklist.id,
          items,
          status: 'DRAFT'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setSubmission(result.submission)
        setSuccess('Draft saved successfully')
      } else {
        setError(result.error || 'Failed to save draft')
      }
    } catch (error) {
      setError('Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  const submitAudit = async () => {
    if (!selectedChecklist) return
    
    // Validate required items
    const requiredItems = selectedChecklist.items.filter(item => 
      selectedChecklist.isRequired
    )
    
    const incompleteRequired = requiredItems.filter(item => 
      !formData[item.id]?.isCompleted
    )
    
    if (incompleteRequired.length > 0) {
      setError(`Please complete all required items: ${incompleteRequired.map(item => item.title).join(', ')}`)
      return
    }
    
    setSubmitting(true)
    setError('')
    
    try {
      const items = Object.entries(formData).map(([itemId, data]) => ({
        auditItemId: itemId,
        response: data.response,
        evidenceUrl: data.evidenceUrl,
        evidenceType: data.evidenceType,
        score: data.score,
        isCompleted: data.isCompleted,
        notes: data.notes
      }))

      const response = await fetch('/api/audit/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checklistId: selectedChecklist.id,
          items,
          status: 'SUBMITTED'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setSubmission(result.submission)
        setSuccess('Audit submitted successfully for review')
      } else {
        setError(result.error || 'Failed to submit audit')
      }
    } catch (error) {
      setError('Failed to submit audit')
    } finally {
      setSubmitting(false)
    }
  }

  const getEvidenceIcon = (evidenceType: string) => {
    switch (evidenceType) {
      case 'PHOTO':
        return <Camera className="w-4 h-4" />
      case 'VIDEO':
        return <Video className="w-4 h-4" />
      case 'DOCUMENT':
        return <FileText className="w-4 h-4" />
      case 'SPEED_TEST':
        return <Wifi className="w-4 h-4" />
      case 'SCREENSHOT':
        return <Monitor className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getProgressPercentage = () => {
    if (!selectedChecklist) return 0
    
    const totalItems = selectedChecklist.items.length
    const completedItems = selectedChecklist.items.filter(item => 
      formData[item.id]?.isCompleted
    ).length
    
    return Math.round((completedItems / totalItems) * 100)
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
        return <TrendingUp className="w-5 h-5 text-orange-500" />
      default:
        return <Shield className="w-5 h-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Digital Infrastructure Audit</h2>
          <p className="text-gray-600">
            Complete the audit to evaluate your school's digital readiness
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {submission && (
            <Badge variant={submission.status === 'DRAFT' ? 'secondary' : 'default'}>
              {submission.status.replace('_', ' ')}
            </Badge>
          )}
          {submission && (
            <div className="text-sm text-gray-500">
              Score: {submission.totalScore}/{submission.maxScore}
            </div>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Audit Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Completion</span>
                <span className="text-sm text-gray-500">{getProgressPercentage()}%</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>
            
            {selectedChecklist && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Required Items</span>
                    <span className="text-sm text-gray-500">
                      {selectedChecklist.items.filter(item => (item as any).isRequired).length} total
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Completed</span>
                    <span className="text-sm text-gray-500">
                      {selectedChecklist.items.filter(item => 
                        (item as any).isRequired && formData[item.id]?.isCompleted
                      ).length}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Optional Items</span>
                    <span className="text-sm text-gray-500">
                      {selectedChecklist.items.filter(item => !(item as any).isRequired).length} total
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Completed</span>
                    <span className="text-sm text-gray-500">
                      {selectedChecklist.items.filter(item => 
                        !(item as any).isRequired && formData[item.id]?.isCompleted
                      ).length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error and Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Checklist Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Audit Checklist</CardTitle>
          <CardDescription>
            Choose the appropriate audit checklist for your evaluation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedChecklist?.id || ''} onValueChange={handleChecklistChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a checklist" />
            </SelectTrigger>
            <SelectContent>
              {checklists.map((checklist) => (
                <SelectItem key={checklist.id} value={checklist.id}>
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(checklist.category)}
                    <div>
                      <div className="font-medium">{checklist.title}</div>
                      <div className="text-sm text-gray-500">{checklist.category}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Audit Form */}
      {selectedChecklist && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedChecklist.title}</CardTitle>
            <CardDescription>{selectedChecklist.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {selectedChecklist.items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-4">
                  {/* Item Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{item.title}</h4>
                        {(item as any).isRequired && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {item.points} points
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getEvidenceIcon(item.evidenceType)}
                      <span className="text-sm text-gray-500">{item.evidenceType}</span>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`response-${item.id}`}>Response</Label>
                      <Textarea
                        id={`response-${item.id}`}
                        placeholder="Describe your implementation or provide details"
                        value={formData[item.id]?.response || ''}
                        onChange={(e) => handleInputChange(item.id, 'response', e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`notes-${item.id}`}>Notes (Optional)</Label>
                      <Textarea
                        id={`notes-${item.id}`}
                        placeholder="Add any additional notes or comments"
                        value={formData[item.id]?.notes || ''}
                        onChange={(e) => handleInputChange(item.id, 'notes', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Evidence Upload */}
                  <div className="space-y-2">
                    <Label>Evidence Upload</Label>
                    <div className="flex items-center space-x-4">
                      <Input
                        type="file"
                        accept={
                          item.evidenceType === 'PHOTO' ? 'image/*' :
                          item.evidenceType === 'VIDEO' ? 'video/*' :
                          item.evidenceType === 'DOCUMENT' ? '.pdf,.doc,.docx' :
                          '*/*'
                        }
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleFileUpload(item.id, file)
                          }
                        }}
                        className="flex-1"
                      />
                      {formData[item.id]?.evidenceUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(formData[item.id]?.evidenceUrl, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      )}
                    </div>
                    {formData[item.id]?.evidenceUrl && (
                      <p className="text-sm text-green-600">
                        ✓ Evidence uploaded
                      </p>
                    )}
                  </div>

                  {/* Completion Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`completed-${item.id}`}
                        checked={formData[item.id]?.isCompleted || false}
                        onChange={(e) => handleItemComplete(item.id, e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor={`completed-${item.id}`} className="text-sm font-medium">
                        Mark as completed
                      </Label>
                    </div>
                    {formData[item.id]?.isCompleted && (
                      <div className="text-sm text-green-600">
                        ✓ {formData[item.id]?.score}/{item.points} points
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {selectedChecklist && (
        <div className="flex items-center justify-end space-x-4">
          <Button
            variant="outline"
            onClick={saveDraft}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </>
            )}
          </Button>
          
          <Button
            onClick={submitAudit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit for Review
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

// Import Users icon for the capability category
function Users({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}