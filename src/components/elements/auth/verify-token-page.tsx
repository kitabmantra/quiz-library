"use client"

import { useRouter } from 'next/navigation'
import React, { useState, useTransition, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { verifyToken } from '@/lib/actions/auth/post/verify-token'
import { useCheckUserInRedis } from '@/lib/hooks/tanstack-query/query-hook/auth/use-check-user-in-redis'
import { deleteEmailToken } from '@/lib/actions/auth/delete/delete-email-token'

type VerificationState = 'idle' | 'loading' | 'success' | 'error' | 'invalid-token'

function VerifyTokenPage() {
  const {data : userInRedisStatus, isLoading : isUserInRedisLoading, isError : isUserInRedisError} = useCheckUserInRedis()
  const router = useRouter()
  const [token, setToken] = useState('')
  const [tokenError, setTokenError] = useState('')
  const [state, setState] = useState<VerificationState>('idle')
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()
  const queryClient = useQueryClient()

  // Security check: Redirect if user is not authorized to access this page
  useEffect(() => {
    if (isUserInRedisLoading) return // Wait for the check to complete
    
    // If there's an error or user is not in Redis, redirect to home
    if (isUserInRedisError || !userInRedisStatus?.success) {
      console.log("Unauthorized access to verify-token page, redirecting to home")
      router.replace('/')
      return
    }
    
    console.log("User authorized for verification:", userInRedisStatus)
  }, [userInRedisStatus, isUserInRedisLoading, isUserInRedisError, router])

  // Show loading while checking authorization
  if (isUserInRedisLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-lg shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Checking authorization...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Don't render the form if user is not authorized (will redirect anyway)
  if (isUserInRedisError || !userInRedisStatus?.success) {
    return null
  }

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '') // Only allow numbers
    setToken('')
    setTokenError('')
    setState('idle')
    setMessage('')

    // Validate token length (server action validates > 6 characters)
    if (value.length > 6) {
      setTokenError('Code must be 6 digits or less')
      return
    }

    setToken(value)
  }

  const handleVerifyToken = async () => {
    if (!token.trim()) {
      setTokenError('Please enter a verification code')
      return
    }
    
    if (token.length > 6) {
      setTokenError('Invalid code: Code must be 6 digits or less')
      return
    }

    setTokenError('')
    setState('loading')

    startTransition(async () => {
      try {
        const result = await verifyToken(token)
        
        if (result.success) {
          setState('success')
          setMessage(result.message || 'Token verified successfully!')
          queryClient.invalidateQueries({ queryKey: ["get-user-from-token"] })
          await deleteEmailToken()
          setTimeout(() => router.push("/"), 2000)
        } else {
          setState('error')
          setMessage(typeof result.error === 'string' ? result.error : 'Verification failed')
        }
      } catch (error) {
        setState('error')
        setMessage('An unexpected error occurred')
        console.error('Verification error:', error)
      }
    })
  }



  const renderContent = () => {
    switch (state) {
      case 'idle':
        return (
          <div className="flex flex-col space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Enter Verification Code</h3>
              <p className="text-sm text-muted-foreground">
                We sent a 6-digit code to your email address
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token" className="text-sm font-medium">
                  Verification Code
                </Label>
                <div className="relative">
                  <Input
                    id="token"
                    type="text"
                    placeholder="000000"
                    value={token}
                    onChange={handleTokenChange}
                    className={`text-center text-lg font-mono tracking-widest h-12 ${
                      tokenError 
                        ? "border-red-500 focus-visible:ring-red-500" 
                        : "border-primary/20 focus-visible:ring-primary"
                    }`}
                    maxLength={6}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-xs text-muted-foreground">
                      {token.length}/6
                    </span>
                  </div>
                </div>
                {tokenError && (
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <p className="text-sm text-red-500">{tokenError}</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800 dark:text-blue-300">
                    <p className="font-medium mb-1">Didn't receive the code?</p>
                    <p>Check your spam folder or request a new verification email</p>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleVerifyToken} 
              disabled={!token.trim() || token.length !== 6 || isPending}
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying Code...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Verify Code
                </>
              )}
            </Button>

            <div className="text-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/login')}
                className="text-muted-foreground hover:text-foreground"
              >
                Back to Login
              </Button>
            </div>
          </div>
        )

      case 'loading':
        return (
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="relative">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse"></div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Verifying Code...</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Please wait while we verify your verification code
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-300 font-medium ml-3">
                    Processing verification...
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
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-green-700 dark:text-green-400">
                Account Verified!
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {message}
              </p>
              
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                  <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                    Redirecting to dashboard...
                  </p>
                </div>
              </div>
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
                <XCircle className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-red-700 dark:text-red-400">
                Verification Failed
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {message}
              </p>
            </div>

            <Alert className="w-full" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-left">
                {message.toLowerCase().includes('invalid') && 
                  'The verification code is invalid or has expired.'}
                {message.toLowerCase().includes('expired') && 
                  'This verification code has expired. Please request a new one.'}
                {message.toLowerCase().includes('used') && 
                  'This verification code has already been used.'}
                {!message.toLowerCase().includes('invalid') && 
                 !message.toLowerCase().includes('expired') && 
                 !message.toLowerCase().includes('used') && 
                  'There was an issue verifying your code. Please try again or contact support.'}
              </AlertDescription>
            </Alert>

            <div className="flex flex-col space-y-2 w-full">
              <Button 
                onClick={() => {
                  setState('idle')
                  setToken('')
                  setMessage('')
                }}
                className="w-full"
                variant="default"
              >
                Try Different Code
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
              ? 'Verify Your Account' 
              : state === 'loading' 
              ? 'Verifying...'
              : state === 'success'
              ? 'Verification Complete!'
              : 'Verification Failed'
            }
          </CardTitle>
          <CardDescription className="text-base">
            {state === 'idle' 
              ? 'Complete your account setup by entering the verification code' 
              : state === 'loading' 
              ? 'Please wait while we verify your code'
              : state === 'success'
              ? 'Your account has been successfully verified'
              : 'There was an issue verifying your code'
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

export default VerifyTokenPage
