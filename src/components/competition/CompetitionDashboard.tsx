'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Medal, Target, Upload, Calendar, Users, TrendingUp } from 'lucide-react'
import { CompetitionLevel, CompetitionTier, ActivityType } from '@/types'

interface Competition {
  id: string
  name: string
  description: string
  level: CompetitionLevel
  startDate: string
  endDate: string
  submissionDeadline: string
  resultsDate: string
  status: string
  isActive: boolean
  _count: {
    submissions: number
  }
}

interface CompetitionSubmission {
  id: string
  totalPoints: number
  tier: CompetitionTier
  rank: number
  status: string
  submittedAt: string
  competition: {
    id: string
    name: string
    level: CompetitionLevel
  }
  activities: CompetitionActivity[]
}

interface CompetitionActivity {
  id: string
  activityType: ActivityType
  title: string
  description: string
  points: number
  evidenceUrl: string
  evidenceType: string
  status: string
}

interface LeaderboardEntry {
  id: string
  rank: number
  totalPoints: number
  tier: CompetitionTier
  school: {
    id: string
    name: string
    city: string
    state: string
    district: string
    membershipTier: string
    idsnRating: number
  }
}

const ACTIVITY_POINTS = {
  TEACHER_TRAINING: 10,
  ACADEMY_ADOPTION: 15,
  OFFLINE_SERVER: 20,
  PARENT_ENGAGEMENT: 5,
  DIGITAL_INNOVATION: 10,
  EVIDENCE_SUBMISSION: 2
} as const

const TIER_COLORS = {
  BRONZE: 'bg-orange-100 text-orange-800 border-orange-200',
  SILVER: 'bg-gray-100 text-gray-800 border-gray-200',
  GOLD: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PLATINUM: 'bg-purple-100 text-purple-800 border-purple-200'
} as const

const TIER_ICONS = {
  BRONZE: Medal,
  SILVER: Medal,
  GOLD: Trophy,
  PLATINUM: Trophy
} as const

export default function CompetitionDashboard() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [submissions, setSubmissions] = useState<CompetitionSubmission[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchCompetitions()
    fetchSubmissions()
    fetchLeaderboard()
  }, [])

  const fetchCompetitions = async () => {
    try {
      const response = await fetch('/api/competitions')
      const data = await response.json()
      setCompetitions(data.competitions)
    } catch (error) {
      console.error('Failed to fetch competitions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/competitions/submissions')
      const data = await response.json()
      setSubmissions(data.submissions)
    } catch (error) {
      console.error('Failed to fetch submissions:', error)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/competitions/leaderboard')
      const data = await response.json()
      setLeaderboard(data.leaderboard)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    }
  }

  const getTierColor = (tier: CompetitionTier) => TIER_COLORS[tier]
  const getTierIcon = (tier: CompetitionTier) => TIER_ICONS[tier]

  const calculateProgress = (submission: CompetitionSubmission) => {
    const maxPoints = 200 // Maximum possible points
    return (submission.totalPoints / maxPoints) * 100
  }

  const getLevelColor = (level: CompetitionLevel) => {
    switch (level) {
      case 'DISTRICT': return 'bg-blue-100 text-blue-800'
      case 'STATE': return 'bg-green-100 text-green-800'
      case 'NATIONAL': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Digital Leader Competition</h1>
          <p className="text-gray-600 mt-2">
            Compete with schools across India to become a digital education leader
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button>
            <Trophy className="w-4 h-4 mr-2" />
            View Certificates
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Competitions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {competitions.filter(c => c.isActive).length}
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {submissions.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Your Rank</p>
                <p className="text-2xl font-bold text-gray-900">
                  {submissions[0]?.rank || '-'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Your Points</p>
                <p className="text-2xl font-bold text-gray-900">
                  {submissions[0]?.totalPoints || 0}
                </p>
              </div>
              <Medal className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">My Submissions</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Active Competitions */}
          <Card>
            <CardHeader>
              <CardTitle>Active Competitions</CardTitle>
              <CardDescription>
                Participate in ongoing competitions at district, state, and national levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitions.filter(c => c.isActive).map((competition) => (
                  <div key={competition.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">{competition.name}</h3>
                        <Badge className={getLevelColor(competition.level)}>
                          {competition.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{competition.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Deadline: {new Date(competition.submissionDeadline).toLocaleDateString()}
                        </span>
                        <span>{competition._count.submissions} submissions</span>
                      </div>
                    </div>
                    <Button>
                      Participate
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>
                Leading schools in the current competition season
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((entry, index) => {
                  const Icon = getTierIcon(entry.tier)
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white border-2 border-gray-300 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{entry.school.name}</p>
                          <p className="text-sm text-gray-500">
                            {entry.school.city}, {entry.school.state}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{entry.totalPoints} pts</p>
                          <p className="text-sm text-gray-500">Rank #{entry.rank}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full border ${getTierColor(entry.tier)}`}>
                          <Icon className="w-4 h-4 mr-1 inline" />
                          {entry.tier}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          {/* My Submissions */}
          <Card>
            <CardHeader>
              <CardTitle>My Competition Submissions</CardTitle>
              <CardDescription>
                Track your progress and manage your competition submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions yet</h3>
                  <p className="text-gray-600 mb-4">
                    Participate in a competition to start your journey
                  </p>
                  <Button>View Competitions</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {submission.competition.name}
                          </h3>
                          <Badge className={getLevelColor(submission.competition.level)}>
                            {submission.competition.level}
                          </Badge>
                        </div>
                        <div className={`px-3 py-1 rounded-full border ${getTierColor(submission.tier)}`}>
                          {(() => {
                            const IconComponent = getTierIcon(submission.tier);
                            return IconComponent ? <IconComponent className="w-4 h-4 mr-1 inline" /> : null;
                          })()}
                          {submission.tier}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Points</p>
                          <p className="text-2xl font-bold text-gray-900">{submission.totalPoints}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Current Rank</p>
                          <p className="text-2xl font-bold text-gray-900">#{submission.rank || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <Badge 
                            variant={submission.status === 'SUBMITTED' ? 'default' : 'secondary'}
                          >
                            {submission.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress to Next Tier</span>
                          <span className="text-sm text-gray-600">
                            {calculateProgress(submission).toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={calculateProgress(submission)} className="w-full" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Submitted: {submission.submittedAt ? 
                            new Date(submission.submittedAt).toLocaleDateString() : 
                            'Not submitted'
                          }
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Add Evidence
                          </Button>
                          <Button size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Competition Leaderboard</CardTitle>
              <CardDescription>
                See how schools are performing across different competition levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry, index) => {
                  const Icon = getTierIcon(entry.tier)
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white border-2 border-gray-300 font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{entry.school.name}</p>
                          <p className="text-sm text-gray-600">
                            {entry.school.city}, {entry.school.state} • {entry.school.district}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {entry.school.membershipTier}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {entry.school.idsnRating} ⭐
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">{entry.totalPoints}</p>
                          <p className="text-sm text-gray-500">points</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full border ${getTierColor(entry.tier)}`}>
                          <Icon className="w-4 h-4 mr-1 inline" />
                          {entry.tier}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          {/* Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Competition Activities</CardTitle>
              <CardDescription>
                Complete activities to earn points and climb the leaderboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(ACTIVITY_POINTS).map(([type, points]) => (
                  <div key={type} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">
                        {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                      <Badge variant="secondary">{points} pts</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Complete this activity to earn {points} points towards your competition score.
                    </p>
                    <Button className="w-full" variant="outline">
                      Complete Activity
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}