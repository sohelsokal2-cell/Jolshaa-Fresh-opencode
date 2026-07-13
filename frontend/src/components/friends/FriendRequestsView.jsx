import React, { useState } from 'react';
import { getAvatarColor, getInitial, toBnNumber, timeAgo } from './friendsHelpers';

export default function FriendRequestsView({ requests = [], onAccept, onDelete }) {
  const [actionLoading, setActionLoading] = useState({});

  async function handleAccept(req) {
    setActionLoading(prev => ({ ...prev, [req.id]: 'accepting' }));
    try {
      await onAccept?.(req);
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[req.id]; return n; });
    }
  }

  async function handleDelete(req) {
    setActionLoading(prev => ({ ...prev, [req.id]: 'deleting' }));
    try {
      await onDelete?.(req);
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[req.id]; return n; });
    }
  }

  if (requests.length === 0) {
    return (
      <div className="fp-section">
        <div className="fp-section-head">
          <h3 className="fp-section-title">
            <span className="fp-st-bn">বন্ধুর অনুরোধ</span>
            <span className="fp-st-en">Friend Requests</span>
          </h3>
        </div>
        <div className="fp-empty">
          <div className="fp-empty-icon">📬</div>
          <p className="fp-empty-bn">কোনো নতুন অনুরোধ নেই</p>
          <p className="fp-empty-en">No new requests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fp-section">
      <div className="fp-section-head">
        <div className="fp-section-title-group">
          <h3 className="fp-section-title">
            <span className="fp-st-bn">বন্ধুর অনুরোধ</span>
            <span className="fp-st-en">Friend Requests</span>
          </h3>
          <span className="fp-section-count">{toBnNumber(requests.length)} জন</span>
        </div>
      </div>
      <div className="fp-req-list">
        {requests.map(req => {
          const isLoading = actionLoading[req.id];
          return (
            <div key={req.id} className="fp-req-row">
              <div
                className="fp-req-avatar"
                style={{ background: req.requesterAvatar ? 'none' : getAvatarColor(req.requesterName) }}
              >
                {req.requesterAvatar ? (
                  <img src={req.requesterAvatar} alt={req.requesterName} />
                ) : (
                  <span className="fp-avatar-char">{getInitial(req.requesterName)}</span>
                )}
              </div>
              <div className="fp-req-info">
                <span className="fp-req-name">{req.requesterName}</span>
                <span className="fp-req-time">{timeAgo(req.created_at)}</span>
              </div>
              <div className="fp-req-actions">
                <button
                  className="fp-btn fp-btn-accept"
                  disabled={isLoading}
                  onClick={() => handleAccept(req)}
                >
                  {isLoading === 'accepting' ? '...' : 'গ্রহণ করুন / Accept'}
                </button>
                <button
                  className="fp-btn fp-btn-delete"
                  disabled={isLoading}
                  onClick={() => handleDelete(req)}
                >
                  {isLoading === 'deleting' ? '...' : 'মুছুন / Delete'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
