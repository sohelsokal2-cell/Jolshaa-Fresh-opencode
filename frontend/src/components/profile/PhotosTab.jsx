import React, { useEffect, useState } from 'react';
import { fetchUserPhotos } from '../../lib/photosApi';
import CreatePostModal from '../CreatePostModal';
import MediaLightbox from '../MediaLightbox';
import { useToast } from '../Toast';
import './ProfileSections.css';

export default function PhotosTab({ userId, isOwnProfile }) {
  const { showToast } = useToast(); const [photos, setPhotos] = useState([]); const [showComposer, setShowComposer] = useState(false); const [lightbox, setLightbox] = useState(null); const [albums, setAlbums] = useState(false);
  useEffect(() => { let cancelled = false; fetchUserPhotos(userId).then(data => { if (!cancelled) setPhotos(data); }).catch(err => console.error('Failed to load photos:', err)); return () => { cancelled = true; }; }, [userId]);
  return <div className="profile-section-main"><div className="section-head"><h2>ছবি / Photos</h2>{isOwnProfile && <button className="section-action" onClick={() => setShowComposer(true)}>ছবি/ভিডিও যোগ করো / Add Photos/Video</button>}</div><div className="section-tabs"><button className={`section-tab ${!albums ? 'active' : ''}`} onClick={() => setAlbums(false)}>তোমার ছবি / Your Photos</button><button className={`section-tab ${albums ? 'active' : ''}`} onClick={() => { setAlbums(true); showToast('শীঘ্রই আসছে / Coming soon'); }}>অ্যালবাম / Albums</button></div>{albums ? <div className="section-empty">শীঘ্রই আসছে / Coming soon</div> : photos.length === 0 ? <div className="section-empty">এখনো কোনো ছবি নেই / No photos yet</div> : <div className="section-grid">{photos.map(photo => <img key={photo.id} className="section-photo" src={photo.media_url} alt="Post media / পোস্টের ছবি" onClick={() => setLightbox({ media_url: photo.media_url, media_type: 'image' })} />)}</div>}{showComposer && <CreatePostModal isOpen={showComposer} openFilePicker onClose={() => setShowComposer(false)} onPostCreated={() => { setShowComposer(false); fetchUserPhotos(userId).then(setPhotos); }} />}{lightbox && <MediaLightbox media={[lightbox]} activeIndex={0} onChange={() => {}} onClose={() => setLightbox(null)} />}</div>;
}
