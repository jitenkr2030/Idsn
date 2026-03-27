import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET /api/member-directory - Get member directory
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const state = searchParams.get('state') || ''
    const tier = searchParams.get('tier') as 'BASIC' | 'SILVER' | 'GOLD' | 'PLATINUM' | null
    const expertise = searchParams.get('expertise') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = {
      isVisible: true
    }

    if (search) {
      whereClause.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { school: { name: { contains: search, mode: 'insensitive' } } },
        { bio: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (state) {
      whereClause.school = {
        state: { contains: state, mode: 'insensitive' }
      }
    }

    if (tier) {
      whereClause.school = {
        membershipTier: tier
      }
    }

    const [members, total] = await Promise.all([
      db.memberDirectory.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true
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
              isVerified: true
            }
          }
        },
        orderBy: [
          { school: { membershipTier: 'desc' } },
          { school: { idsnRating: 'desc' } },
          { user: { name: 'asc' } }
        ],
        skip,
        take: limit
      }),
      db.memberDirectory.count({ where: whereClause })
    ])

    // Get membership tier statistics
    const tierStats = await db.memberDirectory.groupBy({
      by: ['schoolId'],
      _count: true
    })

    return NextResponse.json({
      success: true,
      members,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        totalMembers: total,
        tierDistribution: tierStats
      }
    })

  } catch (error) {
    console.error('Get member directory error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/member-directory - Update member directory profile
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
    const { bio, expertise, achievements, socialLinks, isVisible } = body

    if (!decoded.schoolId) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 })
    }

    // Update or create member directory entry
    const memberDirectory = await db.memberDirectory.upsert({
      where: {
        schoolId: decoded.schoolId,
        userId: decoded.id
      },
      update: {
        bio: bio || null,
        expertise: expertise ? JSON.stringify(expertise) : null,
        achievements: achievements ? JSON.stringify(achievements) : null,
        socialLinks: socialLinks || null,
        isVisible: isVisible !== undefined ? isVisible : true
      },
      create: {
        schoolId: decoded.schoolId,
        userId: decoded.id,
        bio: bio || null,
        expertise: expertise ? JSON.stringify(expertise) : null,
        achievements: achievements ? JSON.stringify(achievements) : null,
        socialLinks: socialLinks || null,
        isVisible: isVisible !== undefined ? isVisible : true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Member directory profile updated successfully',
      memberDirectory
    })

  } catch (error) {
    console.error('Update member directory error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}