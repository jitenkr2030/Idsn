'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  GraduationCap, 
  Users, 
  Award, 
  BookOpen, 
  CheckCircle, 
  TrendingUp,
  Star,
  ArrowRight,
  Shield,
  Globe,
  Target,
  Zap
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication status
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status')
      const data = await response.json()
      
      if (data.authenticated) {
        setIsAuthenticated(true)
        setUserRole(data.user.role)
        // Redirect to dashboard based on role
        redirectBasedOnRole(data.user.role)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    }
  }

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case 'SCHOOL_ADMIN':
        router.push('/dashboard/admin')
        break
      case 'EDUCATOR':
        router.push('/dashboard/educator')
        break
      case 'INTERNAL_ADMIN':
        router.push('/dashboard/super-admin')
        break
      default:
        router.push('/dashboard')
        break
    }
  }

  const handleGetStarted = () => {
    router.push('/auth/signup')
  }

  const handleSignIn = () => {
    router.push('/auth/login')
  }

  const features = [
    {
      icon: <GraduationCap className="w-8 h-8 text-blue-600" />,
      title: "Digital Certification",
      description: "Get your school certified for digital excellence with our comprehensive audit system",
      color: "bg-blue-50 border-blue-200"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-green-600" />,
      title: "Training Programs",
      description: "Access expert-led courses and training programs for educators and administrators",
      color: "bg-green-50 border-green-200"
    },
    {
      icon: <Award className="w-8 h-8 text-purple-600" />,
      title: "Competition Platform",
      description: "Participate in all-India digital competitions and showcase your school's achievements",
      color: "bg-purple-50 border-purple-200"
    },
    {
      icon: <Users className="w-8 h-8 text-orange-600" />,
      title: "Community Network",
      description: "Connect with thousands of schools and educators across India",
      color: "bg-orange-50 border-orange-200"
    }
  ]

  const stats = [
    { label: "Schools Certified", value: "500+", icon: <Shield className="w-5 h-5" /> },
    { label: "Educators Trained", value: "10,000+", icon: <GraduationCap className="w-5 h-5" /> },
    { label: "Courses Completed", value: "50,000+", icon: <BookOpen className="w-5 h-5" /> },
    { label: "Competition Participants", value: "2,000+", icon: <Award className="w-5 h-5" /> }
  ]

  const testimonials = [
    {
      name: "Dr. Rajesh Kumar",
      role: "Principal, Delhi Public School",
      content: "IDSN Portal transformed our digital infrastructure. The certification process was thorough and the results were outstanding.",
      rating: 5,
      avatar: "RK"
    },
    {
      name: "Priya Sharma",
      role: "Computer Science Teacher",
      content: "The training programs are excellent. I've learned so much about digital teaching tools and methodologies.",
      rating: 5,
      avatar: "PS"
    },
    {
      name: "Michael Chen",
      role: "IT Administrator",
      content: "The platform is intuitive and powerful. Managing our school's digital assets has never been easier.",
      rating: 5,
      avatar: "MC"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Badge className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white mb-6">
              <Zap className="w-4 h-4 mr-1" />
              Transforming Digital Education in India
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to <span className="text-yellow-300">IDSN Portal</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Empowering schools with digital certification, training, and competition platforms
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                onClick={handleGetStarted}
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg font-semibold"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-transparent to-white/10"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2 text-blue-600">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Digital Excellence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive platform designed to transform your educational institution
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`border-2 ${feature.color} hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-700">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How IDSN Portal Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple 3-step process to get your school digitally certified
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 mx-auto">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Sign Up & Create Profile</h3>
              <p className="text-gray-600">Register your school and complete your profile with basic information</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 mx-auto">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Complete Digital Audit</h3>
              <p className="text-gray-600">Submit evidence for various digital infrastructure and practices</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6 mx-auto">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Certified & Trained</h3>
              <p className="text-gray-600">Receive your certification and access premium training resources</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Leading Educators
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what schools and educators are saying about IDSN Portal
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div className="ml-4">
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your School?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of schools already benefiting from IDSN Portal
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
              onClick={handleGetStarted}
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg font-semibold"
              onClick={handleSignIn}
            >
              Sign In to Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">IDSN Portal</h3>
              <p className="text-gray-400 text-sm">
                Transforming digital education in India, one school at a time.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
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