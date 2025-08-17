import React, { useState } from 'react'
import { useSignOut } from '@nhost/react'
import { LogOut, Plus, MessageSquare, Sparkles, Settings, User, Moon, Sun, Menu, X } from 'lucide-react'
import { ChatList } from './ChatList'
import { ChatWindow } from './ChatWindow'

export function ChatApp() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { signOut } = useSignOut()

  const handleSignOut = () => {
    signOut()
  }

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showUserMenu && !target.closest('[data-user-menu]')) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside)
    }
    
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showUserMenu])

    return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
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
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  AI Assistant Pro
                </h1>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
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
                  setShowUserMenu(!showUserMenu)
                }}
                className="group flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="hidden sm:inline text-sm font-medium text-gray-700">Account</span>
                <div className={`transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}>
                  <svg className="h-3 w-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200/50 backdrop-blur-sm z-50 animate-fade-in">
                  <div className="p-2">
                    <button 
                      onClick={() => {
                        setShowUserMenu(false)
                        // Add settings functionality here
                        console.log('Settings clicked')
                      }}
                      className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-200"
                    >
                      <Settings className="h-4 w-4 mr-3 text-gray-400" />
                      Settings
                    </button>
                    <button 
                      onClick={() => {
                        setShowUserMenu(false)
                        // Add dark mode toggle functionality here
                        console.log('Dark mode toggle clicked')
                      }}
                      className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-200"
                    >
                      <Moon className="h-4 w-4 mr-3 text-gray-400" />
                      Dark Mode
                    </button>
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        handleSignOut()
                      }}
                      className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
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
              onBack={() => {
                console.log('Going back to chat list')
                setSelectedChatId(null)
                setIsMobileMenuOpen(false)
                setShowUserMenu(false)
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/30 px-4">
              <div className="text-center max-w-lg mx-auto p-4 sm:p-8 animate-fade-in">
                <div className="relative mb-6 sm:mb-8">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl mx-auto animate-pulse-glow">
                    <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-6 w-6 sm:h-8 sm:w-8 bg-green-500 border-4 border-white rounded-full animate-bounce">
                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3 sm:mb-4">
                  Welcome to AI Assistant Pro
                </h3>
                <p className="text-base sm:text-lg text-gray-600 mb-2 sm:mb-3">
                  Your intelligent conversation partner is ready to help
                </p>
                <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">
                  <span className="lg:hidden">Tap the menu button to see your conversations or create a new chat</span>
                  <span className="hidden lg:inline">Select a conversation from the sidebar or create a new one to begin chatting with our advanced AI assistant</span>
                </p>
                
                {/* Feature highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm">
                    <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Smart AI</h4>
                    <p className="text-xs text-gray-600">Powered by GPT-3.5 Turbo for intelligent responses</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm">
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Real-time</h4>
                    <p className="text-xs text-gray-600">Instant responses and live conversation</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm">
                    <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Secure</h4>
                    <p className="text-xs text-gray-600">Your conversations are private and protected</p>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>AI Online</span>
                  </div>
                  <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
                  <span>Ready to chat</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
