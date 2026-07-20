import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../lib/profileApi';

export default function EditProfileModal({ profileData, onClose, onUpdated }) {
  const { user } = useAuth();
  const [name, setName] = useState(profileData?.name || '');
  const [bio, setBio] = useState(profileData?.bio || '');
  const [location, setLocation] = useState(profileData?.location || '');
  const [work, setWork] = useState(profileData?.work || '');
  const [education, setEducation] = useState(profileData?.education || '');
  const [website, setWebsite] = useState(profileData?.website || '');
  const [phone, setPhone] = useState(profileData?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user?.id || saving) return;
    setSaving(true);
    try {
      await updateProfile(user.id, {
        name: name.trim(),
        bio: bio.trim() || null,
        location: location.trim() || null,
        work: work.trim() || null,
        education: education.trim() || null,
        website: website.trim() || null,
        phone: phone.trim() || null,
      });
      onUpdated?.();
    } catch (err) {
      console.error('Profile update failed:', err);
      alert('সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
        background: 'white', borderRadius: '16px', padding: '24px',
        width: '90%', maxWidth: '520px', maxHeight: '85vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-bn)', fontSize: '18px', fontWeight: 700, margin: 0 }}>
            প্রোফাইল সম্পাদনা
            <span style={{ fontFamily: 'var(--font-en)', fontSize: '13px', color: 'var(--text-light)', marginLeft: '8px', fontWeight: 400 }}>
              Edit Profile
            </span>
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-light)' }}>
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name */}
          <div>
            <label style={labelStyle}>নাম / Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              placeholder="তোমার নাম"
            />
          </div>

          {/* Bio */}
          <div>
            <label style={labelStyle}>বায়ো / Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
              placeholder="নিজের সম্পর্কে কিছু লিখুন..."
              maxLength={200}
            />
            <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-light)', marginTop: '2px' }}>
              {bio.length}/200
            </div>
          </div>

          {/* Location */}
          <div>
            <label style={labelStyle}>লোকেশন / Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={inputStyle}
              placeholder="যেমন: মাগুরা, খুলনা"
            />
          </div>

          {/* Work */}
          <div>
            <label style={labelStyle}>কর্মস্থল / Work</label>
            <input
              value={work}
              onChange={(e) => setWork(e.target.value)}
              style={inputStyle}
              placeholder="যেমন: TechBD Solutions"
            />
          </div>

          {/* Education */}
          <div>
            <label style={labelStyle}>শিক্ষা / Education</label>
            <input
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              style={inputStyle}
              placeholder="যেমন: Khulna University"
            />
          </div>

          {/* Website */}
          <div>
            <label style={labelStyle}>ওয়েবসাইট / Website</label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              style={inputStyle}
              placeholder="যেমন: sohel.dev.bd"
            />
          </div>

          {/* Phone */}
          <div>
            <label style={labelStyle}>ফোন / Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
              placeholder="যেমন: @sohel.digital"
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--border)',
              background: 'var(--off-white)', cursor: 'pointer', fontFamily: 'var(--font-bn)', fontSize: '14px',
            }}
          >
            বাতিল
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            style={{
              padding: '10px 24px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, var(--teal), var(--teal-light))',
              color: 'white', fontWeight: 700, cursor: saving ? 'wait' : 'pointer',
              fontFamily: 'var(--font-bn)', fontSize: '14px', opacity: saving || !name.trim() ? 0.6 : 1,
            }}
          >
            {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করো / Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontFamily: 'var(--font-bn)', fontSize: '13px', fontWeight: 600,
  marginBottom: '4px', color: 'var(--text)',
};

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)',
  fontSize: '14px', fontFamily: 'var(--font-bn)', outline: 'none', boxSizing: 'border-box',
};
