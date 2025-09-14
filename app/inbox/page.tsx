'use client'

import { useState } from 'react'
import { useTranslations } from '@/lib/translations'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video,
  MessageCircle,
  Check,
  CheckCheck
} from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'

// Mock data - in real app, this would come from Supabase
const mockConversations = [
  {
    id: 1,
    last_message: {
      body: 'Hi! Is the MacBook still available?',
      sender: {
        first_name: 'John',
        last_name: 'Smith',
        verified_expat: true
      },
      created_at: '2024-01-15T14:30:00Z',
      is_read: false
    },
    participants: [
      {
        id: '1',
        first_name: 'John',
        last_name: 'Smith',
        verified_expat: true,
        avatar_url: null,
        is_online: true
      },
      {
        id: '2',
        first_name: 'Maria',
        last_name: 'Garcia',
        verified_expat: true,
        avatar_url: null,
        is_online: false
      }
    ],
    unread_count: 2,
    is_archived: false
  },
  {
    id: 2,
    last_message: {
      body: 'Yes, the dining table is still available. Would you like to arrange a viewing?',
      sender: {
        first_name: 'David',
        last_name: 'Wilson',
        verified_expat: true
      },
      created_at: '2024-01-14T16:45:00Z',
      is_read: true
    },
    participants: [
      {
        id: '3',
        first_name: 'David',
        last_name: 'Wilson',
        verified_expat: true,
        avatar_url: null,
        is_online: false
      },
      {
        id: '4',
        first_name: 'Sarah',
        last_name: 'Brown',
        verified_expat: false,
        avatar_url: null,
        is_online: true
      }
    ],
    unread_count: 0,
    is_archived: false
  },
  {
    id: 3,
    last_message: {
      body: 'Thank you for the great service!',
      sender: {
        first_name: 'Alex',
        last_name: 'Johnson',
        verified_expat: true
      },
      created_at: '2024-01-13T10:20:00Z',
      is_read: true
    },
    participants: [
      {
        id: '5',
        first_name: 'Alex',
        last_name: 'Johnson',
        verified_expat: true,
        avatar_url: null,
        is_online: false
      },
      {
        id: '6',
        first_name: 'Elena',
        last_name: 'Petrov',
        verified_expat: false,
        avatar_url: null,
        is_online: false
      }
    ],
    unread_count: 0,
    is_archived: true
  }
]

const mockMessages = [
  {
    id: 1,
    sender_id: '1',
    body: 'Hi! Is the MacBook still available?',
    translated_body: 'Привет! MacBook еще доступен?',
    source_lang: 'en',
    target_lang: 'ru',
    created_at: '2024-01-15T14:30:00Z',
    is_read: true,
    sender: {
      first_name: 'John',
      last_name: 'Smith'
    }
  },
  {
    id: 2,
    sender_id: '2',
    body: 'Yes, it is! Are you interested in buying it?',
    translated_body: 'Да, доступен! Вы заинтересованы в покупке?',
    source_lang: 'en',
    target_lang: 'ru',
    created_at: '2024-01-15T14:32:00Z',
    is_read: true,
    sender: {
      first_name: 'Maria',
      last_name: 'Garcia'
    }
  },
  {
    id: 3,
    sender_id: '1',
    body: 'Yes, I would like to see it in person first. When would be convenient?',
    translated_body: 'Да, я хотел бы сначала посмотреть лично. Когда будет удобно?',
    source_lang: 'en',
    target_lang: 'ru',
    created_at: '2024-01-15T14:35:00Z',
    is_read: false,
    sender: {
      first_name: 'John',
      last_name: 'Smith'
    }
  }
]

export default function InboxPage() {
  const t = useTranslations('inbox')
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [newMessage, setNewMessage] = useState('')

  const filteredConversations = mockConversations.filter(conv => 
    !conv.is_archived && 
    (searchQuery === '' || 
     conv.participants.some(p => 
       `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
     ) ||
     conv.last_message.body.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const currentConversation = selectedConversation ? 
    mockConversations.find(c => c.id === selectedConversation) : null

  const currentMessages = selectedConversation ? mockMessages : []

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      // In real app, send to Supabase
      console.log('Sending message:', newMessage)
      setNewMessage('')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground mt-2">
              Connect with buyers and sellers in your community
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Conversations</CardTitle>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    New Chat
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[480px]">
                  {filteredConversations.length > 0 ? (
                    <div className="space-y-1">
                      {filteredConversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`p-4 cursor-pointer hover:bg-muted/50 border-b ${
                            selectedConversation === conversation.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => setSelectedConversation(conversation.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={conversation.participants[0].avatar_url || undefined} />
                                <AvatarFallback>
                                  {getInitials(
                                    conversation.participants[0].first_name,
                                    conversation.participants[0].last_name
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              {conversation.participants[0].is_online && (
                                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-medium truncate">
                                  {conversation.participants[0].first_name} {conversation.participants[0].last_name}
                                </h3>
                                <div className="flex items-center space-x-1">
                                  {conversation.unread_count > 0 && (
                                    <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                                      {conversation.unread_count}
                                    </Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(conversation.last_message.created_at)}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {conversation.last_message.body}
                              </p>
                              <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center space-x-1">
                                  {conversation.participants[0].verified_expat && (
                                    <Badge variant="outline" className="text-xs">
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1">
                                  {conversation.last_message.is_read ? (
                                    <CheckCheck className="h-3 w-3 text-blue-500" />
                                  ) : (
                                    <Check className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{t('no_conversations')}</h3>
                      <p className="text-muted-foreground mb-4">
                        Start a conversation with sellers or buyers
                      </p>
                      <Button>
                        {t('start_conversation')}
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-2">
              {currentConversation ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="pb-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={currentConversation.participants[0].avatar_url || undefined} />
                            <AvatarFallback>
                              {getInitials(
                                currentConversation.participants[0].first_name,
                                currentConversation.participants[0].last_name
                              )}
                            </AvatarFallback>
                          </Avatar>
                          {currentConversation.participants[0].is_online && (
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {currentConversation.participants[0].first_name} {currentConversation.participants[0].last_name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {currentConversation.participants[0].is_online ? (
                              <span className="text-sm text-green-500">{t('online')}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">{t('offline')}</span>
                            )}
                            {currentConversation.participants[0].verified_expat && (
                              <Badge variant="outline" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="icon">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="p-0 flex-1">
                    <ScrollArea className="h-[400px] p-4">
                      <div className="space-y-4">
                        {currentMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender_id === '1' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${message.sender_id === '1' ? 'order-2' : 'order-1'}`}>
                              <div className={`rounded-lg p-3 ${
                                message.sender_id === '1' 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted'
                              }`}>
                                <p className="text-sm">{message.body}</p>
                                {message.translated_body && (
                                  <div className="mt-2 pt-2 border-t border-white/20">
                                    <p className="text-xs opacity-80">
                                      {message.translated_body}
                                      <span className="ml-2 text-xs opacity-60">({t('translated')})</span>
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className={`flex items-center space-x-1 mt-1 ${
                                message.sender_id === '1' ? 'justify-end' : 'justify-start'
                              }`}>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(message.created_at)}
                                </span>
                                {message.sender_id === '1' && (
                                  <div className="flex items-center">
                                    {message.is_read ? (
                                      <CheckCheck className="h-3 w-3 text-blue-500" />
                                    ) : (
                                      <Check className="h-3 w-3 text-muted-foreground" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={t('type_message')}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
