'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  MapPin, 
  Award, 
  Users, 
  Download,
  Share2,
  QrCode
} from 'lucide-react'

interface CertificateData {
  success: boolean
  certificate?: {
    id: string
    certificateId: string
    title: string
    description: string
    level: string
    rank: number
    tier: string
    issuedDate: string
    qrCode: string
    school: {
      id: string
      name: string
      city: string
      state: string
      address: string
      membershipTier: string
      idsnRating: number
    }
    competition: {
      id: string
      name: string
      level: string
      description: string
      startDate: string
      endDate: string
    }
    submission: {
      totalPoints: number
      tier: string
      rank: number
      submittedAt: string
    }
  }
  message?: string
  error?: string
}

const TIER_COLORS = {
  BRONZE: 'bg-orange-100 text-orange-800 border-orange-200',
  SILVER: 'bg-gray-100 text-gray-800 border-gray-200',
  GOLD: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PLATINUM: 'bg-purple-100 text-purple-800 border-purple-200'
} as const

const LEVEL_COLORS = {
  DISTRICT: 'bg-blue-100 text-blue-800',
  STATE: 'bg-green-100 text-green-800',
  NATIONAL: 'bg-red-100 text-red-800'
} as const

export default function CertificateVerification() {
  const params = useParams()
  const certificateId = params.certificateId as string
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (certificateId) {
      verifyCertificate()
    }
  }, [certificateId])

  const verifyCertificate = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/competitions/certificates/${certificateId}`)
      const data = await response.json()
      setCertificateData(data)
      
      if (!data.success) {
        setError(data.message || data.error || 'Certificate verification failed')
      }
    } catch (err) {
      setError('Failed to verify certificate. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const downloadCertificate = () => {
    if (certificateData?.certificate) {
      // Create a temporary link to download the certificate
      const link = document.createElement('a')
      link.href = `/api/competitions/certificates/${certificateId}/download`
      link.download = `certificate-${certificateId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const shareCertificate = async () => {
    if (certificateData?.certificate) {
      const shareData = {
        title: `${certificateData.certificate.school.name} - ${certificateData.certificate.title}`,
        text: `I'm proud to share my achievement in the ${certificateData.certificate.competition.name} competition!`,
        url: window.location.href
      }

      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        )
        alert('Certificate link copied to clipboard!')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying certificate...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!certificateData?.certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h2>
              <p className="text-gray-600 mb-4">The certificate you're looking for doesn't exist or has been revoked.</p>
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { certificate } = certificateData

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate Verified</h1>
          <p className="text-gray-600">This is a valid and authentic competition certificate</p>
        </div>

        {/* Certificate Details */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{certificate.title}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge className={LEVEL_COLORS[certificate.level as keyof typeof LEVEL_COLORS]}>
                  {certificate.level}
                </Badge>
                <Badge className={TIER_COLORS[certificate.tier as keyof typeof TIER_COLORS]}>
                  {certificate.tier}
                </Badge>
              </div>
            </div>
            <CardDescription>{certificate.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* School Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  School Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">School Name</p>
                    <p className="font-medium text-gray-900">{certificate.school.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {certificate.school.city}, {certificate.school.state}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium text-gray-900">{certificate.school.address}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-sm text-gray-600">Membership</p>
                      <Badge variant="outline">{certificate.school.membershipTier}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">IDSN Rating</p>
                      <Badge variant="outline">{certificate.school.idsnRating} ⭐</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Competition Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Competition Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Competition</p>
                    <p className="font-medium text-gray-900">{certificate.competition.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Level</p>
                    <Badge className={LEVEL_COLORS[certificate.competition.level as keyof typeof LEVEL_COLORS]}>
                      {certificate.competition.level}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Period</p>
                    <p className="font-medium text-gray-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(certificate.competition.startDate).toLocaleDateString()} - {new Date(certificate.competition.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Rank</p>
                      <p className="text-2xl font-bold text-gray-900">#{certificate.rank}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Points</p>
                      <p className="text-2xl font-bold text-gray-900">{certificate.submission.totalPoints}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tier</p>
                      <Badge className={TIER_COLORS[certificate.tier as keyof typeof TIER_COLORS]}>
                        {certificate.tier}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Certificate Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Certificate ID</p>
                <p className="font-mono text-sm text-gray-900">{certificate.certificateId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Issued Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(certificate.issuedDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* QR Code */}
            {certificate.qrCode && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Verification QR Code</p>
                <div className="inline-block p-4 bg-white border rounded-lg">
                  <img 
                    src={certificate.qrCode} 
                    alt="Certificate QR Code" 
                    className="w-32 h-32"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Scan to verify this certificate</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={downloadCertificate} className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Download Certificate
          </Button>
          <Button onClick={shareCertificate} variant="outline" className="flex-1 sm:flex-none">
            <Share2 className="w-4 h-4 mr-2" />
            Share Certificate
          </Button>
        </div>

        {/* Verification Info */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <QrCode className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">About This Verification</h4>
                <p className="text-sm text-gray-600 mt-1">
                  This certificate has been verified through the IDSN Portal's secure verification system. 
                  The QR code contains a unique identifier that can be used to authenticate the certificate's validity.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Verification Date: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}