'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  Award,
  School,
  Calendar,
  User,
  Star,
  Download,
  Share2,
  ArrowLeft
} from 'lucide-react'

interface CertificateData {
  id: string
  certificateId: string
  title: string
  description?: string
  type: string
  score?: number
  maxScore?: number
  rating?: number
  status: string
  issuedDate?: string
  expiryDate?: string
  issuedBy?: string
  user: {
    id: string
    name: string
    email: string
  }
  school?: {
    id: string
    name: string
    city: string
    state: string
    membershipTier?: string
    idsnRating?: number
  }
  verificationDate: string
}

export default function CertificateVerification() {
  const params = useParams()
  const router = useRouter()
  const certificateId = params.certificateId as string

  const [loading, setLoading] = useState(true)
  const [certificate, setCertificate] = useState<CertificateData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    verifyCertificate()
  }, [certificateId])

  const verifyCertificate = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/certificates/verify/${certificateId}`)
      const data = await response.json()

      if (data.success) {
        setCertificate(data.certificate)
        setError(null)
      } else {
        setError(data.message || 'Verification failed')
        setCertificate(data.certificate || null)
      }
    } catch (err) {
      setError('Unable to verify certificate. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = () => {
    if (loading) return <Clock className="w-6 h-6 animate-spin" />
    if (error) return <XCircle className="w-6 h-6 text-red-500" />
    return <CheckCircle className="w-6 h-6 text-green-500" />
  }

  const getStatusColor = () => {
    if (loading) return 'bg-blue-50 border-blue-200'
    if (error) return 'bg-red-50 border-red-200'
    return 'bg-green-50 border-green-200'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>
      case 'EXPIRED':
        return <Badge variant="destructive">Expired</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStarRating = (rating?: number) => {
    if (!rating) return null
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  const shareCertificate = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `IDSN Certificate - ${certificate?.title}`,
          text: `Verify this IDSN certificate: ${certificateId}`,
          url: window.location.href
        })
      } catch (err) {
        // Fallback to copying to clipboard
        copyToClipboard()
      }
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      // You could add a toast notification here
    }
  }

  const downloadCertificate = () => {
    // This would generate a PDF certificate
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold mb-2">Verifying Certificate</h3>
            <p className="text-muted-foreground">Please wait while we verify this certificate...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to IDSN Portal</span>
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <span className="font-semibold">IDSN Verification</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Verification Status Card */}
        <Card className={`mb-8 ${getStatusColor()}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon()}
                <div>
                  <CardTitle className="text-xl">
                    {error ? 'Verification Failed' : 'Certificate Verified'}
                  </CardTitle>
                  <CardDescription>
                    Certificate ID: {certificateId}
                  </CardDescription>
                </div>
              </div>
              {certificate && getStatusBadge(certificate.status)}
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  This certificate is authentic and has been verified by the IDSN system.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Certificate Details */}
        {certificate && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Certificate Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Certificate Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Title</label>
                  <p className="font-semibold">{certificate.title}</p>
                </div>
                
                {certificate.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-sm">{certificate.description}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="text-sm">{certificate.type.replace('_', ' ')}</p>
                </div>

                {certificate.score !== undefined && certificate.maxScore && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Score</label>
                    <p className="font-semibold">
                      {certificate.score} / {certificate.maxScore}
                      <span className="text-sm text-gray-500 ml-2">
                        ({Math.round((certificate.score / certificate.maxScore) * 100)}%)
                      </span>
                    </p>
                  </div>
                )}

                {certificate.rating && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">IDSN Rating</label>
                    <div className="flex items-center space-x-1">
                      {getStarRating(certificate.rating)}
                      <span className="font-semibold ml-2">{certificate.rating} Stars</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {certificate.issuedDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Issued Date</label>
                      <p className="text-sm flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(certificate.issuedDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  
                  {certificate.expiryDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Expiry Date</label>
                      <p className="text-sm flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(certificate.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Verified On</label>
                  <p className="text-sm">
                    {new Date(certificate.verificationDate).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recipient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Recipient Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Certificate Holder</label>
                  <p className="font-semibold">{certificate.user.name}</p>
                  <p className="text-sm text-gray-600">{certificate.user.email}</p>
                </div>

                {certificate.school && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">School/Organization</label>
                    <div className="flex items-start space-x-2">
                      <School className="w-4 h-4 mt-0.5 text-gray-500" />
                      <div>
                        <p className="font-semibold">{certificate.school.name}</p>
                        <p className="text-sm text-gray-600">
                          {certificate.school.city}, {certificate.school.state}
                        </p>
                        {certificate.school.membershipTier && (
                          <Badge variant="outline" className="mt-1">
                            {certificate.school.membershipTier} Member
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex items-center space-x-2 mb-3">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Verification Features</span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Authentic IDSN certificate</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Blockchain-verified QR code</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Tamper-proof verification</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions */}
        {certificate && !error && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={downloadCertificate} className="flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download Certificate</span>
                </Button>
                <Button variant="outline" onClick={shareCertificate} className="flex items-center space-x-2">
                  <Share2 className="w-4 h-4" />
                  <span>Share Verification</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">About IDSN Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-gray-600">
                IDSN (Indian Digital School Network) certificates are secured with advanced QR code technology 
                and blockchain verification. Each certificate contains a unique identifier that can be verified 
                instantly through our secure verification system.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm">Secure Verification</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Tamper-proof verification system
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm">Instant Validation</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Real-time certificate verification
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm">Globally Recognized</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Accepted across educational institutions
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}