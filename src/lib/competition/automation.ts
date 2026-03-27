import { db } from '@/lib/db'
import { CompetitionLevel, CompetitionStatus, CompetitionTier, ActivityType } from '@/types'

// Competition Automation Service
export class CompetitionAutomation {
  // Send deadline reminders
  static async sendDeadlineReminders() {
    const upcomingCompetitions = await db.competition.findMany({
      where: {
        status: CompetitionStatus.ACTIVE,
        submissionDeadline: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Within 7 days
          gte: new Date()
        }
      },
      include: {
        submissions: {
          include: {
            school: {
              select: {
                id: true,
                name: true,
                adminProfile: {
                  select: {
                    user: {
                      select: {
                        id: true,
                        email: true,
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    for (const competition of upcomingCompetitions) {
      const daysUntilDeadline = Math.ceil(
        (new Date(competition.submissionDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )

      for (const submission of competition.submissions) {
        if (submission.status === 'DRAFT' && submission.school.adminProfile?.user) {
          await this.createNotification(
            submission.school.adminProfile.user.id,
            'COMPETITION_DEADLINE',
            `Competition Deadline Reminder`,
            `Your submission for ${competition.name} is due in ${daysUntilDeadline} days. Complete your activities to secure your rank!`,
            `/competitions/${competition.id}/submit`,
            {
              competitionId: competition.id,
              daysUntilDeadline,
              submissionId: submission.id
            }
          )
        }
      }
    }
  }

  // Send tier upgrade notifications
  static async sendTierUpgradeNotifications() {
    const submissions = await db.competitionSubmission.findMany({
      where: {
        status: 'SUBMITTED'
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            adminProfile: {
              select: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        competition: {
          select: {
            id: true,
            name: true,
            level: CompetitionLevel
          }
        }
      }
    })

    for (const submission of submissions) {
      const newTier = this.calculateTier(submission.totalPoints)
      
      if (newTier !== submission.tier && submission.school.adminProfile?.user) {
        await this.createNotification(
          submission.school.adminProfile.user.id,
          'TIER_UPGRADE',
          '🎉 Congratulations! Tier Upgrade!',
          `You've been upgraded to ${newTier} tier in the ${submission.competition.name} competition! Keep up the great work!`,
          `/competitions/${submission.competition.id}/leaderboard`,
          {
            competitionId: submission.competition.id,
            oldTier: submission.tier,
            newTier,
            submissionId: submission.id
          }
        )

        // Update submission tier
        await db.competitionSubmission.update({
          where: { id: submission.id },
          data: { tier: newTier }
        })
      }
    }
  }

  // Auto-approve evidence submissions
  static async autoApproveEvidence() {
    const pendingActivities = await db.competitionActivity.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            membershipTier: true
          }
        }
      }
    })

    for (const activity of pendingActivities) {
      // Auto-approve based on school membership tier and activity type
      const shouldAutoApprove = this.shouldAutoApprove(activity)

      if (shouldAutoApprove) {
        await db.competitionActivity.update({
          where: { id: activity.id },
          data: {
            status: 'APPROVED',
            reviewedAt: new Date(),
            feedback: 'Auto-approved: Evidence verified successfully'
          }
        })

        // Send notification to school admin
        const school = await db.school.findUnique({
          where: { id: activity.schoolId },
          include: {
            adminProfile: {
              select: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true
                  }
                }
              }
            }
          }
        })

        if (school?.adminProfile?.user) {
          await this.createNotification(
            school.adminProfile.user.id,
            'ACTIVITY_APPROVED',
            '✅ Activity Approved',
            `Your activity "${activity.title}" has been approved and points have been added to your score!`,
            `/competitions/activities/${activity.id}`,
            {
              activityId: activity.id,
              points: activity.points
            }
          )
        }
      }
    }
  }

  // Generate competition reports
  static async generateCompetitionReports(competitionId: string) {
    const competition = await db.competition.findUnique({
      where: { id: competitionId },
      include: {
        submissions: {
          include: {
            school: {
              select: {
                id: true,
                name: true,
                state: true,
                district: true,
                city: true,
                membershipTier: true
              }
            },
            activities: true
          }
        },
        leaderboards: {
          include: {
            school: {
              select: {
                id: true,
                name: true,
                state: true,
                district: true,
                membershipTier: true
              }
            }
          }
        }
      }
    })

    if (!competition) return null

    const totalSchools = competition.submissions.length
    const totalSubmissions = competition.submissions.reduce((sum, s) => sum + s.activities.length, 0)
    const averagePoints = competition.submissions.reduce((sum, s) => sum + s.totalPoints, 0) / totalSchools || 0
    const topScore = Math.max(...competition.submissions.map(s => s.totalPoints), 0)

    const tierDistribution = competition.submissions.reduce((acc, submission) => {
      acc[submission.tier] = (acc[submission.tier] || 0) + 1
      return acc
    }, {} as Record<CompetitionTier, number>)

    const stateDistribution = competition.submissions.reduce((acc, submission) => {
      const state = submission.school.state
      acc[state] = (acc[state] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      competition: {
        id: competition.id,
        name: competition.name,
        level: competition.level,
        status: competition.status
      },
      metrics: {
        totalSchools,
        totalSubmissions,
        averagePoints: Math.round(averagePoints),
        topScore,
        tierDistribution,
        stateDistribution
      },
      topPerformers: competition.leaderboards.slice(0, 10),
      participationByState: Object.entries(stateDistribution)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count)
    }
  }

  // Update competition status based on dates
  static async updateCompetitionStatuses() {
    const now = new Date()

    const competitions = await db.competition.findMany({
      where: {
        isActive: true
      }
    })

    for (const competition of competitions) {
      let newStatus = competition.status

      if (now < competition.startDate) {
        newStatus = CompetitionStatus.UPCOMING
      } else if (now >= competition.startDate && now <= competition.endDate) {
        newStatus = CompetitionStatus.ACTIVE
      } else if (now > competition.endDate) {
        newStatus = CompetitionStatus.COMPLETED
      }

      if (newStatus !== competition.status) {
        await db.competition.update({
          where: { id: competition.id },
          data: { status: newStatus }
        })

        // Send status change notifications
        if (newStatus === CompetitionStatus.ACTIVE) {
          await this.notifyCompetitionStarted(competition.id)
        } else if (newStatus === CompetitionStatus.COMPLETED) {
          await this.notifyCompetitionCompleted(competition.id)
        }
      }
    }
  }

  // Helper methods
  private static calculateTier(points: number): CompetitionTier {
    if (points >= 151) return CompetitionTier.PLATINUM
    if (points >= 101) return CompetitionTier.GOLD
    if (points >= 51) return CompetitionTier.SILVER
    return CompetitionTier.BRONZE
  }

  private static shouldAutoApprove(activity: any): boolean {
    // Auto-approve based on activity type and evidence
    if (activity.activityType === ActivityType.TEACHER_TRAINING && activity.evidenceUrl) {
      return true
    }
    if (activity.activityType === ActivityType.PARENT_ENGAGEMENT && activity.evidenceUrl) {
      return true
    }
    if (activity.evidenceUrl && activity.evidenceType === 'DOCUMENT') {
      return true
    }
    return false
  }

  private static async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    actionUrl?: string,
    metadata?: any
  ) {
    await db.notification.create({
      data: {
        userId,
        title,
        message,
        type: type as any,
        actionUrl,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    })
  }

  private static async notifyCompetitionStarted(competitionId: string) {
    const competition = await db.competition.findUnique({
      where: { id: competitionId },
      include: {
        submissions: {
          include: {
            school: {
              select: {
                adminProfile: {
                  select: {
                    user: {
                      select: {
                        id: true,
                        email: true,
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (competition) {
      for (const submission of competition.submissions) {
        if (submission.school.adminProfile?.user) {
          await this.createNotification(
            submission.school.adminProfile.user.id,
            'COMPETITION_STARTED',
            '🚀 Competition Started!',
            `The ${competition.name} competition has begun! Start submitting your activities to climb the leaderboard.`,
            `/competitions/${competition.id}`,
            { competitionId: competition.id }
          )
        }
      }
    }
  }

  private static async notifyCompetitionCompleted(competitionId: string) {
    const competition = await db.competition.findUnique({
      where: { id: competitionId },
      include: {
        submissions: {
          include: {
            school: {
              select: {
                adminProfile: {
                  select: {
                    user: {
                      select: {
                        id: true,
                        email: true,
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (competition) {
      for (const submission of competition.submissions) {
        if (submission.school.adminProfile?.user) {
          await this.createNotification(
            submission.school.adminProfile.user.id,
            'COMPETITION_COMPLETED',
            '🏆 Competition Completed!',
            `The ${competition.name} competition has ended! Check the leaderboard to see your final rank and download your certificate.`,
            `/competitions/${competitionId}/results`,
            { competitionId: competition.id }
          )
        }
      }
    }
  }
}