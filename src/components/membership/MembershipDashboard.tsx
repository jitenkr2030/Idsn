'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Crown, 
  Star, 
  Users, 
  Trophy, 
  Calendar,
  CheckCircle,
  ArrowRight,
  Gift,
  Shield,
  Zap,
  Target,
  Award,
  TrendingUp
} from 'lucide-react'

interface MembershipData {
  id: string
  tier: 'BASIC' | 'SILVER' | 'GOLD' | 'PLATINUM'
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'SUSPENDED' | 'PENDING'
  startDate: string
  endDate?: string
  renewalDate?: string
  points: number
  benefits: any
  school: {
    id: string
    name: string
    city: string
    state: string
    membershipTier: string
    idsnRating: number
    isVerified: boolean
  }
}

interface IDPointsData {
  totalPoints: number
  availablePoints: number
  rank: number
  totalSchools: number
  percentile: number
}

export default function MembershipDashboard() {
  const [membership, setMembership] = useState<MembershipData | null>(null)
  const [idPoints, setIdPoints] = useState<IDPointsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    fetchMembershipData()
    fetchIDPointsData()
  }, [])

  const fetchMembershipData = async () => {
    try {
      const response = await fetch('/api/membership')
      const data = await response.json()
      setMembership(data.membership)
    } catch (error) {
      console.error('Failed to fetch membership data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchIDPointsData = async () => {
    try {
      const response = await fetch('/api/id-points')
      const data = await response.json()
      setIdPoints(data.idPoints)
    } catch (error) {
      console.error('Failed to fetch ID points data:', error)
    }
  }

  const handleUpgrade = async (tier: string) => {
    setUpgrading(true)
    try {
      const response = await fetch('/api/membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier })
      })
      const data = await response.json()
      if (data.success) {
        setMembership(data.membership)
        // Show success message
        alert(`Successfully upgraded to ${tier} membership!`)
      }
    } catch (error) {
      console.error('Failed to upgrade membership:', error)
      alert('Failed to upgrade membership. Please try again.')
    } finally {
      setUpgrading(false)
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'BASIC':
        return <Shield className="w-6 h-6 text-gray-500" />
      case 'SILVER':
        return <Shield className="w-6 h-6 text-gray-400" />
      case 'GOLD':
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 'PLATINUM':
        return <Crown className="w-6 h-6 text-purple-500" />
      default:
        return <Shield className="w-6 h-6 text-gray-500" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BASIC':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'SILVER':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'GOLD':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'PLATINUM':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTierBenefits = (tier: string) => {
    const benefits = {
      BASIC: [
        'Access to basic resources',
        'Member directory listing',
        'Email support',
        '1 competition entry per year'
      ],
      SILVER: [
        'All BASIC benefits',
        'Priority email support',
        'Advanced training modules',
        '3 competition entries per year',
        '5 consulting hours'
      ],
      GOLD: [
        'All SILVER benefits',
        'Dedicated account manager',
        'Custom training programs',
        '5 competition entries per year',
        '15 consulting hours',
        'Quarterly progress reports'
      ],
      PLATINUM: [
        'All GOLD benefits',
        '24/7 phone support',
        'On-site training sessions',
        '10 competition entries per year',
        '30 consulting hours',
        'Monthly progress reports',
        'Custom integration support'
      ]
    }
    return benefits[tier as keyof typeof benefits] || []
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!membership || !idPoints) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Unable to load membership data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Membership Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getTierIcon(membership.tier)}
              <div>
                <CardTitle className="text-2xl">{membership.tier} Membership</CardTitle>
                <CardDescription>
                  {membership.school.name} • {membership.school.city}, {membership.school.state}
                </CardDescription>
              </div>
            </div>
            <Badge className={getTierColor(membership.tier)}>
              {membership.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="font-medium">
                {new Date(membership.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Renewal Date</p>
              <p className="font-medium">
                {membership.renewalDate 
                  ? new Date(membership.renewalDate).toLocaleDateString()
                  : 'Not set'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">IDSN Rating</p>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < membership.school.idsnRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-1 text-sm font-medium">
                  {membership.school.idsnRating}/5
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ID Points and Ranking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>ID Points</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Total Points</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {idPoints.totalPoints.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Available Points</span>
                  <span className="text-xl font-semibold text-green-600">
                    {idPoints.availablePoints.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">National Rank</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-purple-600">
                      #{idPoints.rank}
                    </span>
                    <span className="text-xs text-gray-500">
                      of {idPoints.totalSchools} schools
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-500">Percentile</span>
                    <span className="text-sm font-medium text-blue-600">
                      {idPoints.percentile}%
                    </span>
                  </div>
                  <Progress value={idPoints.percentile} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-500" />
              <span>Membership Benefits</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {getTierBenefits(membership.tier).map((benefit, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Options */}
      {membership.tier !== 'PLATINUM' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-500" />
              <span>Upgrade Your Membership</span>
            </CardTitle>
            <CardDescription>
              Unlock more benefits and increase your school's digital excellence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {membership.tier === 'BASIC' && (
                <>
                  <div className={`p-4 rounded-lg border-2 ${getTierColor('SILVER')}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">SILVER</h4>
                      <Shield className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Priority support and advanced training
                    </p>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handleUpgrade('SILVER')}
                      disabled={upgrading}
                    >
                      {upgrading ? 'Upgrading...' : 'Upgrade to Silver'}
                    </Button>
                  </div>
                  <div className={`p-4 rounded-lg border-2 ${getTierColor('GOLD')}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">GOLD</h4>
                      <Crown className="w-5 h-5 text-yellow-500" />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Dedicated support and custom programs
                    </p>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handleUpgrade('GOLD')}
                      disabled={upgrading}
                    >
                      {upgrading ? 'Upgrading...' : 'Upgrade to Gold'}
                    </Button>
                  </div>
                  <div className={`p-4 rounded-lg border-2 ${getTierColor('PLATINUM')}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">PLATINUM</h4>
                      <Crown className="w-5 h-5 text-purple-500" />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      24/7 support and on-site training
                    </p>
                    <Button 
                      className="w-full" 
                      onClick={() => handleUpgrade('PLATINUM')}
                      disabled={upgrading}
                    >
                      {upgrading ? 'Upgrading...' : 'Upgrade to Platinum'}
                    </Button>
                  </div>
                </>
              )}
              
              {membership.tier === 'SILVER' && (
                <>
                  <div className={`p-4 rounded-lg border-2 ${getTierColor('GOLD')}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">GOLD</h4>
                      <Crown className="w-5 h-5 text-yellow-500" />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Dedicated support and custom programs
                    </p>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handleUpgrade('GOLD')}
                      disabled={upgrading}
                    >
                      {upgrading ? 'Upgrading...' : 'Upgrade to Gold'}
                    </Button>
                  </div>
                  <div className={`p-4 rounded-lg border-2 ${getTierColor('PLATINUM')}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">PLATINUM</h4>
                      <Crown className="w-5 h-5 text-purple-500" />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      24/7 support and on-site training
                    </p>
                    <Button 
                      className="w-full" 
                      onClick={() => handleUpgrade('PLATINUM')}
                      disabled={upgrading}
                    >
                      {upgrading ? 'Upgrading...' : 'Upgrade to Platinum'}
                    </Button>
                  </div>
                </>
              )}
              
              {membership.tier === 'GOLD' && (
                <div className={`p-4 rounded-lg border-2 ${getTierColor('PLATINUM')}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">PLATINUM</h4>
                    <Crown className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    24/7 support and on-site training
                  </p>
                  <Button 
                    className="w-full" 
                    onClick={() => handleUpgrade('PLATINUM')}
                    disabled={upgrading}
                  >
                    {upgrading ? 'Upgrading...' : 'Upgrade to Platinum'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}