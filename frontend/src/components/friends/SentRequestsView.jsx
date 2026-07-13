import React from 'react';
import { getAvatarColor, getInitial, toBnNumber, timeAgo } from './friendsHelpers';

export default function SentRequestsView({ sentReqs = [], onCancel }) {
  if (sentReqs.length === 0) {
    return (
      <div className="fp-section">
        <div className="fp-section-head">
          <h3 className="fp-section-title">
            <span className="fp-st-bn">পাঠানো অনুরোধ</span>
            <span className="fp-st-en">Sent Requests</span>
          </h3>
        </div>
        <div className="fp-empty">
          <div className="fp-empty-icon">📤</div>
          <p className="fp-empty-bn">কোনো পাঠানো অনুরোধ নেই</p>
          <p className="fp-empty-en">No sent requests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fp-section">
      <div className="fp-section-head">
        <div className="fp-section-title-group">
          <h3 className="fp-section-title">
            <span className="fp-st-bn">পাঠানো অনুরোধ</span>
            <span className="fp-st-en">Sent Requests</span>
          </h3>
          <span className="fp-section-count">{toBnNumber(sentReqs.length)} জন</span>
        </div>
      </div>
      <div className="fp-req-list">
        {sentReqs.map(req => (
          <div key={req.id} className="fp-req-row">
            <div
              className="fp-req-avatar"
              style={{ background: req.addresseeAvatar ? 'none' : getAvatarColor(req.addresseeName) }}
            >
              {req.addresseeAvatar ? (
                <img src={req.addresseeAvatar} alt={req.addresseeName} />
              ) : (
                <span className="fp-avatar-char">{getInitial(req.addresseeName)}</span>
              )}
            </div>
            <div className="fp-req-info">
              <span className="fp-req-name">{req.addresseeName}</span>
              <span className="fp-req-time">{timeAgo(req.created_at)}</span>
            </div>
            <button className="fp-btn fp-btn-cancel" onClick={() => onCancel?.(req)}>
              বাতিল করুন / Cancel
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
