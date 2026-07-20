import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchConversations, fetchMessages, sendMessage, subscribeToConversation } from '../lib/messagingApi';
import Navbar from '../components/Navbar';
import './Messages.css';

export default function Messages() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // ইনবক্স লোড করা
  useEffect(() => {
    if (!user) return;
    async function loadInboxes() {
      try {
        const data = await fetchConversations(user.id);
        setConversations(data);
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInboxes();
  }, [user]);

  // মেসেজ লোড ও রিয়েল-টাইম সাবস্ক্রিপশন
  useEffect(() => {
    if (!conversationId || !user) return;

    async function loadMessages() {
      const data = await fetchMessages(conversationId);
      setMessages(data);
    }
    loadMessages();

    const cleanup = subscribeToConversation(conversationId, (newMsg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [conversationId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !conversationId) return;

    try {
      await sendMessage(conversationId, user.id, inputText);
      setInputText('');
    } catch (err) {
      alert('মেসেজ পাঠানো যায়নি।');
    }
  };

  return (
    <div className="messages-page">
      <Navbar />
      <div className="messages-container">
        {/* Inbox Sidebar */}
        <aside className="inbox-sidebar">
          <h2 className="inbox-title">ইনবক্স</h2>
          <div className="conversation-list">
            {conversations.map(conv => {
              const otherUser = conv.otherParticipants?.[0];
              const name = otherUser?.name || 'অজানা';
              return (
                <div 
                  key={conv.id} 
                  className={`conv-item ${conversationId === conv.id ? 'active' : ''}`}
                  onClick={() => navigate(`/messages/${conv.id}`)}
                >
                  <div className="avatar-sm">{name[0]}</div>
                  <div className="conv-info">
                    <div className="conv-name">{name}</div>
                    <div className="conv-preview">{conv.lastMessage?.content}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>


        {/* Chat Area */}
        <main className="chat-area">
          {conversationId ? (
            <>
              <div className="message-list">
                {messages.map((msg, i) => (
                  <div key={msg.id || i} className={`message-bubble ${msg.sender_id === user.id ? 'sent' : 'received'}`}>
                    {msg.content}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form className="chat-input-row" onSubmit={handleSend}>
                <input 
                  type="text" 
                  value={inputText} 
                  onChange={e => setInputText(e.target.value)} 
                  placeholder="মেসেজ লিখুন..." 
                />
                <button type="submit">পাঠান</button>
              </form>
            </>
          ) : (
            <div className="empty-chat">কথোপকথন শুরু করতে কাউকে নির্বাচন করুন।</div>
          )}
        </main>
      </div>
    </div>
  );
}
