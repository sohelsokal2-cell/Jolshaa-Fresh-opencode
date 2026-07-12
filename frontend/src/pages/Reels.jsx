import React, { useState, useCallback } from 'react';
import DarkNavbar from '../components/DarkNavbar';
import ReelsSidebar from '../components/ReelsSidebar';
import ReelVideoFrame from '../components/ReelVideoFrame';
import ReelActionColumn from '../components/ReelActionColumn';
import ReelPreviewStrip from '../components/ReelPreviewStrip';
import './Reels.css';

const DEMO_REELS = [
  {
    id: 1,
    creator: { name: 'প্রিয়া রানী দাস', handle: '@priya.foodie.bd', avatar: 'প্র' },
    caption: 'ঢাকার সেরা ঝালমুড়ি! 🌶️ এই স্বাদ একবার খেলে ভুলতে পারবেন না।',
    audioName: 'Original Audio — প্রিয়া রানী দাস',
    viewerCount: '৪.২K দেখছেন · watching',
    likeCount: '১৮.৪K',
    commentCount: '৩.২K',
    shareCount: '৮৪৭',
    starCount: '১২',
  },
  {
    id: 2,
    creator: { name: 'তানভীর আহমেদ', handle: '@tanvir.reels', avatar: 'ত' },
    caption: 'চট্টগ্রামের সমুদ্র সৈকত — সূর্যাস্তের জাদু! 🌅',
    audioName: 'Trending Audio — Tanvir',
    viewerCount: '২.৮K দেখছেন · watching',
    likeCount: '১২.১K',
    commentCount: '১.৮K',
    shareCount: '৫২৩',
    starCount: '৮',
  },
];

export default function Reels() {
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const currentReel = DEMO_REELS[currentReelIndex];

  const handleNavigateUp = useCallback(() => {
    setCurrentReelIndex((prev) => (prev > 0 ? prev - 1 : DEMO_REELS.length - 1));
  }, []);

  const handleNavigateDown = useCallback(() => {
    setCurrentReelIndex((prev) => (prev < DEMO_REELS.length - 1 ? prev + 1 : 0));
  }, []);

  return (
    <>
      <DarkNavbar />
      <div className="reels-body">
        <ReelsSidebar />
        <main className="reels-center" aria-label="Reels video feed">
          <div className="video-and-actions">
            <ReelVideoFrame
              creator={currentReel.creator}
              caption={currentReel.caption}
              audioName={currentReel.audioName}
              viewerCount={currentReel.viewerCount}
              onNavigateUp={handleNavigateUp}
              onNavigateDown={handleNavigateDown}
            />
            <ReelActionColumn
              creator={currentReel.creator}
              likeCount={currentReel.likeCount}
              commentCount={currentReel.commentCount}
              shareCount={currentReel.shareCount}
              starCount={currentReel.starCount}
            />
          </div>
          <ReelPreviewStrip />
        </main>
      </div>
    </>
  );
}
