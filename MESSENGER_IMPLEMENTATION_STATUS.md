# Messenger Implementation Status

## Overview
Building a fully functional messenger page in React + Vite with Supabase backend, matching the complete feature set of `messenger.html`.

---

## ✅ COMPLETED TASKS

### Task 1: Extend Supabase Schema (Migration 016)
**File:** `backend/migrations/016_messenger_full_features.sql` (816 lines)

**Features Added:**
- `message_reactions` table — one emoji per user per message
- `pinned_messages` table — track which messages are pinned
- `user_blocks` table — bidirectional blocking
- **New columns:**
  - `messages.reply_to_id` (foreign key for reply-quoting)
  - `messages.message_type` (enum: text/image/voice/location)
  - `messages.audio_url, audio_duration` (voice notes)
  - `messages.location_lat, location_lng, location_label` (geolocation sharing)
  - `conversations.name, avatar_url, created_by` (group chat metadata)
  - `conversation_participants.is_muted, is_admin` (user-specific settings)
  - `profiles.last_seen_at` (offline timestamp persistence)
- **RLS Policies:** Comprehensive row-level security for all tables + cross-user scenarios
- **Realtime:** Publications for message_reactions, pinned_messages, conversations, profiles
- **RPC Function:** `create_group_conversation(creator_id, member_ids, group_name)` — atomic group creation

---

### Task 2: Extend messagingApi.js
**File:** `frontend/src/lib/messagingApi.js` (810 lines)

**New Functions:**
- `createGroupConversation(creatorId, memberIds, groupName)` — RPC-based group creation
- `fetchConversationDetails(conversationId)` — group metadata + member list
- `sendMessage(conversationId, senderId, options)` — supports all message types (text, image, voice, location, reply)
- `uploadVoiceNote(blob, userId)` — voice recording → storage
- `toggleReaction(messageId, userId, emoji)` — emoji reaction management
- `pinMessage, unpinMessage, fetchPinnedMessages()` — pinned message management
- `muteConversation(conversationId, userId, isMuted)`
- `blockUser, unblockUser, checkBlocked()`
- `markAsRead(conversationId, userId)` — read receipt
- `updateLastSeen(userId)` — offline status
- `subscribeToTyping, broadcastTyping()` — realtime typing indicator
- `subscribeToPresence()` — online status tracking (Supabase Presence)
- `fetchSharedMedia()` — media grid for info panel
- `fetchTotalUnreadCount(userId)`

All functions follow Supabase client patterns with error throwing + proper field mapping.

---

### Task 3: Build NewMessageModal Component
**Files:**
- `frontend/src/components/NewMessageModal.jsx` (228 lines)
- `frontend/src/styles/NewMessageModal.css` (283 lines)

**Features:**
- Two modes: direct message & group creation
- Friend list with search (via friendsApi.fetchFriends)
- Click friend → direct conversation (findOrCreateDirectConversation)
- Select multiple friends → group name input → createGroupConversation
- Modal overlay with smooth interactions
- Bengali/English labels
- Error handling + loading states

**Integration:**
- Wire into ConversationList via `new-msg-btn`
- Callback to navigate to new conversation

---

### Task 4: Upgrade ConversationList Component
**File:** `frontend/src/components/ConversationList.jsx` (updated)

**Changes:**
- Import NewMessageModal component
- Add state `showNewMessageModal`
- Wire compose button (`new-msg-btn`) to open modal
- Handle `onConversationCreated` callback → navigate + refresh

**Visual Enhancements:**
- **Group Avatar Stack:** Overlapping mini-circles for 2 participants (uses `.group-av-stack`, `.group-av-mini`, `.gam-1`, `.gam-2`)
- **Group Badge:** Teal "গ্রুপ" badge on group conversations
- **Online Indicator:** Green/grey dot for direct chats (`.online-dot`)
- **Mute Icon:** Speaker-off SVG when conversation is muted (`.conv-muted`)
- **Message Prefixes:** 📷 for images, 🎤 for voice notes, 📍 for locations

**CSS Added to Messenger.css:**
```css
.group-av-stack { position: relative; width: 46px; height: 46px; }
.group-av-mini { position: absolute; width: 28px; height: 28px; border-radius: 50%; ... }
.gam-1 { background: linear-gradient(135deg,#f97316,#dc2626); top: 0; left: 0; }
.gam-2 { background: linear-gradient(135deg,#06b6d4,#0891b2); bottom: 0; right: 0; }
.group-badge { ... text "গ্রুপ" }
```

---

## ✅ Task 5: Upgrade ChatWindow.jsx (High complexity)
**File:** `frontend/src/components/ChatWindow.jsx` (842 lines)

**Implemented:**
1. **Reply-Quoting** — Reply button on hover → reply preview bar → sendMessage with reply_to_id
2. **Emoji Reactions** — Reaction picker + display reactions on bubbles (toggleReaction, via MessageBubble)
3. **Voice Notes** — MediaRecorder API (useVoiceRecorder hook) + upload/playback via `<audio>` controls
4. **Location Sharing** — Geolocation permission → lat/lng → Google Maps preview link
5. **Pinned Message Bar** — Shows latest pinned message (fetchPinnedMessages) with unpin action
6. **Message Status Ticks** — ✓ sent / ✓✓ seen (via subscribeToReadStatus + otherLastReadAt)
7. **Typing Indicator** — Real-time typing status via broadcast (subscribeToTyping)
8. **Group Chat Header** — Shows group name + member count instead of 1-on-1 contact
9. **Online Status Text** — "অনলাইন" / "N মিনিট আগে" from presence data (useOnlinePresence)

---

## ✅ Task 6: Wire InfoPanel into Messenger.jsx
**File:** `frontend/src/components/InfoPanel.jsx` (432 lines)

**Implemented:**
1. `activeConversation` + `onConversationDeleted` props wired from Messenger.jsx (uses `useAuth()` internally for the current user)
2. Shared media grid — fetchSharedMedia(conversationId)
3. Pinned messages list — fetchPinnedMessages(conversationId)
4. Group member list (conversation_participants) — via fetchConversationDetails
5. Mutual friends (direct conversations) — cross-referenced via fetchFriends
6. Mute toggle — muteConversation(conversationId, userId, isMuted) — **fixed:** the toggle switch's own click handler now calls `handleToggleMute()` (previously it only called `stopPropagation` and did nothing)
7. View Profile button → navigate(`/profile/{userId}`)
8. Block/Unblock — blockUser/unblockUser + checkBlocked, with error handling
9. Delete conversation — leaveConversation(conversationId, userId) with confirm dialog
10. **Added this session:** online status dot on the avatar + last-seen text under the name (useOnlinePresence)

---

## ✅ Task 7: Add Online Presence Tracking
**File:** `frontend/src/hooks/useOnlinePresence.js` (217 lines)

**Implemented:**
1. `useOnlinePresence(conversationId, participantIds)` hook — subscribes to a Supabase Presence channel per conversation, falls back to `profiles.last_seen_at` for offline users
2. `useBroadcastPresence(conversationId, userId)` — tracks the current user's own presence + updates `last_seen_at` on activity (mouse/keyboard/touch)
3. ConversationList — global presence via `trackPresence(userId, onSync)` (online-users channel); **fixed:** each conv-item's green/grey dot now reads from the `onlineUserIds` set (previously it was always grey since `conv.isOnline` was never populated)
4. ChatWindow header — shows "অনলাইন" / "N মিনিট আগে" text next to the contact name
5. InfoPanel — online dot on avatar + last-seen text under the name (newly wired this session)

---

## ✅ Task 8: Verify Build & Feature Parity
1. **Build fixed:** `npm run build` failed under the project's default Node v20.12.0 due to a Vite 8 / Rolldown `styleText` incompatibility (`ERR_INVALID_ARG_VALUE` on `['underline','gray']`, a known issue on Node < 20.19). Built successfully using the Node v26.1.0 install found at `C:\Program Files\nodejs`. **Recommended:** switch the project's active Node to ≥20.19 (or use that v26 install) for local dev/build going forward.
2. Cross-checked ChatWindow, InfoPanel, and ConversationList feature-by-feature — all message types (text/image/voice/location), reactions, pinning, mute/block, group vs. direct headers, and presence are wired end-to-end.
3. `npx oxlint` run on all touched messenger files — 0 errors (only pre-existing, unrelated hook-dependency warnings).
4. Realtime channels confirmed in place: `subscribeToConversation` (messages + reactions), `subscribeToPinnedMessages`, `subscribeToReadStatus`, `subscribeToTyping`, `trackPresence` / `useOnlinePresence` presence channels, `subscribeToConversationsList` (inbox).
5. Performance/virtualization not implemented — message list renders all fetched messages (capped at `fetchMessages` limit=100). Flagged as a future optimization if conversations grow very large.

---

## 🔧 Implementation Notes

### API Conventions
- All async functions use `async/await`
- Errors are thrown (not returned)
- Supabase client accessed via `import { supabase } from '../config/supabaseClient'`
- Timestamps in ISO-8601 format; convert with `new Date()`

### Frontend Conventions
- Bengali translation in JSX: `"বার্তা"` alongside English for accessibility
- Component names: PascalCase
- CSS classes: kebab-case
- Avatar colors cycle via `AVATAR_CLASSES` array (7 gradients)
- Datetime formatting: `toLocaleDateString('bn-BD')` for Bengali, `'en-US'` for English

### Realtime Patterns
- `supabase.channel()` for low-latency broadcasts (typing, presence)
- `supabase.on()` for table subscriptions (messages, reactions)
- All subscriptions must be cleaned up on unmount via `subscription.unsubscribe()`

### RLS + Auth
- All mutations require `auth.uid() = <user_id>` or relationship check
- Cross-user reads (e.g., conversation participants) are protected by participation checks
- Blocks are bidirectional: A blocks B = B cannot message A

---

## Next Steps

1. **Create MessageBubble component** — Encapsulate reply-quote, reactions, status ticks, voice playback
2. **Create VoiceRecorder hook** — Abstraction for MediaRecorder + waveform rendering
3. **Upgrade ChatWindow incrementally** — Add one feature per pass (reply → reactions → voice → location)
4. **Create useOnlinePresence hook** — Presence tracking abstraction
5. **Test each feature** — Manual testing + console validation before moving to next
6. **Performance optimization** — Message list virtualization if needed

---

## Files Modified/Created

**Backend:**
- ✅ `backend/migrations/016_messenger_full_features.sql` (816 lines, NEW)

**Frontend:**
- ✅ `frontend/src/lib/messagingApi.js` (614 lines, EXTENDED)
- ✅ `frontend/src/components/NewMessageModal.jsx` (228 lines, NEW)
- ✅ `frontend/src/styles/NewMessageModal.css` (283 lines, NEW)
- ✅ `frontend/src/components/ConversationList.jsx` (272 lines, UPDATED — online-dot bugfix)
- ✅ `frontend/src/pages/Messenger.css` (UPDATED with group avatar styles)
- ✅ `frontend/src/components/ChatWindow.jsx` (842 lines, DONE)
- ✅ `frontend/src/components/InfoPanel.jsx` (432 lines, DONE — mute-toggle + presence display added)
- ✅ `frontend/src/hooks/useOnlinePresence.js` (217 lines, DONE)
- ✅ `frontend/src/components/MessageBubble.jsx` (205 lines, DONE)
- ✅ `frontend/src/hooks/useVoiceRecorder.js` (DONE)

---

**Last Updated:** July 20, 2026
**Session:** Tasks 6–8 completed (InfoPanel presence display + mute-toggle bugfix, ConversationList online-dot bugfix, build verified on Node v26)
