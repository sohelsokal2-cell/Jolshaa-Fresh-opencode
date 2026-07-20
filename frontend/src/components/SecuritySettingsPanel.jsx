import React from 'react';

export default function SecuritySettingsPanel() {
  return (
    <div className="settings-card">
      <h3 className="settings-section-title">নিরাপত্তা (Security)</h3>
      <div className="settings-row">
        <div className="settings-info">
          <div className="settings-label">টু-ফ্যাক্টর অথেন্টিকেশন (2FA)</div>
          <div className="settings-desc">আপনার অ্যাকাউন্টের নিরাপত্তা বাড়াতে এটি চালু করুন।</div>
        </div>
        <button className="btn-secondary" onClick={() => alert('শীঘ্রই আসছে!')}>চালু করো</button>
      </div>
      <div className="settings-row">
        <div className="settings-info">
          <div className="settings-label">সক্রিয় সেশন (Active Sessions)</div>
          <div className="settings-desc">বর্তমানে কোন কোন ডিভাইসে লগইন করা আছে দেখুন।</div>
        </div>
        <button className="btn-secondary" onClick={() => alert('শীঘ্রই আসছে!')}>সব সেশন দেখো</button>
      </div>
    </div>
  );
}
