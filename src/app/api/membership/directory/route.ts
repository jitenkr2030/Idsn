import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { MembershipTier } from '@/types'

// GET /api/membership/directory - Get member directory
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
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const tier = searchParams.get('tier') as MembershipTier | null
    const state = searchParams.get('state') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = {
      isVerified: true
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (tier) {
      whereClause.membershipTier = tier
    }

    if (state) {
      whereClause.state = { contains: state, mode: 'insensitive' }
    }

    const [schools, total] = await Promise.all([
      db.school.findMany({
        where: whereClause,
        include: {
          adminProfile: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true
                }
              }
            }
          },
          certificates: {
            where: { status: 'APPROVED' },
            select: {
              id: true,
              title: true,
              rating: true,
              issuedDate: true
            },
            orderBy: { issuedDate: 'desc' },
            take: 1
          },
          _count: {
            select: {
              educatorProfiles: true,
              courses: true
            }
          }
        },
        orderBy: [
          { membershipTier: 'desc' },
          { idsnRating: 'desc' },
          { name: 'asc' }
        ],
        skip,
        take: limit
      }),
      db.school.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      schools,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get membership directory error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}