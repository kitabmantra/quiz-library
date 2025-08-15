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
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold text-sky-800">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-sky-600">
                Sign in to continue your learning journey
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-sky-700 mb-1">
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
                    className="border-sky-200 focus:border-sky-400 focus:ring-sky-400"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-sky-700 mb-1">
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
                    className="border-sky-200 focus:border-sky-400 focus:ring-sky-400"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded border-sky-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-sm text-sky-700">Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="text-sm text-sky-600 hover:text-sky-800 underline">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-2.5"
                  disabled={isCreating}
                  >
                  {isCreating ? "Logging in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-sky-600">
                  Don't have an account?{' '}
                  <Link href="/register" className="font-semibold text-sky-700 hover:text-sky-800 underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - AI Generated Image */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>

        {/* AI Generated Quiz/Education Image */}
        <div className="relative z-10 flex items-center justify-center w-full">
          <div className="text-center text-white p-8">
            <div className="mb-8">
              <Image
                src="/login-illustration.svg"
                alt="Quiz Learning Illustration"
                className="w-64 h-64 mx-auto mb-6 drop-shadow-lg"
                width={256}
                height={256}
              />
            </div>

            <h2 className="text-4xl font-bold mb-4">
              Master Your Knowledge
            </h2>
            <p className="text-xl text-white/90 max-w-md mx-auto leading-relaxed">
              Join thousands of learners who are improving their skills with our interactive quiz platform
            </p>

            <div className="mt-8 flex justify-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-sm text-white/80">Active Learners</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm text-white/80">Quiz Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">95%</div>
                <div className="text-sm text-white/80">Success Rate</div>
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
