import React, { useState } from 'react';
import { updateProfile } from '../../lib/profileApi';
import './ProfileSections.css';

const sections = [
  { id: 'intro', label: 'পরিচিতি / Intro' },
  { id: 'personal', label: 'ব্যক্তিগত তথ্য / Personal details' },
  { id: 'links', label: 'লিংক / Links' },
  { id: 'work', label: 'কর্মস্থল / Work' },
  { id: 'education', label: 'শিক্ষা / Education' },
  { id: 'hobbies', label: 'শখ / Hobbies' },
  { id: 'interests', label: 'আগ্রহ / Interests' },
  { id: 'travel', label: 'ভ্রমণ / Travel' },
  { id: 'contact', label: 'যোগাযোগ / Contact info' },
  { id: 'privacy', label: 'গোপনীয়তা ও আইনি তথ্য / Privacy and legal info' },
];

const visibilityOptions = [
  ['public', 'সবার জন্য / Public'],
  ['friends', 'বন্ধুরা / Friends'],
  ['friends_of_friends', 'বন্ধুদের বন্ধুরা / Friends of friends'],
  ['only_me', 'শুধু আমি / Only me'],
  ['custom', 'কাস্টম / Custom'],
];

const fieldFor = id => ({ links: 'links', work: 'work', education: 'education', hobbies: 'hobbies', interests: 'interests', travel: 'travel', contact: 'contact' }[id]);

export default function AboutTab({ profileData, isOwnProfile, onUpdated }) {
  const [active, setActive] = useState('intro');
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [visibility, setVisibility] = useState('public');
  const extended = profileData.extended_info || {};
  const currentKey = fieldFor(active) || (active === 'intro' ? 'bio' : active === 'personal' ? 'personal' : null);
  const currentValue = currentKey === 'bio'
    ? profileData.bio || ''
    : currentKey === 'personal'
      ? extended.personal || ''
      : currentKey ? (extended[currentKey] || profileData[currentKey] || '') : '';
  const currentVisibility = visibility;

  const beginEdit = () => {
    setValue(currentValue);
    setEditing(true);
  };

  const save = async () => {
    const next = { ...extended, visibility: { ...(extended.visibility || {}), [active]: visibility } };
    if (currentKey && currentKey !== 'bio') next[currentKey] = value;
    const updates = { extended_info: next };
    if (currentKey === 'bio') updates.bio = value;
    await updateProfile(profileData.id, updates);
    setEditing(false);
    onUpdated?.();
  };

  const handleVisibilityChange = event => setVisibility(event.target.value);

  const activeLabel = sections.find(item => item.id === active)?.label || '';
  const activeEnglish = activeLabel.split(' / ')[1]?.toLowerCase() || 'information';

  return <div className="profile-section-layout">
    <aside className="profile-section-sidebar">
      <h2>পরিচিতি / About</h2>
      {sections.map(section => <button key={section.id} className={`section-nav-btn ${active === section.id ? 'active' : ''}`} onClick={() => { setActive(section.id); setVisibility(extended.visibility?.[section.id] || 'public'); setEditing(false); }}>{section.label}</button>)}
    </aside>
    <main className="profile-section-main">
      <div className="section-head">
        <h2>{activeLabel}</h2>
        {isOwnProfile && <button className="section-action" onClick={beginEdit}>{editing ? 'বাতিল করো / Cancel' : currentValue ? 'সম্পাদনা করো / Edit' : '+ যোগ করো / Add'}</button>}
      </div>

      {editing ? <div className="about-edit-form">
        <textarea value={value} onChange={e => setValue(e.target.value)} placeholder={`যোগ করো / Add ${activeEnglish}`} />
        <label className="visibility-field">কে এটি দেখতে পাবে? / Who can see this?
          <select value={currentVisibility} onChange={handleVisibilityChange}>
            {visibilityOptions.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
        <div><button className="section-action" onClick={save}>সংরক্ষণ করো / Save</button> <button className="section-secondary" onClick={() => setEditing(false)}>বাতিল করো / Cancel</button></div>
      </div> : <>
        {active === 'intro' && <div className="about-content-grid"><div className="about-info-card"><h3>ব্যক্তিগত তথ্য / Personal details</h3>{extended.personal ? <p>{extended.personal}</p> : <><p>{profileData.location || 'অবস্থান যোগ করা হয়নি / Location not added'}</p><p>{profileData.work || 'কর্মস্থল যোগ করা হয়নি / Work not added'}</p><p>{profileData.education || 'শিক্ষা যোগ করা হয়নি / Education not added'}</p></>}</div><div className="about-info-card"><h3>পরিচিতি / Bio</h3><p>{profileData.bio || 'এখনো কোনো পরিচিতি যোগ করা হয়নি / No intro added yet'}</p></div></div>}
        {active === 'privacy' && <div className="about-info-card"><h3>গোপনীয়তা ও আইনি তথ্য / Privacy and legal info</h3><p>তোমার প্রোফাইলের তথ্য দৃশ্যমানতার সেটিংস দিয়ে নিয়ন্ত্রিত হয়। Jolshaa-এর শর্তাবলি ও গোপনীয়তা নীতি প্রযোজ্য। / Your profile information is controlled by your visibility settings. Jolshaa terms and privacy policy apply.</p><label className="visibility-field">এই section কে দেখতে পাবে? / Who can see this section?<select value={currentVisibility} onChange={handleVisibilityChange}>{visibilityOptions.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><button className="section-action" onClick={save}>সংরক্ষণ করো / Save</button></div>}
        {active !== 'intro' && active !== 'privacy' && <div className="about-info-card"><p>{currentValue || `এখনো কোনো তথ্য যোগ করা হয়নি / No ${activeEnglish} added yet`}</p><p className="visibility-summary">দৃশ্যমানতা / Visibility: {visibilityOptions.find(([key]) => key === currentVisibility)?.[1]}</p></div>}
      </>}
    </main>
  </div>;
}
