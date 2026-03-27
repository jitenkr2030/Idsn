import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/verify/[certificateId] - Verify certificate
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params

    if (!certificateId) {
      return NextResponse.json(
        { error: 'Certificate ID is required' },
        { status: 400 }
      )
    }

    // Find certificate by ID
    const certificate = await db.certificate.findFirst({
      where: {
        certificateId: certificateId.toUpperCase()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true
          }
        },
        school: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            membershipTier: true,
            idsnRating: true,
            logo: true,
            website: true
          }
        }
      }
    })

    if (!certificate) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Certificate not found',
          message: 'This certificate does not exist in our database.'
        },
        { status: 404 }
      )
    }

    // Check if certificate is expired
    const isExpired = certificate.expiryDate && new Date(certificate.expiryDate) < new Date()

    if (isExpired) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Certificate expired',
          message: 'This certificate has expired.',
          certificate: {
            id: certificate.id,
            certificateId: certificate.certificateId,
            type: certificate.type,
            title: certificate.title,
            status: certificate.status,
            issuedDate: certificate.issuedDate,
            expiryDate: certificate.expiryDate
          }
        },
        { status: 410 }
      )
    }

    // Check if certificate is active
    if (certificate.status !== 'APPROVED') {
      return NextResponse.json(
        {
          valid: false,
          error: 'Certificate not active',
          message: `This certificate is currently ${certificate.status.toLowerCase()}.`,
          certificate: {
            id: certificate.id,
            certificateId: certificate.certificateId,
            type: certificate.type,
            title: certificate.title,
            status: certificate.status,
            issuedDate: certificate.issuedDate
          }
        },
        { status: 403 }
      )
    }

    // Certificate is valid
    return NextResponse.json({
      valid: true,
      message: 'This certificate is valid and authentic.',
      certificate: {
        id: certificate.id,
        certificateId: certificate.certificateId,
        type: certificate.type,
        title: certificate.title,
        description: certificate.description,
        score: certificate.score,
        maxScore: certificate.maxScore,
        rating: certificate.rating,
        status: certificate.status,
        issuedDate: certificate.issuedDate,
        expiryDate: certificate.expiryDate,
        certificateUrl: certificate.certificateUrl,
        qrCode: certificate.qrCode,
        isPublic: certificate.isPublic,
        user: certificate.user,
        school: certificate.school,
        verifiedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Certificate verification error:', error)
    return NextResponse.json(
      { 
        valid: false,
        error: 'Verification failed',
        message: 'An error occurred during verification.'
      },
      { status: 500 }
    )
  }
}