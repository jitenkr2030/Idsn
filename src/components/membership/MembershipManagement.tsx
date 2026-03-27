'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Search, 
  Star, 
  MapPin, 
  Calendar,
  Award,
  TrendingUp,
  Building,
  User,
  Filter,
  Loader2,
  Crown,
  Gem,
  Shield
} from 'lucide-react'

interface School {
  id: string
  name: string
  city: string
  state: string
  membershipTier: 'BASIC' | 'SILVER' | 'GOLD' | 'PLATINUM'
  idsnRating: number
  isVerified: boolean
  verificationDate?: string
  expiryDate?: string
  adminProfile?: {
    user: {
      id: string
      name: string
      email: string
      avatar?: string
    }
  }
  certificates: Array<{
    id: string
    title: string
    rating?: number
    issuedDate: string
  }>
  _count: {
    educatorProfiles: number
    courses: number
  }
}

interface MembershipTier {
  tier: string
  name: string
  price: number
  duration: string
  features: string[]
  color: string
  popular: boolean
}

export default function MembershipManagement() {
  const [schools, setSchools] = useState<School[]>([])
  const [tiers, setTiers] = useState<MembershipTier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTier, setSelectedTier] = useState<string>('')
  const [selectedState, setSelectedState] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalSchools, setTotalSchools] = useState(0)

  useEffect(() => {
    fetchData()
  }, [currentPage, searchTerm, selectedTier, selectedState])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [schoolsRes, tiersRes] = await Promise.all([
        fetch(`/api/membership/directory?page=${currentPage}&limit=12&search=${searchTerm}&tier=${selectedTier}&state=${selectedState}`),
        fetch('/api/membership')
      ])

      if (schoolsRes.ok) {
        const schoolsData = await schoolsRes.json()
        setSchools(schoolsData.schools)
        setTotalPages(schoolsData.pagination.pages)
        setTotalSchools(schoolsData.pagination.total)
      }

      if (tiersRes.ok) {
        const tiersData = await tiersRes.json()
        setTiers(tiersData.tiers)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'SILVER': return <Gem className="w-4 h-4" />
      case 'GOLD': return <Crown className="w-4 h-4" />
      case 'PLATINUM': return <Shield className="w-4 h-4" />
      default: return <Award className="w-4 h-4" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BASIC': return 'bg-gray-100 text-gray-800'
      case 'SILVER': return 'bg-slate-100 text-slate-800'
      case 'GOLD': return 'bg-amber-100 text-amber-800'
      case 'PLATINUM': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Mumbai', 'Kolkata',
    'Chennai', 'Bengaluru', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur'
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Membership Network</h2>
          <p className="text-muted-foreground">
            Connect with certified schools and educators across India
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{totalSchools} certified schools</span>
        </div>
      </div>

      <Tabs defaultValue="directory" className="w-full">
        <TabsList>
          <TabsTrigger value="directory">Member Directory</TabsTrigger>
          <TabsTrigger value="tiers">Membership Tiers</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Search & Filter</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search schools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Tiers</SelectItem>
                    <SelectItem value="BASIC">Basic</SelectItem>
                    <SelectItem value="SILVER">Silver</SelectItem>
                    <SelectItem value="GOLD">Gold</SelectItem>
                    <SelectItem value="PLATINUM">Platinum</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All States</SelectItem>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={() => {
                  setSearchTerm('')
                  setSelectedTier('')
                  setSelectedState('')
                }}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Schools Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {schools.map((school) => (
                  <Card key={school.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{school.name}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {school.city}, {school.state}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge className={getTierColor(school.membershipTier)}>
                            <div className="flex items-center space-x-1">
                              {getTierIcon(school.membershipTier)}
                              <span>{school.membershipTier}</span>
                            </div>
                          </Badge>
                          {school.idsnRating > 0 && (
                            <div className="flex items-center space-x-1">
                              {getStarRating(school.idsnRating)}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* School Admin */}
                        {school.adminProfile?.user && (
                          <div className="flex items-center space-x-2 text-sm">
                            <User className="w-3 h-3 text-gray-500" />
                            <span>{school.adminProfile.user.name}</span>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Users className="w-3 h-3 text-blue-500" />
                            <span>{school._count.educatorProfiles} educators</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Award className="w-3 h-3 text-green-500" />
                            <span>{school._count.courses} courses</span>
                          </div>
                        </div>

                        {/* Latest Certificate */}
                        {school.certificates.length > 0 && (
                          <div className="pt-2 border-t">
                            <div className="text-xs text-gray-500 mb-1">Latest Certification</div>
                            <div className="text-sm font-medium">{school.certificates[0].title}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(school.certificates[0].issuedDate).toLocaleDateString()}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex space-x-2 pt-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            View Profile
                          </Button>
                          <Button size="sm" className="flex-1">
                            Connect
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="tiers" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => (
              <Card key={tier.tier} className={`relative ${tier.color} ${tier.popular ? 'ring-2 ring-blue-500' : ''}`}>
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {getTierIcon(tier.tier)}
                  </div>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="text-2xl font-bold">
                    {tier.price === 0 ? 'Free' : `₹${tier.price.toLocaleString()}`}
                  </div>
                  <CardDescription>{tier.duration}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <div className="w-1 h-1 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={tier.popular ? "default" : "outline"}
                  >
                    {tier.price === 0 ? 'Get Started' : 'Upgrade Now'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Membership Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Membership Benefits</span>
              </CardTitle>
              <CardDescription>
                Unlock exclusive features and accelerate your school's digital transformation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Enhanced Credibility</h4>
                  <p className="text-sm text-gray-600">
                    Higher membership tiers increase your school's visibility and trustworthiness
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Networking Opportunities</h4>
                  <p className="text-sm text-gray-600">
                    Connect with premium members and access exclusive networking events
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Priority Support</h4>
                  <p className="text-sm text-gray-600">
                    Get faster response times and dedicated support for your certification journey
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}