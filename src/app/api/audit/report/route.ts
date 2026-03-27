import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET /api/audit/report - Generate audit report
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
    const submissionId = searchParams.get('submissionId')

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 })
    }

    // Get submission with all details
    const submission = await db.auditSubmission.findUnique({
      where: {
        id: submissionId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        school: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
            membershipTier: true,
            idsnRating: true,
            studentCount: true,
            teacherCount: true
          }
        },
        items: {
          include: {
            auditItem: {
              select: {
                id: true,
                title: true,
                description: true,
                points: true,
                evidenceType: true,
                checklist: {
                  select: {
                    id: true,
                    category: true,
                    title: true,
                    weight: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Generate comprehensive audit report
    const report = generateAuditReport(submission)

    return NextResponse.json({
      success: true,
      report
    })

  } catch (error) {
    console.error('Generate audit report error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/audit/report - Submit audit for review
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { submissionId } = body

    // Update submission status to SUBMITTED
    const submission = await db.auditSubmission.update({
      where: {
        id: submissionId
      },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date()
      },
      include: {
        school: true,
        items: true
      }
    })

    // Create activity log
    await db.activityLog.create({
      data: {
        userId: decoded.id,
        schoolId: decoded.schoolId,
        action: 'AUDIT_SUBMITTED',
        entity: 'AuditSubmission',
        entityId: submissionId,
        metadata: JSON.stringify({
          submissionId,
          totalScore: submission.totalScore,
          maxScore: submission.maxScore
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Audit submitted for review successfully',
      submission
    })

  } catch (error) {
    console.error('Submit audit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateAuditReport(submission: any) {
  // Calculate scores by category
  const categoryScores: { [key: string]: { score: number; maxScore: number; percentage: number } } = {}
  
  submission.items.forEach((item: any) => {
    const category = item.auditItem.checklist.category
    if (!categoryScores[category]) {
      categoryScores[category] = { score: 0, maxScore: 0, percentage: 0 }
    }
    
    if (item.isCompleted) {
      categoryScores[category].score += item.score
    }
    categoryScores[category].maxScore += item.auditItem.points
  })

  // Calculate percentages
  Object.keys(categoryScores).forEach(category => {
    const scores = categoryScores[category]
    scores.percentage = scores.maxScore > 0 ? Math.round((scores.score / scores.maxScore) * 100) : 0
  })

  // Calculate overall score and rating
  const overallPercentage = submission.maxScore > 0 
    ? Math.round((submission.totalScore / submission.maxScore) * 100) 
    : 0

  const starRating = calculateStarRating(overallPercentage)
  const grade = calculateGrade(overallPercentage)

  // Generate recommendations
  const recommendations = generateRecommendations(categoryScores, overallPercentage)

  return {
    submission: {
      id: submission.id,
      status: submission.status,
      submittedAt: submission.submittedAt,
      totalScore: submission.totalScore,
      maxScore: submission.maxScore,
      overallPercentage,
      starRating,
      grade
    },
    school: submission.school,
    categoryScores,
    recommendations,
    items: submission.items.map((item: any) => ({
      id: item.id,
      category: item.auditItem.checklist.category,
      title: item.auditItem.title,
      description: item.auditItem.description,
      evidenceType: item.auditItem.evidenceType,
      response: item.response,
      evidenceUrl: item.evidenceUrl,
      score: item.score,
      maxScore: item.auditItem.points,
      isCompleted: item.isCompleted,
      notes: item.notes
    }))
  }
}

function calculateStarRating(percentage: number): number {
  if (percentage >= 90) return 5
  if (percentage >= 80) return 4
  if (percentage >= 70) return 3
  if (percentage >= 60) return 2
  if (percentage >= 50) return 1
  return 0
}

function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A+'
  if (percentage >= 85) return 'A'
  if (percentage >= 80) return 'A-'
  if (percentage >= 75) return 'B+'
  if (percentage >= 70) return 'B'
  if (percentage >= 65) return 'B-'
  if (percentage >= 60) return 'C+'
  if (percentage >= 55) return 'C'
  if (percentage >= 50) return 'C-'
  return 'D'
}

function generateRecommendations(categoryScores: any, overallPercentage: number): string[] {
  const recommendations: string[] = []

  // Category-specific recommendations
  Object.entries(categoryScores).forEach(([category, scores]) => {
    if (scores.percentage < 70) {
      switch (category) {
        case 'INFRASTRUCTURE':
          recommendations.push(`Improve digital infrastructure: Upgrade computers, enhance internet connectivity, and ensure proper classroom technology setup.`)
          break
        case 'CAPABILITY':
          recommendations.push(`Enhance digital capability: Provide more teacher training, improve digital literacy, and encourage technology integration in teaching.`)
          break
        case 'ADOPTION':
          recommendations.push(`Increase digital adoption: Implement more digital teaching tools, use online assessment platforms, and encourage student digital collaboration.`)
          break
        case 'INNOVATION':
          recommendations.push(`Foster digital innovation: Experiment with new teaching technologies, implement AI tools, and create innovative digital learning experiences.`)
          break
      }
    }
  })

  // Overall recommendations
  if (overallPercentage < 60) {
    recommendations.push('Focus on foundational digital infrastructure and basic digital literacy before advancing to more complex initiatives.')
  } else if (overallPercentage < 80) {
    recommendations.push('Continue building on your digital strengths while addressing the identified areas for improvement.')
  } else {
    recommendations.push('Maintain your excellent digital standards and consider becoming a mentor for other schools in your region.')
  }

  return recommendations
}