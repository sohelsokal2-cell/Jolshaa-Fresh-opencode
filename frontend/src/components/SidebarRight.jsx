import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchFriendRequests,
  fetchFriendsPageSuggestions,
  fetchUpcomingBirthdays,
  respondToFriendRequest,
  sendFriendRequest,
} from '../lib/friendsApi';
import { useToast } from './Toast';

export default function SidebarRight() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [birthdays, setBirthdays] = useState([]);
  const [sentIds, setSentIds] = useState(new Set());

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchFriendRequests(user.id),
      fetchFriendsPageSuggestions(user.id),
      fetchUpcomingBirthdays(user.id),
    ]).then(([friendRequests, people, upcomingBirthdays]) => {
      setRequests(friendRequests || []);
      setSuggestions(people || []);
      setBirthdays(upcomingBirthdays || []);
    }).catch(err => {
      console.error('Failed to load feed sidebar data:', err);
    });
  }, [user]);

  const handleAccept = async (request) => {
    try {
      await respondToFriendRequest(request.id, 'accepted', user.id);
      setRequests(prev => prev.filter(item => item.id !== request.id));
      showToast('Friend request accepted');
    } catch (err) {
      console.error('Accept friend request failed:', err);
      showToast('Could not accept friend request');
    }
  };

  const handleDelete = async (request) => {
    try {
      await respondToFriendRequest(request.id, 'rejected', user.id);
      setRequests(prev => prev.filter(item => item.id !== request.id));
    } catch (err) {
      console.error('Delete friend request failed:', err);
      showToast('Could not remove friend request');
    }
  };

  const handleAddFriend = async (profile) => {
    try {
      await sendFriendRequest(user.id, profile.id);
      setSentIds(prev => new Set([...prev, profile.id]));
      showToast('Friend request sent');
    } catch (err) {
      console.error('Send friend request failed:', err);
      showToast(err.message || 'Could not send friend request');
    }
  };

  return (
    <aside className="sidebar-right" aria-label="Right sidebar widgets">
      {requests.length > 0 && (
        <div className="widget">
          <div className="widget-header">
            <div><div className="widget-title-bn">বন্ধু অনুরোধ</div><div className="widget-title-en">Friend Requests</div></div>
            <button className="widget-action" onClick={() => navigate('/friends')}>See all</button>
          </div>
          {requests.slice(0, 3).map(request => (
            <div key={request.id} className="friend-req-item">
              <div className="fr-avatar fr-avatar-1">{request.requesterName?.charAt(0) || '?'}</div>
              <div style={{ flex: 1 }}>
                <div className="fr-name">{request.requesterName}</div>
                <div className="fr-mutual">Friend request</div>
                <div className="fr-actions">
                  <button className="fr-accept" onClick={() => handleAccept(request)}>Accept</button>
                  <button className="fr-delete" onClick={() => handleDelete(request)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {birthdays.length > 0 && (
        <div className="widget">
          <div className="widget-header"><div><div className="widget-title-bn">জন্মদিন</div><div className="widget-title-en">Birthdays</div></div></div>
          {birthdays.slice(0, 3).map(birthday => (
            <div key={birthday.id} className="birthday-item">
              <div className="birthday-icon">🎂</div>
              <div>
                <div className="birthday-text-bn">{birthday.name} এর জন্মদিন আসছে।</div>
                <div className="birthday-text-en">In {birthday.daysUntil} days</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="widget">
        <div className="widget-header">
          <div><div className="widget-title-bn">পরিচিত হতে পারেন</div><div className="widget-title-en">People You May Know</div></div>
          <button className="widget-action" onClick={() => navigate('/friends')}>See all</button>
        </div>
        {suggestions.slice(0, 5).map(profile => {
          const sent = sentIds.has(profile.id);
          return (
            <div key={profile.id} className="pymk-item">
              <div className="pymk-avatar pymk-avatar-1">{profile.name?.charAt(0) || '?'}</div>
              <div style={{ flex: 1 }}><div className="pymk-name">{profile.name}</div><div className="pymk-mutual">People you may know</div></div>
              <button className="pymk-add-btn" onClick={() => handleAddFriend(profile)} disabled={sent}>{sent ? '✓ Sent' : '+ Add'}</button>
            </div>
          );
        })}
        {suggestions.length === 0 && <div className="widget-empty">No suggestions available.</div>}
      </div>
    </aside>
  );
}
