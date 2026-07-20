import React, { useState } from 'react';
import { updateProfile } from '../../lib/profileApi';
import './ProfileSections.css';

const sectionItems = [{ id: 'about', label: 'পরিচিতি / About' }, { id: 'reels', label: 'রিলস / Reels' }, { id: 'photos', label: 'ছবি / Photos' }, { id: 'groups', label: 'গ্রুপ / Groups' }, { id: 'events', label: 'ইভেন্ট / Events' }, { id: 'checkins', label: 'চেক-ইন / Check-ins' }, { id: 'friends', label: 'বন্ধুরা / Friends' }];
export default function ManageSectionsModal({ profileData, onClose, onSaved }) {
  const [sections, setSections] = useState({ about: true, reels: true, photos: true, groups: true, events: true, checkins: true, friends: true, ...(profileData.visible_sections || {}) }); const [saving, setSaving] = useState(false);
  const save = async () => { setSaving(true); try { await updateProfile(profileData.id, { visible_sections: sections }); onSaved?.(sections); onClose?.(); } catch (err) { console.error('Failed to save visible sections:', err); } finally { setSaving(false); } };
  return <div className="manage-modal-backdrop" onMouseDown={onClose}><div className="manage-modal" onMouseDown={e => e.stopPropagation()}><div className="manage-modal-header"><h2>সেকশন পরিচালনা করো / Manage Sections</h2><button onClick={onClose}>×</button></div><p style={{ padding: '14px 20px 0', color: 'var(--text-light)' }}>প্রোফাইল থেকে সেকশন লুকাতে আনচেক করো / Uncheck to hide sections from your Profile</p><div className="manage-list">{sectionItems.map(item => <label className="manage-check" key={item.id}><input type="checkbox" checked={!!sections[item.id]} onChange={e => setSections({ ...sections, [item.id]: e.target.checked })} />{item.label}</label>)}</div><div className="manage-footer"><button className="section-secondary" onClick={onClose}>বাতিল করো / Cancel</button><button className="section-action" onClick={save} disabled={saving}>{saving ? 'সংরক্ষণ হচ্ছে... / Saving...' : 'সংরক্ষণ করো / Save'}</button></div></div></div>;
}
