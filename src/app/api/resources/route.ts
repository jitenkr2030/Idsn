import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET /api/resources - Get available resources
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
    const category = searchParams.get('category') || ''
    const type = searchParams.get('type') as 'DOCUMENT' | 'VIDEO' | 'TEMPLATE' | 'WHITEPAPER' | 'LESSON_PLAN' | 'POLICY_GUIDE' | 'SOFTWARE_TOOL' | null
    const isPremium = searchParams.get('isPremium')

    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = {
      isPublic: true
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      whereClause.category = { contains: category, mode: 'insensitive' }
    }

    if (type) {
      whereClause.type = type
    }

    if (isPremium !== null && isPremium !== undefined) {
      whereClause.isPremium = isPremium === 'true'
    }

    const [resources, total] = await Promise.all([
      db.resource.findMany({
        where: whereClause,
        orderBy: [
          { isPremium: 'desc' },
          { downloadCount: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      db.resource.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      resources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get resources error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/resources - Upload new resource (Admin only)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== 'INTERNAL_ADMIN' && decoded.role !== 'SCHOOL_ADMIN')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const type = formData.get('type') as any
    const isPremium = formData.get('isPremium') === 'true'
    const file = formData.get('file') as File
    const schoolId = formData.get('schoolId') as string

    if (!title || !description || !category || !type || !file) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // In a real implementation, you would upload the file to a storage service
    // For now, we'll simulate the upload
    const fileUrl = `/uploads/${file.name}`
    const fileSize = file.size

    const resource = await db.resource.create({
      data: {
        title,
        description,
        category,
        type,
        fileUrl,
        isPremium,
        schoolId: schoolId || null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Resource uploaded successfully',
      resource
    })

  } catch (error) {
    console.error('Upload resource error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}