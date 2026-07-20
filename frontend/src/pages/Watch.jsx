import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import WatchSidebar from '../components/WatchSidebar';
import MoodFilterStrip from '../components/MoodFilterStrip';
import FeaturedVideoCard from '../components/FeaturedVideoCard';
import VideoCard from '../components/VideoCard';
import SuggestedVideosSidebar from '../components/SuggestedVideosSidebar';
import { fetchVideos, uploadVideo, incrementView } from '../lib/watchApi';
import './Watch.css';

const Watch = () => {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState('foryou');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeMood, setActiveMood] = useState('all');

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadVideoFile, setUploadVideoFile] = useState(null);
  const [uploadThumbnail, setUploadThumbnail] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  // Track which videos the user has already viewed (client-side session flag)
  const viewedSessionRef = useRef(new Set());

  const loadVideos = useCallback(async (pageNum = 0, append = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchVideos(activeNav, pageNum, user?.id);
      if (append) {
        setVideos(prev => [...prev, ...data]);
      } else {
        setVideos(data);
      }
      setHasMore(data.length === 12);
    } catch (err) {
      console.error('Failed to load videos:', err);
      setError('ভিডিও লোড করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  }, [activeNav]);

  useEffect(() => {
    setPage(0);
    loadVideos(0, false);
  }, [loadVideos]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadVideos(nextPage, true);
  };

  const handleVideoPlay = useCallback(async (videoId) => {
    if (viewedSessionRef.current.has(videoId)) return;
    viewedSessionRef.current.add(videoId);
    try {
      await incrementView(videoId, user?.id || null);
      setVideos(prev => prev.map(v =>
        v.id === videoId ? { ...v, view_count: (v.view_count || 0) + 1 } : v
      ));
    } catch (err) {
      console.error('View increment failed:', err);
    }
  }, [user]);

  const handleUpload = async () => {
    if (!uploadVideoFile || !uploadTitle.trim()) return;
    if (!user) {
      alert('আপলোড করতে লগইন করুন।');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress('ভিডিও আপলোড হচ্ছে...');
      const newVideo = await uploadVideo(
        user.id,
        uploadTitle.trim(),
        uploadDesc.trim(),
        uploadVideoFile,
        uploadThumbnail
      );
      setVideos(prev => [newVideo, ...prev]);
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadDesc('');
      setUploadVideoFile(null);
      setUploadThumbnail(null);
      setUploadProgress('');
    } catch (err) {
      console.error('Upload failed:', err);
      alert(`আপলোড ব্যর্থ: ${err.message}`);
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const featuredVideo = videos.length > 0 ? {
    ...videos[0],
    creator: videos[0].uploaderName,
    creatorAvatar: videos[0].uploaderName?.charAt(0) || '?',
    creatorColor: '#1B6B5A',
    views: `${videos[0].view_count || 0} ভিউ`,
    time: new Date(videos[0].created_at).toLocaleDateString('bn-BD'),
    duration: videos[0].duration_seconds
      ? `${Math.floor(videos[0].duration_seconds / 60)}:${String(videos[0].duration_seconds % 60).padStart(2, '0')}`
      : null,
    emoji: '▶️',
    bgGradient: 'linear-gradient(140deg, #1a4a3a 0%, #0f2e24 40%, #1B6B5A 70%, #1a3a2a 100%)',
  } : null;

  const gridVideos = videos.slice(1).map(v => ({
    ...v,
    creator: v.uploaderName,
    creatorAvatar: v.uploaderName?.charAt(0) || '?',
    creatorColor: '#1B6B5A',
    views: `${v.view_count || 0} ভিউ`,
    time: new Date(v.created_at).toLocaleDateString('bn-BD'),
    duration: v.duration_seconds
      ? `${Math.floor(v.duration_seconds / 60)}:${String(v.duration_seconds % 60).padStart(2, '0')}`
      : null,
    emoji: '▶️',
    bgGradient: 'linear-gradient(140deg, #1a4a3a, #2a6a4a, #1a5a3a)',
    verified: false,
    live: v.is_live,
  }));

  return (
    <div className="watch-page-body">
      <Navbar messageCount={5} notificationCount={7} />

      <WatchSidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onUploadClick={() => setShowUploadModal(true)}
      />

      <main className="main-content">
        {loading && videos.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-light)' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
            <div>ভিডিও লোড হচ্ছে...</div>
          </div>
        ) : error ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#ef4444' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
            <div>{error}</div>
            <button
              onClick={() => loadVideos(0, false)}
              style={{
                marginTop: '12px', padding: '8px 20px', background: 'var(--teal)',
                color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'
              }}
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : (
          <>
            {featuredVideo && <FeaturedVideoCard video={featuredVideo} />}

            <div className="section-hdr">
              <div>
                <div className="sh-title-bn">জনপ্রিয় ভিডিও</div>
                <div className="sh-title-en">Popular Videos</div>
              </div>
              <button
                className="btn-see-all"
                onClick={() => setShowUploadModal(true)}
              >
                📤 আপলোড <span>→</span>
              </button>
            </div>

            <MoodFilterStrip activeMood={activeMood} onMoodChange={setActiveMood} />

            {gridVideos.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-light)' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎬</div>
                <div>এখনো কোনো ভিডিও নেই। প্রথম ভিডিও আপলোড করুন!</div>
              </div>
            ) : (
              <div className="video-grid">
                {gridVideos.map((video, index) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    wide={index === 0 || index === 4}
                    onPlay={handleVideoPlay}
                  />
                ))}
              </div>
            )}

            {hasMore && gridVideos.length > 0 && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  style={{
                    padding: '10px 28px', background: 'var(--teal)', color: 'white',
                    border: 'none', borderRadius: '10px', cursor: loading ? 'default' : 'pointer',
                    opacity: loading ? 0.6 : 1, fontSize: '13px'
                  }}
                >
                  {loading ? 'লোড হচ্ছে...' : 'আরও দেখুন'}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <SuggestedVideosSidebar />

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="modal-overlay"
          onClick={() => !uploading && setShowUploadModal(false)}
        >
          <div
            className="modal-box"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="modal-title">
              📤 নতুন ভিডিও আপলোড করুন
            </h3>

            <div className="modal-section">
              <label className="modal-label">
                ভিডিও ফাইল * <span className="modal-label-hint">(সর্বোচ্চ 50MB)</span>
              </label>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={e => setUploadVideoFile(e.target.files?.[0] || null)}
                style={{ width: '100%', fontSize: '13px' }}
              />
              {uploadVideoFile && (
                <div className="modal-file-info">
                  {uploadVideoFile.name} ({(uploadVideoFile.size / (1024 * 1024)).toFixed(1)}MB)
                </div>
              )}
            </div>

            <div className="modal-section">
              <label className="modal-label">
                শিরোনাম *
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={e => setUploadTitle(e.target.value)}
                placeholder="ভিডিওর শিরোনাম লিখুন"
                className="modal-input"
              />
            </div>

            <div className="modal-section">
              <label className="modal-label">
                বিবরণ
              </label>
              <textarea
                value={uploadDesc}
                onChange={e => setUploadDesc(e.target.value)}
                placeholder="ভিডিও সম্পর্কে কিছু লিখুন..."
                rows={3}
                className="modal-textarea"
              />
            </div>

            <div className="modal-section-last">
              <label className="modal-label">
                থাম্বনেইল <span className="modal-label-hint">(ঐচ্ছিক, সর্বোচ্চ 5MB)</span>
              </label>
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                onChange={e => setUploadThumbnail(e.target.files?.[0] || null)}
                style={{ width: '100%', fontSize: '13px' }}
              />
            </div>

            {uploadProgress && (
              <div className="modal-progress">
                {uploadProgress}
              </div>
            )}

            <div className="modal-actions">
              <button
                onClick={() => !uploading && setShowUploadModal(false)}
                disabled={uploading}
                className="modal-btn-cancel"
              >
                বাতিল
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !uploadVideoFile || !uploadTitle.trim()}
                className="modal-btn-teal"
              >
                {uploading ? 'আপলোড হচ্ছে...' : 'আপলোড করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Watch;
