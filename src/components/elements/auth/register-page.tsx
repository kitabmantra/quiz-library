'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { registerUser } from '@/lib/actions/auth/post/register-user'
import { useRouter } from 'next/navigation'

// Validation schema
const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(30, 'First name cannot exceed 30 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(30, 'Last name cannot exceed 30 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  email: z
    .string()
    .min(1, 'Email is required')
    .max(100, 'Email cannot exceed 100 characters')
    .email('Please enter a valid email address'),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .max(20, 'Phone number cannot exceed 20 characters')
    .regex(/^[\+]?[1-9][\d\s\-\(\)]{0,15}$/, 'Please enter a valid phone number'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password cannot exceed 50 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registering, setRegistering] = useState(false)
  const router = useRouter()

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: ''
    },
    mode: 'onChange' // Real-time validation
  })

  const onSubmit = async(data: RegisterFormData) => {
    if(registering) return;
    if(data.confirmPassword !== data.password){
      toast.error("Passwords do not match")
      return;
    }
    setRegistering(true)
    try {
      const res = await registerUser(data)
      if(res.success){
        toast.success(res.message)
        router.push('/login')
      }else if(!res.success && res.error){
        toast.error(res.error)
      }else{
        toast.error("Something went wrong")
      }
    } catch (error) {
      toast.error(error as string)
    }finally{
      setRegistering(false)
    }
  }

  const password = form.watch('password')

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold text-sky-800">
                Create Account
              </CardTitle>
              <CardDescription className="text-sky-600">
                Join our quiz community and start learning!
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-sky-700">
                            First Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="John"
                              className="border-sky-200 focus:border-sky-400 focus:ring-sky-400"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-sky-700">
                            Last Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Doe"
                              className="border-sky-200 focus:border-sky-400 focus:ring-sky-400"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-sky-700">
                          Email Address *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="john@example.com"
                            className="border-sky-200 focus:border-sky-400 focus:ring-sky-400"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-sky-700">
                          Phone Number *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            placeholder="+1234567890"
                            className="border-sky-200 focus:border-sky-400 focus:ring-sky-400"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-sky-700">
                          Password *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              className="border-sky-200 focus:border-sky-400 focus:ring-sky-400 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sky-600 hover:text-sky-800"
                            >
                              {showPassword ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />

                        {/* Password strength indicator */}
                        {password && (
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'
                                }`}></div>
                              <span className="text-xs text-sky-600">At least 6 characters</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${/[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'
                                }`}></div>
                              <span className="text-xs text-sky-600">One lowercase letter</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'
                                }`}></div>
                              <span className="text-xs text-sky-600">One uppercase letter</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${/\d/.test(password) ? 'bg-green-500' : 'bg-gray-300'
                                }`}></div>
                              <span className="text-xs text-sky-600">One number</span>
                            </div>
                          </div>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-sky-700">
                          Confirm Password *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              className="border-sky-200 focus:border-sky-400 focus:ring-sky-400 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sky-600 hover:text-sky-800"
                            >
                              {showConfirmPassword ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-2.5"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center">
                <p className="text-sm text-sky-600">
                  Already have an account?{' '}
                  <Link href="/login" className="font-semibold text-sky-700 hover:text-sky-800 underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Register Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Register Illustration */}
        <div className="relative z-10 flex items-center justify-center w-full">
          <div className="text-center text-white p-8">
            <div className="mb-8">
              <img
                src="/register-illustration.svg"
                alt="Register Illustration"
                className="w-80 h-80 mx-auto mb-6 drop-shadow-2xl"
              />
            </div>

            <h2 className="text-4xl font-bold mb-4">
              Join Our Community
            </h2>
            <p className="text-xl text-white/90 max-w-md mx-auto leading-relaxed mb-8">
              Connect with thousands of learners and start your educational journey with our interactive quiz platform
            </p>

            <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">10K+</div>
                <div className="text-sm text-white/80">Active Learners</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">500+</div>
                <div className="text-sm text-white/80">Quiz Categories</div>
              </div>
            </div>

            {/* Features List */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white/90">Interactive Learning Experience</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white/90">Progress Tracking & Analytics</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white/90">Wide Range of Subjects</span>
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

export default RegisterPage
