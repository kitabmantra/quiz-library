"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useUserStore } from '@/lib/store/useUserStore'
import { useVerifyToken } from '@/lib/hooks/tanstack-query/query-hook/user/use-verify-token'

type VerificationState = 'loading' | 'success' | 'error' | 'invalid-token'

function VerifyTokenPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const { setUser } = useUserStore()

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Invalid Request</CardTitle>
            <CardDescription>No verification token provided</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-amber-500" />
              <div className="text-center space-y-2">
                <h2 className="text-lg font-semibold text-amber-700">Missing Token</h2>
                <p className="text-sm text-muted-foreground">
                  The verification link appears to be incomplete
                </p>
              </div>
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please check your email and click the verification link again.
                </AlertDescription>
              </Alert>
              <Button variant="outline" onClick={() => router.push('/login')} className="mt-4">
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data, isLoading, error, isError } = useVerifyToken(token)
  console.log("this ish te data of token verification    : ",data)
  const [state, setState] = useState<VerificationState>('loading')
  const [message, setMessage] = useState('')
  const queryClient = useQueryClient();
  // verify-user-token
  useEffect(() => {
    if (isLoading) {
      setState('loading')
      return
    }

    // Handle network/fetch errors
    if (isError && error) {
      setState('error')
      setMessage(error?.message || 'Network error occurred during verification')
      return
    }

    // Handle API response
    if (data) {
      if (data.success && data.message) {
        setState('success')
        setMessage(data.message || 'Token verified successfully!')
        router.push("/")
      } else {
        setState('error')
        setMessage(data.error || 'Verification failed')
      }
    }
  }, [data, isLoading, isError, error, setUser])

  const handleRetry = () => {
    window.location.reload()
  }

  const handleSuccessRedirect = () =>{
  // verify-user-token
    queryClient.invalidateQueries({ queryKey: ["verify-user-token"] })
    router.replace("/")
  }

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <h2 className="text-lg font-semibold">Verifying your token...</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Please wait while we verify your request
              </p>
            </div>
          </div>
        )

      case 'success':
        return (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold text-green-700 dark:text-green-400">
                Verification Successful!
              </h2>
              <p className="text-sm text-muted-foreground">{message}</p>
              {data?.user && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    Welcome, <span className="font-semibold">{data.user.userName}</span>!
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Email: {data.user.email}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Account Status: {data.user.isVerified ? 'Verified' : 'Pending'}
                  </p>
                </div>
              )}
            </div>
            <Button onClick={handleSuccessRedirect} className="mt-4">
              Continue to Shop
            </Button>
          </div>
        )

      case 'error':
        return (
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500" />
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
                Verification Failed
              </h2>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            <Alert className="mt-4" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {message.toLowerCase().includes('invalid') && 
                  'The verification token is invalid or has expired.'}
                {message.toLowerCase().includes('expired') && 
                  'This verification link has expired. Please request a new one.'}
                {message.toLowerCase().includes('used') && 
                  'This verification link has already been used.'}
                {!message.toLowerCase().includes('invalid') && 
                 !message.toLowerCase().includes('expired') && 
                 !message.toLowerCase().includes('used') && 
                  'There was an issue verifying your token. Please try again or contact support.'}
              </AlertDescription>
            </Alert>
            <div className="flex space-x-2 mt-4">
              <Button variant="outline" onClick={handleRetry}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push('/login')}>
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
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Token Verification</CardTitle>
          <CardDescription>
            We're processing your verification request
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  )
}

export default VerifyTokenPage
