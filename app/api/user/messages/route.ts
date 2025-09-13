import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@ciuna/sb';

export async function GET(_request: NextRequest) {
  try {
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's conversations with last message and unread count
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        created_at,
        conversation_participants!inner (
          user_id,
          profiles!conversation_participants_user_id_fkey (
            first_name,
            last_name,
            avatar_url
          )
        ),
        messages (
          id,
          content,
          created_at,
          sender_id,
          read_at
        )
      `)
      .eq('conversation_participants.user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    // Transform the data to match the expected format
    const transformedMessages = conversations?.map((conversation: any) => {
      // Get the other participant (not the current user)
      const otherParticipant = conversation.conversation_participants?.find(
        (p: any) => p.user_id !== user.id
      );
      
      const otherUser = otherParticipant?.profiles;
      const otherUserName = otherUser ? `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim() : 'Unknown User';
      
      // Get the last message
      const lastMessage = conversation.messages?.[0];
      
      // Count unread messages (messages not read by current user)
      const unreadCount = conversation.messages?.filter(
        (msg: any) => msg.sender_id !== user.id && !msg.read_at
      ).length || 0;

      return {
        id: conversation.id,
        conversation_id: conversation.id,
        other_user_name: otherUserName,
        other_user_avatar: otherUser?.avatar_url,
        last_message: lastMessage?.content || 'No messages yet',
        last_message_at: lastMessage?.created_at || conversation.created_at,
        unread_count: unreadCount
      };
    }) || [];

    return NextResponse.json(transformedMessages);
  } catch (error) {
    console.error('Error in messages API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
