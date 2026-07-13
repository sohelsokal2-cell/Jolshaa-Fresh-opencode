import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchPosts } from '../lib/postsApi';
import Navbar from '../components/Navbar';
import SidebarLeft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import StoriesBar from '../components/StoriesBar';
import CreatePostBox from '../components/CreatePostBox';
import PostCard from '../components/PostCard';
import './NewsFeed.css';

export default function NewsFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPosts = async (pageNum = 0, append = false) => {
    try {
      const offset = pageNum * 10;
      const data = await fetchPosts(10, offset, user?.id || null);

      if (append) {
        setPosts(prev => [...prev, ...data]);
      } else {
        setPosts(data);
      }

      setHasMore(data.length === 10);
      setError(null);
    } catch (err) {
      console.error('Failed to load posts:', err);
      setError('পোস্ট লোড হয়নি। আবার চেষ্টা করো।');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadPosts(0, false);
  }, [user]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    loadPosts(nextPage, true);
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
      <Navbar messageCount={5} notificationCount={7} />

      <div className="page-body">
        <SidebarLeft userName={user?.full_name || 'ব্যবহারকারী'} />

        <main className="feed-center" aria-label="News Feed">
          <div className="feed-inner">
            <StoriesBar />

            <CreatePostBox onPostCreated={handlePostCreated} />

            {loading ? (
              <div className="feed-loading">
                <div className="feed-spinner"></div>
                <p>পোস্ট লোড হচ্ছে...</p>
              </div>
            ) : error ? (
              <div className="feed-error">
                <p>{error}</p>
                <button onClick={() => { setLoading(true); loadPosts(0, false); }}>
                  আবার চেষ্টা করো
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="feed-empty">
                <p>এখনো কোনো পোস্ট নেই। প্রথম পোস্ট করো!</p>
              </div>
            ) : (
              <>
                {posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}

                {hasMore && (
                  <div className="feed-load-more">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? 'লোড হচ্ছে...' : 'আরও দেখাও'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <SidebarRight />
      </div>
    </div>
  );
}
