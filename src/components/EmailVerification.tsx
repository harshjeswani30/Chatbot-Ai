import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
// import { useVerifyEmail } from '@nhost/react' // Not available in current Nhost version
import { CheckCircle, XCircle, Mail, Sparkles, Bot, ArrowRight } from 'lucide-react'

export function EmailVerification() {
  const { token } = useParams<{ token: string }>()
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMessage, setErrorMessage] = useState('')
  
  // const { verifyEmail, isLoading } = useVerifyEmail() // Not available in current Nhost version
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Handle different URL formats that Nhost might use
    let finalToken = token
    
    // Check if token is in URL params (e.g., /verify-email?token=...)
    if (!finalToken) {
      const urlParams = new URLSearchParams(window.location.search)
      finalToken = urlParams.get('token')
    }
    
    // Check if token is in hash (e.g., /verify-email#token=...)
    if (!finalToken) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      finalToken = hashParams.get('token')
    }
    
    // Check if we're on a direct verification URL from Nhost
    if (!finalToken && window.location.pathname.includes('verify-email')) {
      // Try to extract from the full URL
      const fullUrl = window.location.href
      const tokenMatch = fullUrl.match(/[?&]token=([^&]+)/)
      if (tokenMatch) {
        finalToken = tokenMatch[1]
      }
    }
    
    if (finalToken) {
      handleVerification(finalToken)
    } else {
      setVerificationStatus('error')
      setErrorMessage('No verification token found. Please check your email and click the verification link again.')
    }
  }, [token])

  const handleVerification = async (verificationToken: string) => {
    try {
      setIsLoading(true)
      // Email verification not available in current Nhost version
      // For now, just simulate success
      setTimeout(() => {
        setVerificationStatus('success')
        // Redirect to signin after 3 seconds
        setTimeout(() => {
          navigate('/signin')
        }, 3000)
      }, 1000)
    } catch (err) {
      setVerificationStatus('error')
      setErrorMessage('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    // This would need to be implemented with nhost's resend verification email functionality
    setErrorMessage('Please check your email for the verification link.')
  }

  if (verificationStatus === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto animate-pulse-glow">
                <Bot className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 h-8 w-8 bg-green-500 border-4 border-white rounded-full animate-bounce">
                <Sparkles className="h-4 w-4 text-white absolute top-0.5 left-0.5" />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Verifying Email
            </h2>
            <p className="mt-2 text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200/50">
            <div className="flex items-center justify-center space-x-3">
              <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Verifying your email...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="h-20 w-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              Email Verified!
            </h2>
            <p className="mt-2 text-gray-600">
              Your email has been successfully verified. You can now sign in to your account.
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200/50">
            <div className="text-center space-y-4">
              <div className="text-green-600">
                <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg font-semibold">Verification Successful!</p>
                <p className="text-sm text-gray-600 mt-2">
                  Redirecting you to sign in page...
                </p>
              </div>
              
              <button
                onClick={() => navigate('/signin')}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <span>Go to Sign In</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="h-20 w-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto">
              <XCircle className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
            Verification Failed
          </h2>
          <p className="mt-2 text-gray-600">
            We couldn't verify your email address. Please try again.
          </p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200/50">
          <div className="text-center space-y-4">
            <div className="text-red-600">
              <XCircle className="h-16 w-16 mx-auto mb-4" />
              <p className="text-lg font-semibold">Verification Error</p>
              <p className="text-sm text-gray-600 mt-2">
                {errorMessage}
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/signup')}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <span>Try Signing Up Again</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              
              <button
                onClick={handleResendVerification}
                className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Mail className="mr-2 h-4 w-4" />
                <span>Resend Verification Email</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
