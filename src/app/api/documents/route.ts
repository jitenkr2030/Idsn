import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET /api/documents - Get user's documents
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
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = { userId: decoded.id }

    if (category) {
      whereClause.category = { contains: category, mode: 'insensitive' }
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [documents, total] = await Promise.all([
      db.document.findMany({
        where: whereClause,
        include: {
          submission: {
            select: {
              id: true,
              status: true,
              submittedAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.document.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/documents - Upload new document
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
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const isPublic = formData.get('isPublic') === 'true'
    const file = formData.get('file') as File
    const submissionId = formData.get('submissionId') as string

    if (!title || !category || !file) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // In a real implementation, you would upload the file to a storage service
    // For now, we'll simulate the upload
    const fileUrl = `/uploads/${decoded.id}/${file.name}`
    const fileSize = file.size

    const document = await db.document.create({
      data: {
        userId: decoded.id,
        title,
        description,
        fileUrl,
        fileName: file.name,
        fileSize,
        mimeType: file.type,
        category,
        isPublic,
        submissionId: submissionId || null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      document
    })

  } catch (error) {
    console.error('Upload document error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}