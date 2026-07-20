import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { createPost, searchProfiles } from '../lib/postsApi';
import { useToast } from './Toast';
import './CreatePostModal.css';

const MAX_FILE_SIZE = 100 * 1024 * 1024;

export default function CreatePostModal({ isOpen, onClose, onPostCreated, onLiveVideo, openFilePicker = false }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [privacy, setPrivacy] = useState('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOption, setActiveOption] = useState(null);
  const [feeling, setFeeling] = useState('');
  const [locationName, setLocationName] = useState('');
  const [lifeUpdate, setLifeUpdate] = useState('');
  const [gifUrl, setGifUrl] = useState('');
  const [tagQuery, setTagQuery] = useState('');
  const [tagResults, setTagResults] = useState([]);
  const [taggedUsers, setTaggedUsers] = useState([]);

  const userName = user?.full_name || user?.user_metadata?.full_name || 'User';
  const previews = useMemo(() => files.map(file => ({ file, url: URL.createObjectURL(file) })), [files]);

  useEffect(() => () => previews.forEach(preview => URL.revokeObjectURL(preview.url)), [previews]);
  useEffect(() => {
    if (isOpen && openFilePicker) setTimeout(() => fileInputRef.current?.click(), 0);
  }, [isOpen, openFilePicker]);

  const handleFiles = event => {
    const selected = Array.from(event.target.files || []);
    const valid = selected.filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));
    const tooLarge = valid.find(file => file.size > MAX_FILE_SIZE);
    if (tooLarge) {
      showToast('প্রতিটি image/video file 100MB-এর কম হতে হবে।');
      event.target.value = '';
      return;
    }
    if (valid.length !== selected.length) showToast('শুধু image অথবা video file ব্যবহার করুন।');
    setFiles(prev => [...prev, ...valid].slice(0, 10));
    event.target.value = '';
  };

  const handleContentChange = event => {
    setContent(event.target.value);
    event.target.style.height = 'auto';
    event.target.style.height = `${Math.min(event.target.scrollHeight, 260)}px`;
  };

  const removeFile = index => setFiles(prev => prev.filter((_, itemIndex) => itemIndex !== index));

  useEffect(() => {
    if (activeOption !== 'tag' || tagQuery.trim().length < 2) { setTagResults([]); return undefined; }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try { const results = await searchProfiles(tagQuery.trim(), user?.id); if (!cancelled) setTagResults(results); }
      catch (err) { console.error('Profile search failed:', err); }
    }, 250);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [activeOption, tagQuery, user?.id]);

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0 && !feeling && !locationName && !lifeUpdate && !gifUrl) return;
    setIsSubmitting(true);
    try {
      const postType = files.some(file => file.type.startsWith('video/')) ? 'video' : files.length ? 'photo' : 'text';
      const post = await createPost(content.trim(), files, postType, user?.id, { feeling, locationName, lifeUpdate, gifUrl, taggedUserIds: taggedUsers.map(item => item.id) });
      onPostCreated?.(post);
      setContent(''); setFiles([]); setPrivacy('public'); setFeeling(''); setLocationName(''); setLifeUpdate(''); setGifUrl(''); setTagQuery(''); setTaggedUsers([]); setActiveOption(null);
      onClose?.();
      showToast('পোস্ট তৈরি হয়েছে! / Post created!');
    } catch (err) {
      console.error('Post creation failed:', err);
      showToast('পোস্ট করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;
  return createPortal(
    <div className="create-post-modal-backdrop" onMouseDown={onClose}>
      <div className="create-post-modal" onMouseDown={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Create Post">
        <div className="create-post-modal-header"><h2>পোস্ট তৈরি করো <span>/ Create Post</span></h2><button onClick={onClose} aria-label="Close">×</button></div>
        <div className="create-post-user-row">
          <div className="create-avatar">{userName.charAt(0)}</div>
          <div><strong>{userName}</strong><select value={privacy} onChange={event => setPrivacy(event.target.value)}><option value="public">সবার জন্য / Public</option><option value="friends">বন্ধুদের জন্য / Friends</option><option value="only_me">শুধু আমি / Only me</option></select></div>
        </div>
        <textarea ref={textareaRef} className="create-post-modal-textarea" value={content} onChange={handleContentChange} placeholder={`কী মনে হচ্ছে, ${userName.split(' ')[0]}?`} autoFocus />
        {previews.length > 0 && <div className={`create-media-grid media-count-${Math.min(previews.length, 4)}`}>
          {previews.slice(0, 4).map((preview, index) => <div className="create-media-preview" key={`${preview.file.name}-${index}`}>
            {preview.file.type.startsWith('video/') ? <><video src={preview.url} muted /><span className="media-play">▶</span></> : <img src={preview.url} alt="Selected preview" />}
            <button onClick={() => removeFile(index)} aria-label="Remove media">×</button>
            {index === 3 && previews.length > 4 && <span className="media-more">+{previews.length - 4}</span>}
          </div>)}
        </div>}
        <input ref={fileInputRef} hidden type="file" accept="image/*,video/*" multiple onChange={handleFiles} />
        {activeOption === 'feeling' && <div className="composer-option-panel"><label>Feeling / Activity<select value={feeling} onChange={e => setFeeling(e.target.value)}><option value="">Choose one</option><option>😊 Feeling happy</option><option>🥳 Celebrating</option><option>❤️ In love</option><option>😢 Feeling sad</option><option>💪 Motivated</option></select></label></div>}
        {activeOption === 'location' && <div className="composer-option-panel"><label>Check in<input value={locationName} onChange={e => setLocationName(e.target.value)} placeholder="Where are you?" /></label></div>}
        {activeOption === 'life' && <div className="composer-option-panel"><label>Life update<select value={lifeUpdate} onChange={e => setLifeUpdate(e.target.value)}><option value="">Choose an update</option><option>Started a new job</option><option>Moved to a new place</option><option>Celebrating a milestone</option><option>Travelling</option></select></label></div>}
        {activeOption === 'gif' && <div className="composer-option-panel"><label>GIF URL<input value={gifUrl} onChange={e => setGifUrl(e.target.value)} placeholder="Paste a GIF link" /></label>{gifUrl && <img className="composer-gif-preview" src={gifUrl} alt="GIF preview" />}</div>}
        {activeOption === 'tag' && <div className="composer-option-panel"><label>Tag people<input value={tagQuery} onChange={e => setTagQuery(e.target.value)} placeholder="Search a person" /></label>{tagResults.map(person => <button className="tag-result" key={person.id} onClick={() => { setTaggedUsers(prev => prev.some(item => item.id === person.id) ? prev : [...prev, person]); setTagQuery(''); setTagResults([]); }}>{person.name}</button>)}{taggedUsers.length > 0 && <div className="tagged-list">Tagged: {taggedUsers.map(person => <span key={person.id}>{person.name} <button onClick={() => setTaggedUsers(prev => prev.filter(item => item.id !== person.id))}>×</button></span>)}</div>}</div>}
        <div className="create-post-action-row"><span>পোস্টে যোগ করো / Add to your post</span><button onClick={() => fileInputRef.current?.click()}>📷 Photo/Video</button><button onClick={() => setActiveOption(activeOption === 'tag' ? null : 'tag')}>👥 Tag people</button><button onClick={() => setActiveOption(activeOption === 'feeling' ? null : 'feeling')}>😊 Feeling/Activity</button><button onClick={() => setActiveOption(activeOption === 'location' ? null : 'location')}>📍 Check in</button><button onClick={() => setActiveOption(activeOption === 'gif' ? null : 'gif')}>GIF</button><button onClick={() => setActiveOption(activeOption === 'life' ? null : 'life')}>🚩 Life update</button><button onClick={() => { onClose?.(); onLiveVideo?.(); }}>🔴 Live video</button></div>
        <div className="create-post-modal-footer"><small>{files.length > 0 ? `${files.length} media selected` : 'Text, photo বা video post করুন'}</small><button className="create-post-submit" onClick={handleSubmit} disabled={isSubmitting || (!content.trim() && files.length === 0 && !feeling && !locationName && !lifeUpdate && !gifUrl)}>{isSubmitting ? 'পোস্ট হচ্ছে...' : 'পোস্ট করো / Post'}</button></div>
      </div>
    </div>,
    document.body,
  );
}
