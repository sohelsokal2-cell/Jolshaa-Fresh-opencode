import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import {
  fetchFriends,
  fetchFriendRequests,
  fetchSentRequests,
  respondToFriendRequest,
  deleteFriendRequest,
  sendFriendRequest,
  subscribeToFriendRequests,
} from '../lib/friendsApi';
import { findOrCreateDirectConversation } from '../lib/messagingApi';
import FriendsSidebar from '../components/friends/FriendsSidebar';
import AllFriendsView from '../components/friends/AllFriendsView';
import FriendRequestsView from '../components/friends/FriendRequestsView';
import SentRequestsView from '../components/friends/SentRequestsView';
import SuggestionsView from '../components/friends/SuggestionsView';
import BirthdaysView from '../components/friends/BirthdaysView';
import './FriendsPage.css';

export default function Friends() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sentReqs, setSentReqs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [f, r, s] = await Promise.all([
        fetchFriends(user.id).catch(() => []),
        fetchFriendRequests(user.id).catch(() => []),
        fetchSentRequests(user.id).catch(() => []),
      ]);
      setFriends(f);
      setRequests(r);
      setSentReqs(s);
    } catch (err) {
      console.error('Friends load error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!user) return undefined;
    return subscribeToFriendRequests(user.id, () => loadData());
  }, [user, loadData]);

  async function handleAccept(req) {
    try {
      await respondToFriendRequest(req.id, 'accepted', user.id);
      setRequests(prev => prev.filter(r => r.id !== req.id));
      setFriends(prev => [
        { friendshipId: req.id, id: req.requester_id, name: req.requesterName, avatarUrl: req.requesterAvatar, since: req.created_at },
        ...prev,
      ]);
      showToast('বন্ধুত্ব গ্রহণ করা হয়েছে!');
    } catch (err) {
      console.error(err);
      showToast('গ্রহণ করা যায়নি।');
    }
  }

  async function handleDelete(req) {
    try {
      await deleteFriendRequest(req.id, user.id);
      setRequests(prev => prev.filter(r => r.id !== req.id));
      showToast('অনুরোধ মুছে ফেলা হয়েছে।');
    } catch (err) {
      console.error(err);
      showToast('মুছে ফেলা যায়নি।');
    }
  }

  async function handleCancelSent(req) {
    try {
      await deleteFriendRequest(req.id, user.id);
      setSentReqs(prev => prev.filter(r => r.id !== req.id));
      showToast('অনুরোধ বাতিল করা হয়েছে।');
    } catch (err) {
      console.error(err);
      showToast('বাতিল করা যায়নি।');
    }
  }

  async function handleUnfriend(friend) {
    if (!window.confirm(`${friend.name} কে আনফ্রেন্ড করতে চাও?`)) return;
    try {
      await deleteFriendRequest(friend.friendshipId, user.id);
      setFriends(prev => prev.filter(f => f.friendshipId !== friend.friendshipId));
      showToast('আনফ্রেন্ড করা হয়েছে।');
    } catch (err) {
      console.error(err);
      showToast('আনফ্রেন্ড করা যায়নি।');
    }
  }

  async function handleAddFriend(profileId) {
    try {
      const request = await sendFriendRequest(user.id, profileId);
      setSentReqs(prev => [request, ...prev]);
      showToast('বন্ধু অনুরোধ পাঠানো হয়েছে!');
    } catch (err) {
      console.error(err);
      showToast('অনুরোধ পাঠানো যায়নি।');
    }
  }

  return (
    <div className="fp-root">
      <Navbar />
      <div className="fp-body">
        <FriendsSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          requestCount={requests.length}
        />

        <main className="fp-main">
          {loading ? (
            <div className="fp-loading">
              <div className="fp-spinner"></div>
              <span>লোড হচ্ছে...</span>
            </div>
          ) : (
            <>
              {activeTab === 'all' && (
                <AllFriendsView
                  friends={friends}
                  searchQuery={searchQuery}
                  onMessage={async (friend) => {
                    try {
                      const conv = await findOrCreateDirectConversation(user.id, friend.id);
                      navigate(`/messages/${conv.id}`);
                    } catch (err) {
                      console.error('Failed to open conversation:', err);
                      showToast('বার্তা খুলতে ব্যর্থ হয়েছে।');
                    }
                  }}
                  onUnfriend={handleUnfriend}
                />
              )}
              {activeTab === 'requests' && (
                <FriendRequestsView
                  requests={requests}
                  onAccept={handleAccept}
                  onDelete={handleDelete}
                />
              )}
              {activeTab === 'sent' && (
                <SentRequestsView
                  sentReqs={sentReqs}
                  onCancel={handleCancelSent}
                />
              )}
              {activeTab === 'suggestions' && (
                <SuggestionsView
                  currentUserId={user.id}
                  onAddFriend={handleAddFriend}
                />
              )}
              {activeTab === 'birthdays' && <BirthdaysView />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
