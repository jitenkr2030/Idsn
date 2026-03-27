'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Award, 
  Download, 
  Share2, 
  Eye, 
  Calendar, 
  MapPin, 
  Users,
  Star,
  CheckCircle,
  AlertCircle,
  QrCode,
  ExternalLink,
  FileText,
  Shield,
  Trophy,
  Target,
  TrendingUp,
  Copy,
  Mail
} from 'lucide-react'

interface Certificate {
  id: string
  certificateId: string
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
  isPublic: boolean
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
    website: string
  }
  verifiedAt: string
}

interface CertificateDisplayProps {
  certificate: Certificate
  showActions?: boolean
  compact?: boolean
}

export default function CertificateDisplay({ 
  certificate, 
  showActions = true, 
  compact = false 
}: CertificateDisplayProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = certificate ? `${window.location.origin}/verify/${certificate.certificateId}` : ''

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `IDSN Certificate: ${certificate.title}`,
        text: `I earned a ${certificate.type} certificate from IDSN!`,
        url: shareUrl
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      window.open(`https://twitter.com/intent/tweet?text=I%20earned%20a%20${certificate.type}%20certificate%20from%20IDSN!%20${shareUrl}`, '_blank')
    }
  }

  const handleDownload = () => {
    // Create a simple text certificate
    const certificateText = `
IDSN DIGITAL CERTIFICATE
========================

Certificate ID: ${certificate.certificateId}
Type: ${certificate.type}
Title: ${certificate.title}
Description: ${certificate.description}

Score: ${certificate.score}/${certificate.maxScore}
Rating: ${certificate.rating}/5 Stars
Grade: ${(certificate as any).grade || 'N/A'}

Issued To: ${certificate.user.name}
Email: ${certificate.user.email}
School: ${certificate.school.name}
Location: ${certificate.school.city}, ${certificate.school.state}

Issued Date: ${new Date(certificate.issuedDate).toLocaleDateString()}
Expiry Date: ${new Date(certificate.expiryDate).toLocaleDateString()}

Certificate URL: ${certificate.certificateUrl}
Verification: Scan QR code or visit ${shareUrl}

Generated on: ${new Date().toLocaleDateString()}
IDSN Portal - Indian Digital School Network
    `.trim()

    // Create and download the file
    const blob = new Blob([certificateText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `IDSN-Certificate-${certificate.certificateId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  const getGradeColor = (grade: string) => {
    if (!grade) return 'text-gray-600'
    if (grade.startsWith('A')) return 'text-green-600'
    if (grade.startsWith('B')) return 'text-blue-600'
    if (grade.startsWith('C')) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (compact) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getTypeIcon(certificate.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{certificate.title}</h4>
              <p className="text-xs text-gray-500">{certificate.type}</p>
            </div>
            <Badge className={getStatusColor(certificate.status)} variant="secondary">
              {certificate.status}
            </Badge>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {certificate.school.name}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(certificate.issuedDate).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getTypeIcon(certificate.type)}
            <div>
              <CardTitle className="text-xl">{certificate.title}</CardTitle>
              <CardDescription>
                Certificate ID: {certificate.certificateId}
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(certificate.status)}>
            {certificate.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Certificate Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Certificate Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Type</span>
                    <span className="text-sm font-medium">{certificate.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Score</span>
                    <span className="text-sm font-medium">{certificate.score}/{certificate.maxScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Rating</span>
                    <div className="flex items-center">
                      <div className="flex items-center mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < certificate.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{certificate.rating}/5</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <Badge className={getStatusColor(certificate.status)} variant="secondary">
                      {certificate.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Issued Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Issued To</span>
                    <span className="text-sm font-medium">{certificate.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">School</span>
                    <span className="text-sm font-medium">{certificate.school.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Location</span>
                    <span className="text-sm font-medium">{certificate.school.city}, {certificate.school.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Issued Date</span>
                    <span className="text-sm font-medium">
                      {new Date(certificate.issuedDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Expiry Date</span>
                    <span className="text-sm font-medium">
                      {new Date(certificate.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* School Info */}
            <div>
              <h4 className="font-medium mb-3">School Information</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    {certificate.school.logo ? (
                      <img 
                        src={certificate.school.logo} 
                        alt={certificate.school.name}
                        className="w-10 h-10 rounded"
                      />
                    ) : (
                      <Award className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-medium">{certificate.school.name}</h5>
                    <p className="text-sm text-gray-500">{certificate.school.city}, {certificate.school.state}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Membership</span>
                    <p className="font-medium">{certificate.school.membershipTier}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">IDSN Rating</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < certificate.school.idsnRating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-xs font-medium">
                        {certificate.school.idsnRating}/5
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Description</h4>
              <p className="text-gray-700">{certificate.description}</p>
            </div>
            
            {certificate.score !== undefined && (
              <div>
                <h4 className="font-medium mb-3">Performance Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Score Achieved</span>
                    <span className="text-sm font-medium">{certificate.score}/{certificate.maxScore}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Percentage</span>
                    <span className="text-sm font-medium">
                      {Math.round((certificate.score / certificate.maxScore) * 100)}%
                    </span>
                  </div>
                  <div className="w-full">
                    <Progress 
                      value={Math.round((certificate.score / certificate.maxScore) * 100)} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="verification" className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Certificate Verification</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-800">This certificate is valid and authentic</p>
                    <p className="text-sm text-green-600">
                      Verified on {new Date(certificate.verifiedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Certificate URL</p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 text-sm border rounded px-3 py-2 bg-white"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyUrl}
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">QR Code</p>
                    <div className="flex items-center space-x-3">
                      <div className="bg-white p-2 border rounded">
                        <img 
                          src={certificate.qrCode} 
                          alt="Certificate QR Code"
                          className="w-32 h-32"
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Scan this QR code to verify the certificate</p>
                        <p>or visit the verification URL above</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {showActions && (
            <TabsContent value="actions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Certificate
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Certificate
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(certificate.certificateUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Online
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(shareUrl, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Verify Certificate
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}