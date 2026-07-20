import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createHelpRequest } from '../lib/sahajjoApi';

const CATEGORIES = [
  { value: 'medical', label: 'চিকিৎসা', labelEn: 'Medical', icon: '🏥' },
  { value: 'flood', label: 'বন্যা', labelEn: 'Flood', icon: '🌊' },
  { value: 'fire', label: 'আগুন', labelEn: 'Fire', icon: '🔥' },
  { value: 'lost_person', label: 'হারানো ব্যক্তি', labelEn: 'Lost Person', icon: '👤' },
  { value: 'food', label: 'খাবার', labelEn: 'Food', icon: '🍚' },
  { value: 'shelter', label: 'আশ্রয়', labelEn: 'Shelter', icon: '🏠' },
];

const URGENCY_OPTIONS = [
  { value: 'immediate', label: 'এখনই দরকার', labelEn: 'Immediate' },
  { value: 'hours', label: 'কয়েক ঘণ্টার মধ্যে', labelEn: 'Within hours' },
  { value: 'days', label: 'কয়েক দিনের মধ্যে', labelEn: 'Within days' },
];

const CreateHelpRequestModal = ({ onClose, onRequestCreated }) => {
  const { user } = useAuth();
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('');
  const [upazila, setUpazila] = useState('');
  const [deadline, setDeadline] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('ছবির সাইজ ৫ MB এর কম হতে হবে।');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!category || !urgency || !title.trim() || !description.trim() || !district.trim()) {
      setError('সব তথ্য পূরণ করুন।');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await createHelpRequest({
        requesterId: user.id,
        category,
        urgency,
        title: title.trim(),
        description: description.trim(),
        imageFile,
        district: district.trim(),
        upazila: upazila.trim() || null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      });

      onRequestCreated();
      onClose();
    } catch (err) {
      console.error('Failed to create help request:', err);
      setError('অনুরোধ তৈরি করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content sahajjo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>সাহায্যের অনুরোধ পাঠাও</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <label className="modal-label">ক্যাটাগরি *</label>
          <select
            className="modal-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">নির্বাচন করুন...</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label} / {cat.labelEn}
              </option>
            ))}
          </select>

          <label className="modal-label">জরুরিতা *</label>
          <select
            className="modal-input"
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
          >
            <option value="">নির্বাচন করুন...</option>
            {URGENCY_OPTIONS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label} / {u.labelEn}
              </option>
            ))}
          </select>

          <label className="modal-label">শিরোনাম *</label>
          <input
            className="modal-input"
            type="text"
            placeholder="সংক্ষেপে কী দরকার..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />

          <label className="modal-label">বিস্তারিত বিবরণ *</label>
          <textarea
            className="modal-input"
            placeholder="কী হয়েছে, কে দরকার, কোথায় আছেন..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={1000}
          />

          <label className="modal-label">জেলা *</label>
          <input
            className="modal-input"
            type="text"
            placeholder="যেমন: ঢাকা, চট্টগ্রাম..."
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />

          <label className="modal-label">উপজেলা / এলাকা</label>
          <input
            className="modal-input"
            type="text"
            placeholder="যেমন: মিরপুর, ধানমন্ডি..."
            value={upazila}
            onChange={(e) => setUpazila(e.target.value)}
          />

          <label className="modal-label">সময়সীমা (ঐচ্ছিক)</label>
          <input
            className="modal-input"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          <label className="modal-label">ছবি (ঐচ্ছিক, সর্বোচ্চ ৫ MB)</label>
          <div className="sahajjo-upload-area">
            <input
              id="help-image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            {imagePreview ? (
              <div className="upload-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  className="upload-remove"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <label htmlFor="help-image-upload" className="upload-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>ছবি যোগ করুন</span>
              </label>
            )}
          </div>

          {error && <div className="sahajjo-form-error">{error}</div>}
        </div>

        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={onClose} disabled={submitting}>
            বাতিল
          </button>
          <button
            className="modal-btn-primary"
            onClick={handleSubmit}
            disabled={submitting || !category || !urgency || !title.trim() || !description.trim() || !district.trim()}
          >
            {submitting ? 'পাঠানো হচ্ছে...' : 'অনুরোধ পাঠাও'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateHelpRequestModal;
