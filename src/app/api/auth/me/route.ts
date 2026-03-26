import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get full user data from database
    const user = await db.user.findUnique({
      where: { id: decoded.id, isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        phone: true,
        avatar: true,
        createdAt: true,
        schoolProfile: {
          select: {
            position: true,
            bio: true,
            school: {
              select: {
                id: true,
                name: true,
                city: true,
                state: true,
                membershipTier: true,
                idsnRating: true
              }
            }
          }
        },
        educatorProfile: {
          select: {
            department: true,
            subjects: true,
            experience: true,
            isCertified: true,
            school: {
              select: {
                id: true,
                name: true,
                city: true,
                state: true
              }
            }
          }
        },
        adminProfile: {
          select: {
            department: true,
            level: true,
            bio: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user
    })

  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}