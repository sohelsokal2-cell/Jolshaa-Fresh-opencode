import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import GroupsSidebar from '../components/GroupsSidebar';
import GroupsFeedFilters from '../components/GroupsFeedFilters';
import PostCard from '../components/PostCard';
import { fetchGroups, fetchGroupPosts, createGroup } from '../lib/groupsApi';
import './Groups.css';

export default function Groups() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeNav, setActiveNav] = useState('feed');

  const [joinedGroups, setJoinedGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);

  // Create group modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupPrivacy, setNewGroupPrivacy] = useState('public');
  const [creatingGroup, setCreatingGroup] = useState(false);

  const loadGroupsAndPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const groups = await fetchGroups('joined', user.id);
      setJoinedGroups(groups);

      if (groups.length > 0) {
        setPostsLoading(true);
        const allPosts = [];
        for (const group of groups) {
          try {
            const groupPosts = await fetchGroupPosts(group.id, user.id, 5);
            allPosts.push(...groupPosts);
          } catch (e) {
            console.error(`Failed to load posts for group ${group.id}:`, e);
          }
        }
        allPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setPosts(allPosts);
        setPostsLoading(false);
      }
    } catch (err) {
      console.error('Failed to load groups:', err);
    } finally {
      setLoading(false);
      setPostsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadGroupsAndPosts();
  }, [loadGroupsAndPosts]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !user) return;
    setCreatingGroup(true);
    try {
      const newGroup = await createGroup(
        newGroupName.trim(),
        newGroupDesc.trim() || null,
        null,
        newGroupPrivacy,
        user.id
      );
      setJoinedGroups(prev => [{ ...newGroup, isMember: true }, ...prev]);
      setNewGroupName('');
      setNewGroupDesc('');
      setNewGroupPrivacy('public');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create group:', err);
      alert('গ্রুপ তৈরি হয়নি। আবার চেষ্টা করো।');
    } finally {
      setCreatingGroup(false);
    }
  };

  const filteredPosts = activeFilter === 'all'
    ? posts
    : posts.filter(p => p.authorName?.toLowerCase().includes(activeFilter));

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
      <Navbar />

      <button
        className="mobile-menu-btn"
        style={{
          position: 'fixed',
          top: '11px',
          left: '110px',
          zIndex: 400
        }}
        onClick={() => setSidebarOpen(prev => !prev)}
        aria-label="Toggle groups sidebar"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <div className="groups-page-body">
        <GroupsSidebar
          isOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(false)}
          groups={joinedGroups}
          activeNav={activeNav}
          onNavChange={setActiveNav}
          onCreateGroupClick={() => setShowCreateModal(true)}
          loading={loading}
        />

        <main className="feed-center" aria-label="Groups feed">
          <div className="feed-inner">
            <div className="feed-section-header">
              <div className="feed-title-bn">সাম্প্রতিক কার্যকলাপ</div>
              <div className="feed-title-en">Recent Activity · তোমার গ্রুপগুলো থেকে</div>
            </div>

            {/* Group Call Section */}
            {joinedGroups.length > 0 && (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--teal, #1B6B5A), #2a9678)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                  </div>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-bn)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text-dark, #1a1a2e)',
                    }}>
                      গ্রুপ কল শুরু করো
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-en)',
                      fontSize: '12px',
                      color: 'var(--text-light, #666)',
                    }}>
                      Start a group video call
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}>
                  {joinedGroups.slice(0, 4).map(group => (
                    <button
                      key={group.id}
                      onClick={() => navigate(`/groups/${group.id}/call`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border, #e5e7eb)',
                        background: 'white',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        fontFamily: 'var(--font-bn)',
                        fontSize: '13px',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'var(--off-white, #f5f5f5)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal, #1B6B5A)" strokeWidth="2" strokeLinecap="round">
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                      </svg>
                      {group.name}
                    </button>
                  ))}
                  {joinedGroups.length > 4 && (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      fontFamily: 'var(--font-en)',
                      fontSize: '12px',
                      color: 'var(--text-light, #666)',
                    }}>
                      +{joinedGroups.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <GroupsFeedFilters onChangeFilter={setActiveFilter} />

            <div id="feedContent" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {postsLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>
                  পোস্ট লোড হচ্ছে...
                </div>
              ) : filteredPosts.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>
                  {joinedGroups.length === 0
                    ? 'প্রথমে কোনো গ্রুপে যোগ দাও!'
                    : 'এখনো কোনো পোস্ট নেই।'
                  }
                </div>
              ) : (
                filteredPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>নতুন গ্রুপ তৈরি করো</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <label className="modal-label">গ্রুপের নাম *</label>
              <input
                className="modal-input"
                type="text"
                placeholder="গ্রুপের নাম লিখো..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                maxLength={80}
              />
              <label className="modal-label">বিবরণ</label>
              <textarea
                className="modal-input"
                placeholder="গ্রুপ সম্পর্কে লিখো..."
                value={newGroupDesc}
                onChange={(e) => setNewGroupDesc(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <label className="modal-label">গোপনীয়তা</label>
              <select
                className="modal-input"
                value={newGroupPrivacy}
                onChange={(e) => setNewGroupPrivacy(e.target.value)}
              >
                <option value="public">সর্বজনীন (Public)</option>
                <option value="private">বেসরকারি (Private)</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={() => setShowCreateModal(false)}>বাতিল</button>
              <button
                className="modal-btn-primary"
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim() || creatingGroup}
              >
                {creatingGroup ? 'তৈরি হচ্ছে...' : 'তৈরি করো'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
