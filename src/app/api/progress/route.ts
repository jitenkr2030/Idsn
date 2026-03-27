import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET /api/progress - Get user's overall progress
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

    // Get user's enrollments
    const enrollments = await db.enrollment.findMany({
      where: {
        userId: decoded.id,
        status: 'ACTIVE'
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            level: true,
            duration: true,
            points: true
          }
        }
      }
    })

    // Get user's certificates
    const certificates = await db.certificate.findMany({
      where: {
        userId: decoded.id,
        status: 'APPROVED'
      },
      select: {
        id: true,
        title: true,
        type: true,
        rating: true,
        issuedDate: true
      },
      orderBy: { issuedDate: 'desc' }
    })

    // Get user's achievements
    const achievements = await db.achievement.findMany({
      where: {
        userId: decoded.id
      },
      orderBy: { earnedAt: 'desc' },
      take: 10
    })

    // Get user's points
    const pointsData = await db.iDPoints.findUnique({
      where: { userId: decoded.id }
    })

    // Calculate overall statistics
    const totalCourses = enrollments.length
    const completedCourses = enrollments.filter(e => e.status === 'COMPLETED').length
    const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / Math.max(totalCourses, 1)
    const totalPoints = pointsData?.totalPoints || 0
    const totalStudyTime = enrollments.reduce((sum, e) => {
      return sum + (e.course.duration || 0)
    }, 0)

    return NextResponse.json({
      success: true,
      progress: {
        overview: {
          totalCourses,
          completedCourses,
          totalProgress: Math.round(totalProgress),
          totalPoints,
          totalStudyTime,
          certificates: certificates.length,
          achievements: achievements.length
        },
        enrollments: enrollments.map(e => ({
          id: e.id,
          course: e.course,
          progress: e.progress || 0,
          startedAt: e.startedAt,
          completedAt: e.completedAt
        })),
        certificates,
        achievements
      }
    })

  } catch (error) {
    console.error('Get progress error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}