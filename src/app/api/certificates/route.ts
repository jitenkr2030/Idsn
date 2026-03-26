import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'

// POST /api/certificates/generate - Generate certificate with QR code
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      type, 
      title, 
      description, 
      score, 
      maxScore, 
      schoolId,
      auditSubmissionId 
    } = body

    // Generate unique certificate ID
    const certificateId = `IDSN-${uuidv4().split('-')[0].toUpperCase()}`

    // Calculate rating based on score
    let rating = 1
    if (maxScore > 0) {
      const percentage = (score / maxScore) * 100
      if (percentage >= 90) rating = 5
      else if (percentage >= 75) rating = 4
      else if (percentage >= 60) rating = 3
      else if (percentage >= 40) rating = 2
    }

    // Set expiry date (1 year from now for school certifications)
    const expiryDate = new Date()
    expiryDate.setFullYear(expiryDate.getFullYear() + 1)

    // Generate QR code data
    const qrData = JSON.stringify({
      certificateId,
      type,
      issuedAt: new Date().toISOString(),
      verifyUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/${certificateId}`
    })

    // Generate QR code as base64
    const qrCode = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    // Create certificate in database
    const certificate = await db.certificate.create({
      data: {
        certificateId,
        userId: decoded.id,
        schoolId,
        type: 'SCHOOL_CERTIFICATION',
        title,
        description,
        score,
        maxScore,
        rating,
        status: 'APPROVED',
        issuedDate: new Date(),
        expiryDate,
        qrCode,
        issuedBy: decoded.id,
        isPublic: true
      },
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

    // Update school rating if this is a school certification
    if (type === 'SCHOOL_CERTIFICATION' && schoolId) {
      await db.school.update({
        where: { id: schoolId },
        data: {
          idsnRating: rating,
          isVerified: true,
          verificationDate: new Date(),
          expiryDate
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Certificate generated successfully!',
      certificate
    })

  } catch (error) {
    console.error('Certificate generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/certificates - Get user certificates
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const whereClause: any = { userId: decoded.id }
    if (type) whereClause.type = type
    if (status) whereClause.status = status

    const certificates = await db.certificate.findMany({
      where: whereClause,
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
            state: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      certificates
    })

  } catch (error) {
    console.error('Get certificates error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}