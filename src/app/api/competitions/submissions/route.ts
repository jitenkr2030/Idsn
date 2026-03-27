import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET /api/competitions/submissions - Get competition submissions
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
    const competitionId = searchParams.get('competitionId') || ''
    const schoolId = searchParams.get('schoolId') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const whereClause: any = {}

    if (decoded.role === 'SCHOOL_ADMIN') {
      whereClause.schoolId = decoded.schoolId!
    }

    if (competitionId) {
      whereClause.competitionId = competitionId
    }

    if (schoolId) {
      whereClause.schoolId = schoolId
    }

    if (status) {
      whereClause.status = status
    }

    const skip = (page - 1) * limit

    const [submissions, total] = await Promise.all([
      db.competitionSubmission.findMany({
        where: whereClause,
        include: {
          school: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
              membershipTier: true
            }
          },
          competition: {
            select: {
              id: true,
              name: true,
              level: true,
              status: true,
              startDate: true,
              endDate: true,
              submissionDeadline: true
            }
          },
          activities: {
            where: {
              status: 'APPROVED'
            }
          }
        },
        orderBy: {
          totalPoints: 'desc'
        },
        skip,
        take: limit
      }),
      db.competitionSubmission.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get competition submissions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/competitions/submissions - Create or update competition submission
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    if (!decoded.schoolId) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { competitionId, activities } = body

    // Check if competition exists and is active
    const competition = await db.competition.findUnique({
      where: {
        id: competitionId,
        isActive: true
      }
    })

    if (!competition) {
      return NextResponse.json(
        { error: 'Competition not found or not active' },
        { status: 404 }
      )
    }

    // Calculate total points and determine tier
    const totalPoints = activities
      .filter((activity: any) => activity.status === 'APPROVED')
      .reduce((sum: number, activity: any) => sum + activity.points, 0)

    const tier = getCompetitionTier(totalPoints) as 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'

    // Create or update submission
    const submission = await db.competitionSubmission.upsert({
      where: {
        schoolId_competitionId: {
          schoolId: decoded.schoolId!,
          competitionId
        }
      },
      update: {
        totalPoints,
        tier,
        status: 'SUBMITTED',
        submittedAt: new Date()
      },
      create: {
        schoolId: decoded.schoolId!,
        competitionId,
        totalPoints,
        tier,
        status: 'SUBMITTED',
        submittedAt: new Date()
      }
    })

    // Update or create activities
    for (const activity of activities) {
      await db.competitionActivity.upsert({
        where: {
          submissionId_type: {
            submissionId: submission.id,
            type: activity.type
          }
        },
        update: {
          title: activity.title,
          description: activity.description,
          points: activity.points,
          evidenceUrl: activity.evidenceUrl,
          evidenceType: activity.evidenceType,
          status: activity.status || 'PENDING',
          submittedAt: activity.submittedAt ? new Date(activity.submittedAt) : undefined
        },
        create: {
          submissionId: submission.id,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          points: activity.points,
          evidenceUrl: activity.evidenceUrl,
          evidenceType: activity.evidenceType,
          status: activity.status || 'PENDING'
        }
      })
    }

    // Update leaderboard
    await updateLeaderboard(competitionId, decoded.schoolId!, totalPoints, tier)

    // Award points for submission
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/id-points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${token}`
      },
      body: JSON.stringify({
        type: 'EARNED',
        points: totalPoints,
        description: `Competition submission: ${competition.name}`,
        referenceId: submission.id,
        metadata: JSON.stringify({
          competitionId,
          competitionName: competition.name,
          tier
        })
      })
    })

    // Create activity log
    await db.activityLog.create({
      data: {
        userId: decoded.id,
        schoolId: decoded.schoolId!,
        action: 'COMPETITION_SUBMISSION',
        entity: 'CompetitionSubmission',
        entityId: submission.id,
        metadata: JSON.stringify({
          competitionId,
          totalPoints,
          tier
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Competition submission created successfully',
      submission
    })

  } catch (error) {
    console.error('Create competition submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function updateLeaderboard(competitionId: string, schoolId: string, points: number, tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM') {
  // Get current rank
  const currentLeaderboard = await db.competitionLeaderboard.findFirst({
    where: {
      competitionId,
      schoolId
    }
  })

  // Get all submissions for this competition, ordered by points
  const allSubmissions = await db.competitionSubmission.findMany({
    where: {
      competitionId,
      status: 'SUBMITTED'
    },
    orderBy: {
      totalPoints: 'desc'
    }
  })

  // Calculate new rankings
  const rankings = allSubmissions.map((submission, index) => ({
    schoolId: submission.schoolId,
    points: submission.totalPoints,
    rank: index + 1
  }))

  // Update or create leaderboard entry
  const schoolRanking = rankings.find(r => r.schoolId === schoolId)
  
  if (currentLeaderboard) {
    await db.competitionLeaderboard.update({
      where: {
        id: currentLeaderboard.id
      },
      data: {
        points,
        tier,
        rank: schoolRanking?.rank || 0,
        previousRank: currentLeaderboard.rank
      }
    })
  } else {
    await db.competitionLeaderboard.create({
      data: {
        competitionId,
        schoolId,
        points,
        tier,
        rank: schoolRanking?.rank || 0
      }
    })
  }

  // Update all leaderboard entries
  for (const ranking of rankings) {
    await db.competitionLeaderboard.upsert({
      where: {
        competitionId_schoolId: {
          competitionId,
          schoolId: ranking.schoolId
        }
      },
      update: {
        rank: ranking.rank
      },
      create: {
        competitionId,
        schoolId: ranking.schoolId,
        points: ranking.points,
        tier: getCompetitionTier(ranking.points) as 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM',
        rank: ranking.rank
      }
    })
  }
}

function getCompetitionTier(points: number): string {
  if (points >= 150) return 'PLATINUM'
  if (points >= 101) return 'GOLD'
  if (points >= 51) return 'SILVER'
  return 'BRONZE'
}