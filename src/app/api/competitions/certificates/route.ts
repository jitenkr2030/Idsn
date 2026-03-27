import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'
import { CompetitionLevel, CompetitionTier } from '@/types'

// GET /api/competitions/certificates - Get certificates for a school
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
    const competitionId = searchParams.get('competitionId')
    const schoolId = searchParams.get('schoolId')

    if (!competitionId || !schoolId) {
      return NextResponse.json({ error: 'Competition ID and School ID are required' }, { status: 400 })
    }

    const certificates = await db.competitionCertificate.findMany({
      where: {
        competitionId,
        schoolId
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            address: true
          }
        },
        competition: {
          select: {
            id: true,
            name: true,
            level: true,
            description: true
          }
        },
        submission: {
          select: {
            totalPoints: true,
            tier: true,
            rank: true
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
    console.error('Get competition certificates error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/competitions/certificates - Generate competition certificate
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
    const { competitionId, schoolId, submissionId } = body

    // Get submission details
    const submission = await db.competitionSubmission.findUnique({
      where: { id: submissionId },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            address: true
          }
        },
        competition: {
          select: {
            id: true,
            name: true,
            level: CompetitionLevel,
            description: true
          }
        }
      }
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Generate unique certificate ID
    const certificateId = `IDSN-COMP-${uuidv4().split('-')[0].toUpperCase()}`

    // Generate QR code data
    const qrData = JSON.stringify({
      certificateId,
      competitionName: submission.competition.name,
      schoolName: submission.school.name,
      level: submission.competition.level,
      rank: submission.rank,
      tier: submission.tier,
      points: submission.totalPoints,
      issuedDate: new Date().toISOString(),
      verifyUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/competitions/certificates/${certificateId}`
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

    // Create certificate title based on level and tier
    let title = ''
    let description = ''

    if (submission.competition.level === CompetitionLevel.DISTRICT) {
      title = `District Level ${submission.tier} Achievement`
      description = `Achieved ${submission.tier} tier with ${submission.totalPoints} points in the ${submission.competition.name} district competition`
    } else if (submission.competition.level === CompetitionLevel.STATE) {
      title = `State Level ${submission.tier} Achievement`
      description = `Achieved ${submission.tier} tier with ${submission.totalPoints} points in the ${submission.competition.name} state competition`
    } else {
      title = `National Level ${submission.tier} Achievement`
      description = `Achieved ${submission.tier} tier with ${submission.totalPoints} points in the ${submission.competition.name} national competition`
    }

    // Create certificate
    const certificate = await db.competitionCertificate.create({
      data: {
        schoolId: submission.school.id,
        competitionId: submission.competition.id,
        submissionId: submission.id,
        certificateId,
        level: submission.competition.level,
        rank: submission.rank || 0,
        tier: submission.tier,
        title,
        description,
        qrCode,
        issuedDate: new Date(),
        isPublic: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Certificate generated successfully',
      certificate
    })

  } catch (error) {
    console.error('Generate competition certificate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/competitions/certificates/[certificateId] - Verify certificate
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params

    const certificate = await db.competitionCertificate.findUnique({
      where: { certificateId },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            address: true,
            membershipTier: true,
            idsnRating: true
          }
        },
        competition: {
          select: {
            id: true,
            name: true,
            level: true,
            description: true,
            startDate: true,
            endDate: true
          }
        },
        submission: {
          select: {
            totalPoints: true,
            tier: true,
            rank: true,
            submittedAt: true
          }
        }
      }
    })

    if (!certificate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Certificate not found',
          message: 'This competition certificate does not exist in our system.'
        },
        { status: 404 }
      )
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
        level: certificate.level,
        rank: certificate.rank,
        tier: certificate.tier,
        issuedDate: certificate.issuedDate,
        qrCode: certificate.qrCode,
        school: certificate.school,
        competition: certificate.competition,
        submission: certificate.submission,
        verificationDate: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Verify competition certificate error:', error)
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