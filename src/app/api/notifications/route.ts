import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET /api/notifications - Get user notifications
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
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const skip = (page - 1) * limit

    const whereClause: any = { userId: decoded.id }
    if (unreadOnly) {
      whereClause.isRead = false
    }

    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.notification.count({ where: { userId: decoded.id } }),
      db.notification.count({ where: { userId: decoded.id, isRead: false } })
    ])

    return NextResponse.json({
      success: true,
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    })

  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Mark notifications as read
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
    const { notificationIds, markAll } = body

    if (markAll) {
      // Mark all notifications as read
      await db.notification.updateMany({
        where: {
          userId: decoded.id,
          isRead: false
        },
        data: {
          isRead: true
        }
      })
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      await db.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: decoded.id
        },
        data: {
          isRead: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read'
    })

  } catch (error) {
    console.error('Mark notifications read error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/notifications - Create new notification (Admin only)
export async function PUT(request: NextRequest) {
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
    const { userIds, title, message, type, actionUrl, metadata } = body

    if (!userIds || !Array.isArray(userIds) || !title || !message || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create notifications for multiple users
    const notifications = await db.notification.createMany({
      data: userIds.map((userId: string) => ({
        userId,
        title,
        message,
        type: type as any,
        actionUrl,
        metadata: metadata ? JSON.stringify(metadata) : null
      }))
    })

    return NextResponse.json({
      success: true,
      message: `Created ${notifications.count} notifications`,
      count: notifications.count
    })

  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}