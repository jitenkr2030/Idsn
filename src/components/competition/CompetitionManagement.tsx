'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Trophy, 
  Medal, 
  Target, 
  Upload, 
  Calendar, 
  Users, 
  TrendingUp, 
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { CompetitionLevel, CompetitionTier, ActivityType, EvidenceStatus } from '@/types'

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
}

interface CompetitionSubmission {
  id: string
  totalPoints: number
  tier: CompetitionTier
  rank: number
  status: string
  submittedAt: string
  competition: Competition
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
  status: EvidenceStatus
  createdAt: string
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

export default function CompetitionManagement() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [submissions, setSubmissions] = useState<CompetitionSubmission[]>([])
  const [activities, setActivities] = useState<CompetitionActivity[]>([])
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<CompetitionSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showActivityDialog, setShowActivityDialog] = useState(false)
  const [editingActivity, setEditingActivity] = useState<CompetitionActivity | null>(null)

  // Form state
  const [activityForm, setActivityForm] = useState({
    activityType: '',
    title: '',
    description: '',
    evidence: null as File | null
  })

  useEffect(() => {
    fetchCompetitions()
    fetchSubmissions()
    fetchActivities()
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

  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/competitions/activities?competitionId=${selectedCompetition?.id}&schoolId=your-school-id`)
      const data = await response.json()
      setActivities(data.activities)
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    }
  }

  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCompetition) return

    const formData = new FormData()
    formData.append('competitionId', selectedCompetition.id)
    formData.append('schoolId', 'your-school-id')
    formData.append('activityType', activityForm.activityType)
    formData.append('title', activityForm.title)
    formData.append('description', activityForm.description)
    if (activityForm.evidence) {
      formData.append('evidence', activityForm.evidence)
    }

    try {
      const response = await fetch('/api/competitions/activities', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        await fetchActivities()
        await fetchSubmissions()
        setShowActivityDialog(false)
        resetActivityForm()
      }
    } catch (error) {
      console.error('Failed to submit activity:', error)
    }
  }

  const handleDeleteActivity = async (activityId: string) => {
    try {
      const response = await fetch(`/api/competitions/activities/${activityId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchActivities()
        await fetchSubmissions()
      }
    } catch (error) {
      console.error('Failed to delete activity:', error)
    }
  }

  const resetActivityForm = () => {
    setActivityForm({
      activityType: '',
      title: '',
      description: '',
      evidence: null
    })
    setEditingActivity(null)
  }

  const calculateProgress = (submission: CompetitionSubmission) => {
    const maxPoints = 200
    return (submission.totalPoints / maxPoints) * 100
  }

  const getTierColor = (tier: CompetitionTier) => TIER_COLORS[tier]
  const getTierIcon = (tier: CompetitionTier) => TIER_ICONS[tier]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return CheckCircle
      case 'PENDING': return Clock
      case 'REJECTED': return AlertCircle
      default: return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-600'
      case 'PENDING': return 'text-yellow-600'
      case 'REJECTED': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Competition Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your school's participation in digital leader competitions
          </p>
        </div>
        <Button onClick={() => setShowActivityDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {/* Competition Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Competition</CardTitle>
          <CardDescription>
            Choose a competition to manage your submission and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCompetition?.id || ''} onValueChange={(value) => {
            const competition = competitions.find(c => c.id === value)
            setSelectedCompetition(competition || null)
            if (competition) {
              fetchActivities()
            }
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select a competition" />
            </SelectTrigger>
            <SelectContent>
              {competitions.map((competition) => (
                <SelectItem key={competition.id} value={competition.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{competition.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {competition.level}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCompetition && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="submission">Submission</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Competition Info */}
            <Card>
              <CardHeader>
                <CardTitle>{selectedCompetition.name}</CardTitle>
                <CardDescription>{selectedCompetition.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Level</Label>
                    <Badge className="mt-1">{selectedCompetition.level}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Submission Deadline</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(selectedCompetition.submissionDeadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Results Date</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(selectedCompetition.resultsDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission Status */}
            {submissions
              .filter(s => s.competitionId === selectedCompetition.id)
              .map((submission) => (
                <Card key={submission.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Your Submission</CardTitle>
                      <div className={`px-3 py-1 rounded-full border ${getTierColor(submission.tier)}`}>
                        {(() => {
                          const IconComponent = getTierIcon(submission.tier);
                          return IconComponent ? <IconComponent className="w-4 h-4 mr-1 inline" /> : null;
                        })()}
                        {submission.tier}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Total Points</Label>
                        <p className="text-2xl font-bold text-gray-900">{submission.totalPoints}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Current Rank</Label>
                        <p className="text-2xl font-bold text-gray-900">#{submission.rank || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Activities</Label>
                        <p className="text-2xl font-bold text-gray-900">{submission.activities.length}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Status</Label>
                        <Badge 
                          variant={submission.status === 'SUBMITTED' ? 'default' : 'secondary'}
                          className="mt-1"
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
                        {submission.submittedAt ? 
                          `Submitted: ${new Date(submission.submittedAt).toLocaleDateString()}` : 
                          'Not submitted yet'
                        }
                      </div>
                      <Button>
                        Submit Competition
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            {/* Activity Points Guide */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Points Guide</CardTitle>
                <CardDescription>
                  Complete activities to earn points and climb the leaderboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(ACTIVITY_POINTS).map(([type, points]) => (
                    <div key={type} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h4>
                        <Badge variant="secondary">{points} pts</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Complete this activity to earn {points} points
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activities List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Activities</CardTitle>
                <CardDescription>
                  Manage your competition activities and evidence submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start adding activities to earn points and climb the leaderboard
                    </p>
                    <Button onClick={() => setShowActivityDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Activity
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => {
                      const StatusIcon = getStatusIcon(activity.status)
                      return (
                        <div key={activity.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${getStatusColor(activity.status)} bg-opacity-10`}>
                                <StatusIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                                <p className="text-sm text-gray-600">
                                  {activity.activityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{activity.points} pts</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingActivity(activity)
                                  setActivityForm({
                                    activityType: activity.activityType,
                                    title: activity.title,
                                    description: activity.description,
                                    evidence: null
                                  })
                                  setShowActivityDialog(true)
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteActivity(activity.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {activity.description && (
                            <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                          )}

                          {activity.evidenceUrl && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Upload className="w-4 h-4" />
                              <span>Evidence submitted</span>
                              <Badge variant="outline" className="text-xs">
                                +2 pts
                              </Badge>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <div className="text-xs text-gray-500">
                              Added: {new Date(activity.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center space-x-1">
                              <StatusIcon className={`w-4 h-4 ${getStatusColor(activity.status)}`} />
                              <span className="text-sm font-medium">{activity.status}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submission" className="space-y-6">
            {/* Submission Details */}
            {submissions
              .filter(s => s.competitionId === selectedCompetition.id)
              .map((submission) => (
                <Card key={submission.id}>
                  <CardHeader>
                    <CardTitle>Submission Details</CardTitle>
                    <CardDescription>
                      Review your submission before final submission
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Points Summary */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Points Summary</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Total Points</p>
                            <p className="text-2xl font-bold text-gray-900">{submission.totalPoints}</p>
                          </div>
                          <div className="border rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Current Tier</p>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getTierColor(submission.tier)}`}>
                              {(() => {
                                const IconComponent = getTierIcon(submission.tier);
                                return IconComponent ? <IconComponent className="w-4 h-4 mr-1" /> : null;
                              })()}
                              {submission.tier}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Activities Summary */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Activities Summary</h4>
                        <div className="space-y-2">
                          {Object.entries(ACTIVITY_POINTS).map(([type, points]) => {
                            const count = submission.activities.filter(a => a.activityType === type).length
                            return (
                              <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm text-gray-700">
                                  {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-600">{count} × {points}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {count * points} pts
                                  </Badge>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Submission Actions */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Submission Actions</h4>
                        <div className="flex space-x-3">
                          <Button>
                            <Upload className="w-4 h-4 mr-2" />
                            Submit Competition
                          </Button>
                          <Button variant="outline">
                            Download Draft
                          </Button>
                          <Button variant="outline">
                            Preview Certificate
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      )}

      {/* Add/Edit Activity Dialog */}
      <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {editingActivity ? 'Edit Activity' : 'Add New Activity'}
            </DialogTitle>
            <DialogDescription>
              {editingActivity ? 'Update your activity details' : 'Add a new activity to earn points'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitActivity}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="activityType">Activity Type</Label>
                <Select
                  value={activityForm.activityType}
                  onValueChange={(value) => setActivityForm(prev => ({ ...prev, activityType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ActivityType.TEACHER_TRAINING}>Teacher Training</SelectItem>
                    <SelectItem value={ActivityType.ACADEMY_ADOPTION}>Academy Adoption</SelectItem>
                    <SelectItem value={ActivityType.OFFLINE_SERVER}>Offline Server</SelectItem>
                    <SelectItem value={ActivityType.PARENT_ENGAGEMENT}>Parent Engagement</SelectItem>
                    <SelectItem value={ActivityType.DIGITAL_INNOVATION}>Digital Innovation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={activityForm.title}
                  onChange={(e) => setActivityForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter activity title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={activityForm.description}
                  onChange={(e) => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your activity"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="evidence">Evidence (Optional)</Label>
                <Input
                  id="evidence"
                  type="file"
                  onChange={(e) => setActivityForm(prev => ({ ...prev, evidence: e.target.files?.[0] || null }))}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mov"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload evidence to earn 2 additional points
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowActivityDialog(false)
                  resetActivityForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingActivity ? 'Update Activity' : 'Add Activity'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}