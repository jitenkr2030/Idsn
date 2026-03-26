import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET /api/audit/checklists - Get all audit checklists
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

    const checklists = await db.auditChecklist.findMany({
      where: { isActive: true },
      include: {
        items: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({
      success: true,
      checklists
    })

  } catch (error) {
    console.error('Get audit checklists error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/audit/checklists - Create new audit checklist (Admin only)
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
    const { category, title, description, weight, isRequired, items } = body

    // Create checklist
    const checklist = await db.auditChecklist.create({
      data: {
        category,
        title,
        description,
        weight: weight || 1,
        isRequired: isRequired || false,
        items: {
          create: items?.map((item: any) => ({
            title: item.title,
            description: item.description,
            points: item.points || 1,
            evidenceType: item.evidenceType,
            isRequired: item.isRequired || false
          })) || []
        }
      },
      include: {
        items: true
      }
    })

    return NextResponse.json({
      success: true,
      checklist
    })

  } catch (error) {
    console.error('Create audit checklist error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}