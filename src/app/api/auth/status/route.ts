import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ authenticated: false })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      }
    })

  } catch (error) {
    return NextResponse.json({ authenticated: false })
  }
}