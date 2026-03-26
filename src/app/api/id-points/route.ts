import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET /api/id-points - Get school's ID points
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

    // Get ID points for the school
    let idPoints = await db.iDPoints.findFirst({
      where: {
        schoolId: decoded.schoolId
      }
    })

    if (!idPoints) {
      // Create default ID points if none exists
      idPoints = await db.iDPoints.create({
        data: {
          schoolId: decoded.schoolId,
          totalPoints: 0,
          availablePoints: 0
        }
      })
    }

    // Get recent transactions
    const transactions = await db.pointsTransaction.findMany({
      where: {
        schoolId: decoded.schoolId
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get school's ranking
    const ranking = await db.school.findMany({
      select: {
        id: true,
        name: true,
        membershipTier: true,
        idsnRating: true
      },
      orderBy: [
        { membershipTier: 'desc' },
        { idsnRating: 'desc' }
      ]
    })

    const schoolRank = ranking.findIndex(school => school.id === decoded.schoolId) + 1
    const totalSchools = ranking.length

    return NextResponse.json({
      success: true,
      idPoints: {
        totalPoints: idPoints.totalPoints,
        availablePoints: idPoints.availablePoints,
        rank: schoolRank,
        totalSchools,
        percentile: Math.round(((totalSchools - schoolRank + 1) / totalSchools) * 100)
      },
      transactions
    })

  } catch (error) {
    console.error('Get ID points error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/id-points - Add points transaction
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== 'SCHOOL_ADMIN' && decoded.role !== 'INTERNAL_ADMIN')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { type, points, description, referenceId, metadata } = body

    // Validate points
    if (points <= 0) {
      return NextResponse.json(
        { error: 'Points must be greater than 0' },
        { status: 400 }
      )
    }

    // Create points transaction
    const transaction = await db.pointsTransaction.create({
      data: {
        schoolId: decoded.schoolId,
        type,
        points,
        description,
        referenceId: referenceId || null,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    })

    // Update school's ID points
    let idPoints = await db.iDPoints.findFirst({
      where: { schoolId: decoded.schoolId }
    })

    if (!idPoints) {
      idPoints = await db.iDPoints.create({
        data: {
          schoolId: decoded.schoolId,
          totalPoints: 0,
          availablePoints: 0
        }
      })
    }

    const updatedPoints = await db.iDPoints.update({
      where: { id: idPoints.id },
      data: {
        totalPoints: type === 'EARNED' 
          ? idPoints.totalPoints + points 
          : idPoints.totalPoints - points,
        availablePoints: type === 'EARNED' 
          ? idPoints.availablePoints + points 
          : idPoints.availablePoints - points,
        lastUpdated: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: `Points ${type.toLowerCase()} successfully`,
      transaction,
      updatedPoints
    })

  } catch (error) {
    console.error('Add points transaction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}