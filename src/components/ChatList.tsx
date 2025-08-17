import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { gql } from '@apollo/client'
import { Plus, MessageSquare, Trash2, Search, Clock, Sparkles } from 'lucide-react'
import { useUserId } from '@nhost/react'

const GET_CHATS = gql`
  query GetChats($user_id: uuid!) {
    chats(where: { user_id: { _eq: $user_id } }, order_by: { updated_at: desc }) {
      id
      title
      created_at
      updated_at
    }
  }
`

const CREATE_CHAT = gql`
  mutation CreateChat($title: String!, $user_id: uuid!) {
    insert_chats_one(object: { title: $title, user_id: $user_id }) {
      id
      title
      created_at
      updated_at
    }
  }
`

const DELETE_CHAT = gql`
  mutation DeleteChat($id: uuid!) {
    delete_chats_by_pk(id: $id) {
      id
    }
  }
`

interface Chat {
  id: string
  title: string
  created_at: string
  updated_at: string
}

interface ChatListProps {
  selectedChatId: string | null
  isDarkMode?: boolean
  onSelectChat: (chatId: string) => void
}

export function ChatList({ selectedChatId, isDarkMode = false, onSelectChat }: ChatListProps) {
  const [newChatTitle, setNewChatTitle] = useState('')
  const [showNewChatForm, setShowNewChatForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const userId = useUserId()

  const { data, loading, error, refetch } = useQuery(GET_CHATS, {
    variables: { user_id: userId },
    skip: !userId
  })

  const [createChat] = useMutation(CREATE_CHAT, {
    onCompleted: () => {
      setNewChatTitle('')
      setShowNewChatForm(false)
      refetch()
    }
  })

  const [deleteChat] = useMutation(DELETE_CHAT, {
    onCompleted: () => {
      refetch()
    }
  })

  const handleCreateChat = async () => {
    if (!newChatTitle.trim() || !userId) return
    
    try {
      await createChat({
        variables: {
          title: newChatTitle.trim(),
          user_id: userId
        }
      })
    } catch (err) {
      console.error('Error creating chat:', err)
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat({
        variables: { id: chatId }
      })
    } catch (err) {
      console.error('Error deleting chat:', err)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays < 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading chats...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-red-500">Error loading chats</div>
      </div>
    )
  }

  const chats = data?.chats || []
  const filteredChats = chats.filter((chat: Chat) => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div 
      className="flex-1 flex flex-col transition-all duration-300"
      style={{
        background: isDarkMode 
          ? 'linear-gradient(to bottom, #1f2937, rgba(17, 24, 39, 0.8))' 
          : 'linear-gradient(to bottom, #ffffff, rgba(249, 250, 251, 0.8))'
      }}
    >
      {/* Header */}
      <div 
        className="p-6 border-b transition-all duration-300"
        style={{
          borderBottomColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h2 
              className="text-xl font-bold bg-clip-text text-transparent"
              style={{
                backgroundImage: isDarkMode 
                  ? 'linear-gradient(to right, #f3f4f6, #d1d5db)' 
                  : 'linear-gradient(to right, #111827, #374151)'
              }}
            >
              Conversations
            </h2>
          </div>
          <button
            onClick={() => setShowNewChatForm(true)}
            className="group inline-flex items-center p-2.5 border border-transparent rounded-xl shadow-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
          >
            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
            style={{
              backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
              borderColor: isDarkMode ? '#6b7280' : '#e5e7eb',
              color: isDarkMode ? '#f3f4f6' : '#111827'
            }}
          />
        </div>
      </div>

      {/* New Chat Form */}
      {showNewChatForm && (
        <div 
          className="p-6 border-b transition-all duration-300"
          style={{
            borderBottomColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)',
            background: isDarkMode 
              ? 'linear-gradient(to right, rgba(31, 41, 55, 0.8), rgba(55, 65, 81, 0.8))' 
              : 'linear-gradient(to right, rgba(219, 234, 254, 1), rgba(199, 210, 254, 1))'
          }}
        >
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Give your chat a creative name..."
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
                style={{
                  backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                  borderColor: isDarkMode ? '#6b7280' : '#e5e7eb',
                  color: isDarkMode ? '#f3f4f6' : '#111827'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateChat()}
                autoFocus
              />
              {newChatTitle.trim() && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCreateChat}
                disabled={!newChatTitle.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02] disabled:transform-none"
              >
                Create Chat
              </button>
              <button
                onClick={() => {
                  setShowNewChatForm(false)
                  setNewChatTitle('')
                }}
                className="px-4 py-2.5 border text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
                style={{
                  backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                  borderColor: isDarkMode ? '#6b7280' : '#e5e7eb',
                  color: isDarkMode ? '#f3f4f6' : '#374151'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = isDarkMode ? '#4b5563' : '#f9fafb'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = isDarkMode ? '#374151' : '#ffffff'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center">
            {searchQuery ? (
              <>
                <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 
                  className="text-lg font-medium mb-2"
                  style={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}
                >No matches found</h3>
                <p 
                  className="text-sm"
                  style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                >Try a different search term</p>
              </>
            ) : chats.length === 0 ? (
              <>
                <div className="relative mb-6">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-6 w-6 bg-green-500 border-2 border-white rounded-full animate-bounce"></div>
                </div>
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}
                >Start Your First Chat</h3>
                <p 
                  className="text-sm mb-1"
                  style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                >Welcome to your AI assistant!</p>
                <p 
                  className="text-xs"
                  style={{ color: isDarkMode ? '#6b7280' : '#9ca3af' }}
                >Click the + button to create your first conversation</p>
              </>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChats.map((chat: Chat, index) => (
              <div
                key={chat.id}
                className="group relative p-4 rounded-2xl cursor-pointer transition-all duration-200"
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  ...(selectedChatId === chat.id 
                    ? {
                        background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                        color: 'white',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        transform: 'scale(1.02)'
                      }
                    : {
                        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                        borderColor: isDarkMode ? '#6b7280' : '#f3f4f6',
                        border: '1px solid'
                      })
                }}
                onMouseEnter={(e) => {
                  if (selectedChatId !== chat.id) {
                    e.target.style.backgroundColor = isDarkMode ? '#4b5563' : '#f9fafb'
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedChatId !== chat.id) {
                    e.target.style.backgroundColor = isDarkMode ? '#374151' : '#ffffff'
                    e.target.style.boxShadow = 'none'
                  }
                }}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      selectedChatId === chat.id 
                        ? 'bg-white/20 backdrop-blur-sm' 
                        : 'bg-gradient-to-br from-blue-500 to-purple-600'
                    }`}>
                      <MessageSquare className={`h-5 w-5 ${
                        selectedChatId === chat.id ? 'text-white' : 'text-white'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="text-sm font-semibold truncate mb-1"
                        style={{ 
                          color: selectedChatId === chat.id 
                            ? '#ffffff' 
                            : (isDarkMode ? '#f3f4f6' : '#111827')
                        }}
                      >
                        {chat.title}
                      </h3>
                      <div 
                        className="flex items-center space-x-1 text-xs"
                        style={{ 
                          color: selectedChatId === chat.id 
                            ? '#dbeafe' 
                            : (isDarkMode ? '#9ca3af' : '#6b7280')
                        }}
                      >
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(chat.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteChat(chat.id)
                    }}
                    className="p-2 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                    style={{
                      color: selectedChatId === chat.id 
                        ? '#ffffff' 
                        : (isDarkMode ? '#9ca3af' : '#9ca3af'),
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedChatId !== chat.id) {
                        e.target.style.color = '#ef4444'
                        e.target.style.backgroundColor = isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(254, 242, 242, 1)'
                      } else {
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedChatId !== chat.id) {
                        e.target.style.color = isDarkMode ? '#9ca3af' : '#9ca3af'
                        e.target.style.backgroundColor = 'transparent'
                      } else {
                        e.target.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {selectedChatId === chat.id && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 opacity-10 pointer-events-none"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
