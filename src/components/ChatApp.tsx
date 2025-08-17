import React, { useState, useEffect } from 'react'
import { useSignOut } from '@nhost/react'
import { LogOut, Plus, MessageSquare, Sparkles, Settings, User, Moon, Sun, Menu, X } from 'lucide-react'
import { ChatList } from './ChatList'
import { ChatWindow } from './ChatWindow'

export function ChatApp() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('darkMode')
    return savedTheme === 'true'
  })
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('chatSettings')
    return savedSettings ? JSON.parse(savedSettings) : {
      autoScroll: true,
      messageSound: true,
      typingIndicator: true,
      compactMode: false,
      fontSize: 'medium',
      language: 'en'
    }
  })
  const { signOut } = useSignOut()

  const handleSignOut = () => {
    signOut()
  }

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    console.log('Dark mode toggled to:', newDarkMode)
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', newDarkMode.toString())
    
    // Apply dark mode to the document
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      document.body.style.backgroundColor = '#1f2937'
      document.body.style.color = '#f9fafb'
    } else {
      document.documentElement.classList.remove('dark')
      document.body.style.backgroundColor = ''
      document.body.style.color = ''
    }
  }

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('chatSettings', JSON.stringify(newSettings))
    console.log(`Setting updated: ${key} = ${value}`)
  }

  const openSettings = () => {
    setShowSettings(true)
    setShowUserMenu(false)
  }

  const toggleUserMenu = () => {
    const newState = !showUserMenu
    setShowUserMenu(newState)
    console.log('User menu toggled:', newState)
    console.log('showUserMenu state:', newState)
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showUserMenu && !target.closest('[data-user-menu]')) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      // Add a small delay to prevent immediate closure
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 100)
      
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [showUserMenu])

  // Close user menu when pressing Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showUserMenu) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => document.removeEventListener('keydown', handleEscape)
  }, [showUserMenu])

  // Close user menu when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (showUserMenu) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('scroll', handleScroll, true)
    }

    return () => document.removeEventListener('scroll', handleScroll, true)
  }, [showUserMenu])

  // Apply dark mode on component mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      document.body.style.backgroundColor = '#1f2937'
      document.body.style.color = '#f9fafb'
    } else {
      document.documentElement.classList.remove('dark')
      document.body.style.backgroundColor = ''
      document.body.style.color = ''
    }
  }, [])

  return (
    <div 
      className="h-screen flex flex-col transition-all duration-300"
      style={{
        background: isDarkMode 
          ? 'linear-gradient(to bottom right, #1f2937, #111827, #0f172a)' 
          : 'linear-gradient(to bottom right, #f8fafc, #dbeafe, #e0e7ff)'
      }}
    >
      {/* Header */}
      <header 
        className="backdrop-blur-lg shadow-lg border-b transition-all duration-300"
        style={{
          backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          borderBottomColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl transition-colors duration-200"
              style={{
                color: isDarkMode ? '#d1d5db' : '#4b5563',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#3b82f6'
                e.target.style.backgroundColor = isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(219, 234, 254, 1)'
              }}
              onMouseLeave={(e) => {
                e.target.style.color = isDarkMode ? '#d1d5db' : '#4b5563'
                e.target.style.backgroundColor = 'transparent'
              }}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Logo and Title */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse-glow">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <h1 
                  className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent"
                  style={{
                    backgroundImage: isDarkMode 
                      ? 'linear-gradient(to right, #60a5fa, #a78bfa, #60a5fa)' 
                      : 'linear-gradient(to right, #2563eb, #9333ea, #1e40af)'
                  }}
                >
                  AI Assistant Pro
                </h1>
                <div 
                  className="flex items-center space-x-3 text-xs"
                  style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                >
                  <div className="flex items-center space-x-1">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Online</span>
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">Powered by GPT-3.5 Turbo</span>
                </div>
              </div>
            </div>

            {/* User Menu */}
            <div className="relative" data-user-menu>

              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleUserMenu()
                }}
                className="group flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: showUserMenu 
                    ? (isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(219, 234, 254, 1)')
                    : (isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(249, 250, 251, 1)'),
                  borderColor: showUserMenu 
                    ? (isDarkMode ? 'rgba(59, 130, 246, 0.5)' : 'rgba(191, 219, 254, 1)')
                    : (isDarkMode ? 'rgba(107, 114, 128, 0.5)' : 'rgba(229, 231, 235, 1)'),
                  color: showUserMenu 
                    ? (isDarkMode ? '#93c5fd' : '#1d4ed8')
                    : (isDarkMode ? '#e5e7eb' : '#374151')
                }}
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                  showUserMenu 
                    ? 'bg-blue-600' 
                    : 'bg-gradient-to-br from-blue-500 to-blue-600'
                }`}>
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="hidden sm:inline text-sm font-medium">Account</span>
                <div className={`transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}>
                  <svg className="h-3 w-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Sidebar - Chat List */}
        <div className={`
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          w-80 bg-white/90 backdrop-blur-sm border-r border-gray-200/50 flex flex-col shadow-xl lg:shadow-lg
          transition-transform duration-300 ease-in-out
        `}>
                            <ChatList 
                    selectedChatId={selectedChatId}
                    isDarkMode={isDarkMode}
                    onSelectChat={(chatId) => {
                      console.log('Selecting chat:', chatId)
                      setSelectedChatId(chatId)
                      setIsMobileMenuOpen(false) // Close mobile menu when chat is selected
                      setShowUserMenu(false) // Close user menu when chat is selected
                    }}
                  />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {selectedChatId ? (
                         <ChatWindow 
               chatId={selectedChatId}
               isDarkMode={isDarkMode}
               settings={settings}
               onBack={() => {
                 console.log('Going back to chat list')
                 setSelectedChatId(null)
                 setIsMobileMenuOpen(false)
                 setShowUserMenu(false)
               }}
             />
          ) : (
            <div 
              className="flex-1 flex items-center justify-center px-4 transition-all duration-300"
              style={{
                background: isDarkMode 
                  ? 'linear-gradient(to bottom right, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9), rgba(15, 23, 42, 0.8))'
                  : 'linear-gradient(to bottom right, rgba(249, 250, 251, 1), rgba(255, 255, 255, 1), rgba(219, 234, 254, 0.3))'
              }}
            >
              <div className="text-center max-w-lg mx-auto p-4 sm:p-8 animate-fade-in">
                <div className="relative mb-6 sm:mb-8">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl mx-auto animate-pulse-glow">
                    <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-6 w-6 sm:h-8 sm:w-8 bg-green-500 border-4 border-white rounded-full animate-bounce">
                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
                <h3 
                  className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent mb-3 sm:mb-4"
                  style={{
                    backgroundImage: isDarkMode 
                      ? 'linear-gradient(to right, #f3f4f6, #d1d5db)' 
                      : 'linear-gradient(to right, #111827, #374151)'
                  }}
                >
                  Welcome to AI Assistant Pro
                </h3>
                <p 
                  className="text-base sm:text-lg mb-2 sm:mb-3"
                  style={{ color: isDarkMode ? '#d1d5db' : '#4b5563' }}
                >
                  Your intelligent conversation partner is ready to help
                </p>
                <p 
                  className="text-sm sm:text-base mb-6 sm:mb-8"
                  style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                >
                  <span className="lg:hidden">Tap the menu button to see your conversations or create a new chat</span>
                  <span className="hidden lg:inline">Select a conversation from the sidebar or create a new one to begin chatting with our advanced AI assistant</span>
                </p>
                
                {/* Feature highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div 
                    className="backdrop-blur-sm rounded-2xl p-4 border shadow-sm transition-all duration-300"
                    style={{
                      backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                      borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)'
                    }}
                  >
                    <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h4 
                      className="font-semibold mb-1"
                      style={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}
                    >Smart AI</h4>
                    <p 
                      className="text-xs"
                      style={{ color: isDarkMode ? '#d1d5db' : '#4b5563' }}
                    >Powered by GPT-3.5 Turbo for intelligent responses</p>
                  </div>
                  <div 
                    className="backdrop-blur-sm rounded-2xl p-4 border shadow-sm transition-all duration-300"
                    style={{
                      backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                      borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)'
                    }}
                  >
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <h4 
                      className="font-semibold mb-1"
                      style={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}
                    >Real-time</h4>
                    <p 
                      className="text-xs"
                      style={{ color: isDarkMode ? '#d1d5db' : '#4b5563' }}
                    >Instant responses and live conversation</p>
                  </div>
                  <div 
                    className="backdrop-blur-sm rounded-2xl p-4 border shadow-sm transition-all duration-300"
                    style={{
                      backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                      borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)'
                    }}
                  >
                    <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <h4 
                      className="font-semibold mb-1"
                      style={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}
                    >Secure</h4>
                    <p 
                      className="text-xs"
                      style={{ color: isDarkMode ? '#d1d5db' : '#4b5563' }}
                    >Your conversations are private and protected</p>
                  </div>
                </div>

                <div 
                  className="flex items-center justify-center space-x-4 text-sm"
                  style={{ color: isDarkMode ? '#9ca3af' : '#9ca3af' }}
                >
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>AI Online</span>
                  </div>
                  <div 
                    className="h-1 w-1 rounded-full"
                    style={{ backgroundColor: isDarkMode ? '#6b7280' : '#d1d5db' }}
                  ></div>
                  <span>Ready to chat</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Dropdown - Positioned at the VERY FRONT */}
      {showUserMenu && (
        <>
          {/* Full screen backdrop */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 2147483647,
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              cursor: 'pointer'
            }}
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('Backdrop clicked - closing menu')
              setShowUserMenu(false)
            }}
          />
          
          {/* Account Menu Dropdown */}
          <div 
            style={{
              position: 'fixed',
              top: '80px',
              right: '16px',
              width: '280px',
              backgroundColor: '#ffffff',
              border: '3px solid #3b82f6',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
              zIndex: 2147483647,
              display: 'block'
            }}
            onMouseDown={(e) => {
              e.stopPropagation()
            }}
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            {/* Header */}
            <div style={{
              backgroundColor: '#3b82f6',
              padding: '16px',
              borderRadius: '13px 13px 0 0',
              borderBottom: '2px solid #2563eb'
            }}>
              <span style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'white'
              }}>Account Menu</span>
            </div>
            
            {/* Menu Items */}
            <div style={{ padding: '16px' }}>
                                    {/* Settings */}
                      <button 
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log('Settings button clicked!')
                          openSettings()
                        }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                  backgroundColor: '#f3f4f6',
                  border: '2px solid #d1d5db',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e5e7eb'
                  e.target.style.transform = 'scale(1.02)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6'
                  e.target.style.transform = 'scale(1)'
                }}
              >
                <Settings style={{ width: '20px', height: '20px', marginRight: '12px', color: '#6b7280' }} />
                Settings
              </button>
              
              {/* Dark Mode */}
              <button 
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Dark mode button clicked!')
                  setShowUserMenu(false)
                  setTimeout(() => {
                    toggleDarkMode()
                  }, 100)
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                  backgroundColor: isDarkMode ? '#dbeafe' : '#f3f4f6',
                  border: isDarkMode ? '2px solid #3b82f6' : '2px solid #d1d5db',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = isDarkMode ? '#bfdbfe' : '#dbeafe'
                  e.target.style.transform = 'scale(1.02)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = isDarkMode ? '#dbeafe' : '#f3f4f6'
                  e.target.style.transform = 'scale(1)'
                }}
              >
                {isDarkMode ? (
                  <>
                    <Sun style={{ width: '20px', height: '20px', marginRight: '12px', color: '#f59e0b' }} />
                    Switch to Light Mode
                  </>
                ) : (
                  <>
                    <Moon style={{ width: '20px', height: '20px', marginRight: '12px', color: '#3b82f6' }} />
                    Switch to Dark Mode
                  </>
                )}
              </button>
              
              {/* Divider */}
              <hr style={{ margin: '16px 0', border: '1px solid #d1d5db' }} />
              
              {/* Sign Out */}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Sign out button clicked!')
                  setShowUserMenu(false)
                  setTimeout(() => {
                    if (window.confirm('Are you sure you want to sign out?')) {
                      handleSignOut()
                    }
                  }, 100)
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'white',
                  backgroundColor: '#ef4444',
                  border: '2px solid #dc2626',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#dc2626'
                  e.target.style.transform = 'scale(1.02)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ef4444'
                  e.target.style.transform = 'scale(1)'
                }}
              >
                <LogOut style={{ width: '20px', height: '20px', marginRight: '12px' }} />
                Sign Out
              </button>
            </div>
          </div>
                 </>
       )}

       {/* Settings Panel - Positioned at the VERY FRONT */}
       {showSettings && (
         <>
           {/* Full screen backdrop */}
           <div 
             style={{
               position: 'fixed',
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               zIndex: 2147483647,
               backgroundColor: 'rgba(0, 0, 0, 0.3)',
               cursor: 'pointer'
             }}
             onMouseDown={(e) => {
               e.preventDefault()
               e.stopPropagation()
               console.log('Settings backdrop clicked - closing settings')
               setShowSettings(false)
             }}
           />
           
           {/* Settings Panel */}
           <div 
             style={{
               position: 'fixed',
               top: '50%',
               left: '50%',
               transform: 'translate(-50%, -50%)',
               width: '90vw',
               maxWidth: '600px',
               maxHeight: '80vh',
               backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
               border: '3px solid #3b82f6',
               borderRadius: '20px',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
               zIndex: 2147483647,
               display: 'block',
               overflow: 'hidden'
             }}
             onMouseDown={(e) => {
               e.stopPropagation()
             }}
             onClick={(e) => {
               e.stopPropagation()
             }}
           >
             {/* Header */}
             <div style={{
               backgroundColor: '#3b82f6',
               padding: '20px',
               borderRadius: '17px 17px 0 0',
               borderBottom: '2px solid #2563eb'
             }}>
               <div style={{
                 display: 'flex',
                 justifyContent: 'space-between',
                 alignItems: 'center'
               }}>
                 <span style={{
                   fontSize: '20px',
                   fontWeight: 'bold',
                   color: 'white'
                 }}>⚙️ Settings</span>
                 <button
                   onClick={() => setShowSettings(false)}
                   style={{
                     background: 'none',
                     border: 'none',
                     color: 'white',
                     fontSize: '24px',
                     cursor: 'pointer',
                     padding: '4px',
                     borderRadius: '8px',
                     transition: 'background-color 0.2s'
                   }}
                   onMouseEnter={(e) => {
                     e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                   }}
                   onMouseLeave={(e) => {
                     e.target.style.backgroundColor = 'transparent'
                   }}
                 >
                   ✕
                 </button>
               </div>
             </div>
             
             {/* Settings Content */}
             <div style={{ 
               padding: '24px',
               maxHeight: 'calc(80vh - 100px)',
               overflowY: 'auto'
             }}>
               <div style={{ display: 'grid', gap: '24px' }}>
                 
                 {/* Chat Behavior Section */}
                 <div>
                   <h3 style={{
                     fontSize: '18px',
                     fontWeight: '600',
                     marginBottom: '16px',
                     color: isDarkMode ? '#f3f4f6' : '#111827'
                   }}>Chat Behavior</h3>
                   <div style={{ display: 'grid', gap: '16px' }}>
                     
                     {/* Auto-scroll */}
                     <div style={{
                       display: 'flex',
                       justifyContent: 'space-between',
                       alignItems: 'center',
                       padding: '16px',
                       backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                       borderRadius: '12px',
                       border: '1px solid',
                       borderColor: isDarkMode ? '#6b7280' : '#e5e7eb'
                     }}>
                       <div>
                         <div style={{
                           fontWeight: '600',
                           marginBottom: '4px',
                           color: isDarkMode ? '#f3f4f6' : '#111827'
                         }}>Auto-scroll to new messages</div>
                         <div style={{
                           fontSize: '14px',
                           color: isDarkMode ? '#9ca3af' : '#6b7280'
                         }}>Automatically scroll to new messages when they arrive</div>
                       </div>
                       <label style={{
                         position: 'relative',
                         display: 'inline-block',
                         width: '48px',
                         height: '24px'
                       }}>
                         <input
                           type="checkbox"
                           checked={settings.autoScroll}
                           onChange={(e) => updateSetting('autoScroll', e.target.checked)}
                           style={{ display: 'none' }}
                         />
                         <span style={{
                           position: 'absolute',
                           cursor: 'pointer',
                           top: 0,
                           left: 0,
                           right: 0,
                           bottom: 0,
                           backgroundColor: settings.autoScroll ? '#3b82f6' : '#d1d5db',
                           borderRadius: '24px',
                           transition: 'background-color 0.3s'
                         }}>
                           <span style={{
                             position: 'absolute',
                             content: '""',
                             height: '18px',
                             width: '18px',
                             left: '3px',
                             bottom: '3px',
                             backgroundColor: 'white',
                             borderRadius: '50%',
                             transition: 'transform 0.3s',
                             transform: settings.autoScroll ? 'translateX(24px)' : 'translateX(0)'
                           }} />
                         </span>
                       </label>
                     </div>

                     {/* Typing Indicator */}
                     <div style={{
                       display: 'flex',
                       justifyContent: 'space-between',
                       alignItems: 'center',
                       padding: '16px',
                       backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                       borderRadius: '12px',
                       border: '1px solid',
                       borderColor: isDarkMode ? '#6b7280' : '#e5e7eb'
                     }}>
                       <div>
                         <div style={{
                           fontWeight: '600',
                           marginBottom: '4px',
                           color: isDarkMode ? '#f3f4f6' : '#111827'
                         }}>Show typing indicator</div>
                         <div style={{
                           fontSize: '14px',
                           color: isDarkMode ? '#9ca3af' : '#6b7280'
                         }}>Display "AI is thinking..." when processing responses</div>
                       </div>
                       <label style={{
                         position: 'relative',
                         display: 'inline-block',
                         width: '48px',
                         height: '24px'
                       }}>
                         <input
                           type="checkbox"
                           checked={settings.typingIndicator}
                           onChange={(e) => updateSetting('typingIndicator', e.target.checked)}
                           style={{ display: 'none' }}
                         />
                         <span style={{
                           position: 'absolute',
                           cursor: 'pointer',
                           top: 0,
                           left: 0,
                           right: 0,
                           bottom: 0,
                           backgroundColor: settings.typingIndicator ? '#3b82f6' : '#d1d5db',
                           borderRadius: '24px',
                           transition: 'background-color 0.3s'
                         }}>
                           <span style={{
                             position: 'absolute',
                             content: '""',
                             height: '18px',
                             width: '18px',
                             left: '3px',
                             bottom: '3px',
                             backgroundColor: 'white',
                             borderRadius: '50%',
                             transition: 'transform 0.3s',
                             transform: settings.typingIndicator ? 'translateX(24px)' : 'translateX(0)'
                           }} />
                         </span>
                       </label>
                     </div>

                     {/* Compact Mode */}
                     <div style={{
                       display: 'flex',
                       justifyContent: 'space-between',
                       alignItems: 'center',
                       padding: '16px',
                       backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                       borderRadius: '12px',
                       border: '1px solid',
                       borderColor: isDarkMode ? '#6b7280' : '#e5e7eb'
                     }}>
                       <div>
                         <div style={{
                           fontWeight: '600',
                           marginBottom: '4px',
                           color: isDarkMode ? '#f3f4f6' : '#111827'
                         }}>Compact mode</div>
                         <div style={{
                           fontSize: '14px',
                           color: isDarkMode ? '#9ca3af' : '#6b7280'
                         }}>Reduce spacing between messages for more content</div>
                       </div>
                       <label style={{
                         position: 'relative',
                         display: 'inline-block',
                         width: '48px',
                         height: '24px'
                       }}>
                         <input
                           type="checkbox"
                           checked={settings.compactMode}
                           onChange={(e) => updateSetting('compactMode', e.target.checked)}
                           style={{ display: 'none' }}
                         />
                         <span style={{
                           position: 'absolute',
                           cursor: 'pointer',
                           top: 0,
                           left: 0,
                           right: 0,
                           bottom: 0,
                           backgroundColor: settings.compactMode ? '#3b82f6' : '#d1d5db',
                           borderRadius: '24px',
                           transition: 'background-color 0.3s'
                         }}>
                           <span style={{
                             position: 'absolute',
                             content: '""',
                             height: '18px',
                             width: '18px',
                             left: '3px',
                             bottom: '3px',
                             backgroundColor: 'white',
                             borderRadius: '50%',
                             transition: 'transform 0.3s',
                             transform: settings.compactMode ? 'translateX(24px)' : 'translateX(0)'
                           }} />
                         </span>
                       </label>
                     </div>
                   </div>
                 </div>

                 {/* Appearance Section */}
                 <div>
                   <h3 style={{
                     fontSize: '18px',
                     fontWeight: '600',
                     marginBottom: '16px',
                     color: isDarkMode ? '#f3f4f6' : '#111827'
                   }}>Appearance</h3>
                   <div style={{ display: 'grid', gap: '16px' }}>
                     
                     {/* Font Size */}
                     <div style={{
                       padding: '16px',
                       backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                       borderRadius: '12px',
                       border: '1px solid',
                       borderColor: isDarkMode ? '#6b7280' : '#e5e7eb'
                     }}>
                       <div style={{
                         fontWeight: '600',
                         marginBottom: '8px',
                         color: isDarkMode ? '#f3f4f6' : '#111827'
                       }}>Font Size</div>
                       <div style={{
                         display: 'flex',
                         gap: '8px',
                         flexWrap: 'wrap'
                       }}>
                         {['small', 'medium', 'large'].map((size) => (
                           <button
                             key={size}
                             onClick={() => updateSetting('fontSize', size)}
                             style={{
                               padding: '8px 16px',
                               borderRadius: '8px',
                               border: '1px solid',
                               borderColor: settings.fontSize === size ? '#3b82f6' : (isDarkMode ? '#6b7280' : '#d1d5db'),
                               backgroundColor: settings.fontSize === size ? '#dbeafe' : 'transparent',
                               color: settings.fontSize === size ? '#1d4ed8' : (isDarkMode ? '#f3f4f6' : '#111827'),
                               cursor: 'pointer',
                               fontSize: size === 'small' ? '12px' : size === 'medium' ? '14px' : '16px',
                               fontWeight: '500',
                               transition: 'all 0.2s'
                             }}
                             onMouseEnter={(e) => {
                               if (settings.fontSize !== size) {
                                 e.target.style.backgroundColor = isDarkMode ? '#4b5563' : '#f3f4f6'
                               }
                             }}
                             onMouseLeave={(e) => {
                               if (settings.fontSize !== size) {
                                 e.target.style.backgroundColor = 'transparent'
                               }
                             }}
                           >
                             {size.charAt(0).toUpperCase() + size.slice(1)}
                           </button>
                         ))}
                       </div>
                     </div>

                     {/* Language */}
                     <div style={{
                       padding: '16px',
                       backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                       borderRadius: '12px',
                       border: '1px solid',
                       borderColor: isDarkMode ? '#6b7280' : '#e5e7eb'
                     }}>
                       <div style={{
                         fontWeight: '600',
                         marginBottom: '8px',
                         color: isDarkMode ? '#f3f4f6' : '#111827'
                       }}>Language</div>
                       <select
                         value={settings.language}
                         onChange={(e) => updateSetting('language', e.target.value)}
                         style={{
                           padding: '8px 12px',
                           borderRadius: '8px',
                           border: '1px solid',
                           borderColor: isDarkMode ? '#6b7280' : '#d1d5db',
                           backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                           color: isDarkMode ? '#f3f4f6' : '#111827',
                           fontSize: '14px',
                           cursor: 'pointer'
                         }}
                       >
                         <option value="en">English</option>
                         <option value="es">Español</option>
                         <option value="fr">Français</option>
                         <option value="de">Deutsch</option>
                         <option value="it">Italiano</option>
                         <option value="pt">Português</option>
                         <option value="ru">Русский</option>
                         <option value="ja">日本語</option>
                         <option value="ko">한국어</option>
                         <option value="zh">中文</option>
                       </select>
                     </div>
                   </div>
                 </div>

                 {/* Notifications Section */}
                 <div>
                   <h3 style={{
                     fontSize: '18px',
                     fontWeight: '600',
                     marginBottom: '16px',
                     color: isDarkMode ? '#f3f4f6' : '#111827'
                   }}>Notifications</h3>
                   <div style={{ display: 'grid', gap: '16px' }}>
                     
                     {/* Message Sound */}
                     <div style={{
                       display: 'flex',
                       justifyContent: 'space-between',
                       alignItems: 'center',
                       padding: '16px',
                       backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                       borderRadius: '12px',
                       border: '1px solid',
                       borderColor: isDarkMode ? '#6b7280' : '#e5e7eb'
                     }}>
                       <div>
                         <div style={{
                           fontWeight: '600',
                           marginBottom: '4px',
                           color: isDarkMode ? '#f3f4f6' : '#111827'
                         }}>Message sound</div>
                         <div style={{
                           fontSize: '14px',
                           color: isDarkMode ? '#9ca3af' : '#6b7280'
                         }}>Play sound when new messages arrive</div>
                       </div>
                       <label style={{
                         position: 'relative',
                         display: 'inline-block',
                         width: '48px',
                         height: '24px'
                       }}>
                         <input
                           type="checkbox"
                           checked={settings.messageSound}
                           onChange={(e) => updateSetting('messageSound', e.target.checked)}
                           style={{ display: 'none' }}
                         />
                         <span style={{
                           position: 'absolute',
                           cursor: 'pointer',
                           top: 0,
                           left: 0,
                           right: 0,
                           bottom: 0,
                           backgroundColor: settings.messageSound ? '#3b82f6' : '#d1d5db',
                           borderRadius: '24px',
                           transition: 'background-color 0.3s'
                         }}>
                           <span style={{
                             position: 'absolute',
                             content: '""',
                             height: '18px',
                             width: '18px',
                             left: '3px',
                             bottom: '3px',
                             backgroundColor: 'white',
                             borderRadius: '50%',
                             transition: 'transform 0.3s',
                             transform: settings.messageSound ? 'translateX(24px)' : 'translateX(0)'
                           }} />
                         </span>
                       </label>
                     </div>
                   </div>
                 </div>

                 {/* Reset Button */}
                 <div style={{ textAlign: 'center', marginTop: '16px' }}>
                   <button
                     onClick={() => {
                       const defaultSettings = {
                         autoScroll: true,
                         messageSound: true,
                         typingIndicator: true,
                         compactMode: false,
                         fontSize: 'medium',
                         language: 'en'
                       }
                       setSettings(defaultSettings)
                       localStorage.setItem('chatSettings', JSON.stringify(defaultSettings))
                     }}
                     style={{
                       padding: '12px 24px',
                       backgroundColor: '#6b7280',
                       color: 'white',
                       border: 'none',
                       borderRadius: '12px',
                       fontSize: '14px',
                       fontWeight: '600',
                       cursor: 'pointer',
                       transition: 'background-color 0.2s'
                     }}
                     onMouseEnter={(e) => {
                       e.target.style.backgroundColor = '#4b5563'
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.backgroundColor = '#6b7280'
                     }}
                   >
                     Reset to Defaults
                   </button>
                 </div>
               </div>
             </div>
           </div>
         </>
       )}
     </div>
   )
 }
