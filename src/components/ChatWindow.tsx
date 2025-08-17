import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useSubscription } from '@apollo/client'
import { gql } from '@apollo/client'
import { ArrowLeft, Send, Bot, User, Copy, ThumbsUp, ThumbsDown, MoreVertical, Sparkles } from 'lucide-react'
import { useUserId } from '@nhost/react'

const GET_MESSAGES = gql`
  query GetMessages($chat_id: uuid!) {
    messages(where: { chat_id: { _eq: $chat_id } }, order_by: { created_at: asc }) {
      id
      content
      is_bot
      user_id
      created_at
    }
  }
`

const GET_CHAT_INFO = gql`
  query GetChatInfo($chat_id: uuid!) {
    chats_by_pk(id: $chat_id) {
      id
      title
    }
  }
`

const INSERT_MESSAGE = gql`
  mutation InsertMessage($chat_id: uuid!, $content: String!, $user_id: uuid!) {
    insert_messages_one(object: { chat_id: $chat_id, content: $content, user_id: $user_id, is_bot: false }) {
      id
      content
      created_at
    }
  }
`

const SEND_MESSAGE_ACTION = gql`
  mutation SendMessageAction($chat_id: uuid!, $content: String!, $user_id: uuid!) {
    sendMessage(input: { chat_id: $chat_id, content: $content, user_id: $user_id }) {
      success
      message
      bot_response
    }
  }
`

const MESSAGE_SUBSCRIPTION = gql`
  subscription OnMessageAdded($chat_id: uuid!) {
    messages(where: { chat_id: { _eq: $chat_id } }, order_by: { created_at: desc }, limit: 1) {
      id
      content
      is_bot
      user_id
      created_at
    }
  }
`

interface Message {
  id: string
  content: string
  is_bot: boolean
  user_id: string
  created_at: string
}

interface ChatInfo {
  id: string
  title: string
}

interface ChatWindowProps {
  chatId: string
  isDarkMode?: boolean
  onBack: () => void
  settings?: {
    autoScroll: boolean
    messageSound: boolean
    typingIndicator: boolean
    compactMode: boolean
    fontSize: string
    language: string
  }
}

export function ChatWindow({ chatId, isDarkMode = false, onBack, settings }: ChatWindowProps) {
  // Default settings if none provided
  const defaultSettings = {
    autoScroll: true,
    messageSound: true,
    typingIndicator: true,
    compactMode: false,
    fontSize: 'medium',
    language: 'en'
  }
  
  const currentSettings = settings || defaultSettings
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set())
  const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set())
  const [showCopyToast, setShowCopyToast] = useState(false)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const userId = useUserId()

  const { data: chatData } = useQuery(GET_CHAT_INFO, {
    variables: { chat_id: chatId }
  })

  const { data: messagesData, loading, refetch } = useQuery(GET_MESSAGES, {
    variables: { chat_id: chatId }
  })

  const [insertMessage] = useMutation(INSERT_MESSAGE)
  const [sendMessageAction] = useMutation(SEND_MESSAGE_ACTION)

  // Subscribe to new messages
  useSubscription(MESSAGE_SUBSCRIPTION, {
    variables: { chat_id: chatId },
    onData: ({ data }) => {
      if (data?.data?.messages?.[0]) {
        refetch()
      }
    }
  })

  // Smart scroll function - only scroll if user is at bottom or just sent message
  const scrollToBottom = (force = false) => {
    if (!messagesContainerRef.current || !messagesEndRef.current) return
    
    const container = messagesContainerRef.current
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
    
    if (force || (isAtBottom && currentSettings.autoScroll) || (!isUserScrolling && currentSettings.autoScroll)) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Detect if user is manually scrolling
  const handleScroll = () => {
    if (!messagesContainerRef.current) return
    
    const container = messagesContainerRef.current
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
    
    setIsUserScrolling(!isAtBottom)
  }

  // Reset states when entering a new chat and scroll to bottom
  useEffect(() => {
    // Clear input and reset states for new chat
    setMessage('')
    setIsSending(false)
    setLikedMessages(new Set())
    setDislikedMessages(new Set())
    setShowCopyToast(false)
    setIsUserScrolling(false)
    
    // Scroll to bottom for new chat
    setTimeout(() => scrollToBottom(true), 100)
  }, [chatId])

  // Auto-scroll only if user is at bottom
  useEffect(() => {
    if (messagesData?.messages?.length > 0) {
      setTimeout(() => scrollToBottom(), 100)
      
      // Play notification sound for new bot messages
      const lastMessage = messagesData.messages[messagesData.messages.length - 1]
      if (lastMessage && lastMessage.is_bot && currentSettings.messageSound) {
        playNotificationSound()
      }
    }
  }, [messagesData, isUserScrolling, currentSettings.messageSound])

  const handleSendMessage = async () => {
    if (!message.trim() || !userId) return

    setIsSending(true)
    const userMessage = message.trim()
    setMessage('')
    
    // Force scroll to bottom when user sends message
    setIsUserScrolling(false)
    setTimeout(() => scrollToBottom(true), 100)

    try {
      // First, save the user message
      await insertMessage({
        variables: {
          chat_id: chatId,
          content: userMessage,
          user_id: userId
        }
      })

      // Scroll after user message appears
      setTimeout(() => scrollToBottom(true), 300)

      // Then trigger the chatbot action
      await sendMessageAction({
        variables: {
          chat_id: chatId,
          content: userMessage,
          user_id: userId
        }
      })

      // Refresh messages to ensure bot response shows
      setTimeout(() => {
        refetch()
        scrollToBottom(true)
      }, 1000)

      setTimeout(() => {
        refetch()
        scrollToBottom(true)
      }, 3000)

    } catch (err) {
      console.error('Error sending message:', err)
      alert('Error sending message: ' + err.message)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setShowCopyToast(true)
      setTimeout(() => setShowCopyToast(false), 2000)
    } catch (err) {
      console.error('Failed to copy message:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = content
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setShowCopyToast(true)
      setTimeout(() => setShowCopyToast(false), 2000)
    }
  }

  const handleLikeMessage = (messageId: string) => {
    setLikedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
        // Remove from disliked if it was disliked
        setDislikedMessages(prevDisliked => {
          const newDisliked = new Set(prevDisliked)
          newDisliked.delete(messageId)
          return newDisliked
        })
      }
      return newSet
    })
  }

  const handleDislikeMessage = (messageId: string) => {
    setDislikedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
        // Remove from liked if it was liked
        setLikedMessages(prevLiked => {
          const newLiked = new Set(prevLiked)
          newLiked.delete(messageId)
          return newLiked
        })
      }
      return newSet
    })
  }

  // Play notification sound if enabled
  const playNotificationSound = () => {
    if (currentSettings.messageSound) {
      try {
        // Create a simple notification sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
      } catch (error) {
        console.log('Could not play notification sound:', error)
      }
    }
  }

  // Language translations
  const translations = {
    en: {
      placeholder: "Ask me anything...",
      thinking: "AI is thinking...",
      online: "Online • Ready to help",
      delivered: "Delivered",
      copyMessage: "Copy message",
      goodResponse: "Good response",
      poorResponse: "Poor response",
      messageCopied: "Message copied!",
      ready: "Ready",
      aiOnline: "AI Online",
      readyToChat: "Ready to chat",
      loading: "Loading messages...",
      backToChatList: "Go back to chat list"
    },
    es: {
      placeholder: "Pregúntame lo que quieras...",
      thinking: "IA está pensando...",
      online: "En línea • Listo para ayudar",
      delivered: "Entregado",
      copyMessage: "Copiar mensaje",
      goodResponse: "Buena respuesta",
      poorResponse: "Mala respuesta",
      messageCopied: "¡Mensaje copiado!",
      ready: "Listo",
      aiOnline: "IA en línea",
      readyToChat: "Listo para chatear",
      loading: "Cargando mensajes...",
      backToChatList: "Volver a la lista de chats"
    },
    fr: {
      placeholder: "Demandez-moi n'importe quoi...",
      thinking: "L'IA réfléchit...",
      online: "En ligne • Prêt à aider",
      delivered: "Livré",
      copyMessage: "Copier le message",
      goodResponse: "Bonne réponse",
      poorResponse: "Mauvaise réponse",
      messageCopied: "Message copié !",
      ready: "Prêt",
      aiOnline: "IA en ligne",
      readyToChat: "Prêt à discuter",
      loading: "Chargement des messages...",
      backToChatList: "Retourner à la liste des chats"
    }
  }

  const t = translations[currentSettings.language as keyof typeof translations] || translations.en

  const messages = messagesData?.messages || []
  const chatInfo = chatData?.chats_by_pk

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">{t.loading}</div>
      </div>
    )
  }

  return (
    <div 
      className="flex-1 flex flex-col relative h-full transition-all duration-300"
      style={{
        background: isDarkMode 
          ? 'linear-gradient(to bottom right, #1f2937, #111827, #0f172a)' 
          : 'linear-gradient(to bottom right, #f9fafb, #ffffff, #dbeafe)'
      }}
    >
      {/* Chat Header */}
      <div 
        className="backdrop-blur-sm border-b px-4 sm:px-6 py-4 shadow-sm transition-all duration-300"
        style={{
          backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          borderBottomColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => {
                console.log('Back button clicked')
                // Clear any pending states
                setMessage('')
                setIsSending(false)
                setLikedMessages(new Set())
                setDislikedMessages(new Set())
                setShowCopyToast(false)
                // Call the back function
                onBack()
              }}
              className="flex items-center justify-center p-2 rounded-xl transition-all duration-200 group min-w-[40px] h-10"
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
              aria-label={t.backToChatList}
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
              </div>
                                    <div className="min-w-0">
                        <h2 
                          className="text-base sm:text-lg font-semibold truncate"
                          style={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}
                        >
                          {chatInfo?.title || 'AI Chat'}
                        </h2>
                        <p className="text-xs sm:text-sm text-green-600 font-medium">{t.online}</p>
                      </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 font-medium">Active</span>
          </div>
        </div>
      </div>

      {/* Messages Container - Scrollable History */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center p-4 sm:p-6">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mx-auto">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-8 h-4 w-4 bg-green-500 border-2 border-white rounded-full animate-bounce"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to AI Chat!</h3>
              <p className="text-gray-500 mb-1">I'm your AI assistant, ready to help you.</p>
              <p className="text-sm text-gray-400">Start the conversation by typing a message below.</p>
            </div>
          </div>
        ) : (
          <div className="min-h-full flex flex-col justify-end">
            <div 
              className="p-4 sm:p-6"
              style={{
                padding: currentSettings.compactMode ? '16px' : '24px',
                paddingTop: currentSettings.compactMode ? '16px' : '24px',
                paddingBottom: currentSettings.compactMode ? '16px' : '24px',
                paddingLeft: currentSettings.compactMode ? '16px' : '24px',
                paddingRight: currentSettings.compactMode ? '16px' : '24px'
              }}
            >
            <div 
              style={{
                display: 'grid',
                gap: currentSettings.compactMode ? '12px' : '24px'
              }}
            >
            {messages.map((msg: Message, index) => (
              <div
                key={msg.id}
                className={`flex ${msg.is_bot ? 'justify-start' : 'justify-end'} group animate-fade-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`relative max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg ${
                    msg.is_bot ? 'mr-8 sm:mr-12' : 'ml-8 sm:ml-12'
                  }`}
                >
                  <div
                    className="px-5 py-4 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg"
                    style={{
                      backgroundColor: msg.is_bot 
                        ? (isDarkMode ? '#374151' : '#ffffff')
                        : '',
                      background: !msg.is_bot 
                        ? 'linear-gradient(to bottom right, #3b82f6, #2563eb)'
                        : '',
                      borderColor: msg.is_bot 
                        ? (isDarkMode ? '#6b7280' : 'rgba(229, 231, 235, 0.6)')
                        : 'transparent',
                      border: msg.is_bot ? '1px solid' : 'none',
                      color: msg.is_bot 
                        ? (isDarkMode ? '#f3f4f6' : '#111827')
                        : '#ffffff'
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      {msg.is_bot && (
                        <div className="relative h-7 w-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                          <Sparkles className="h-3.5 w-3.5 text-white" />
                          <div className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p 
                          className="leading-relaxed whitespace-pre-wrap break-words"
                          style={{
                            fontSize: currentSettings.fontSize === 'small' ? '12px' : 
                                     currentSettings.fontSize === 'medium' ? '14px' : '16px'
                          }}
                        >{msg.content}</p>
                        
                        {/* Message Actions */}
                        <div className={`flex items-center justify-between mt-3 ${
                          msg.is_bot ? 'text-gray-400' : 'text-blue-100'
                        }`}>
                          <span className="text-xs font-medium">
                            {formatTime(msg.created_at)}
                          </span>
                          
                          {/* Bot message actions */}
                          {msg.is_bot && (
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button 
                                onClick={() => handleCopyMessage(msg.content)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200" 
                                title={t.copyMessage}
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => handleLikeMessage(msg.id)}
                                className={`p-1.5 rounded-lg transition-colors duration-200 ${
                                  likedMessages.has(msg.id) 
                                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                    : 'hover:bg-gray-100'
                                }`}
                                title={t.goodResponse}
                              >
                                <ThumbsUp className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDislikeMessage(msg.id)}
                                className={`p-1.5 rounded-lg transition-colors duration-200 ${
                                  dislikedMessages.has(msg.id) 
                                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                    : 'hover:bg-gray-100'
                                }`}
                                title={t.poorResponse}
                              >
                                <ThumbsDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                          
                          {/* User message status */}
                          {!msg.is_bot && (
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <div className="h-1 w-1 bg-blue-200 rounded-full"></div>
                                <div className="h-1 w-1 bg-blue-300 rounded-full"></div>
                              </div>
                              <span className="text-xs">{t.delivered}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {!msg.is_bot && (
                        <div className="h-7 w-7 bg-gradient-to-br from-blue-700 to-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                          <User className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                                            {/* Message tail/pointer */}
                          <div className={`absolute top-4 ${
                            msg.is_bot ? '-left-2' : '-right-2'
                          }`}>
                            <div 
                              className="w-0 h-0"
                              style={{
                                borderTop: '4px solid transparent',
                                borderBottom: '4px solid transparent',
                                ...(msg.is_bot 
                                  ? {
                                      borderRight: `8px solid ${isDarkMode ? '#374151' : '#ffffff'}`
                                    }
                                  : {
                                      borderLeft: '8px solid #3b82f6'
                                    })
                              }}
                            ></div>
                          </div>
                </div>
              </div>
            ))}
            {isSending && currentSettings.typingIndicator && (
              <div className="flex justify-start animate-fade-in">
                <div className="relative max-w-xs lg:max-w-md mr-12">
                  <div 
                    className="px-5 py-4 rounded-2xl shadow-sm border"
                    style={{
                      backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                      borderColor: isDarkMode ? '#6b7280' : 'rgba(229, 231, 235, 0.6)'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative h-7 w-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                        <Sparkles className="h-3.5 w-3.5 text-white animate-pulse" />
                        <div className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-orange-500 border-2 border-white rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span 
                        className="text-xs font-medium"
                        style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}
                      >{t.thinking}</span>
                    </div>
                  </div>
                  {/* Message tail */}
                  <div className="absolute top-4 -left-2">
                    <div 
                      className="w-0 h-0"
                      style={{
                        borderTop: '4px solid transparent',
                        borderBottom: '4px solid transparent',
                        borderRight: `8px solid ${isDarkMode ? '#374151' : '#ffffff'}`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            </div>
            </div>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div 
        className="backdrop-blur-lg border-t p-4 sm:p-6 transition-all duration-300"
        style={{
          backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderTopColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)'
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="flex items-end space-x-3 sm:space-x-4">
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t.placeholder}
                  disabled={isSending}
                  rows={1}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 pr-12 sm:pr-16 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-all duration-200 resize-none min-h-[3rem] sm:min-h-[3.5rem] max-h-32 overflow-y-auto text-sm sm:text-base scrollbar-hide"
                  style={{
                    height: 'auto',
                    backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                    borderColor: isDarkMode ? '#6b7280' : '#e5e7eb',
                    color: isDarkMode ? '#f3f4f6' : '#111827',
                    border: '1px solid',
                    '--placeholder-color': isDarkMode ? '#9ca3af' : '#9ca3af'
                  } as React.CSSProperties}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                  }}
                />
                {message.trim() && (
                  <div className="absolute right-3 sm:right-4 bottom-3 sm:bottom-4">
                    <div className="flex items-center space-x-1">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="hidden sm:inline text-xs text-gray-500 font-medium">{t.ready}</span>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isSending}
                className="group relative p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {isSending ? (
                  <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                )}
                {!isSending && message.trim() && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full animate-bounce"></div>
                )}
              </button>
            </div>
          </div>
                            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                    <div 
                      className="flex items-center space-x-3 sm:space-x-4 text-xs"
                      style={{ color: isDarkMode ? '#9ca3af' : '#9ca3af' }}
                    >
              <div className="flex items-center space-x-1">
                <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                <span>{t.aiOnline}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Sparkles className="h-3 w-3" />
                <span className="hidden sm:inline">GPT-3.5 Turbo</span>
                <span className="sm:hidden">GPT-3.5</span>
              </div>
            </div>
            <p 
              className="text-xs text-center sm:text-right"
              style={{ color: isDarkMode ? '#9ca3af' : '#9ca3af' }}
            >
              <span className="hidden sm:inline">Press Enter to send • Shift+Enter for new line</span>
              <span className="sm:hidden">Tap send or press Enter</span>
            </p>
          </div>
        </div>
      </div>

      {/* Copy Toast Notification */}
      {showCopyToast && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 bg-white rounded-full flex items-center justify-center">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </div>
                              <span className="text-sm font-medium">{t.messageCopied}</span>
          </div>
        </div>
      )}
    </div>
  )
}
