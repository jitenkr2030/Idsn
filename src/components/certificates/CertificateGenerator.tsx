'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Award, 
  FileText, 
  Trophy, 
  Target, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Send,
  Save,
  Eye,
  Download,
  Calendar,
  MapPin,
  Star,
  Shield,
  TrendingUp
} from 'lucide-react'

interface CertificateData {
  type: string
  title: string
  description: string
  score: number
  maxScore: number
  rating: number
  status: string
  issuedDate: string
  expiryDate: string
  certificateUrl: string
  qrCode: string
  user: {
    id: string
    name: string
    email: string
    role: string
    avatar: string
  }
  school: {
    id: string
    name: string
    city: string
    state: string
    membershipTier: string
    idsnRating: number
    logo: string
  }
}

interface CertificateGeneratorProps {
  auditSubmissionId?: string
  courseCompletionId?: string
  achievementId?: string
  competitionId?: string
  customData?: any
}

export default function CertificateGenerator({ 
  auditSubmissionId, 
  courseCompletionId, 
  achievementId, 
  competitionId, 
  customData 
}: CertificateGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [certificate, setCertificate] = useState<CertificateData | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [selectedType, setSelectedType] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (auditSubmissionId) {
      setSelectedType('SCHOOL_CERTIFICATION')
      setTitle('Digital Infrastructure Excellence')
      setDescription('Certificate of excellence in digital infrastructure and educational technology implementation')
    } else if (courseCompletionId) {
      setSelectedType('COURSE_COMPLETION')
      setTitle('Course Completion Certificate')
      setDescription('Certificate of successful completion of professional development course')
    } else if (achievementId) {
      setSelectedType('ACHIEVEMENT')
      setTitle('Achievement Badge')
      setDescription('Recognition of outstanding achievement in digital education')
    } else if (competitionId) {
      setSelectedType('COMPETITION_WINNER')
      setTitle('Competition Winner')
      setDescription('Certificate of achievement in digital education competition')
    }
  }, [auditSubmissionId, courseCompletionId, achievementId, competitionId])

  const generateCertificate = async () => {
    if (!selectedType || !title) {
      setError('Please select certificate type and provide title')
      return
    }

    setGenerating(true)
    setError('')
    
    try {
      const certificateData = {
        type: selectedType,
        title,
        description,
        auditSubmissionId,
        courseCompletionId,
        achievementId,
        competitionId,
        customData
      }

      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(certificateData)
      })

      const result = await response.json()
      
      if (result.success) {
        setCertificate(result.certificate)
        setSuccess('Certificate generated successfully!')
      } else {
        setError(result.error || 'Failed to generate certificate')
      }
    } catch (error) {
      setError('Failed to generate certificate')
    } finally {
      setGenerating(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SCHOOL_CERTIFICATION':
        return <Award className="w-5 h-5 text-blue-500" />
      case 'EDUCATOR_BADGE':
        return <Users className="w-5 h-5 text-green-500" />
      case 'COURSE_COMPLETION':
        return <FileText className="w-5 h-5 text-purple-500" />
      case 'ACHIEVEMENT':
        return <Trophy className="w-5 h-5 text-orange-500" />
      case 'COMPETITION_WINNER':
        return <Target className="w-5 h-5 text-red-500" />
      default:
        return <Shield className="w-5 h-5 text-gray-500" />
    }
  }

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'SCHOOL_CERTIFICATION':
        return 'Official certification for schools meeting digital infrastructure standards'
      case 'EDUCATOR_BADGE':
        return 'Professional recognition for educators demonstrating digital excellence'
      case 'COURSE_COMPLETION':
        return 'Acknowledgment for completing professional development courses'
      case 'ACHIEVEMENT':
        return 'Special recognition for outstanding achievements in digital education'
      case 'COMPETITION_WINNER':
        return 'Award for winners in digital education competitions and challenges'
      default:
        return 'Certificate of achievement in digital education'
    }
  }

  const getCertificatePreview = () => {
    if (!selectedType) return null

    return {
      type: selectedType,
      title: title || 'Certificate Title',
      description: description || 'Certificate description',
      score: 85,
      maxScore: 100,
      rating: 4,
      status: 'PENDING',
      issuedDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      certificateUrl: '#',
      qrCode: '#',
      user: {
        id: 'preview',
        name: 'Preview User',
        email: 'preview@example.com',
        role: 'SCHOOL_ADMIN',
        avatar: ''
      },
      school: {
        id: 'preview',
        name: 'Preview School',
        city: 'Preview City',
        state: 'Preview State',
        membershipTier: 'GOLD',
        idsnRating: 4,
        logo: '',
        website: ''
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Generate Certificate</h2>
        <p className="text-gray-600">
          Create official IDSN certificates for achievements and recognition
        </p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Certificate Form */}
        <Card>
          <CardHeader>
            <CardTitle>Certificate Details</CardTitle>
            <CardDescription>
              Configure your certificate settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Certificate Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select certificate type</option>
                <option value="SCHOOL_CERTIFICATION">School Certification</option>
                <option value="EDUCATOR_BADGE">Educator Badge</option>
                <option value="COURSE_COMPLETION">Course Completion</option>
                <option value="ACHIEVEMENT">Achievement</option>
                <option value="COMPETITION_WINNER">Competition Winner</option>
              </select>
              {selectedType && (
                <p className="text-xs text-gray-500 mt-1">
                  {getTypeDescription(selectedType)}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Certificate Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter certificate title"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter certificate description"
                rows={3}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button
              onClick={generateCertificate}
              disabled={generating || !selectedType || !title}
              className="w-full"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Award className="w-4 h-4 mr-2" />
                  Generate Certificate
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Certificate Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              See how your certificate will look
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedType ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center mb-4">
                  {getTypeIcon(selectedType)}
                  <h3 className="text-lg font-semibold mt-2">{title || 'Certificate Title'}</h3>
                  <p className="text-sm text-gray-600">{description || 'Certificate description'}</p>
                </div>
                
                <div className="bg-gray-50 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">Score</span>
                    <span className="text-xs">85/100</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">Rating</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Status</span>
                    <Badge variant="secondary" className="text-xs">PENDING</Badge>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded mx-auto mb-2 flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">QR Code for verification</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a certificate type to see preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Generated Certificate */}
      {certificate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Certificate Generated Successfully!</span>
            </CardTitle>
            <CardDescription>
              Your certificate has been created and is ready for use
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-800">Certificate Ready</p>
                  <p className="text-sm text-green-600">
                    Certificate ID: {certificate.certificateId}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Certificate Details:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Type: {certificate.type}</li>
                    <li>• Title: {certificate.title}</li>
                    <li>• Score: {certificate.score}/{certificate.maxScore}</li>
                    <li>• Rating: {certificate.rating}/5 stars</li>
                  </ul>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Next Steps:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Certificate is pending approval</li>
                    <li>• You'll be notified when approved</li>
                    <li>• Download and share once approved</li>
                    <li>• QR code will be active for verification</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// QR Code icon component
function QrCode({ className }: { className?: string }) {
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
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <rect x="7" y="7" width="3" height="3" rx="1" ry="1"/>
      <rect x="14" y="7" width="3" height="3" rx="1" ry="1"/>
      <rect x="7" y="14" width="3" height="3" rx="1" ry="1"/>
      <rect x="14" y="14" width="3" height="3" rx="1" ry="1"/>
    </svg>
  )
}