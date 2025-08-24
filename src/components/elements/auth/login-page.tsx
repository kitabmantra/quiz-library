'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { loginUser } from '@/lib/actions/auth/post/login-user'
import { toast } from 'react-hot-toast'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isCreating, setIsCreating] = useState(false);
  const searchParams = useSearchParams()
  const redirect = searchParams.get("callbackUrl")
  const queryClient = useQueryClient();

  const router = useRouter()
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      const res = await loginUser(formData)
      if(res.success && res.message){
        toast.success(res.message)
        queryClient.invalidateQueries({ queryKey: ["get-user-from-token"] });
        router.push(redirect || "/")
      }else if(!res.success && res.error){  
        toast.error(res.error as string)
      }else{
        toast.error("Something went wrong")
      }
    } catch (error) {
      toast.error(error as string)
    } finally{
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-purple-50 via-white to-purple-100">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold text-purple-800">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-purple-600">
                Sign in to continue your learning journey
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-purple-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isCreating}
                    required
                    className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-purple-700 mb-1">
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isCreating}
                    required
                    className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-purple-700">Remember me</span>
                  </label>
                  <Link href="/login/forgot-password" className="text-sm text-purple-600 hover:text-purple-800 underline">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-2.5"
                  disabled={isCreating}
                  >
                  {isCreating ? "Logging in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-purple-600">
                  Don't have an account?{' '}
                  <Link href="/register" className="font-semibold text-purple-700 hover:text-purple-800 underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Enhanced Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-purple-600/10"></div>

        {/* Quiz Interface Mockup - Top Right */}
        <div className="absolute top-8 right-8 z-20">
          <div className="relative">
            <div className="w-72 h-80 bg-white rounded-2xl shadow-2xl p-5 border-4 border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="text-sm font-medium text-purple-600">Question 2/10</div>
              </div>
              
              <div className="space-y-3">
                <div className="h-3 bg-purple-100 rounded-full w-3/4"></div>
                <div className="h-3 bg-purple-100 rounded-full w-full"></div>
                <div className="h-3 bg-purple-100 rounded-full w-5/6"></div>
                
                <div className="space-y-2 mt-4">
                  <div className="h-7 bg-purple-50 border-2 border-purple-200 rounded-lg flex items-center px-3">
                    <div className="w-3 h-3 border-2 border-purple-400 rounded-full mr-2"></div>
                    <div className="h-2 bg-purple-200 rounded w-3/4"></div>
                  </div>
                  <div className="h-7 bg-purple-50 border-2 border-purple-200 rounded-lg flex items-center px-3">
                    <div className="w-3 h-3 border-2 border-purple-400 rounded-full mr-2"></div>
                    <div className="h-2 bg-purple-200 rounded w-2/3"></div>
                  </div>
                  <div className="h-7 bg-purple-50 border-2 border-purple-200 rounded-lg flex items-center px-3">
                    <div className="w-3 h-3 border-2 border-purple-400 rounded-full mr-2"></div>
                    <div className="h-2 bg-purple-200 rounded w-4/5"></div>
                  </div>
                  <div className="h-7 bg-purple-50 border-2 border-purple-200 rounded-lg flex items-center px-3">
                    <div className="w-3 h-3 border-2 border-purple-400 rounded-full mr-2"></div>
                    <div className="h-2 bg-purple-200 rounded w-1/2"></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <div className="text-xs text-purple-600">⏱️ 01:30</div>
                  <div className="w-16 h-1.5 bg-purple-100 rounded-full overflow-hidden">
                    <div className="w-2/5 h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-3 -left-3 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg animate-bounce">
              ✓
            </div>
            <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg animate-bounce" style={{animationDelay: '0.5s'}}>
              ⭐
            </div>
          </div>
        </div>

        {/* Enhanced Content - Centered */}
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <div className="text-center text-white p-8 max-w-lg">
            <div className="mb-6">
              <Image
                src="/login-illustration.svg"
                alt="Quiz Learning Illustration"
                className="w-48 h-48 mx-auto mb-4 drop-shadow-lg"
                width={192}
                height={192}
              />
            </div>

            <h2 className="text-3xl font-bold mb-3">
              Master Your Knowledge
            </h2>
            <p className="text-lg text-white/90 max-w-sm mx-auto leading-relaxed mb-6">
              Join thousands of learners who are improving their skills with our interactive quiz platform
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-4 text-white/80 text-xs mb-6">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Secure Login</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>24/7 Access</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Progress Sync</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">50K+</div>
                <div className="text-xs text-white/80">Active Learners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">1000+</div>
                <div className="text-xs text-white/80">Quiz Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">98%</div>
                <div className="text-xs text-white/80">Success Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
        <div className="absolute top-32 right-16 w-12 h-12 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-16 h-16 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-white/10 rounded-full"></div>
      </div>
    </div>
  )
}

export default LoginPage
