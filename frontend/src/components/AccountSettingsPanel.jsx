import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import {
  updateProfileField,
  updateEmail,
  updatePassword,
  reauthenticate,
  updateToggle,
  updatePostPrivacy,
  deactivateAccount,
  requestAccountDeletion,
} from '../lib/settingsApi';

const FIELD_META = [
  { key: 'name', labelBn: 'পুরো নাম', labelEn: 'Full Name', iconClass: 'fri-account', type: 'text',
    svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { key: 'email', labelBn: 'ইমেইল', labelEn: 'Email Address', iconClass: 'fri-mail', type: 'email',
    svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
  { key: 'phone', labelBn: 'ফোন নম্বর', labelEn: 'Phone Number', iconClass: 'fri-phone', type: 'tel',
    svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.1 2.18a2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-.89a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> },
];

export default function AccountSettingsPanel() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [values, setValues] = useState({ name: '', email: '', phone: '' });
  const [originalValues, setOriginalValues] = useState({ name: '', email: '', phone: '' });
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const [toggles, setToggles] = useState({
    lockProfile: false,
    showActive: true,
  });
  const [originalToggles, setOriginalToggles] = useState({
    lockProfile: false,
    showActive: true,
  });

  const [postVisibility, setPostVisibility] = useState('public');
  const [originalPostVisibility, setOriginalPostVisibility] = useState('public');

  const [hasChanges, setHasChanges] = useState(false);

  // Password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Deactivate confirmation modal
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Load profile data on mount
  useEffect(() => {
    if (user) {
      const profileData = {
        name: user.full_name || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      };
      setValues(profileData);
      setOriginalValues(profileData);

      const toggleData = {
        lockProfile: user.is_profile_locked || false,
        showActive: user.show_active_status !== false,
      };
      setToggles(toggleData);
      setOriginalToggles(toggleData);

      const privacy = user.default_post_privacy || 'public';
      setPostVisibility(privacy);
      setOriginalPostVisibility(privacy);
    }
  }, [user]);

  const markChanged = () => setHasChanges(true);

  const checkChanges = (newVals, newToggles, newPrivacy) => {
    const fieldsChanged = JSON.stringify(newVals) !== JSON.stringify(originalValues);
    const togglesChanged = JSON.stringify(newToggles) !== JSON.stringify(originalToggles);
    const privacyChanged = newPrivacy !== originalPostVisibility;
    setHasChanges(fieldsChanged || togglesChanged || privacyChanged);
  };

  // Inline field edit
  const startEdit = (field) => {
    setEditing(field);
    setDraft(values[field]);
  };

  const saveEdit = async (field) => {
    const val = draft.trim();
    if (!val) return;

    setSaving(true);
    try {
      if (field === 'email') {
        await updateEmail(val);
        showToast('ইমেইল আপডেট অনুরোধ পাঠানো হয়েছে — নতুন ইমেইলে কনফার্মেশন চেক করুন');
      } else if (field === 'phone') {
        await updateProfileField(user.id, 'phone', val);
      } else {
        await updateProfileField(user.id, field, val);
      }

      const newValues = { ...values, [field]: val };
      setValues(newValues);
      setOriginalValues({ ...newValues });
      setEditing(null);
      checkChanges(newValues, toggles, postVisibility);
      showToast('সংরক্ষিত হয়েছে ✓');
    } catch (err) {
      console.error('Save field failed:', err);
      showToast(`ব্যর্থ: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => setEditing(null);

  // Toggle switches — optimistic update
  const flipToggle = async (key) => {
    const newToggles = { ...toggles, [key]: !toggles[key] };
    setToggles(newToggles);
    checkChanges(values, newToggles, postVisibility);

    const fieldMap = {
      lockProfile: 'is_profile_locked',
      showActive: 'show_active_status',
    };

    try {
      await updateToggle(user.id, fieldMap[key], newToggles[key]);
    } catch (err) {
      console.error('Toggle failed:', err);
      setToggles(toggles);
      checkChanges(values, toggles, postVisibility);
      showToast(`ব্যর্থ: ${err.message}`);
    }
  };

  // Post privacy
  const handlePostPrivacy = async (value) => {
    setPostVisibility(value);
    checkChanges(values, toggles, value);

    try {
      await updatePostPrivacy(user.id, value);
    } catch (err) {
      console.error('Privacy update failed:', err);
      setPostVisibility(postVisibility);
      checkChanges(values, toggles, postVisibility);
      showToast(`ব্যর্থ: ${err.message}`);
    }
  };

  // Password change
  const handleChangePassword = () => {
    setShowPasswordModal(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const submitPasswordChange = async () => {
    if (!currentPassword) {
      showToast('বর্তমান পাসওয়ার্ড দিন');
      return;
    }
    if (newPassword.length < 8) {
      showToast('নতুন পাসওয়ার্ড কমপক্ষে ৮ ক্যারেক্টার হতে হবে');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('নতুন পাসওয়ার্ড মিলছে না');
      return;
    }

    setChangingPassword(true);
    try {
      // Verify current password by re-authenticating
      await reauthenticate(user.email, currentPassword);
      // Now update to the new password
      await updatePassword(newPassword);
      setShowPasswordModal(false);
      showToast('পাসওয়ার্ড পরিবর্তন হয়েছে ✓');
    } catch (err) {
      console.error('Password change failed:', err);
      if (err.message?.includes('Invalid login credentials')) {
        showToast('বর্তমান পাসওয়ার্ড ভুল।');
      } else if (err.message?.includes('session') || err.message?.includes('recent')) {
        showToast('সেশন মেয়াদোতীর্ত হয়েছে। আবার লগইন করুন।');
      } else {
        showToast(`ব্যর্থ: ${err.message}`);
      }
    } finally {
      setChangingPassword(false);
    }
  };

  // Deactivate
  const handleDeactivate = () => setShowDeactivateModal(true);

  const confirmDeactivate = async () => {
    setDeactivating(true);
    try {
      await deactivateAccount(user.id);
      setShowDeactivateModal(false);
      showToast('অ্যাকাউন্ট নিষ্ক্রিয় হয়েছে');
    } catch (err) {
      console.error('Deactivate failed:', err);
      showToast(`ব্যর্থ: ${err.message}`);
    } finally {
      setDeactivating(false);
    }
  };

  // Delete
  const handleDelete = () => {
    setShowDeleteModal(true);
    setDeleteConfirmText('');
  };

  const confirmDelete = async () => {
    if (deleteConfirmText !== 'DELETE') return;

    setDeleting(true);
    try {
      await requestAccountDeletion();
      setShowDeleteModal(false);
      showToast('অ্যাকাউন্ট এবং সমস্ত ডেটা স্থায়ীভাবে মুছে ফেলা হয়েছে।');
    } catch (err) {
      console.error('Delete request failed:', err);
      showToast(`ব্যর্থ: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Discard changes
  const discardChanges = () => {
    setValues(originalValues);
    setToggles(originalToggles);
    setPostVisibility(originalPostVisibility);
    setEditing(null);
    setHasChanges(false);
    showToast('পরিবর্তনগুলো বাতিল করা হয়েছে');
  };

  // Save all (for the save bar)
  const saveAllSettings = () => {
    setOriginalValues({ ...values });
    setOriginalToggles({ ...toggles });
    setOriginalPostVisibility(postVisibility);
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
                <button className="btn-save" onClick={() => saveEdit(f.key)} disabled={saving}>
                  {saving ? '...' : 'সংরক্ষণ'}
                </button>
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
            <div className="ar-en">Change Password</div>
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
            onChange={(e) => handlePostPrivacy(e.target.value)}
          >
            <option value="public">সবার জন্য / Public</option>
            <option value="friends">বন্ধুদের জন্য / Friends</option>
            <option value="only_me">শুধু আমার জন্য / Only Me</option>
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

      {/* Save bar */}
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

      {/* ── Password Change Modal ── */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => !changingPassword && setShowPasswordModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">
              🔒 পাসওয়ার্ড পরিবর্তন করো
            </h3>
            <div className="modal-section">
              <label className="modal-label">
                বর্তমান পাসওয়ার্ড *
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="তোমার বর্তমান পাসওয়ার্ড লিখুন"
                className="modal-input"
              />
            </div>
            <div className="modal-section">
              <label className="modal-label">
                নতুন পাসওয়ার্ড *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="কমপক্ষে ৮ ক্যারেক্টার"
                className="modal-input"
              />
            </div>
            <div className="modal-section-last">
              <label className="modal-label">
                পাসওয়ার্ড নিশ্চিত করো
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="আবার পাসওয়ার্ড লিখুন"
                className="modal-input"
              />
            </div>
            <div className="modal-actions">
              <button
                onClick={() => !changingPassword && setShowPasswordModal(false)}
                disabled={changingPassword}
                className="modal-btn-cancel"
              >
                বাতিল
              </button>
              <button
                onClick={submitPasswordChange}
                disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="modal-btn-primary"
              >
                {changingPassword ? 'পরিবর্তন হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করো'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Deactivate Confirmation Modal ── */}
      {showDeactivateModal && (
        <div className="modal-overlay" onClick={() => !deactivating && setShowDeactivateModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title-danger">
              ⚠️ অ্যাকাউন্ট নিষ্ক্রিয় করবেন?
            </h3>
            <p className="modal-desc">
              নিষ্ক্রিয় করলে তোমার প্রোফাইল অন্যদের কাছে দেখা যাবে না। তুমি পরে আবার লগইন করে সক্রিয় করতে পারবে।
            </p>
            <div className="modal-actions">
              <button
                onClick={() => !deactivating && setShowDeactivateModal(false)}
                disabled={deactivating}
                className="modal-btn-cancel"
              >
                বাতিল
              </button>
              <button
                onClick={confirmDeactivate}
                disabled={deactivating}
                className="modal-btn-danger"
              >
                {deactivating ? 'নিষ্ক্রিয় হচ্ছে...' : 'হ্যাঁ, নিষ্ক্রিয় করো'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title-danger">
              🗑️ অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলবেন?
            </h3>
            <p className="modal-desc-short">
              এই কাজটি অপরিবর্তনীয়। সমস্ত পোস্ট, বার্তা এবং ডেটা চিরতরে মুছে যাবে।
            </p>
            <p className="modal-desc-bold">
              নিশ্চিত করতে <span className="modal-danger-text">DELETE</span> টাইপ করুন:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="modal-input-with-margin"
            />
            <div className="modal-actions">
              <button
                onClick={() => !deleting && setShowDeleteModal(false)}
                disabled={deleting}
                className="modal-btn-cancel"
              >
                বাতিল
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting || deleteConfirmText !== 'DELETE'}
                className="modal-btn-danger"
              >
                {deleting ? 'মুছে ফেলা হচ্ছে...' : 'স্থায়ীভাবে মুছে ফেলো'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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
