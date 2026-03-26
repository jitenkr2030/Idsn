import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET /api/audit/submissions - Get user's audit submissions
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
    const status = searchParams.get('status')

    const whereClause: any = { userId: decoded.id }
    if (status) {
      whereClause.status = status as 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUIRED'
    }

    const submissions = await db.auditSubmission.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            auditItem: true
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
      submissions
    })

  } catch (error) {
    console.error('Get audit submissions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/audit/submissions - Create new audit submission
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
    const { schoolId, items } = body

    // Calculate total score
    let totalScore = 0
    let maxScore = 0

    const submissionItems = items.map((item: any) => {
      totalScore += item.score || 0
      maxScore += item.maxPoints || 0
      return {
        auditItemId: item.auditItemId,
        response: item.response,
        evidenceUrl: item.evidenceUrl,
        evidenceType: item.evidenceType as 'PHOTO' | 'VIDEO' | 'DOCUMENT' | 'SPEED_TEST' | 'SCREENSHOT' | 'TEXT',
        score: item.score || 0,
        isCompleted: item.isCompleted || false,
        notes: item.notes
      }
    })

    // Calculate rating (1-5 stars based on percentage)
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
    let rating = 1
    if (percentage >= 90) rating = 5
    else if (percentage >= 75) rating = 4
    else if (percentage >= 60) rating = 3
    else if (percentage >= 40) rating = 2

    const submission = await db.auditSubmission.create({
      data: {
        userId: decoded.id,
        schoolId,
        status: 'SUBMITTED',
        totalScore,
        maxScore,
        rating,
        submittedAt: new Date(),
        items: {
          create: submissionItems
        }
      },
      include: {
        items: {
          include: {
            auditItem: true
          }
        },
        school: true
      }
    })

    return NextResponse.json({
      success: true,
      submission
    })

  } catch (error) {
    console.error('Create audit submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}