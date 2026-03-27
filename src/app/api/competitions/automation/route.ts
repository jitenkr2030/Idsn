import { NextRequest, NextResponse } from 'next/server'
import { CompetitionAutomation } from '@/lib/competition'

// POST /api/competitions/automation - Run automation tasks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { task } = body

    let result

    switch (task) {
      case 'sendDeadlineReminders':
        result = await CompetitionAutomation.sendDeadlineReminders()
        break
      
      case 'sendTierUpgradeNotifications':
        result = await CompetitionAutomation.sendTierUpgradeNotifications()
        break
      
      case 'autoApproveEvidence':
        result = await CompetitionAutomation.autoApproveEvidence()
        break
      
      case 'updateCompetitionStatuses':
        result = await CompetitionAutomation.updateCompetitionStatuses()
        break
      
      case 'generateReports':
        const { competitionId } = body
        if (!competitionId) {
          return NextResponse.json(
            { error: 'Competition ID is required for report generation' },
            { status: 400 }
          )
        }
        result = await CompetitionAutomation.generateCompetitionReports(competitionId)
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid automation task' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `Automation task '${task}' completed successfully`,
      result
    })

  } catch (error) {
    console.error('Competition automation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/competitions/automation - Get automation status
export async function GET(request: NextRequest) {
  try {
    // Return automation status and next scheduled runs
    return NextResponse.json({
      success: true,
      automation: {
        lastRun: new Date().toISOString(),
        nextRuns: {
          sendDeadlineReminders: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          sendTierUpgradeNotifications: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          autoApproveEvidence: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          updateCompetitionStatuses: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        },
        status: 'active'
      }
    })

  } catch (error) {
    console.error('Get automation status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}