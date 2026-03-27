import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// POST /api/enrollments - Enroll in a course
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
    const { courseId } = body

    // Check if course exists and is published
    const course = await db.course.findUnique({
      where: { 
        id: courseId,
        isPublished: true 
      },
      include: {
        modules: {
          where: { isPublished: true },
          select: { id: true }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found or not available' },
        { status: 404 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: decoded.id,
          courseId
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 409 }
      )
    }

    // Create enrollment
    const enrollment = await db.enrollment.create({
      data: {
        userId: decoded.id,
        courseId,
        status: 'ACTIVE'
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            level: true,
            duration: true,
            thumbnail: true
          }
        }
      }
    })

    // Initialize progress for all modules
    if (course.modules.length > 0) {
      await db.courseProgress.createMany({
        data: course.modules.map(module => ({
          userId: decoded.id,
          moduleId: module.id,
          status: 'NOT_STARTED'
        }))
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully enrolled in course',
      enrollment
    })

  } catch (error) {
    console.error('Enrollment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/enrollments - Get user's enrollments
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
      whereClause.status = status
    }

    const enrollments = await db.enrollment.findMany({
      where: whereClause,
      include: {
        course: {
          include: {
            modules: {
              where: { isPublished: true },
              select: {
                id: true,
                title: true,
                duration: true
              }
            },
            _count: {
              select: {
                modules: true
              }
            }
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      enrollments
    })

  } catch (error) {
    console.error('Get enrollments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}