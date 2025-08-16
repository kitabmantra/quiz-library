"use client"

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, Loader2, AlertTriangle, Mail, ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react'
import { useSessionToken } from '@/lib/hooks/params/useSessionToken'
import { useCheckForgotPasswordSession } from '@/lib/hooks/tanstack-query/query-hook/auth/forgot-password/use-check-forgot-password-session'
import { resetForgotPassword } from '@/lib/actions/auth/forgot-password/post/verify-forgot-password-otp'
import { deleteClientCookie } from '@/lib/utils/client-cookies'
import { delete_cookies } from '@/lib/utils/get-cookie'

type VerificationState = 'idle' | 'loading' | 'success' | 'error'

function ForgotSessionTokenPage() {
  const router = useRouter()
  const sessionToken = useSessionToken()
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [state, setState] = useState<VerificationState>('idle')
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  const { 
    data: checkForgotPasswordSession, 
    isLoading: isCheckForgotPasswordSessionLoading, 
    isError: isCheckForgotPasswordSessionError 
  } = useCheckForgotPasswordSession(sessionToken || '')

  // Handle session token validation
  if (!sessionToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold">Invalid Session</h3>
              <p className="text-sm text-muted-foreground">
                No session token found. Please start the password reset process again.
              </p>
              <Button onClick={() => router.push('/login/forgot-password')} className="w-full">
                Go to Forgot Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Handle loading state
  if (isCheckForgotPasswordSessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <h3 className="text-lg font-semibold">Validating Session...</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we validate your session.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Handle session validation error or expired session
  if (isCheckForgotPasswordSessionError || !checkForgotPasswordSession?.success || !checkForgotPasswordSession?.check) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold">Session Expired</h3>
              <p className="text-sm text-muted-foreground">
                Your password reset session has expired or is invalid. Please start the process again.
              </p>
              <div className="space-y-2">
                <Button onClick={() => router.push('/login/forgot-password')} className="w-full">
                  Start Password Reset
                </Button>
                <Button variant="ghost" onClick={() => router.push('/login')} className="w-full">
                  Back to Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Password validation function
  const validatePassword = (password: string) => {
    const hasNumber = /\d/.test(password)
    const hasLetter = /[a-zA-Z]/.test(password)
    const isLengthValid = password.length >= 6

    if (!isLengthValid) {
      return 'Password must be at least 6 characters long'
    }
    if (!hasNumber) {
      return 'Password must contain at least one number'
    }
    if (!hasLetter) {
      return 'Password must contain at least one letter'
    }
    return ''
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '') // Only allow numbers
    setOtp('')
    setOtpError('')
    setState('idle')
    setMessage('')

    // Validate OTP length
    if (value.length > 6) {
      setOtpError('Code must be 6 digits')
      return
    }

    setOtp(value)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewPassword(value)
    setPasswordError('')
    
    if (value) {
      const error = validatePassword(value)
      setPasswordError(error)
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setConfirmPassword(value)
    setPasswordError('')
    
    if (value && newPassword && value !== newPassword) {
      setPasswordError('Passwords do not match')
    }
  }

  const handleResetPasswordWithOTP = async () => {
    // Validate OTP
    if (!otp.trim()) {
      setOtpError('Please enter the verification code')
      return
    }
    
    if (otp.length !== 6) {
      setOtpError('Please enter a complete 6-digit code')
      return
    }

    // Validate passwords
    if (!newPassword.trim()) {
      setPasswordError('Please enter a new password')
      return
    }

    const passwordValidationError = validatePassword(newPassword)
    if (passwordValidationError) {
      setPasswordError(passwordValidationError)
      return
    }

    if (!confirmPassword.trim()) {
      setPasswordError('Please confirm your password')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setOtpError('')
    setPasswordError('')
    setState('loading')

    startTransition(async () => {
      try {
        const result = await resetForgotPassword({
          email: checkForgotPasswordSession?.email!,
          sessionToken: sessionToken,
          password: newPassword,
          token: otp
        })
        
        if (result.success) {
          setState('success')
          setMessage('Password reset successfully! Redirecting to login...')
          await delete_cookies("forgot_email")
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        } else {
          setState('error')
          setMessage(result.error || 'Failed to reset password')
        }
      } catch (error) {
        setState('error')
        setMessage('An unexpected error occurred. Please try again.')
        console.error('Password reset error:', error)
      }
    })
  }



  const renderContent = () => {
    switch (state) {
      case 'idle':
        return (
          <div className="flex flex-col space-y-4">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-2">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-semibold">Reset Your Password</h3>
              <p className="text-xs text-muted-foreground">
                Enter the code sent to <strong>{checkForgotPasswordSession.email}</strong> and set your new password
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium">
                  Verification Code
                </Label>
                <div className="relative">
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={handleOtpChange}
                    className={`text-center text-base font-mono tracking-widest h-10 ${
                      otpError 
                        ? "border-red-500 focus-visible:ring-red-500" 
                        : "border-primary/20 focus-visible:ring-primary"
                    }`}
                    maxLength={6}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-xs text-muted-foreground">
                      {otp.length}/6
                    </span>
                  </div>
                </div>
                {otpError && (
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <p className="text-sm text-red-500">{otpError}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={handlePasswordChange}
                    className={`pr-10 h-10 ${
                      passwordError 
                        ? "border-red-500 focus-visible:ring-red-500" 
                        : "border-primary/20 focus-visible:ring-primary"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className={`pr-10 h-10 ${
                      passwordError 
                        ? "border-red-500 focus-visible:ring-red-500" 
                        : "border-primary/20 focus-visible:ring-primary"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="flex items-center space-x-1">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-500">{passwordError}</p>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-2">
                <div className="text-xs text-blue-800 dark:text-blue-300">
                  <p className="font-medium mb-1">Requirements:</p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`flex items-center space-x-1 ${newPassword.length >= 6 ? 'text-green-600 dark:text-green-400' : ''}`}>
                      <span className={`w-1 h-1 rounded-full ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      <span className="text-xs">6+ chars</span>
                    </span>
                    <span className={`flex items-center space-x-1 ${/\d/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}`}>
                      <span className={`w-1 h-1 rounded-full ${/\d/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      <span className="text-xs">1 number</span>
                    </span>
                    <span className={`flex items-center space-x-1 ${/[a-zA-Z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}`}>
                      <span className={`w-1 h-1 rounded-full ${/[a-zA-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      <span className="text-xs">1 letter</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Didn't receive code? Check spam folder.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleResetPasswordWithOTP} 
              disabled={!otp.trim() || otp.length !== 6 || !newPassword || !confirmPassword || !!passwordError || isPending}
              className="w-full h-10 text-sm font-medium"
              size="sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Reset Password
                </>
              )}
            </Button>

            <div className="text-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/login/forgot-password')}
                className="text-xs text-muted-foreground hover:text-foreground h-8"
              >
                <ArrowLeft className="mr-1 h-3 w-3" />
                Back to Forgot Password
              </Button>
            </div>
          </div>
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
              <h3 className="text-xl font-semibold">Resetting Password...</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Please wait while we verify your code and reset your password
              </p>
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
                <Shield className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-green-700 dark:text-green-400">
                Password Reset Successfully!
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {message}
              </p>
            </div>
          </div>
        )

      case 'error':
        return (
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-red-700 dark:text-red-400">
                Password Reset Failed
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {message}
              </p>
            </div>

            <div className="flex flex-col space-y-2 w-full">
              <Button 
                onClick={() => {
                  setState('idle')
                  setOtp('')
                  setNewPassword('')
                  setConfirmPassword('')
                  setMessage('')
                  setOtpError('')
                  setPasswordError('')
                  setShowPassword(false)
                  setShowConfirmPassword(false)
                }}
                className="w-full"
                variant="default"
              >
                Try Again
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/login/forgot-password')}
                className="w-full"
              >
                Start Over
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg max-h-[95vh] overflow-y-auto">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Password Reset
            </CardTitle>
            <CardDescription className="text-sm">
              Complete your password reset
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ForgotSessionTokenPage
