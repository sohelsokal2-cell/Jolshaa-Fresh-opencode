import React, { useEffect, useState } from 'react';
import { fetchVideos } from '../../lib/watchApi';
import './ProfileSections.css';

export default function ReelsTab({ userId, isOwnProfile }) {
  const [reels, setReels] = useState([]); const [saved, setSaved] = useState(false);
  useEffect(() => { let cancelled = false; fetchVideos('yourvideos', 0, userId).then(data => { if (!cancelled) setReels(data); }).catch(err => console.error('Failed to load profile reels:', err)); return () => { cancelled = true; }; }, [userId]);
  return <div className="profile-section-main"><div className="section-head"><h2>রিলস / Reels</h2>{isOwnProfile && <button className="section-action" onClick={() => alert('শীঘ্রই আসছে / Coming soon')}>রিল তৈরি করো / Create reel</button>}</div><div className="section-tabs"><button className={`section-tab ${!saved ? 'active' : ''}`} onClick={() => setSaved(false)}>তোমার রিলস / Your Reels</button><button className={`section-tab ${saved ? 'active' : ''}`} onClick={() => setSaved(true)}>সংরক্ষিত রিলস / Saved reels</button></div>{saved ? <div className="section-empty">শীঘ্রই আসছে / Coming soon</div> : reels.length === 0 ? <div className="section-empty">এখনো কোনো রিল নেই / No reels yet</div> : <div className="section-grid">{reels.map(reel => <video key={reel.id} className="section-photo" src={reel.video_url} controls muted />)}</div>}</div>;
}
