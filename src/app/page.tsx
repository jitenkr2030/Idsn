'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowRight, 
  Users, 
  Award, 
  BookOpen, 
  Shield, 
  CheckCircle,
  Star,
  TrendingUp,
  Zap,
  Globe,
  School,
  Target,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setIsAuthenticated(true)
          setUserRole(data.user.role)
        }
      } catch (error) {
        // User not authenticated
      }
    }
    checkAuth()
  }, [])

  // If authenticated, redirect to appropriate dashboard
  if (isAuthenticated && userRole) {
    switch (userRole) {
      case 'SCHOOL_ADMIN':
        return <div>Redirecting to School Dashboard...</div>
      case 'EDUCATOR':
        return <div>Redirecting to Educator Dashboard...</div>
      case 'INTERNAL_ADMIN':
        return <div>Redirecting to Admin Dashboard...</div>
      default:
        return <div>Redirecting to Dashboard...</div>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <School className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">IDSN Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transform Your School with
              <span className="block text-yellow-300"> Digital Excellence</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join India's leading digital education platform. Get certified, access training, 
              and lead the digital transformation in education.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Sign In
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-300 mr-2" />
                <span>Free Registration</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-300 mr-2" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-300 mr-2" />
                <span>Instant Access</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-10"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Educational Institutions Across India
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of schools already transforming their digital education journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">5,000+</div>
              <div className="text-gray-600">Schools</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50,000+</div>
              <div className="text-gray-600">Educators</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">1M+</div>
              <div className="text-gray-600">Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">25+</div>
              <div className="text-gray-600">States</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Digital Education Excellence
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive platform designed for schools, educators, and administrators
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <School className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Digital School Certification</CardTitle>
                <CardDescription>
                  Get your school certified for digital excellence with comprehensive audit and verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Digital infrastructure assessment
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Teacher training verification
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Official certification badge
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Training & Development</CardTitle>
                <CardDescription>
                  Access comprehensive training programs for educators and administrators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Digital literacy courses
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Technology integration training
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Professional development
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Achievement & Recognition</CardTitle>
                <CardDescription>
                  Earn badges, certificates, and recognition for your digital achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Digital badges and certificates
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Leaderboard rankings
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Achievement system
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Role-Based Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Designed for Every Role in Education
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tailored experiences for school administrators, educators, and system administrators
            </p>
          </div>
          <Tabs defaultValue="schools" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="schools" className="flex items-center space-x-2">
                <School className="w-4 h-4" />
                <span>Schools</span>
              </TabsTrigger>
              <TabsTrigger value="educators" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Educators</span>
              </TabsTrigger>
              <TabsTrigger value="administrators" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Administrators</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schools">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">For School Administrators</h3>
                  <p className="text-gray-600 mb-6">
                    Manage your school's digital transformation with comprehensive tools and insights.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                      <div>
                        <strong>Digital Certification:</strong> Get your school certified and recognized
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                      <div>
                        <strong>Staff Management:</strong> Onboard and manage educators digitally
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                      <div>
                        <strong>Progress Tracking:</strong> Monitor digital adoption and training
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                      <div>
                        <strong>Resource Management:</strong> Access digital tools and content
                      </div>
                    </li>
                  </ul>
                  <Link href="/auth/register?role=SCHOOL_ADMIN">
                    <Button size="lg" className="mt-6">
                      Start as School Admin
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-3">Key Benefits</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-2" />
                      <span className="text-sm">Official digital certification</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">Data-driven insights</span>
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm">Secure platform</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="educators">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">For Educators</h3>
                  <p className="text-gray-600 mb-6">
                    Enhance your teaching skills and access resources for digital education excellence.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                      <div>
                        <strong>Professional Development:</strong> Access training courses and workshops
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                      <div>
                        <strong>Digital Resources:</strong> Get teaching tools and content
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                      <div>
                        <strong>Community:</strong> Connect with educators nationwide
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                      <div>
                        <strong>Recognition:</strong> Earn badges and certificates
                      </div>
                    </li>
                  </ul>
                  <Link href="/auth/register?role=EDUCATOR">
                    <Button size="lg" className="mt-6">
                      Start as Educator
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="font-semibold text-green-900 mb-3">Key Benefits</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm">Free training courses</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 text-yellow-500 mr-2" />
                      <span className="text-sm">Professional certificates</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm">Educator community</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="administrators">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">For System Administrators</h3>
                  <p className="text-gray-600 mb-6">
                    Manage the entire platform and ensure smooth operation across all institutions.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                      <div>
                        <strong>Platform Management:</strong> Oversee all schools and users
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                      <div>
                        <strong>Analytics:</strong> Access comprehensive reports and insights
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                      <div>
                        <strong>Compliance:</strong> Ensure standards and regulations
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                      <div>
                        <strong>Support:</strong> Provide help and guidance
                      </div>
                    </li>
                  </ul>
                  <Link href="/auth/register?role=INTERNAL_ADMIN">
                    <Button size="lg" className="mt-6">
                      Start as Administrator
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="font-semibold text-purple-900 mb-3">Key Benefits</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <BarChart3 className="w-4 h-4 text-purple-600 mr-2" />
                      <span className="text-sm">Advanced analytics</span>
                    </div>
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm">Platform oversight</span>
                    </div>
                    <div className="flex items-center">
                      <Target className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">Strategic management</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Educational Institution?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of schools already benefiting from digital education excellence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Sign In to Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <School className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">IDSN Portal</span>
              </div>
              <p className="text-gray-400 text-sm">
                Transforming education through digital excellence across India.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/certification" className="hover:text-white">Certification</Link></li>
                <li><Link href="/training" className="hover:text-white">Training</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link href="/api/docs" className="hover:text-white">API Docs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 IDSN Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}