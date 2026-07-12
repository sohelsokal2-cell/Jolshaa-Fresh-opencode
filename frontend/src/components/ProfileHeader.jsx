import React, { useState } from 'react';
import coverPhoto from '../assets/profile_cover_photo_1783610015722.png';

export default function ProfileHeader({
  name = 'Md Sohel',
  nameBn = 'মোঃ সোহেল',
  avatarChar = 'স',
  creatorBadgeText = 'Digital Creator · ডিজিটাল ক্রিয়েটর',
  bio = 'স্বপ্ন দেখি, তৈরি করি, ভাগ করি — জীবনের রঙিন মুহূর্তগুলো।',
  stats = { followers: '৩৬৬', following: '২৪', friends: '৮৯' },
  meta = {
    livesIn: 'মাগুরা',
    livesInEn: 'Lives in Magura',
    from: 'খুলনা',
    fromEn: 'From Khulna'
  },
  onDashboardClick,
  onEditProfileClick,
  onMoreOptionsClick
}) {
  const [coverTextState, setCoverTextState] = useState('default'); // 'default' | 'updated'
  const [avOutlineGlow, setAvOutlineGlow] = useState(false);

  const handleCoverClick = () => {
    setCoverTextState('updated');
    setTimeout(() => {
      setCoverTextState('default');
    }, 2000);
  };

  const handleAvatarClick = () => {
    setAvOutlineGlow(true);
    setTimeout(() => {
      setAvOutlineGlow(false);
    }, 800);
  };

  return (
    <div className="profile-header-wrap">
      {/* Cover Photo */}
      <div className="cover-photo-wrap" role="img" aria-label="প্রোফাইল কভার ফটো — নদীর দৃশ্য">
        <img
          src={coverPhoto}
          className="cover-photo-img"
          alt="Cover photo — Bangladesh river at golden hour"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className="cover-bottom-fade"></div>

        {/* Edit cover button — frosted glass pill */}
        <button
          className="edit-cover-btn"
          aria-label="কভার ছবি পরিবর্তন করুন / Edit cover photo"
          onClick={handleCoverClick}
        >
          {coverTextState === 'updated' ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <div>
                <div>পরিবর্তন হয়েছে</div>
                <span className="edit-cover-btn-en">Cover updated!</span>
              </div>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <div>
                <div>কভার পরিবর্তন</div>
                <span className="edit-cover-btn-en">Edit cover photo</span>
              </div>
            </>
          )}
        </button>
      </div>

      {/* Profile Info Bar */}
      <div className="profile-info-bar">
        {/* Avatar + Name + Actions row */}
        <div className="profile-av-row">
          {/* Avatar with teal ring */}
          <div className="profile-av-wrap" role="img" aria-label={`${name}-এর প্রোফাইল ছবি`}>
            <div
              className="profile-av"
              title="প্রোফাইল ছবি পরিবর্তন করুন"
              onClick={handleAvatarClick}
              style={{
                outline: avOutlineGlow ? '4px solid var(--teal-light)' : '4px solid var(--teal-ring)'
              }}
            >
              {avatarChar}
            </div>
            <button className="profile-av-edit" aria-label="প্রোফাইল ছবি পরিবর্তন / Edit profile photo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </button>
          </div>

          {/* Name + bio + stats */}
          <div className="profile-name-actions">
            <div className="profile-name-group">
              <h1 className="profile-name">{name}</h1>
              <div className="profile-name-bn">{nameBn}</div>

              {/* Creator badge */}
              <div className="creator-badge">
                <span className="creator-badge-dot"></span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                {creatorBadgeText}
              </div>

              {/* Bio */}
              <p className="profile-bio">{bio}</p>

              {/* Stat chips */}
              <div className="stat-chips">
                <a href="#" className="stat-chip" aria-label={`${stats.followers} ফলোয়ার`}>
                  <span className="stat-chip-num">{stats.followers}</span>
                  <span className="stat-chip-label-bn">ফলোয়ার</span>
                  <span className="stat-chip-label-en">Followers</span>
                </a>
                <span className="stat-divider" aria-hidden="true"></span>
                <a href="#" className="stat-chip" aria-label={`${stats.following} ফলো করছেন`}>
                  <span className="stat-chip-num">{stats.following}</span>
                  <span className="stat-chip-label-bn">ফলো করছেন</span>
                  <span className="stat-chip-label-en">Following</span>
                </a>
                <span className="stat-divider" aria-hidden="true"></span>
                <a href="#" className="stat-chip" aria-label={`${stats.friends} বন্ধু`}>
                  <span className="stat-chip-num">{stats.friends}</span>
                  <span className="stat-chip-label-bn">বন্ধু</span>
                  <span className="stat-chip-label-en">Friends</span>
                </a>
              </div>

              {/* Meta row */}
              <div className="profile-meta">
                <div className="profile-meta-item">
                  <span className="meta-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </span>
                  <span className="meta-text-bn">থাকেন <strong style={{ color: 'var(--teal)' }}>{meta.livesIn}</strong>-তে</span>
                  <span className="meta-text-en">· {meta.livesInEn}</span>
                </div>
                <div className="profile-meta-item">
                  <span className="meta-icon" style={{ color: 'var(--gold)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </span>
                  <span className="meta-text-bn">থেকে এসেছেন <strong style={{ color: 'var(--gold)' }}>{meta.from}</strong></span>
                  <span className="meta-text-en">· {meta.fromEn}</span>
                </div>
              </div>
            </div>

            {/* Action buttons group */}
            <div className="profile-actions">
              {/* Dashboard */}
              <button
                className="btn-secondary"
                aria-label="ড্যাশবোর্ড / Creator Dashboard"
                onClick={onDashboardClick}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                </svg>
                <div>
                  <div>ড্যাশবোর্ড</div>
                  <span className="btn-secondary-en">Dashboard</span>
                </div>
              </button>

              {/* Edit Profile */}
              <button
                className="btn-primary"
                aria-label="প্রোফাইল সম্পাদনা / Edit Profile"
                onClick={onEditProfileClick}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                <div>
                  <div>সম্পাদনা</div>
                  <span className="btn-primary-en">Edit Profile</span>
                </div>
              </button>

              {/* More options */}
              <button
                className="btn-ghost"
                aria-label="আরও বিকল্প / More options"
                onClick={onMoreOptionsClick}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="2"/>
                  <circle cx="12" cy="12" r="2"/>
                  <circle cx="19" cy="12" r="2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
