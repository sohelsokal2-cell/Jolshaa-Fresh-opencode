import React, { useState } from 'react';
import { useToast } from './Toast';

const INITIAL_FIELDS = {
  name: 'আরিফ হোসেন',
  email: 'arif.hossain@gmail.com',
  phone: '+880 1700-000000',
};

const FIELD_META = [
  { key: 'name', labelBn: 'পুরো নাম', labelEn: 'Full Name', iconClass: 'fri-account', type: 'text',
    svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { key: 'email', labelBn: 'ইমেইল', labelEn: 'Email Address', iconClass: 'fri-mail', type: 'email',
    svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
  { key: 'phone', labelBn: 'ফোন নম্বর', labelEn: 'Phone Number', iconClass: 'fri-phone', type: 'tel',
    svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.1 2.18a2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-.89a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> },
];

export default function AccountSettingsPanel() {
  const { showToast } = useToast();

  const [values, setValues] = useState(INITIAL_FIELDS);
  const [editing, setEditing] = useState(null);   // field key being edited, or null
  const [draft, setDraft] = useState('');

  // Toggle states (persisted later via backend)
  const [toggles, setToggles] = useState({
    lockProfile: true,
    showActive: false,
    followSuggest: true,
  });

  // Dropdown selections
  const [postVisibility, setPostVisibility] = useState('friends');
  const [tagYou, setTagYou] = useState('friends');

  const [hasChanges, setHasChanges] = useState(false);

  const markChanged = () => setHasChanges(true);

  /* ─── Inline field edit ─── */
  const startEdit = (field) => {
    setEditing(field);
    setDraft(values[field]);
    markChanged();
  };

  const saveEdit = (field) => {
    const val = draft.trim();
    if (!val) return;
    setValues((prev) => ({ ...prev, [field]: val }));
    setEditing(null);
    showToast('সংরক্ষিত হয়েছে ✓');
    // TODO: call backend to persist the updated field (PATCH /api/users/me)
  };

  const cancelEdit = () => setEditing(null);

  /* ─── Toggle switches ─── */
  const flipToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
    markChanged();
  };

  /* ─── Password / danger actions (placeholder for now) ─── */
  const handleChangePassword = () => {
    // TODO: open real password-change flow / modal in a later step
    showToast('পাসওয়ার্ড পরিবর্তনের পেজ খুলছে...');
  };

  const handleDeactivate = () => {
    // TODO: show real confirmation modal before deactivating
    showToast('নিশ্চিত করার জন্য একটি ডায়ালগ দেখাবে');
  };

  const handleDelete = () => {
    // TODO: require password re-auth confirmation modal before permanent delete
    showToast('স্থায়ী মুছে ফেলার জন্য পাসওয়ার্ড নিশ্চিতকরণ প্রয়োজন');
  };

  /* ─── Save bar ─── */
  const discardChanges = () => {
    setValues(INITIAL_FIELDS);
    setToggles({ lockProfile: true, showActive: false, followSuggest: true });
    setPostVisibility('friends');
    setTagYou('friends');
    setEditing(null);
    setHasChanges(false);
    showToast('পরিবর্তনগুলো বাতিল করা হয়েছে');
  };

  const saveAllSettings = () => {
    // TODO: POST/PATCH all changed settings to backend in a later step
    setHasChanges(false);
    showToast('সেটিংস সফলভাবে সংরক্ষিত হয়েছে ✓');
  };

  return (
    <>
      {/* ── Section 1: Account Information ── */}
      <div className="settings-card">
        <div className="sc-header">
          <div className="sc-header-icon" style={{ background: 'var(--teal-pale)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.3" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div>
            <div className="sc-title-bn">অ্যাকাউন্ট তথ্য</div>
            <div className="sc-title-en">Account Information</div>
          </div>
        </div>

        {FIELD_META.map((f) => {
          const isEditing = editing === f.key;
          const isBn = f.key === 'name';
          return (
            <div className={`field-row ${isEditing ? 'editing' : ''}`} key={f.key}>
              <div className={`fr-icon ${f.iconClass}`}>{f.svg}</div>
              <div className="fr-content">
                <div className="fr-label-bn">{f.labelBn}</div>
                <div className="fr-label-en">{f.labelEn}</div>
                {isBn ? (
                  <div className="fr-value-bn">{values[f.key]}</div>
                ) : (
                  <div className="fr-value">{values[f.key]}</div>
                )}
                <input
                  type={f.type}
                  className="fr-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
              </div>
              <div className="fr-edit-wrap">
                <button className="btn-edit" onClick={() => startEdit(f.key)}>সম্পাদনা / Edit</button>
                <button className="btn-save" onClick={() => saveEdit(f.key)}>সংরক্ষণ</button>
                <button className="btn-cancel-edit" onClick={cancelEdit}>বাতিল</button>
              </div>
            </div>
          );
        })}

        {/* Password action row */}
        <div className="action-row" onClick={handleChangePassword}>
          <div className="ar-icon" style={{ background: 'var(--amber-pale)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          </div>
          <div className="ar-content">
            <div className="ar-bn">পাসওয়ার্ড পরিবর্তন করো</div>
            <div className="ar-en">Change Password · Last changed 3 months ago</div>
          </div>
          <svg className="ar-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </div>
      </div>

      {/* ── Section 2: Profile Settings (toggles) ── */}
      <div className="settings-card">
        <div className="sc-header">
          <div className="sc-header-icon" style={{ background: '#ede9fe' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.3" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <div className="sc-title-bn">প্রোফাইল সেটিংস</div>
            <div className="sc-title-en">Profile Settings</div>
          </div>
        </div>

        <ToggleRow
          bn="প্রোফাইল লক করো" en="Lock Profile"
          desc="অপরিচিতরা তোমার পোস্ট ও ছবি দেখতে পাবে না"
          on={toggles.lockProfile} onClick={() => flipToggle('lockProfile')}
          svg={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>}
        />
        <ToggleRow
          bn="সক্রিয় অবস্থা দেখাও" en="Show Active Status"
          desc="বন্ধুরা দেখতে পাবে তুমি অনলাইনে আছো কিনা"
          on={toggles.showActive} onClick={() => flipToggle('showActive')}
          svg={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
        <ToggleRow
          bn="পরিচিতদের সাজেশন দেখাও" en="Show to People You May Know"
          desc="তোমার প্রোফাইল সাজেস্টেড লিস্টে দেখা যাবে"
          on={toggles.followSuggest} onClick={() => flipToggle('followSuggest')}
          svg={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>}
        />
      </div>

      {/* ── Section 3: Post Privacy ── */}
      <div className="settings-card">
        <div className="sc-header">
          <div className="sc-header-icon" style={{ background: '#f0f9ff' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.3" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <div>
            <div className="sc-title-bn">পোস্ট প্রাইভেসি</div>
            <div className="sc-title-en">Post Privacy · Default visibility</div>
          </div>
        </div>

        <div className="dropdown-row">
          <div className="dr-left">
            <div className="dr-icon" style={{ background: '#f0f9ff' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
            </div>
            <div>
              <div className="dr-bn">ডিফল্ট পোস্ট দৃশ্যমানতা</div>
              <div className="dr-en">Default Post Visibility</div>
            </div>
          </div>
          <select
            className="styled-select"
            value={postVisibility}
            onChange={(e) => { setPostVisibility(e.target.value); markChanged(); }}
          >
            <option value="public">সবার জন্য / Public</option>
            <option value="friends">বন্ধুদের জন্য / Friends</option>
            <option value="only_me">শুধু আমার জন্য / Only Me</option>
          </select>
        </div>

        <div className="dropdown-row">
          <div className="dr-left">
            <div className="dr-icon" style={{ background: '#fdf5f4' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
            </div>
            <div>
              <div className="dr-bn">কে আমাকে ট্যাগ করতে পারবে</div>
              <div className="dr-en">Who Can Tag You</div>
            </div>
          </div>
          <select
            className="styled-select"
            value={tagYou}
            onChange={(e) => { setTagYou(e.target.value); markChanged(); }}
          >
            <option value="all">সবাই / Everyone</option>
            <option value="friends">বন্ধুরা / Friends</option>
            <option value="none">কেউ না / No One</option>
          </select>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="danger-card">
        <div className="dc-header">
          <div className="dc-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div>
            <div className="dc-title-bn">বিপজ্জনক অঞ্চল</div>
            <div className="dc-title-en">Danger Zone · Irreversible actions</div>
          </div>
        </div>

        <div className="danger-row">
          <div className="dang-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.2" strokeLinecap="round"><path d="M18.36 6.64A9 9 0 115.64 17.36"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className="dang-bn">অ্যাকাউন্ট নিষ্ক্রিয় করো</div>
            <div className="dang-en">Deactivate Account</div>
            <div className="dang-desc">সাময়িকভাবে নিষ্ক্রিয় করলে তোমার প্রোফাইল আর দেখা যাবে না। পরে আবার সক্রিয় করা যাবে।</div>
          </div>
          <button className="btn-danger" onClick={handleDeactivate}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18.36 6.64A9 9 0 115.64 17.36"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
            নিষ্ক্রিয় করো
          </button>
        </div>

        <div className="danger-row">
          <div className="dang-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className="dang-bn">অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলো</div>
            <div className="dang-en">Delete Account Permanently</div>
            <div className="dang-desc">একবার মুছলে আর ফিরিয়ে আনা সম্ভব হবে না। সমস্ত পোস্ট, বার্তা এবং ডেটা চিরতরে মুছে যাবে।</div>
          </div>
          <button className="btn-danger-hard" onClick={handleDelete}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            মুছে ফেলো
          </button>
        </div>
      </div>

      {/* Save bar (shows when changes are pending) */}
      {hasChanges && (
        <div className="save-bar">
          <div className="save-bar-msg">তোমার পরিবর্তনগুলো <span>সংরক্ষিত হয়নি</span> — এখনই সংরক্ষণ করো</div>
          <div className="save-bar-actions">
            <button className="btn-discard" onClick={discardChanges}>বাতিল করো</button>
            <button className="btn-save-settings" onClick={saveAllSettings}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              সেটিংস সংরক্ষণ করো
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* Small helper for a toggle row */
function ToggleRow({ bn, en, desc, on, onClick, svg }) {
  return (
    <div className="toggle-row">
      <div className="tr-left">
        <div className="tr-icon" style={{ background: 'var(--amber-pale)' }}>{svg}</div>
        <div className="tr-content">
          <div className="tr-bn">{bn}</div>
          <div className="tr-en">{en}</div>
          <div className="tr-desc">{desc}</div>
        </div>
      </div>
      <div className="toggle-switch" onClick={onClick}>
        <div className={`toggle-track ${on ? 'on' : ''}`} />
        <span className="toggle-state-lbl">{on ? 'চালু' : 'বন্ধ'}</span>
      </div>
    </div>
  );
}
