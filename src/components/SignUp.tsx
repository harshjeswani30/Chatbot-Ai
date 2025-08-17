import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSignUpEmailPassword, useSignInOAuth } from '@nhost/react'
import { Mail, Lock, Eye, EyeOff, User, Sparkles, Bot, ArrowRight, Github, Chrome } from 'lucide-react'

export function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  
  const { signUpEmailPassword, isLoading } = useSignUpEmailPassword()
  const { signInOAuth, isLoading: isOAuthLoading } = useSignInOAuth()
  const navigate = useNavigate()

  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  
  // Debug: Log the current state
  console.log('SignUp component - showSuccessMessage:', showSuccessMessage)

  const handleGitHubSignUp = async () => {
    try {
      setError('') // Clear any previous errors
      const { error } = await signInOAuth('github')
      if (error) {
        setError(error.message)
      }
      // OAuth will redirect to GitHub, so no need to navigate
    } catch (err) {
      setError('GitHub sign-up failed. Please try again.')
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      setError('') // Clear any previous errors
      const { error } = await signInOAuth('google')
      if (error) {
        setError(error.message)
      }
      // OAuth will redirect to Google, so no need to navigate
    } catch (err) {
      setError('Google sign-up failed. Please try again.')
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    try {
      const { error } = await signUpEmailPassword(email, password)
      if (error) {
        setError(error.message)
      } else {
        setShowSuccessMessage(true)
        // Don't navigate immediately, show success message first
      }
    } catch (err) {
      setError('An unexpected error occurred')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
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
            Join AI Chat
          </h2>
          <p className="mt-2 text-gray-600">
            Create your account and start chatting with AI
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/signin" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
              Sign in here
            </Link>
          </p>
        </div>
        
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl animate-fade-in">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <div className="h-5 w-5 bg-green-500 rounded-full"></div>
                <span className="text-lg font-semibold">Account Created Successfully!</span>
              </div>
              <div className="space-y-2 text-sm">
                <p>We've sent a verification email to <strong>{email}</strong></p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <div className="h-4 w-4 bg-yellow-500 rounded-full mt-0.5"></div>
                    <div className="text-left">
                      <p className="font-medium text-yellow-800">Important: Check Your Spam Folder!</p>
                      <p className="text-yellow-700 text-xs mt-1">
                        Verification emails often land in spam/junk folders. Please check there if you don't see it in your inbox.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-green-600">
                  Click the verification link in the email to activate your account and start chatting!
                </p>
              </div>
              <button
                onClick={() => navigate('/signin')}
                className="mt-3 w-full flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
              >
                Go to Sign In
              </button>
            </div>
          </div>
        )}

        {/* OAuth Sign-up Options */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50" style={{ zIndex: 10 }}>
          <div className="text-center mb-6">
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-700">
                <strong>✅ Ready!</strong> OAuth providers are now configured and working
              </p>
            </div>
            <p className="text-sm text-gray-600 mb-4">Sign up with</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGitHubSignUp}
                disabled={isOAuthLoading}
                className="flex items-center justify-center space-x-2 w-full py-3 px-4 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {isOAuthLoading ? (
                  <div className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Github className="h-5 w-5" />
                )}
                <span className="text-sm font-medium">
                  {isOAuthLoading ? 'Connecting...' : 'GitHub'}
                </span>
              </button>
              
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isOAuthLoading}
                className="flex items-center justify-center space-x-2 w-full py-3 px-4 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {isOAuthLoading ? (
                  <div className="h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Chrome className="h-5 w-5" />
                )}
                <span className="text-sm font-medium">
                  {isOAuthLoading ? 'Connecting...' : 'Google'}
                </span>
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or create account with email</span>
            </div>
          </div>
        </div>

        {/* Email/Password Form */}
        <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200/50 ${showSuccessMessage ? 'hidden' : 'block'}`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-fade-in">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}
            
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-xl relative block w-full pl-12 pr-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  We'll send a verification email to this address. Please use a valid email you can access.
                </p>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-xl relative block w-full pl-12 pr-12 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none rounded-xl relative block w-full pl-12 pr-12 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors duration-200"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Create your account</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                )}
              </button>
            </div>

            {/* Email Verification Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">What happens next?</p>
                  <ul className="space-y-1 text-xs">
                    <li>• We'll send a verification email to your inbox</li>
                    <li>• <strong>Check your spam/junk folder</strong> if you don't see it</li>
                    <li>• Click the verification link to activate your account</li>
                    <li>• Then you can sign in and start chatting!</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
