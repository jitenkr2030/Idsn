import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET /api/membership - Get school membership info
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

    if (!decoded.schoolId) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 })
    }

    // Get membership for the user's school
    const membership = await db.membership.findFirst({
      where: {
        schoolId: decoded.schoolId
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            membershipTier: true,
            idsnRating: true,
            isVerified: true
          }
        }
      }
    })

    if (!membership) {
      // Create default membership if none exists
      const defaultMembership = await db.membership.create({
        data: {
          schoolId: decoded.schoolId,
          tier: 'BASIC',
          status: 'ACTIVE',
          points: 0,
          benefits: {
            accessToResources: true,
            basicSupport: true,
            memberDirectory: true
          }
        },
        include: {
          school: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
              membershipTier: true,
              idsnRating: true,
              isVerified: true
            }
          }
        }
      })
      return NextResponse.json({ membership: defaultMembership })
    }

    return NextResponse.json({ membership })

  } catch (error) {
    console.error('Get membership error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/membership - Update or upgrade membership
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'SCHOOL_ADMIN' && decoded.role !== 'INTERNAL_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    if (!decoded.schoolId) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { tier, paymentInfo } = body

    // Define membership benefits based on tier
    const tierBenefits = {
      BASIC: {
        accessToResources: true,
        basicSupport: true,
        memberDirectory: true,
        prioritySupport: false,
        advancedTraining: false,
        consultingHours: 0,
        competitionEntries: 1
      },
      SILVER: {
        accessToResources: true,
        basicSupport: true,
        memberDirectory: true,
        prioritySupport: true,
        advancedTraining: true,
        consultingHours: 5,
        competitionEntries: 3
      },
      GOLD: {
        accessToResources: true,
        basicSupport: true,
        memberDirectory: true,
        prioritySupport: true,
        advancedTraining: true,
        consultingHours: 15,
        competitionEntries: 5
      },
      PLATINUM: {
        accessToResources: true,
        basicSupport: true,
        memberDirectory: true,
        prioritySupport: true,
        advancedTraining: true,
        consultingHours: 30,
        competitionEntries: 10
      }
    }

    // Update or create membership
    const membership = await db.membership.upsert({
      where: {
        schoolId: decoded.schoolId
      },
      update: {
        tier,
        status: 'ACTIVE',
        benefits: tierBenefits[tier as keyof typeof tierBenefits],
        paymentInfo: paymentInfo || null,
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      },
      create: {
        schoolId: decoded.schoolId,
        tier,
        status: 'ACTIVE',
        benefits: tierBenefits[tier as keyof typeof tierBenefits],
        paymentInfo: paymentInfo || null,
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            membershipTier: true,
            idsnRating: true,
            isVerified: true
          }
        }
      }
    })

    // Update school's membership tier
    await db.school.update({
      where: { id: decoded.schoolId },
      data: { membershipTier: tier }
    })

    return NextResponse.json({
      success: true,
      message: `Membership upgraded to ${tier}`,
      membership
    })

  } catch (error) {
    console.error('Update membership error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}