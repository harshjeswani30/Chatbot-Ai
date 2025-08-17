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
  onSelectChat: (chatId: string) => void
}

export function ChatList({ selectedChatId, onSelectChat }: ChatListProps) {
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
    <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-gray-50/80">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
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
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-400 transition-all duration-200"
          />
        </div>
      </div>

      {/* New Chat Form */}
      {showNewChatForm && (
        <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Give your chat a creative name..."
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-400 transition-all duration-200"
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
                className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
                <p className="text-gray-500 text-sm">Try a different search term</p>
              </>
            ) : chats.length === 0 ? (
              <>
                <div className="relative mb-6">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-6 w-6 bg-green-500 border-2 border-white rounded-full animate-bounce"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your First Chat</h3>
                <p className="text-gray-500 text-sm mb-1">Welcome to your AI assistant!</p>
                <p className="text-gray-400 text-xs">Click the + button to create your first conversation</p>
              </>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChats.map((chat: Chat, index) => (
              <div
                key={chat.id}
                className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                  selectedChatId === chat.id 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-[1.02]' 
                    : 'bg-white hover:bg-gray-50 hover:shadow-md border border-gray-100 hover:border-gray-200'
                }`}
                onClick={() => onSelectChat(chat.id)}
                style={{ animationDelay: `${index * 50}ms` }}
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
                      <h3 className={`text-sm font-semibold truncate mb-1 ${
                        selectedChatId === chat.id ? 'text-white' : 'text-gray-900'
                      }`}>
                        {chat.title}
                      </h3>
                      <div className={`flex items-center space-x-1 text-xs ${
                        selectedChatId === chat.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
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
                    className={`p-2 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                      selectedChatId === chat.id 
                        ? 'text-white hover:bg-white/20' 
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
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
