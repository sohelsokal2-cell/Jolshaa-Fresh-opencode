import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import InfoPanel from '../components/InfoPanel';
import GroupChatDemoPanel from '../components/GroupChatDemoPanel';
import IncomingCallOverlay from '../components/IncomingCallOverlay';
import './Messenger.css';

export default function Messenger() {
  const [activeConversation, setActiveConversation] = useState(null);
  const [showInfo, setShowInfo] = useState(true);
  const [showGroupDemo, setShowGroupDemo] = useState(false); // Conditionally hidden
  const [showCallOverlay, setShowCallOverlay] = useState(false); // Conditionally hidden

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div style={{ background: 'var(--off-white)', height: '100vh', overflow: 'hidden' }}>
      {/* Shared Navbar loaded with custom badge count */}
      <Navbar messageCount={5} notificationCount={3} />

      {/* Messenger Body Container */}
      <div className="messenger-body">
        <ConversationList
          activeId={activeConversation ? activeConversation.id : 1}
          onSelectConversation={(conv) => setActiveConversation(conv)}
        />

        <ChatWindow
          activeConversation={activeConversation}
          onToggleInfo={() => setShowInfo(prev => !prev)}
        />

        {showInfo && (
          <InfoPanel activeConversation={activeConversation} />
        )}
      </div>

      {/* Float Demo Panels (Conditionally hidden for showcase reference) */}
      {showGroupDemo && <GroupChatDemoPanel />}
      {showCallOverlay && (
        <IncomingCallOverlay
          onAccept={() => setShowCallOverlay(false)}
          onReject={() => setShowCallOverlay(false)}
        />
      )}
    </div>
  );
}
