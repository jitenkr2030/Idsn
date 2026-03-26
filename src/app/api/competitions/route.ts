import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET /api/competitions - Get competitions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const whereClause: any = {
      isActive: true
    }

    if (level) {
      whereClause.level = level
    }

    if (status) {
      whereClause.status = status
    }

    const skip = (page - 1) * limit

    const [competitions, total] = await Promise.all([
      db.competition.findMany({
        where: whereClause,
        include: {
          submissions: {
            include: {
              school: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                  state: true,
                  membershipTier: true
                }
              }
            }
          },
          leaderboards: {
            include: {
              school: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                  state: true
                }
              }
            },
            orderBy: {
              rank: 'asc'
            },
            take: 10
          }
        },
        orderBy: [
          { status: 'desc' },
          { startDate: 'asc' }
        ],
        skip,
        take: limit
      }),
      db.competition.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      competitions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get competitions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/competitions - Create new competition (Admin only)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'INTERNAL_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      name, 
      description, 
      level, 
      startDate, 
      endDate, 
      submissionDeadline, 
      resultsDate,
      maxParticipants,
      prizePool 
    } = body

    const competition = await db.competition.create({
      data: {
        name,
        description,
        level,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        submissionDeadline: new Date(submissionDeadline),
        resultsDate: new Date(resultsDate),
        maxParticipants,
        prizePool: prizePool ? parseFloat(prizePool) : null,
        status: 'UPCOMING',
        isActive: true
      }
    })

    // Create activity log
    await db.activityLog.create({
      data: {
        userId: decoded.id,
        action: 'COMPETITION_CREATED',
        entity: 'Competition',
        entityId: competition.id,
        metadata: JSON.stringify({
          name,
          level,
          startDate,
          endDate
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Competition created successfully',
      competition
    })

  } catch (error) {
    console.error('Create competition error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/competitions/[id] - Update competition
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'INTERNAL_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body

    const competition = await db.competition.update({
      where: { id },
      data: { status }
    })

    // Create activity log
    await db.activityLog.create({
      data: {
        userId: decoded.id,
        action: 'COMPETITION_UPDATED',
        entity: 'Competition',
        entityId: id,
        metadata: JSON.stringify({
          competitionId: competition.id,
          status
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: `Competition ${status.toLowerCase()} successfully`,
      competition
    })

  } catch (error) {
    console.error('Update competition error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}