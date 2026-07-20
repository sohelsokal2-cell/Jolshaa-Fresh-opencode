import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreatePostModal from './CreatePostModal';
import LiveVideoModal from './LiveVideoModal';

export default function CreatePostBox({ onPostCreated }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openFilePicker, setOpenFilePicker] = useState(false);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const userName = user?.full_name || user?.user_metadata?.full_name || 'ব্যবহারকারী';

  const openComposer = useCallback((withFilePicker = false) => {
    setOpenFilePicker(withFilePicker);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setOpenFilePicker(false);
  }, []);

  const openWithFile = useCallback(() => openComposer(true), [openComposer]);
  const openDefault = useCallback(() => openComposer(false), [openComposer]);
  const goToSahajjo = useCallback(() => navigate('/sahajjo'), [navigate]);
  const openLive = useCallback(() => setIsLiveModalOpen(true), []);
  const closeLive = useCallback(() => setIsLiveModalOpen(false), []);

  return (
    <>
      <section className="create-post" aria-label="Create a post">
        <div className="create-post-top">
          <div className="create-avatar" aria-hidden="true">{userName.charAt(0)}</div>
          <button className="create-input" onClick={openDefault} aria-label="What's on your mind?">
            কী মনে হচ্ছে, {userName.split(' ')[0]}?
          </button>
        </div>
        <div className="create-divider" />
        <div className="create-actions">
          <button className="create-action-btn" onClick={openWithFile} aria-label="Add Photo/Video">📷 <span>ছবি/ভিডিও <small>Photo/Video</small></span></button>
          <button className="create-action-btn" onClick={openDefault} aria-label="Feeling or Activity">😊 <span>অনুভূতি <small>Feeling/Activity</small></span></button>
          <button className="create-action-btn" onClick={goToSahajjo} aria-label="Request Help">🆘 <span>সাহায্য চাই <small>Request Help</small></span></button>
        </div>
      </section>
      <CreatePostModal
        isOpen={isModalOpen}
        openFilePicker={openFilePicker}
        onClose={closeModal}
        onPostCreated={onPostCreated}
        onLiveVideo={openLive}
      />
      <LiveVideoModal isOpen={isLiveModalOpen} onClose={closeLive} />
    </>
  );
}
