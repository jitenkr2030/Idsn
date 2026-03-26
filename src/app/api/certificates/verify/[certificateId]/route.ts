import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import QRCode from 'qrcode'

// GET /api/certificates/verify/:certificateId - Verify certificate by QR code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params

    const certificate = await db.certificate.findUnique({
      where: { certificateId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        school: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            membershipTier: true,
            idsnRating: true
          }
        }
      }
    })

    if (!certificate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Certificate not found',
          message: 'This certificate does not exist in our system.'
        },
        { status: 404 }
      )
    }

    // Check if certificate is expired
    if (certificate.expiryDate && new Date(certificate.expiryDate) < new Date()) {
      return NextResponse.json({
        success: false,
        error: 'Certificate expired',
        message: 'This certificate has expired. Please contact the school for renewal.',
        certificate: {
          id: certificate.id,
          certificateId: certificate.certificateId,
          title: certificate.title,
          type: certificate.type,
          status: certificate.status,
          expiryDate: certificate.expiryDate
        }
      }, { status: 410 })
    }

    // Check if certificate is active
    if (certificate.status !== 'APPROVED') {
      return NextResponse.json({
        success: false,
        error: 'Certificate not active',
        message: `This certificate is currently ${certificate.status.toLowerCase()}.`,
        certificate: {
          id: certificate.id,
          certificateId: certificate.certificateId,
          title: certificate.title,
          type: certificate.type,
          status: certificate.status
        }
      }, { status: 400 })
    }

    // Certificate is valid
    return NextResponse.json({
      success: true,
      message: 'Certificate verified successfully!',
      certificate: {
        id: certificate.id,
        certificateId: certificate.certificateId,
        title: certificate.title,
        description: certificate.description,
        type: certificate.type,
        score: certificate.score,
        maxScore: certificate.maxScore,
        rating: certificate.rating,
        status: certificate.status,
        issuedDate: certificate.issuedDate,
        expiryDate: certificate.expiryDate,
        issuedBy: certificate.issuedBy,
        user: certificate.user,
        school: certificate.school,
        verificationDate: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Certificate verification error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Unable to verify certificate. Please try again later.'
      },
      { status: 500 }
    )
  }
}