'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, Avatar, Badge, Button } from '@/lib/ui';
import { 
  MessageCircle, 
  Search, 
  MoreVertical, 
  Send, 
  Paperclip,
  Smile,
  Phone,
  Video
} from 'lucide-react';
import { db } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';
import type { Conversation, Message } from '@/lib/types';

export default function InboxPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const { data } = await db.conversations.getAll(user?.id || '', 1, 50);
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data } = await db.messages.getAll(conversationId, 1, 100);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await db.messages.create({
        conversation_id: selectedConversation.id,
        sender_id: user?.id || '',
        content: newMessage.trim(),
        message_type: 'TEXT',
      });
      
      setNewMessage('');
      // Reload messages
      loadMessages(selectedConversation.id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    // TODO: Implement participant lookup when using ConversationWithDetails
    return null;
  };

  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery) return true;
    // TODO: Implement search when using ConversationWithDetails
    return true;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Messages
        </h1>
        <p className="text-lg text-gray-600">
          Chat with buyers and sellers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No conversations yet
                  </h3>
                  <p className="text-gray-600">
                    Start a conversation by messaging a seller
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredConversations.map((conversation) => {
                    const otherParticipant = getOtherParticipant(conversation);
                    const lastMessage = null; // TODO: Get last message when using ConversationWithDetails
                    
                    return (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                          selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar
                            src={undefined}
                            fallback="U"
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                Unknown User
                              </p>
                              <p className="text-xs text-gray-500">
                                No messages
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              No recent messages
                            </p>
                          </div>
                          <Badge variant="default" className="bg-blue-500">
                            0
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <Card className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      src={undefined}
                      fallback="U"
                      size="md"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Unknown User
                      </h3>
                      <p className="text-sm text-gray-600">Online</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_id === user?.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatRelativeTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={sendMessage} className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" type="button">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button variant="ghost" size="sm" type="button">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button type="submit" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600">
                  Choose a conversation from the list to start chatting
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
