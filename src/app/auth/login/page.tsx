'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, EyeOff, LogIn, School, Users, Shield } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Successful login
        router.push('/dashboard')
        router.refresh() // Refresh to update auth state
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <School className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">IDSN Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo Accounts */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Demo Accounts</CardTitle>
            <CardDescription>
              Use these accounts to explore the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="school" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="school" className="flex items-center space-x-1">
                  <School className="w-4 h-4" />
                  <span className="text-xs">School</span>
                </TabsTrigger>
                <TabsTrigger value="educator" className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">Educator</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center space-x-1">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs">Admin</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="school" className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900">School Admin</p>
                  <p className="text-sm text-blue-700">Email: admin@school.com</p>
                  <p className="text-sm text-blue-700">Password: admin123</p>
                </div>
              </TabsContent>
              
              <TabsContent value="educator" className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-900">Educator</p>
                  <p className="text-sm text-green-700">Email: teacher@school.com</p>
                  <p className="text-sm text-green-700">Password: teacher123</p>
                </div>
              </TabsContent>
              
              <TabsContent value="admin" className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="font-medium text-purple-900">System Admin</p>
                  <p className="text-sm text-purple-700">Email: admin@idsn.com</p>
                  <p className="text-sm text-purple-700">Password: admin123</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}