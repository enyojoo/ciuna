import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { 
  Text, 
  Card, 
  Avatar,
  Badge,
  Searchbar,
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  MessageCircle, 
  Search,
  Phone,
  Video
} from 'lucide-react-native';
import { db } from '@ciuna/sb';
import { formatRelativeTime } from '../utils/formatting';
import type { ConversationWithParticipants } from '@ciuna/types';

export function InboxScreen() {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState<ConversationWithParticipants[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const { data } = await db.conversations.getAll({}, 1, 50);
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const getOtherParticipant = (conversation: ConversationWithParticipants) => {
    // In a real app, you would get the current user ID and find the other participant
    return conversation.participants[0];
  };

  const filteredConversations = conversations.filter(conversation => {
    if (searchQuery) {
      const otherParticipant = getOtherParticipant(conversation);
      return otherParticipant?.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const renderConversationItem = (conversation: ConversationWithParticipants) => {
    const otherParticipant = getOtherParticipant(conversation);
    const lastMessage = conversation.last_message;
    
    return (
      <TouchableOpacity
        key={conversation.id}
        onPress={() => navigation.navigate('Chat', { conversationId: conversation.id })}
        style={styles.conversationItem}
      >
        <Card style={styles.conversationCard}>
          <Card.Content style={styles.conversationContent}>
            <View style={styles.avatarContainer}>
              <Avatar.Text 
                size={48} 
                label={otherParticipant?.user.email.charAt(0) || 'U'} 
              />
              {conversation.unread_count > 0 && (
                <Badge style={styles.unreadBadge}>
                  {conversation.unread_count}
                </Badge>
              )}
            </View>
            
            <View style={styles.conversationInfo}>
              <View style={styles.conversationHeader}>
                <Text variant="titleMedium" style={styles.participantName}>
                  {otherParticipant?.user.email}
                </Text>
                {lastMessage && (
                  <Text variant="bodySmall" style={styles.timestamp}>
                    {formatRelativeTime(lastMessage.created_at)}
                  </Text>
                )}
              </View>
              
              {lastMessage && (
                <Text variant="bodyMedium" style={styles.lastMessage} numberOfLines={2}>
                  {lastMessage.content}
                </Text>
              )}
            </View>
            
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton}>
                <Phone size={20} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Video size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Messages
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Chat with buyers and sellers
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading conversations...</Text>
          </View>
        ) : filteredConversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MessageCircle size={48} color="#9CA3AF" />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No conversations yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Start a conversation by messaging a seller
            </Text>
          </View>
        ) : (
          <View style={styles.conversationsList}>
            {filteredConversations.map(renderConversationItem)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default InboxScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    color: '#6B7280',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 8,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
  },
  conversationsList: {
    padding: 16,
  },
  conversationItem: {
    marginBottom: 12,
  },
  conversationCard: {
    elevation: 1,
  },
  conversationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#3B82F6',
  },
  conversationInfo: {
    flex: 1,
    marginRight: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  timestamp: {
    color: '#9CA3AF',
  },
  lastMessage: {
    color: '#6B7280',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
});
