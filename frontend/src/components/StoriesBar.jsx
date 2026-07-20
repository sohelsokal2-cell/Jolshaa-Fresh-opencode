import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createStory, fetchActiveStories, fetchViewedStoryIds, markStoryViewed } from '../lib/storiesApi';

const STORY_BACKGROUNDS = [
  'linear-gradient(145deg,#1B6B5A,#2a9678)',
  'linear-gradient(145deg,#7c3aed,#4c1d95)',
  'linear-gradient(145deg,#f97316,#dc2626)',
  'linear-gradient(145deg,#0891b2,#164e63)',
  'linear-gradient(145deg,#db2777,#7e22ce)',
];
const VIEWER_MS = 5000;

function groupStories(stories) {
  const grouped = new Map();
  stories.forEach(story => {
    const key = story.user_id;
    if (!grouped.has(key)) grouped.set(key, { user: story.author, stories: [] });
    grouped.get(key).stories.push(story);
  });
  return [...grouped.values()];
}

function storyBackground(story) {
  return story.media_url ? `url(${story.media_url}) center/cover` : story.background;
}

export default function StoriesBar() {
  const { user } = useAuth();
  const fileRef = useRef(null);
  const timerRef = useRef(null);
  const [stories, setStories] = useState([]);
  const [viewedIds, setViewedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComposer, setShowComposer] = useState(false);
  const [viewer, setViewer] = useState(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [background, setBackground] = useState(STORY_BACKGROUNDS[0]);
  const [saving, setSaving] = useState(false);

  const groups = useMemo(() => groupStories(stories), [stories]);
  const currentStory = viewer ? viewer.stories[storyIndex] : null;

  const loadStories = async () => {
    try {
      setError(null);
      const active = await fetchActiveStories();
      setStories(active);
      const viewed = await fetchViewedStoryIds(user?.id, active.map(story => story.id));
      setViewedIds(new Set(viewed));
    } catch (err) {
      console.error('Failed to load stories:', err);
      setError('Stories unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStories(); }, [user]);

  useEffect(() => {
    if (!mediaFile) {
      setMediaPreview(null);
      return undefined;
    }
    const previewUrl = URL.createObjectURL(mediaFile);
    setMediaPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [mediaFile]);

  const closeViewer = () => {
    clearTimeout(timerRef.current);
    setViewer(null);
    setStoryIndex(0);
  };

  const advance = (direction = 1) => {
    if (!viewer) return;
    if (storyIndex + direction < viewer.stories.length && storyIndex + direction >= 0) {
      setStoryIndex(index => index + direction);
      return;
    }
    const groupIndex = groups.indexOf(viewer);
    const nextGroup = groups[groupIndex + direction];
    if (nextGroup) {
      setViewer(nextGroup);
      setStoryIndex(direction > 0 ? 0 : nextGroup.stories.length - 1);
    } else {
      closeViewer();
    }
  };

  useEffect(() => {
    if (!currentStory || !viewer) return undefined;
    setViewedIds(prev => new Set([...prev, currentStory.id]));
    markStoryViewed(currentStory.id, user?.id).catch(err => console.error('Failed to mark story viewed:', err));
    timerRef.current = setTimeout(() => advance(1), VIEWER_MS);
    return () => clearTimeout(timerRef.current);
  }, [currentStory?.id, viewer]);

  const handleCreate = async () => {
    if (!user || (!content.trim() && !mediaFile)) return;
    setSaving(true);
    try {
      const story = await createStory(user.id, { content, mediaFile, background });
      setStories(prev => [story, ...prev]);
      setContent(''); setMediaFile(null); setShowComposer(false);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      console.error('Failed to create story:', err);
      setError(err.message || 'Could not create story');
    } finally { setSaving(false); }
  };

  return (
    <section className="stories-bar" aria-label="Stories">
      <div className="stories-bar-header">
        <div><span className="stories-bar-title-bn">স্টোরি</span><span className="stories-bar-title-en"> · Stories</span></div>
        <span className="stories-bar-title-en">{groups.length} people</span>
      </div>
      <div className="stories-scroll" role="list">
        <button className="story-card-yours" onClick={() => setShowComposer(true)} aria-label="Add your story">
          <div className="story-add-circle">+</div><div className="story-yours-label-bn">আপনার স্টোরি</div><div className="story-yours-label-en">Add story</div>
        </button>
        {loading && <div className="stories-empty">Loading stories...</div>}
        {!loading && !error && groups.length === 0 && <div className="stories-empty">No active stories yet.</div>}
        {error && <div className="stories-empty">{error}</div>}
        {groups.map((group, index) => {
          const name = group.user?.name || 'Unknown user';
          const unseen = group.stories.some(story => !viewedIds.has(story.id));
          const preview = group.stories[group.stories.length - 1];
          const openGroup = () => { setViewer(group); setStoryIndex(0); };
          return (
            <button key={group.user?.id || index} className={`story-card ${unseen ? 'fresh' : 'older'}`} onClick={openGroup} aria-label={`${name}'s stories`}>
              <div className="story-bg" style={{ height: '100%', background: storyBackground(preview) }} />
              <span className="story-freshness-dot" />
              <div className="story-overlay"><span className="story-name">{name}<small>{group.stories.length} {group.stories.length === 1 ? 'story' : 'stories'}</small></span></div>
            </button>
          );
        })}
      </div>

      {showComposer && <div className="story-modal-backdrop" onClick={() => setShowComposer(false)}><div className="story-modal" onClick={e => e.stopPropagation()}>
        <h3>Create story</h3><textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Share an update..." maxLength={500} />
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => {
          const file = e.target.files?.[0];
          if (file && file.type.startsWith('image/')) setMediaFile(file);
        }} />
        <div className="story-attachment-row">
          <button type="button" className="story-attach-btn" onClick={() => fileRef.current?.click()}>
            📷 Add photo
          </button>
          {mediaFile && <button type="button" className="story-remove-file" onClick={() => { setMediaFile(null); if (fileRef.current) fileRef.current.value = ''; }}>Remove</button>}
        </div>
        {mediaPreview && <img className="story-image-preview" src={mediaPreview} alt="Selected story preview" />}
        <div className="story-color-row">{STORY_BACKGROUNDS.map(bg => <button key={bg} aria-label="Choose background" style={{ background: bg }} onClick={() => setBackground(bg)} />)}</div>
        <div className="story-modal-actions"><button onClick={() => setShowComposer(false)}>Cancel</button><button onClick={handleCreate} disabled={saving || (!content.trim() && !mediaFile)}>{saving ? 'Posting...' : 'Post story'}</button></div>
      </div></div>}

      {currentStory && <div className="story-modal-backdrop story-viewer-backdrop" onClick={closeViewer}><div className="story-viewer" style={{ background: storyBackground(currentStory) }} onClick={e => e.stopPropagation()}>
        <div className="story-progress-row">{viewer.stories.map((story, index) => <span key={story.id} className={index <= storyIndex ? 'done' : ''}><i /></span>)}</div>
        <div className="story-viewer-head"><span>{viewer.user?.name || 'Story'}</span><button onClick={closeViewer}>×</button></div>
        <button className="story-nav story-nav-prev" onClick={() => advance(-1)} aria-label="Previous story">‹</button>
        {currentStory.content && <p>{currentStory.content}</p>}
        <button className="story-nav story-nav-next" onClick={() => advance(1)} aria-label="Next story">›</button>
      </div></div>}
    </section>
  );
}
