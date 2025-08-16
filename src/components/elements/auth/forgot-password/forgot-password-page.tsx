"use client"

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, Loader2, AlertTriangle, Mail, ArrowLeft, Send } from 'lucide-react'
import { createForgotPasswordSession } from '@/lib/actions/auth/forgot-password/post/create-forgot-password'    

type ForgotPasswordState = 'idle' | 'loading' | 'success' | 'error'

function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [state, setState] = useState<ForgotPasswordState>('idle')
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setEmailError('')
    setState('idle')
    setMessage('')

    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setEmailError('Please enter your email address')
      return
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    setEmailError('')
    setState('loading')

    startTransition(async () => {
      try {
        const result = await createForgotPasswordSession(email)

        if(result.success && result.sessionToken){
          setState('success')
          router.push(`/login/forgot-password/${result.sessionToken}`)
          setMessage('Password reset instructions have been sent to your email')
        }else if (!result.success && result.error){
            setState('error')
            setMessage(result.error)
        }
        
      } catch (error) {
        setState('error')
        setMessage('Failed to send reset instructions. Please try again.')
        console.error('Forgot password error:', error)
      }
    })
  }

  const renderContent = () => {
    switch (state) {
      case 'idle':
        return (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold">Reset Your Password</h3>
              <p className="text-sm text-muted-foreground">
                Enter your email address and we'll send you instructions to reset your password
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={handleEmailChange}
                    className={`pl-10 h-12 ${
                      emailError 
                        ? "border-red-500 focus-visible:ring-red-500" 
                        : "border-primary/20 focus-visible:ring-primary"
                    }`}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {emailError && (
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <p className="text-sm text-red-500">{emailError}</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800 dark:text-blue-300">
                    <p className="font-medium mb-1">Password Reset Instructions</p>
                    <p>We'll send you a secure link to reset your password. The link will expire in 15 minutes.</p>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit"
              disabled={!email.trim() || !validateEmail(email) || isPending}
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending Instructions...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Send Reset Instructions
                </>
              )}
            </Button>

            <div className="text-center space-y-2">
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/login')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </div>
          </form>
        )

      case 'loading':
        return (
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="relative">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-blue-200 dark:border-blue-800 animate-pulse"></div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Sending Instructions...</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Please wait while we send password reset instructions to your email
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-300 font-medium ml-3">
                    Processing request...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'success':
        return (
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="relative">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Mail className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-green-700 dark:text-green-400">
                Instructions Sent!
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {message}
              </p>
              
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                <div className="space-y-2 text-left">
                  <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                    What's next?
                  </p>
                  <ul className="text-xs text-green-700 dark:text-green-400 space-y-1">
                    <li>• Check your email inbox for reset instructions</li>
                    <li>• Click the secure link in the email</li>
                    <li>• Create your new password</li>
                    <li>• The link expires in 15 minutes</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2 w-full">
              <Button 
                onClick={() => {
                  setState('idle')
                  setEmail('')
                  setMessage('')
                }}
                className="w-full"
                variant="default"
              >
                Send Another Email
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </div>
        )

      case 'error':
        return (
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="relative">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-red-700 dark:text-red-400">
                Failed to Send Instructions
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {message}
              </p>
            </div>

            <Alert className="w-full" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-left">
                There was an issue sending the password reset instructions. Please check your email address and try again.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col space-y-2 w-full">
              <Button 
                onClick={() => {
                  setState('idle')
                  setMessage('')
                }}
                className="w-full"
                variant="default"
              >
                Try Again
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {state === 'idle' 
              ? 'Forgot Password?' 
              : state === 'loading' 
              ? 'Sending Instructions...'
              : state === 'success'
              ? 'Check Your Email!'
              : 'Something Went Wrong'
            }
          </CardTitle>
          <CardDescription className="text-base">
            {state === 'idle' 
              ? 'No worries! We\'ll help you reset your password' 
              : state === 'loading' 
              ? 'Please wait while we process your request'
              : state === 'success'
              ? 'Password reset instructions have been sent'
              : 'There was an issue with your request'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPasswordPage
