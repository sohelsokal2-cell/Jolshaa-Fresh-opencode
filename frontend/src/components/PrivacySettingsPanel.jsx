import React, { useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { useToast } from './Toast';

export default function PrivacySettingsPanel({ settings, onUpdate }) {
  const { showToast } = useToast();
  const [privacy, setPrivacy] = useState(settings?.post_privacy || 'public');
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePrivacyChange = async (val) => {
    setPrivacy(val);
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ post_privacy: val })
        .eq('id', (await supabase.auth.getUser()).data.user.id);
      
      if (error) throw error;
      showToast('গোপনীয়তা সেটিংস আপডেট হয়েছে।');
      if (onUpdate) onUpdate({ post_privacy: val });
    } catch (err) {
      console.error('Privacy update error:', err);
      showToast('আপডেট করা সম্ভব হয়নি।');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="settings-card">
      <h3 className="settings-section-title">গোপনীয়তা সেটিংস (Privacy Settings)</h3>
      <div className="settings-row">
        <div className="settings-info">
          <div className="settings-label">ডিফল্ট পোস্ট প্রাইভেসি</div>
          <div className="settings-desc">নতুন পোস্ট করার সময় স্বয়ংক্রিয়ভাবে এই প্রাইভেসি সেট হবে।</div>
        </div>
        <select 
          className="field-select" 
          value={privacy} 
          onChange={(e) => handlePrivacyChange(e.target.value)}
          disabled={isUpdating}
        >
          <option value="public">সবার জন্য (Public)</option>
          <option value="friends">বন্ধুদের জন্য (Friends)</option>
          <option value="private">শুধু আমার জন্য (Only Me)</option>
        </select>
      </div>
    </div>
  );
}
