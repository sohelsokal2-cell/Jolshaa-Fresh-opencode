import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPost } from '../lib/postsApi';
import { useToast } from './Toast';

export default function CreatePostBox({ onPostCreated }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userName = user?.full_name || user?.user_metadata?.full_name || 'ব্যবহারকারী';

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('ছবির সাইজ ৫MB-এর কম হতে হবে।');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) return;

    setIsSubmitting(true);
    try {
      const newPost = await createPost(content.trim(), imageFile, user.id);
      onPostCreated(newPost);
      setContent('');
      removeImage();
      setIsExpanded(false);
      showToast('পোস্ট তৈরি হয়েছে! / Post created!');
    } catch (err) {
      console.error('Post creation error:', err);
      showToast('পোস্ট তৈরি করা যায়নি। আবার চেষ্টা করো।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="create-post" aria-label="Create a post">
      <div className="create-post-top">
        <div className="create-avatar" aria-hidden="true">
          {userName.charAt(0)}
        </div>
        {!isExpanded ? (
          <button
            className="create-input"
            onClick={() => setIsExpanded(true)}
            aria-label="What's on your mind?"
          >
            কী মনে হচ্ছে, {userName.split(' ')[0]}?
          </button>
        ) : (
          <div className="create-input-expanded">
            <textarea
              className="create-textarea"
              placeholder={`কী মনে হচ্ছে, ${userName.split(' ')[0]}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
              rows={3}
            />
          </div>
        )}
      </div>

      {isExpanded && imagePreview && (
        <div className="create-image-preview">
          <img src={imagePreview} alt="Preview" />
          <button className="remove-image-btn" onClick={removeImage} aria-label="Remove image">
            ×
          </button>
        </div>
      )}

      <div className="create-divider"></div>
      <div className="create-actions">
        <button
          className="create-action-btn"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Add Photo/Video"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span>
            ছবি/ভিডিও{' '}
            <span style={{ fontFamily: 'var(--font-en)', fontSize: '10px', color: 'var(--text-light)', display: 'block', marginTop: '1px' }}>
              Photo/Video
            </span>
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageSelect}
        />

        <button
          className="create-action-btn"
          onClick={() => navigate('/sahajjo')}
          aria-label="Request Help"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>
            🆘 সাহায্য চাই{' '}
            <span style={{ fontFamily: 'var(--font-en)', fontSize: '9px', fontWeight: 400, display: 'block', marginTop: '1px' }}>
              Request Help
            </span>
          </span>
        </button>

        {isExpanded && (
          <button
            className="create-submit-btn"
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && !imageFile)}
            style={{
              marginLeft: 'auto',
              padding: '6px 16px',
              borderRadius: '8px',
              border: 'none',
              background: content.trim() || imageFile ? 'var(--teal)' : '#ccc',
              color: '#fff',
              fontFamily: 'var(--font-bn)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: content.trim() || imageFile ? 'pointer' : 'not-allowed',
            }}
          >
            {isSubmitting ? 'পোস্ট হচ্ছে...' : 'পোস্ট করো'}
          </button>
        )}
      </div>
    </section>
  );
}
