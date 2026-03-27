'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Trophy, 
  Target, 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  Star,
  Award,
  TrendingUp,
  Upload,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Share2,
  Medal,
  Crown as CrownIcon,
  Flag as FlagIcon,
  BarChart3,
  FileText,
  Monitor,
  Wifi,
  BookOpen,
  Lightbulb,
  ArrowRight
} from 'lucide-react'

interface Competition {
  id: string
  name: string
  description: string
  level: 'DISTRICT' | 'STATE' | 'NATIONAL'
  startDate: string
  endDate: string
  submissionDeadline: string
  resultsDate: string
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  isActive: boolean
  maxParticipants?: number
  prizePool?: number
  submissions: any[]
  leaderboards: any[]
}

interface CompetitionSubmission {
  id: string
  schoolId: string
  competitionId: string
  totalPoints: number
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
  rank?: number
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
  submittedAt?: string
  reviewedAt?: string
  feedback?: string
  school: {
    id: string
    name: string
    city: string
    state: string
    membershipTier: string
  }
  competition: {
    id: string
    name: string
    level: string
    status: string
    startDate: string
    endDate: string
    submissionDeadline: string
  }
  activities: CompetitionActivity[]
}

interface CompetitionActivity {
  id: string
  submissionId: string
  type: CompetitionActivityType
  title: string
  description?: string
  points: number
  evidenceUrl?: string
  evidenceType: string
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  submittedAt?: string
  reviewedAt?: string
  feedback?: string
}

enum CompetitionActivityType {
  TEACHER_TRAINING = 'TEACHER_TRAINING',
  INR99_ACADEMY_ADOPTION = 'INR99_ACADEMY_ADOPTION',
  OFFLINE_SERVER = 'OFFLINE_SERVER',
  PARENT_ENGAGEMENT = 'PARENT_ENGAGEMENT',
  DIGITAL_INNOVATION = 'DIGITAL_INNOVATION',
  EVIDENCE_SUBMISSION = 'EVIDENCE_SUBMISSION'
}

const ACTIVITY_POINTS = {
  TEACHER_TRAINING: 10,
  INR99_ACADEMY_ADOPTION: 15,
  OFFLINE_SERVER: 20,
  PARENT_ENGAGEMENT: 5,
  DIGITAL_INNOVATION: 10,
  EVIDENCE_SUBMISSION: 2
}

const ACTIVITY_DESCRIPTIONS = {
  TEACHER_TRAINING: 'Complete teacher training programs and workshops',
  INR99_ACADEMY_ADOPTION: 'Adopt and implement INR99 Academy platform',
  OFFLINE_SERVER: 'Set up and maintain offline server infrastructure',
  PARENT_ENGAGEMENT: 'Conduct parent engagement sessions and meetings',
  DIGITAL_INNOVATION: 'Implement innovative digital learning solutions',
  EVIDENCE_SUBMISSION: 'Submit evidence and documentation for activities'
}

export default function CompetitionDashboard() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null)
  const [submission, setSubmission] = useState<CompetitionSubmission | null>(null)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  // Form state
  const [activities, setActivities] = useState<CompetitionActivity[]>([])

  useEffect(() => {
    fetchCompetitions()
  }, [])

  const fetchCompetitions = async () => {
    try {
      const response = await fetch('/api/competitions')
      const data = await response.json()
      setCompetitions(data.competitions)
      
      // Select first active competition by default
      const activeCompetition = data.competitions.find(c => c.status === 'ACTIVE')
      if (activeCompetition) {
        setSelectedCompetition(activeCompetition)
        fetchCompetitionData(activeCompetition.id)
      }
    } catch (error) {
      console.error('Failed to fetch competitions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompetitionData = async (competitionId: string) => {
    try {
      // Fetch submission
      const submissionResponse = await fetch(`/api/competitions/submissions?competitionId=${competitionId}`)
      const submissionData = await submissionResponse.json()
      
      if (submissionData.submissions.length > 0) {
        setSubmission(submissionData.submissions[0])
        setActivities(submissionData.submissions[0].activities || [])
      }

      // Fetch leaderboard
      const leaderboardResponse = await fetch(`/api/competitions/leaderboard?competitionId=${competitionId}`)
      const leaderboardData = await leaderboardResponse.json()
      setLeaderboard(leaderboardData.leaderboard)
    } catch (error) {
      console.error('Failed to fetch competition data:', error)
    }
  }

  const handleCompetitionSelect = (competitionId: string) => {
    const competition = competitions.find(c => c.id === competitionId)
    if (competition) {
      setSelectedCompetition(competition)
      setSubmission(null)
      setActivities([])
      fetchCompetitionData(competitionId)
    }
  }

  const handleAddActivity = () => {
    const newActivity: CompetitionActivity = {
      id: '',
      submissionId: submission?.id || '',
      type: 'TEACHER_TRAINING' as CompetitionActivityType,
      title: '',
      description: '',
      points: 10,
      evidenceUrl: '',
      evidenceType: 'DOCUMENT',
      status: 'PENDING'
    }
    setActivities([...activities, newActivity])
  }

  const handleActivityChange = (index: number, field: string, value: any) => {
    const updatedActivities = [...activities]
    updatedActivities[index] = {
      ...updatedActivities[index],
      [field]: value
    }
    setActivities(updatedActivities)
  }

  const handleRemoveActivity = (index: number) => {
    const updatedActivities = activities.filter((_, i) => i !== index)
    setActivities(updatedActivities)
  }

  const handleSubmitCompetition = async () => {
    if (!selectedCompetition || activities.length === 0) {
      setError('Please add at least one activity before submitting')
      return
    }

    setSubmitting(true)
    setError('')
    
    try {
      const response = await fetch('/api/competitions/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          competitionId: selectedCompetition.id,
          activities: activities.map(activity => ({
            ...activity,
            points: ACTIVITY_POINTS[activity.type as keyof typeof ACTIVITY_POINTS]
          }))
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setSubmission(result.submission)
        setSuccess('Competition submitted successfully!')
        setActiveTab('submission')
      } else {
        setError(result.error || 'Failed to submit competition')
      }
    } catch (error) {
      setError('Failed to submit competition')
    } finally {
      setSubmitting(false)
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'DISTRICT':
        return <FlagIcon className="w-5 h-5 text-blue-500" />
      case 'STATE':
        return <FlagIcon className="w-5 h-5 text-green-500" />
      case 'NATIONAL':
        return <CrownIcon className="w-5 h-5 text-purple-500" />
      default:
        return <Trophy className="w-5 h-5 text-gray-500" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE':
        return 'bg-orange-100 text-orange-800'
      case 'SILVER':
        return 'bg-gray-100 text-gray-800'
      case 'GOLD':
        return 'bg-yellow-100 text-yellow-800'
      case 'PLATINUM':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return 'bg-blue-100 text-blue-800'
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateTotalPoints = () => {
    return activities.reduce((total, activity) => {
      return total + (ACTIVITY_POINTS[activity.type as keyof typeof ACTIVITY_POINTS] || 0)
    }, 0)
  }

  const calculateTier = (points: number) => {
    if (points >= 150) return 'PLATINUM'
    if (points >= 101) return 'GOLD'
    if (points >= 51) return 'SILVER'
    return 'BRONZE'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">School Competitions</h2>
          <p className="text-gray-600">
            Participate in digital excellence competitions and earn recognition
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {competitions.length} Active Competitions
          </Badge>
          {submission && (
            <Badge className={getTierColor(submission.tier)}>
              {submission.tier} Tier
            </Badge>
          )}
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Competition Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Competition</CardTitle>
          <CardDescription>
            Choose a competition to participate in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCompetition?.id || ''} onValueChange={handleCompetitionSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a competition" />
            </SelectTrigger>
            <SelectContent>
              {competitions.map((competition) => (
                <SelectItem key={competition.id} value={competition.id}>
                  <div className="flex items-center space-x-2">
                    {getLevelIcon(competition.level)}
                    <div>
                      <div className="font-medium">{competition.name}</div>
                      <div className="text-sm text-gray-500">
                        {competition.level} • {competition.status}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCompetition && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="submission">Submission</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Competition Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getLevelIcon(selectedCompetition.level)}
                  <span>{selectedCompetition.name}</span>
                  <Badge className={getStatusColor(selectedCompetition.status)}>
                    {selectedCompetition.status}
                  </Badge>
                </CardTitle>
                <CardDescription>{selectedCompetition.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Level</p>
                    <p className="font-medium">{selectedCompetition.level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">
                      {new Date(selectedCompetition.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">
                      {new Date(selectedCompetition.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Submission Deadline</p>
                    <p className="font-medium">
                      {new Date(selectedCompetition.submissionDeadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {selectedCompetition.prizePool && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium text-yellow-800">
                        Prize Pool: ₹{selectedCompetition.prizePool.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Status */}
            {submission && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Submission Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {submission.totalPoints}
                      </div>
                      <p className="text-sm text-gray-500">Total Points</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getTierColor(submission.tier).split(' ')[0]}`}>
                        {submission.tier}
                      </div>
                      <p className="text-sm text-gray-500">Current Tier</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        #{submission.rank || 'N/A'}
                      </div>
                      <p className="text-sm text-gray-500">Current Rank</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Progress to Next Tier</span>
                      <span className="text-sm text-gray-500">
                        {getNextTierPoints(submission.tier) - submission.totalPoints} points to go
                      </span>
                    </div>
                    <Progress 
                      value={getTierProgress(submission.totalPoints, submission.tier)} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Performers */}
            {leaderboard.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>
                    Current leaderboard rankings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.slice(0, 5).map((entry, index) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">
                              {entry.rank}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{entry.school.name}</p>
                            <p className="text-sm text-gray-500">
                              {entry.school.city}, {entry.school.state}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">
                            {entry.points}
                          </div>
                          <p className="text-sm text-gray-500">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="activities" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Competition Activities</h3>
              <Button onClick={handleAddActivity}>
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </div>

            {/* Points System */}
            <Card>
              <CardHeader>
                <CardTitle>Points System</CardTitle>
                <CardDescription>
                  Earn points by completing various digital education activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(ACTIVITY_POINTS).map(([type, points]) => (
                    <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{type.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-gray-500">{ACTIVITY_DESCRIPTIONS[type as keyof typeof ACTIVITY_DESCRIPTIONS]}</p>
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {points} pts
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activities List */}
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Select
                            value={activity.type}
                            onValueChange={(value) => handleActivityChange(index, 'type', value)}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TEACHER_TRAINING">Teacher Training</SelectItem>
                              <SelectItem value="DIGITAL_PLATFORM_ADOPTION">Digital Platform Adoption</SelectItem>
                              <SelectItem value="OFFLINE_SERVER">Offline Server</SelectItem>
                              <SelectItem value="PARENT_ENGAGEMENT">Parent Engagement</SelectItem>
                              <SelectItem value="DIGITAL_INNOVATION">Digital Innovation</SelectItem>
                              <SelectItem value="EVIDENCE_SUBMISSION">Evidence Submission</SelectItem>
                            </SelectContent>
                          </Select>
                          <Badge variant="outline" className="text-xs">
                            {ACTIVITY_POINTS[activity.type as keyof typeof ACTIVITY_POINTS]} points
                          </Badge>
                        </div>
                        <Input
                          placeholder="Activity title"
                          value={activity.title}
                          onChange={(e) => handleActivityChange(index, 'title', e.target.value)}
                          className="w-full max-w-md"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveActivity(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <Textarea
                      placeholder="Activity description (optional)"
                      value={activity.description || ''}
                      onChange={(e) => handleActivityChange(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full"
                    />

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Evidence Type</Label>
                        <Select
                          value={activity.evidenceType}
                          onValueChange={(value) => handleActivityChange(index, 'evidenceType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PHOTO">Photo</SelectItem>
                            <SelectItem value="VIDEO">Video</SelectItem>
                            <SelectItem value="DOCUMENT">Document</SelectItem>
                            <SelectItem value="SCREENSHOT">Screenshot</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Evidence URL</Label>
                        <Input
                          placeholder="Upload evidence and paste URL here"
                          value={activity.evidenceUrl || ''}
                          onChange={(e) => handleActivityChange(index, 'evidenceUrl', e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleSubmitCompetition}
                disabled={submitting || activities.length === 0}
                size="lg"
                className="px-8"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    Submit Competition
                  </>
                )}
              </Button>
            </div>

            {/* Points Summary */}
            {activities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Points Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {activities.length}
                      </div>
                      <p className="text-sm text-gray-500">Activities</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {calculateTotalPoints()}
                      </div>
                      <p className="text-sm text-gray-500">Total Points</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getTierColor(calculateTier(calculateTotalPoints())).split(' ')[0]}`}>
                        {calculateTier(calculateTotalPoints())}
                      </div>
                      <p className="text-sm text-gray-500">Projected Tier</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="submission" className="space-y-6">
            {submission ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Submission Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Submission Information</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Status</span>
                            <Badge className={getStatusColor(submission.status)}>
                              {submission.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Total Points</span>
                            <span className="text-sm font-medium">{submission.totalPoints}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Tier</span>
                            <Badge className={getTierColor(submission.tier)}>
                              {submission.tier}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Rank</span>
                            <span className="text-sm font-medium">#{submission.rank || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Submitted</span>
                            <span className="text-sm font-medium">
                              {submission.submittedAt 
                                ? new Date(submission.submittedAt).toLocaleDateString()
                                : 'Not submitted'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">School Information</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">School</span>
                            <span className="text-sm font-medium">{submission.school.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Location</span>
                            <span className="text-sm font-medium">
                              {submission.school.city}, {submission.school.state}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Membership</span>
                            <Badge variant="outline" className="text-xs">
                              {submission.school.membershipTier}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Submitted Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle>Submitted Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {submission.activities.map((activity, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium">{activity.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {activity.type.replace(/_/g, ' ')}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {activity.points} points
                                </Badge>
                                <Badge 
                                  className={activity.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                                >
                                  {activity.status}
                                </Badge>
                              </div>
                              {activity.description && (
                                <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                              )}
                              {activity.evidenceUrl && (
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(activity.evidenceUrl, '_blank')}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View Evidence
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submission Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start by adding activities to participate in the competition
                  </p>
                  <Button onClick={() => setActiveTab('activities')}>
                    Go to Activities
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Competition Leaderboard</CardTitle>
                <CardDescription>
                  See how your school ranks among participants
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">
                              {entry.rank}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{entry.school.name}</p>
                            <p className="text-sm text-gray-500">
                              {entry.school.city}, {entry.school.state}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <div className="text-lg font-bold text-blue-600">
                              {entry.points}
                            </div>
                            <Badge className={getTierColor(entry.tier)}>
                              {entry.tier}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leaderboard Data</h3>
                    <p className="text-gray-600">
                      Leaderboard will be available once submissions are made
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Your Ranking */}
            {submission && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Ranking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                        #{submission.rank || 'N/A'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {submission.rank ? `You're ranked #${submission.rank}!` : 'Submit to see your ranking'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {submission.rank 
                        ? `Out of ${leaderboard.length} participating schools`
                        : 'Complete and submit your activities to see your ranking'
                      }
                    </p>
                    <div className="flex justify-center space-x-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {submission.totalPoints}
                        </div>
                        <p className="text-sm text-gray-500">Total Points</p>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getTierColor(submission.tier).split(' ')[0]}`}>
                          {submission.tier}
                        </div>
                        <p className="text-sm text-gray-500">Current Tier</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

// Helper functions
function getNextTierPoints(currentTier: string): number {
  switch (currentTier) {
    case 'BRONZE': return 51 - 0  // Need 51 points for Silver
    case 'SILVER': return 101 - 51 // Need 50 more points for Gold
    case 'GOLD': return 150 - 101 // Need 49 more points for Platinum
    case 'PLATINUM': return 0
    default: return 51
  }
}

function getTierProgress(points: number, tier: string): number {
  switch (tier) {
    case 'BRONZE':
      return Math.min((points / 50) * 100, 100)
    case 'SILVER':
      return Math.min(((points - 50) / 50) * 100, 100)
    case 'GOLD':
      return Math.min(((points - 100) / 50) * 100, 100)
    case 'PLATINUM':
      return 100
    default:
      return 0
  }
}

// Icon components
function Flag({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 1c5 0 10-5 10-5s-1-1-4-1-5 1c-5 0-10 5-10 5z"/>
      <path d="M8 4v12"/>
      <path d="M16 4v12"/>
    </svg>
  )
}

function Crown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6"/>
      <path d="M12 3v18"/>
      <path d="M3.5 9h17"/>
      <path d="M3.5 15h17"/>
    </svg>
  )
}