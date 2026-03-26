import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/competitions/leaderboard - Get competition leaderboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const competitionId = searchParams.get('competitionId') || ''
    const level = searchParams.get('level') || ''
    const tier = searchParams.get('tier') || ''
    const state = searchParams.get('state') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const whereClause: any = {}

    if (competitionId) {
      whereClause.competitionId = competitionId
    }

    const skip = (page - 1) * limit

    // Build the query with joins
    const leaderboard = await db.competitionLeaderboard.findMany({
      where: whereClause,
      include: {
        school: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            membershipTier: true,
            idsnRating: true,
            logo: true
          }
        },
        competition: {
          select: {
            id: true,
            name: true,
            level: true,
            status: true,
            startDate: true,
            endDate: true
          }
        }
      },
      orderBy: {
        rank: 'asc'
      },
      skip,
      take: limit
    })

    // Apply additional filtering
    let filteredLeaderboard = leaderboard

    if (level) {
      filteredLeaderboard = filteredLeaderboard.filter(
        entry => entry.competition.level === level
      )
    }

    if (tier) {
      filteredLeaderboard = filteredLeaderboard.filter(
        entry => entry.tier === tier
      )
    }

    if (state) {
      filteredLeaderboard = filteredLeaderboard.filter(
        entry => entry.school.state.toLowerCase().includes(state.toLowerCase())
      )
    }

    // Get tier statistics
    const tierStats = await db.competitionLeaderboard.groupBy({
      by: ['tier'],
      where: whereClause,
      _count: true
    })

    // Get level statistics
    const levelStats = await db.competitionLeaderboard.groupBy({
      by: ['competition'],
      where: whereClause,
      _count: true,
      _avg: {
        points: true
      }
    })

    return NextResponse.json({
      success: true,
      leaderboard: filteredLeaderboard,
      stats: {
        totalParticipants: filteredLeaderboard.length,
        tierDistribution: tierStats,
        levelDistribution: levelStats,
        topPerformers: filteredLeaderboard.slice(0, 10)
      },
      pagination: {
        page,
        limit,
        total: filteredLeaderboard.length,
        pages: Math.ceil(filteredLeaderboard.length / limit)
      }
    })

  } catch (error) {
    console.error('Get competition leaderboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}