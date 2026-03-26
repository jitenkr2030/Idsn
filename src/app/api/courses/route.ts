import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { CourseLevel } from '@/types'

// GET /api/courses - Get available courses
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const level = searchParams.get('level') as CourseLevel | null
    const category = searchParams.get('category') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = {
      isPublished: true
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (level) {
      whereClause.level = level
    }

    if (category) {
      whereClause.category = { contains: category, mode: 'insensitive' }
    }

    const [courses, total] = await Promise.all([
      db.course.findMany({
        where: whereClause,
        include: {
          modules: {
            where: { isPublished: true },
            select: {
              id: true,
              title: true,
              duration: true,
              _count: {
                select: {
                  lessons: true,
                  quizzes: true
                }
              }
            },
            orderBy: { order: 'asc' }
          },
          _count: {
            select: {
              enrollments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.course.count({ where: whereClause })
    ])

    // Get user's enrollments
    const enrollments = await db.enrollment.findMany({
      where: {
        userId: decoded.id,
        status: 'ACTIVE'
      },
      select: {
        courseId: true,
        progress: true,
        completedAt: true
      }
    })

    const enrolledCourseIds = new Set(enrollments.map(e => e.courseId))

    return NextResponse.json({
      success: true,
      courses: courses.map(course => ({
        ...course,
        isEnrolled: enrolledCourseIds.has(course.id),
        userProgress: enrollments.find(e => e.courseId === course.id)?.progress || 0
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get courses error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/courses - Create new course (Admin only)
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
      title, 
      description, 
      category, 
      level, 
      duration, 
      thumbnail, 
      isRequired,
      points,
      modules 
    } = body

    const course = await db.course.create({
      data: {
        title,
        description,
        category,
        level: level as CourseLevel,
        duration,
        thumbnail,
        isRequired: isRequired || false,
        points: points || 0,
        modules: {
          create: modules?.map((module: any, index: number) => ({
            title: module.title,
            description: module.description,
            content: module.content,
            videoUrl: module.videoUrl,
            order: index + 1,
            duration: module.duration || 0,
            isPublished: module.isPublished || false,
            lessons: {
              create: module.lessons?.map((lesson: any, lessonIndex: number) => ({
                title: lesson.title,
                content: lesson.content,
                videoUrl: lesson.videoUrl,
                order: lessonIndex + 1,
                duration: lesson.duration || 0,
                isPublished: lesson.isPublished || false
              })) || []
            },
            quizzes: {
              create: module.quizzes?.map((quiz: any) => ({
                title: quiz.title,
                description: quiz.description,
                timeLimit: quiz.timeLimit,
                passingScore: quiz.passingScore || 70,
                maxAttempts: quiz.maxAttempts || 3,
                isPublished: quiz.isPublished || false,
                questions: {
                  create: quiz.questions?.map((question: any, qIndex: number) => ({
                    question: question.question,
                    type: question.type,
                    options: question.options ? JSON.stringify(question.options) : null,
                    correctAnswer: question.correctAnswer,
                    points: question.points || 1,
                    order: qIndex + 1
                  })) || []
                }
              })) || []
            }
          })) || []
        }
      },
      include: {
        modules: {
          include: {
            lessons: true,
            quizzes: {
              include: {
                questions: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Course created successfully',
      course
    })

  } catch (error) {
    console.error('Create course error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}