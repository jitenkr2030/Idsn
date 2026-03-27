import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { ActivityType, EvidenceStatus } from '@/types'

// GET /api/competitions/activities - Get activities for a school
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

    const activities = await db.competitionActivity.findMany({
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
            state: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      activities
    })

  } catch (error) {
    console.error('Get competition activities error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/competitions/activities - Add or update activity
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

    const formData = await request.formData()
    const competitionId = formData.get('competitionId') as string
    const schoolId = formData.get('schoolId') as string
    const activityId = formData.get('activityId') as string
    const activityType = formData.get('activityType') as ActivityType
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const evidenceFile = formData.get('evidence') as File

    if (!competitionId || !schoolId || !activityType || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Calculate base points for activity type
    let basePoints = 0
    switch (activityType) {
      case ActivityType.TEACHER_TRAINING:
        basePoints = 10
        break
      case ActivityType.ACADEMY_ADOPTION:
        basePoints = 15
        break
      case ActivityType.OFFLINE_SERVER:
        basePoints = 20
        break
      case ActivityType.PARENT_ENGAGEMENT:
        basePoints = 5
        break
      case ActivityType.DIGITAL_INNOVATION:
        basePoints = 10
        break
    }

    // Add evidence submission points
    let totalPoints = basePoints
    let evidenceUrl = null

    if (evidenceFile) {
      // In a real implementation, upload to storage service
      evidenceUrl = `/uploads/competitions/${schoolId}/${evidenceFile.name}`
      totalPoints += 2 // Evidence submission bonus
    }

    let activity
    if (activityId) {
      // Update existing activity
      activity = await db.competitionActivity.update({
        where: { id: activityId },
        data: {
          title,
          description,
          points: totalPoints,
          evidenceUrl,
          evidenceType: evidenceFile?.type || 'DOCUMENT',
          status: EvidenceStatus.PENDING
        }
      })
    } else {
      // Create new activity
      activity = await db.competitionActivity.create({
        data: {
          competitionId,
          schoolId,
          activityType,
          title,
          description,
          points: totalPoints,
          evidenceUrl,
          evidenceType: evidenceFile?.type || 'DOCUMENT',
          status: EvidenceStatus.PENDING
        }
      })
    }

    // Update submission total points
    await updateSubmissionPoints(competitionId, schoolId)

    return NextResponse.json({
      success: true,
      message: activityId ? 'Activity updated successfully' : 'Activity added successfully',
      activity
    })

  } catch (error) {
    console.error('Add competition activity error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/competitions/activities/[id] - Delete activity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id } = await params

    // Get activity details before deletion
    const activity = await db.competitionActivity.findUnique({
      where: { id }
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    // Delete activity
    await db.competitionActivity.delete({
      where: { id }
    })

    // Update submission total points
    await updateSubmissionPoints(activity.competitionId, activity.schoolId)

    return NextResponse.json({
      success: true,
      message: 'Activity deleted successfully'
    })

  } catch (error) {
    console.error('Delete competition activity error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to update submission points
async function updateSubmissionPoints(competitionId: string, schoolId: string) {
  // Calculate total points from all activities
  const activities = await db.competitionActivity.findMany({
    where: {
      competitionId,
      schoolId
    }
  })

  const totalPoints = activities.reduce((sum, activity) => sum + activity.points, 0)

  // Determine tier based on points
  let tier = 'BRONZE'
  if (totalPoints >= 151) tier = 'PLATINUM'
  else if (totalPoints >= 101) tier = 'GOLD'
  else if (totalPoints >= 51) tier = 'SILVER'

  // Update submission
  const submission = await db.competitionSubmission.findUnique({
    where: {
      schoolId_competitionId: {
        schoolId,
        competitionId
      }
    }
  })

  if (submission) {
    await db.competitionSubmission.update({
      where: { id: submission.id },
      data: {
        totalPoints,
        tier
      }
    })

    // Update leaderboard
    const competition = await db.competition.findUnique({
      where: { id: competitionId }
    })

    if (competition) {
      await updateLeaderboard(competitionId, schoolId, totalPoints, tier, competition.level)
    }
  }
}

// Helper function to update leaderboard
async function updateLeaderboard(
  competitionId: string,
  schoolId: string,
  totalPoints: number,
  tier: string,
  level: string
) {
  // Get school details
  const school = await db.school.findUnique({
    where: { id: schoolId }
  })

  // Check if leaderboard entry exists
  const existingEntry = await db.competitionLeaderboard.findUnique({
    where: {
      competitionId_schoolId_level: {
        competitionId,
        schoolId,
        level
      }
    }
  })

  if (existingEntry) {
    // Update existing entry
    await db.competitionLeaderboard.update({
      where: { id: existingEntry.id },
      data: {
        totalPoints,
        tier,
        state: school?.state,
        district: school?.district
      }
    })
  } else {
    // Create new entry
    await db.competitionLeaderboard.create({
      data: {
        competitionId,
        schoolId,
        totalPoints,
        tier,
        level,
        state: school?.state,
        district: school?.district,
        rank: 0
      }
    })
  }

  // Recalculate ranks
  const leaderboard = await db.competitionLeaderboard.findMany({
    where: {
      competitionId,
      level
    },
    orderBy: { totalPoints: 'desc' }
  })

  for (let i = 0; i < leaderboard.length; i++) {
    await db.competitionLeaderboard.update({
      where: { id: leaderboard[i].id },
      data: { rank: i + 1 }
    })
  }
}