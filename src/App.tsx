import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthenticationStatus } from '@nhost/react'
import { SignIn } from './components/SignIn'
import { SignUp } from './components/SignUp'
import { EmailVerification } from './components/EmailVerification'
import { ChatApp } from './components/ChatApp'
import { Loading } from './components/Loading'

function App() {
  const { isAuthenticated, isLoading } = useAuthenticationStatus()

  if (isLoading) {
    return <Loading />
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route 
            path="/signin" 
            element={isAuthenticated ? <Navigate to="/" /> : <SignIn />} 
          />
          <Route 
            path="/signup" 
            element={isAuthenticated ? <Navigate to="/" /> : <SignUp />} 
          />
          <Route 
            path="/verify-email/:token" 
            element={<EmailVerification />} 
          />
          <Route 
            path="/verify-email" 
            element={<EmailVerification />} 
          />
          <Route 
            path="/" 
            element={isAuthenticated ? <ChatApp /> : <Navigate to="/signin" />} 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
