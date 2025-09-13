import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Card, CardContent } from 'react-native-paper';
import { Button } from 'react-native-paper';
import { 
  ArrowLeft, 
  Send, 
  Phone, 
  Video,
  MoreVertical,
  User
} from 'lucide-react-native';
import { formatRelativeTime } from '../utils/formatting';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isOwn: boolean;
}

interface ChatScreenProps {
  route: {
    params: {
      conversationId: string;
      participantName?: string;
    };
  };
  navigation: any;
}

export function ChatScreen({ route, navigation }: ChatScreenProps) {
  const { conversationId, participantName } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual message loading from API
      // Simulate loading messages
      const mockMessages: Message[] = [
        {
          id: '1',
          text: 'Hello! I\'m interested in your listing. Is it still available?',
          senderId: 'other',
          senderName: participantName || 'Other User',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          isOwn: false,
        },
        {
          id: '2',
          text: 'Yes, it\'s still available! Would you like to see more photos?',
          senderId: 'me',
          senderName: 'You',
          timestamp: new Date(Date.now() - 3000000).toISOString(),
          isOwn: true,
        },
        {
          id: '3',
          text: 'That would be great! Can you also tell me about the condition?',
          senderId: 'other',
          senderName: participantName || 'Other User',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          isOwn: false,
        },
        {
          id: '4',
          text: 'It\'s in excellent condition, barely used. I can send you more photos right now.',
          senderId: 'me',
          senderName: 'You',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          isOwn: true,
        },
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      senderId: 'me',
      senderName: 'You',
      timestamp: new Date().toISOString(),
      isOwn: true,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // TODO: Send message to API
    try {
      // await sendMessage(conversationId, message.text);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleCall = () => {
    Alert.alert('Call', 'Calling feature will be implemented soon');
  };

  const handleVideoCall = () => {
    Alert.alert('Video Call', 'Video calling feature will be implemented soon');
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isOwn ? styles.ownMessage : styles.otherMessage
      ]}
    >
      <Card style={[
        styles.messageCard,
        message.isOwn ? styles.ownMessageCard : styles.otherMessageCard
      ]}>
        <CardContent style={styles.messageContent}>
          <Text style={[
            styles.messageText,
            message.isOwn ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {message.text}
          </Text>
          <Text style={[
            styles.messageTime,
            message.isOwn ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            {formatRelativeTime(message.timestamp)}
          </Text>
        </CardContent>
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <View style={styles.participantInfo}>
            <View style={styles.avatar}>
              <User size={20} color="#6B7280" />
            </View>
            <View>
              <Text style={styles.participantName}>
                {participantName || 'Other User'}
              </Text>
              <Text style={styles.participantStatus}>Online</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleCall} style={styles.actionButton}>
            <Phone size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleVideoCall} style={styles.actionButton}>
            <Video size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MoreVertical size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.messagesContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading messages...</Text>
            </View>
          ) : (
            messages.map(renderMessage)
          )}
        </ScrollView>

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !newMessage.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Send size={20} color={newMessage.trim() ? "#FFFFFF" : "#9CA3AF"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  participantStatus: {
    fontSize: 12,
    color: '#059669',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    marginBottom: 16,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageCard: {
    maxWidth: '80%',
  },
  ownMessageCard: {
    backgroundColor: '#3B82F6',
  },
  otherMessageCard: {
    backgroundColor: '#FFFFFF',
  },
  messageContent: {
    padding: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  ownMessageTime: {
    color: '#DBEAFE',
  },
  otherMessageTime: {
    color: '#6B7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});
