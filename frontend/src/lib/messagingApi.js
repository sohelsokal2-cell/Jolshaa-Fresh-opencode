import { supabase } from '../config/supabaseClient';

/**
 * দুইজন ইউজারের মধ্যে কথোপকথন খুঁজে বের করে বা নতুন তৈরি করে।
 */
export async function findOrCreateDirectConversation(user1Id, user2Id) {
  // ১. চেক করা যে আগে থেকেই কোনো ২-জনের ডাইরেক্ট চ্যাট আছে কি না
  // Find conversations where user1 is a participant
  const { data: user1Convs } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', user1Id);

  if (user1Convs && user1Convs.length > 0) {
    const convIds = user1Convs.map(c => c.conversation_id);

    // Check if user2 is also a participant in any of those conversations (direct type)
    const { data: shared } = await supabase
      .from('conversation_participants')
      .select('conversation_id, conversation:conversations(type)')
      .in('conversation_id', convIds)
      .eq('user_id', user2Id);

    const directConv = shared?.find(s => s.conversation?.type === 'direct');
    if (directConv) {
      return directConv.conversation_id;
    }
  }

  // ২. না থাকলে নতুন তৈরি করা
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .insert({ type: 'direct' })
    .select()
    .single();

  if (convError) throw convError;

  // ৩. অংশগ্রহণকারীদের যুক্ত করা
  const { error: partError } = await supabase
    .from('conversation_participants')
    .insert([
      { conversation_id: conv.id, user_id: user1Id },
      { conversation_id: conv.id, user_id: user2Id }
    ]);

  if (partError) throw partError;

  return conv.id;
}

/**
 * একাধিক সদস্য নিয়ে নতুন গ্রুপ কথোপকথন তৈরি করে (সৃষ্টিকর্তা অটো-অ্যাডমিন হয়)।
 */
export async function createGroupConversation(creatorId, memberIds, groupName) {
  const { data, error } = await supabase
    .rpc('create_group_conversation', {
      group_name: groupName,
      creator_id: creatorId,
      member_ids: memberIds,
    });

  if (error) throw error;
  return data; // new conversation id
}

/**
 * ইউজারের সব চ্যাট লিস্ট (Inbox) নিয়ে আসে। ডাইরেক্ট ও গ্রুপ দুটোই সাপোর্ট করে।
 */
export async function fetchConversations(userId) {
  // Step 1: Fetch conversations (no messages nesting — PostgREST only allows 1 level)
  const { data, error } = await supabase
    .from('conversation_participants')
    .select(`
      conversation_id,
      last_read_at,
      is_muted,
      conversation:conversations (
        id,
        type,
        last_message_at
      )
    `)
    .eq('user_id', userId)
    .order('conversation(last_message_at)', { ascending: false });

  if (error) throw error;

  const results = await Promise.all((data || []).map(async (item) => {
    const conv = item.conversation;
    if (!conv) return null;

    // Fetch last message separately (avoids deep nesting)
    const { data: lastMsgs } = await supabase
      .from('messages')
      .select('content, image_url, audio_url, location_lat, created_at')
      .eq('conversation_id', item.conversation_id)
      .order('created_at', { ascending: false })
      .limit(1);

    const lastMessage = lastMsgs?.[0] || null;

    // Fetch other participants
    const { data: others } = await supabase
      .from('conversation_participants')
      .select('user:profiles(id, name, profile_photo_url)')
      .eq('conversation_id', item.conversation_id)
      .neq('user_id', userId);

    const otherParticipants = others?.map(o => o.user).filter(Boolean) || [];

    const { data: unreadData } = await supabase
      .rpc('get_unread_count', { conv_id: item.conversation_id, uid: userId });
    const unreadCount = unreadData || 0;

    const isGroup = conv.type === 'group';

    return {
      id: item.conversation_id,
      type: conv.type,
      isGroup,
      name: isGroup ? (conv.name || 'গ্রুপ') : null,
      groupName: isGroup ? (conv.name || 'গ্রুপ') : null,
      avatarUrl: conv.avatar_url || null,
      otherParticipants,
      lastMessage,
      unreadCount,
      isMuted: item.is_muted,
      last_read_at: item.last_read_at,
      last_message_at: conv.last_message_at,
    };
  }));

  return results.filter(Boolean);
}

/**
 * একটি নির্দিষ্ট কথোপকথনের বিস্তারিত তথ্য (নাম, ছবি, সব সদস্য, অ্যাডমিন) নিয়ে আসে।
 */
export async function fetchConversationDetails(conversationId) {
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .select('id, type, last_message_at, created_by')
    .eq('id', conversationId)
    .single();

  if (convError) throw convError;

  const { data: participants, error: partError } = await supabase
    .from('conversation_participants')
    .select('user_id, is_admin, is_muted, last_read_at, user:profiles(id, name, profile_photo_url, last_seen_at)')
    .eq('conversation_id', conversationId);

  if (partError) throw partError;

  return { ...conv, participants: participants || [] };
}

/**
 * স্পেসিফিক কথোপকথনের মেসেজগুলো নিয়ে আসে (reply + reactions সহ)।
 */
export async function fetchMessages(conversationId, limit = 100) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles(id, name, profile_photo_url),
      reactions:message_reactions(id, emoji, user_id)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * টেক্সট / ছবি / ভয়েস / লোকেশন — যেকোনো ধরনের মেসেজ পাঠানো।
 */
export async function sendMessage(conversationId, senderId, options = {}) {
  const {
    content = null,
    imageUrl = null,
    audioUrl = null,
    audioDurationSec = null,
    locationLat = null,
    locationLng = null,
    locationLabel = null,
    replyToId = null,
  } = typeof options === 'string' ? { content: options } : options;

  let { messageType } = typeof options === 'string' ? {} : options;
  if (!messageType) {
    if (imageUrl) messageType = 'image';
    else if (audioUrl) messageType = 'voice';
    else if (locationLat != null && locationLng != null) messageType = 'location';
    else messageType = 'text';
  }

  const insertPayload = {
    conversation_id: conversationId,
    sender_id: senderId,
    content,
    image_url: imageUrl,
  };

  // Only include new columns if they exist (migration 016 may not be applied yet)
  // For images, image_url is enough — message_type only needed for voice/location
  if (messageType === 'voice' || messageType === 'location') insertPayload.message_type = messageType;
  if (audioUrl) insertPayload.audio_url = audioUrl;
  if (audioDurationSec != null) insertPayload.audio_duration_sec = audioDurationSec;
  if (locationLat != null) insertPayload.location_lat = locationLat;
  if (locationLng != null) insertPayload.location_lng = locationLng;
  if (locationLabel) insertPayload.location_label = locationLabel;
  if (replyToId) insertPayload.reply_to_id = replyToId;

  const { data, error } = await supabase
    .from('messages')
    .insert(insertPayload)
    .select(`
      *,
      sender:profiles(id, name, profile_photo_url),
      reactions:message_reactions(id, emoji, user_id)
    `)
    .single();

  if (error) throw error;
  return data;
}

/**
 * ছবি আপলোড করা।
 */
export async function uploadChatImage(file, userId) {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('chat-images')
    .upload(path, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('chat-images')
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * ফাইল আপলোড করা (ডকুমেন্ট)।
 */
export async function uploadChatFile(file, userId) {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('chat-files')
    .upload(path, file, { contentType: file.type || 'application/octet-stream' });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('chat-files')
    .getPublicUrl(path);

  return { publicUrl: data.publicUrl, fileName: file.name };
}

/**
 * ভয়েস নোট আপলোড করা।
 */
export async function uploadVoiceNote(blob, userId) {
  const path = `${userId}/${Date.now()}.webm`;

  const { error: uploadError } = await supabase.storage
    .from('chat-voice')
    .upload(path, blob, { contentType: blob.type || 'audio/webm' });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('chat-voice')
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * মেসেজ পড়া হয়েছে বলে চিহ্নিত করা।
 */
export async function markAsRead(conversationId, userId) {
  const { error } = await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .match({ conversation_id: conversationId, user_id: userId });

  if (error) throw error;
}

/**
 * এই মেসেজে ইমোজি রিয়েকশন দেওয়া/সরানো (টগল — একই ইমোজিতে আবার ক্লিক করলে মুছে যায়)।
 */
export async function toggleReaction(messageId, userId, emoji) {
  const { data: existing } = await supabase
    .from('message_reactions')
    .select('id, emoji')
    .eq('message_id', messageId)
    .eq('user_id', userId);

  const already = existing?.find(r => r.emoji === emoji);

  // ইউজারের আগের সব রিয়েকশন সরানো (একজনের একটাই রিয়েকশন থাকবে)
  if (existing && existing.length > 0) {
    await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId);
  }

  if (already) {
    return null; // toggled off
  }

  const { data, error } = await supabase
    .from('message_reactions')
    .insert({ message_id: messageId, user_id: userId, emoji })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * মেসেজ পিন করা।
 */
export async function pinMessage(conversationId, messageId, userId) {
  const { data, error } = await supabase
    .from('pinned_messages')
    .insert({ conversation_id: conversationId, message_id: messageId, pinned_by: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function unpinMessage(conversationId, messageId) {
  const { error } = await supabase
    .from('pinned_messages')
    .delete()
    .match({ conversation_id: conversationId, message_id: messageId });

  if (error) throw error;
}

export async function fetchPinnedMessages(conversationId) {
  const { data, error } = await supabase
    .from('pinned_messages')
    .select(`
      id, pinned_at,
      message:messages(id, content, image_url, audio_url, location_lat, created_at, sender:profiles(id, name))
    `)
    .eq('conversation_id', conversationId)
    .order('pinned_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * কথোপকথন নিঃশব্দ / সরব করা।
 */
export async function muteConversation(conversationId, userId, isMuted) {
  const { error } = await supabase
    .from('conversation_participants')
    .update({ is_muted: isMuted })
    .match({ conversation_id: conversationId, user_id: userId });

  if (error) throw error;
}

/**
 * ইউজার ব্লক করা / আনব্লক করা / চেক করা।
 */
export async function blockUser(blockerId, blockedId) {
  const { error } = await supabase
    .from('user_blocks')
    .insert({ blocker_id: blockerId, blocked_id: blockedId });

  if (error) throw error;
}

export async function unblockUser(blockerId, blockedId) {
  const { error } = await supabase
    .from('user_blocks')
    .delete()
    .match({ blocker_id: blockerId, blocked_id: blockedId });

  if (error) throw error;
}

export async function checkBlocked(userId, otherUserId) {
  const { data } = await supabase
    .from('user_blocks')
    .select('id')
    .or(`and(blocker_id.eq.${userId},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${userId})`)
    .maybeSingle();

  return !!data;
}

/**
 * কথোপকথন মুছে ফেলা — শুধু নিজের ইনবক্স থেকে সরানো হয় (participant row মুছে)।
 */
export async function leaveConversation(conversationId, userId) {
  const { error } = await supabase
    .from('conversation_participants')
    .delete()
    .match({ conversation_id: conversationId, user_id: userId });

  if (error) throw error;
}
export const deleteConversation = leaveConversation;

/**
 * প্রোফাইলের last_seen_at আপডেট করা।
 */
export async function updateLastSeen(userId) {
  const { error } = await supabase
    .from('profiles')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * একটি নির্দিষ্ট মেসেজের বর্তমান রিয়েকশনগুলো নিয়ে আসে (রিয়েল-টাইম আপডেটের জন্য)।
 */
export async function fetchMessageReactions(messageId) {
  const { data, error } = await supabase
    .from('message_reactions')
    .select('id, emoji, user_id')
    .eq('message_id', messageId);

  if (error) throw error;
  return data || [];
}

/**
 * শেয়ার করা মিডিয়া (info panel-এর জন্য) নিয়ে আসে।
 */
export async function fetchSharedMedia(conversationId, limit = 9) {
  // Fetch messages that have an image_url (works with or without message_type column)
  const { data, error } = await supabase
    .from('messages')
    .select('id, image_url, content, created_at')
    .eq('conversation_id', conversationId)
    .not('image_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * রিয়েল-টাইম মেসেজ সাবস্ক্রিপশন (নতুন মেসেজ + রিয়েকশন পরিবর্তন)।
 */
export function subscribeToConversation(conversationId, onMessage, onReactionChange) {
  const uniqueId = Math.random().toString(36).substring(2, 10);
  const channel = supabase
    .channel(`messages:${conversationId}:${uniqueId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, (payload) => {
      onMessage(payload.new);
    });

  if (onReactionChange) {
    channel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'message_reactions',
    }, (payload) => {
      onReactionChange(payload);
    });
  }

  channel.subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * পিন করা মেসেজ লিস্টে রিয়েল-টাইম পরিবর্তন সাবস্ক্রাইব করা।
 */
export function subscribeToPinnedMessages(conversationId, onChange) {
  const uniqueId = Math.random().toString(36).substring(2, 10);
  const channel = supabase
    .channel(`pinned:${conversationId}:${uniqueId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'pinned_messages',
      filter: `conversation_id=eq.${conversationId}`,
    }, (payload) => {
      onChange(payload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * অন্য অংশগ্রহণকারীদের read-status (seen tick) পরিবর্তনে সাবস্ক্রাইব করা।
 */
export function subscribeToReadStatus(conversationId, onChange) {
  const uniqueId = Math.random().toString(36).substring(2, 10);
  const channel = supabase
    .channel(`read-status:${conversationId}:${uniqueId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'conversation_participants',
      filter: `conversation_id=eq.${conversationId}`,
    }, (payload) => {
      onChange(payload.new);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * টাইপিং ইন্ডিকেটর ব্রডকাস্ট করা ও শোনা (broadcast channel, DB-তে সংরক্ষণ হয় না)।
 */
export function subscribeToTyping(conversationId, userId, onTyping) {
  const channel = supabase.channel(`typing:${conversationId}`, {
    config: { broadcast: { self: false } },
  });

  channel
    .on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (payload.userId !== userId) onTyping(payload);
    })
    .subscribe();

  return {
    broadcast: (userName, isTyping) => {
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, userName, isTyping },
      });
    },
    unsubscribe: () => supabase.removeChannel(channel),
  };
}

/**
 * ইউজারের সব কথোপকথন মিলিয়ে মোট অপঠিত (unread) মেসেজ সংখ্যা নিয়ে আসে।
 */
export async function fetchTotalUnreadCount(userId) {
  const { data, error } = await supabase
    .from('conversation_participants')
    .select(`
      last_read_at,
      conversation:conversations (
        last_message_at
      )
    `)
    .eq('user_id', userId);

  if (error) throw error;

  const count = data.filter(item => {
    if (!item.conversation) return false;
    if (!item.conversation.last_message_at) return false;
    if (!item.last_read_at) return true;
    return new Date(item.conversation.last_message_at) > new Date(item.last_read_at);
  }).length;

  return count;
}

/**
 * ইনবক্স লিস্টের রিয়েল-টাইম সাবস্ক্রিপশন।
 */
export function subscribeToConversationsList(userId, onUpdate) {
  const uniqueId = Math.random().toString(36).substring(2, 10);
  const channel = supabase
    .channel(`inbox:${userId}:${uniqueId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'conversations'
    }, (payload) => {
      onUpdate(payload);
    })
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'conversation_participants',
      filter: `user_id=eq.${userId}`,
    }, (payload) => {
      onUpdate(payload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * অনলাইন প্রেজেন্স — গ্লোবাল presence চ্যানেলে ইউজারকে ট্র্যাক করা।
 * রিটার্ন করে unsubscribe ফাংশন।
 */
export function trackPresence(userId, onSync) {
  const channel = supabase.channel('online-users', {
    config: { presence: { key: userId } },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      onSync(new Set(Object.keys(state)));
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online_at: new Date().toISOString() });
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
