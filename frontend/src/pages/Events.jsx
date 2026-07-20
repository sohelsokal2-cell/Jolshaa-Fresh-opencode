import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import EventsSidebar from '../components/EventsSidebar';
import EventCategoryPillRow from '../components/EventCategoryPillRow';
import EventCard from '../components/EventCard';
import EventDetailPanel from '../components/EventDetailPanel';
import { fetchEvents, createEvent, setRsvp, getRsvpCounts, getMyRsvp, getEventGuestAvatars } from '../lib/eventsApi';
import './Events.css';

const CATEGORY_MAP = {
  music: { emoji: '🎵', label: 'সংগীত / Music', gradient: 'linear-gradient(140deg,#1a0f2e,#3b1a5e,#5c2d8a)' },
  sports: { emoji: '⚽', label: 'খেলাধুলা / Sports', gradient: 'linear-gradient(140deg,#052e16,#14532d,#1e7c3c)' },
  community: { emoji: '🤝', label: 'সম্প্রদায় / Community', gradient: 'linear-gradient(140deg,#1a3a2a,#2d6a4a,#1a4a3a)' },
  education: { emoji: '📚', label: 'শিক্ষা / Education', gradient: 'linear-gradient(140deg,#0c1a2e,#1a3a5e,#0a2a4a)' },
  arts: { emoji: '🎨', label: 'শিল্পকলা / Arts', gradient: 'linear-gradient(140deg,#2e0a1e,#5a1a3a,#8a2d5a)' },
  tech: { emoji: '💻', label: 'টেক / Tech', gradient: 'linear-gradient(140deg,#0c1a2e,#1a3a5e,#0a2a4a)' },
  online: { emoji: '🌐', label: 'অনলাইন / Online', gradient: 'linear-gradient(140deg,#0c1a2e,#1a3a5e,#0a2a4a)' },
};

function formatEventDate(dateStr) {
  const d = new Date(dateStr);
  const dayBn = d.toLocaleDateString('bn-BD', { day: 'numeric' });
  const monthShort = d.toLocaleDateString('en-US', { month: 'short' });
  const monthFull = d.toLocaleDateString('bn-BD', { month: 'long' });
  const dayOfWeek = d.toLocaleDateString('bn-BD', { weekday: 'long' });
  const timeBn = d.toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit' });
  const whenBn = `${dayOfWeek}, ${dayBn} ${monthFull} · ${timeBn}`;
  const whenEn = d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  return { dayBn, monthShort, monthFull, dayOfWeek, whenBn, whenEn };
}

const Events = () => {
  const { user } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [activeTab, setActiveTab] = useState('discover');
  const [activeCategory, setActiveCategory] = useState('all');

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEventRsvps, setSelectedEventRsvps] = useState({ going: 0, interested: 0 });
  const [selectedEventGuests, setSelectedEventGuests] = useState([]);
  const [myRsvp, setMyRsvp] = useState(null);

  // Create event modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createCategory, setCreateCategory] = useState('community');
  const [createLocationType, setCreateLocationType] = useState('physical');
  const [createLocationText, setCreateLocationText] = useState('');
  const [createDate, setCreateDate] = useState('');
  const [createCoverFile, setCreateCoverFile] = useState(null);
  const [creating, setCreating] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEvents(activeTab, user?.id);
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('ইভেন্ট লোড করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  }, [activeTab, user]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Load selected event details
  useEffect(() => {
    if (!selectedEventId) {
      setSelectedEvent(null);
      return;
    }

    const ev = events.find(e => e.id === selectedEventId);
    if (ev) {
      setSelectedEvent(ev);

      // Fetch RSVP counts + my RSVP + guest avatars in parallel
      Promise.all([
        getRsvpCounts(selectedEventId),
        getMyRsvp(selectedEventId, user?.id),
        getEventGuestAvatars(selectedEventId, 5),
      ]).then(([counts, rsvp, guests]) => {
        setSelectedEventRsvps(counts);
        setMyRsvp(rsvp);
        setSelectedEventGuests(guests);
      }).catch(err => {
        console.error('Failed to load event details:', err);
      });
    }
  }, [selectedEventId, events, user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedEventId(null);
  };

  const handleRsvpChange = async (eventId, status) => {
    if (!user) {
      alert('RSVP করতে লগইন করুন।');
      return;
    }
    try {
      const newStatus = await setRsvp(eventId, user.id, status);
      setMyRsvp(newStatus);

      const counts = await getRsvpCounts(eventId);
      setSelectedEventRsvps(counts);

      setEvents(prev => prev.map(e =>
        e.id === eventId
          ? { ...e, goingCount: counts.going_count, interestedCount: counts.interested_count }
          : e
      ));
    } catch (err) {
      console.error('RSVP failed:', err);
    }
  };

  const handleCreateEvent = async () => {
    if (!createTitle.trim() || !createDesc.trim() || !createDate) return;
    if (!user) {
      alert('ইভেন্ট তৈরি করতে লগইন করুন।');
      return;
    }

    try {
      setCreating(true);
      const newEvent = await createEvent(
        user.id,
        createTitle.trim(),
        createDesc.trim(),
        createCoverFile,
        createCategory,
        createLocationType,
        createLocationText.trim(),
        new Date(createDate).toISOString()
      );
      setEvents(prev => [newEvent, ...prev]);
      setShowCreateModal(false);
      setCreateTitle('');
      setCreateDesc('');
      setCreateCategory('community');
      setCreateLocationType('physical');
      setCreateLocationText('');
      setCreateDate('');
      setCreateCoverFile(null);
    } catch (err) {
      console.error('Create event failed:', err);
      alert(`ইভেন্ট তৈরি ব্যর্থ: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  // Map events to display format for components
  const displayEvents = events.map(ev => {
    const cat = CATEGORY_MAP[ev.category] || CATEGORY_MAP.community;
    const { dayBn, monthShort, monthFull, dayOfWeek, whenBn, whenEn } = formatEventDate(ev.event_date);
    return {
      ...ev,
      categoryEmoji: cat.emoji,
      categoryLabel: cat.label,
      emoji: cat.emoji,
      coverGradient: ev.cover_image_url ? null : cat.gradient,
      day: dayBn,
      monthShort,
      monthFull,
      dayOfWeek,
      whenBn,
      whenEn,
      whereBn: ev.location_text || (ev.location_type === 'online' ? 'অনলাইন' : 'ঢাকা'),
      whereEn: ev.location_type === 'online' ? 'Online Event' : 'Dhaka, Bangladesh',
      duration: '',
      goingText: `${ev.goingCount || 0} জন যাচ্ছে`,
      goingEn: `${ev.goingCount || 0} going · ${ev.interestedCount || 0} interested`,
      initialRsvp: 'none',
    };
  });

  const upcomingEvents = events.slice(0, 3).map(ev => {
    const { dayBn, monthShort } = formatEventDate(ev.event_date);
    return {
      id: ev.id,
      title: ev.title,
      day: dayBn,
      month: monthShort,
      dateBg: 'var(--teal-xpale)',
      dateBorder: 'var(--teal-pale)',
      dayColor: null,
    };
  });

  return (
    <div className="events-page-body">
      <Navbar messageCount={5} notificationCount={7} />

      <EventsSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onSelectEvent={setSelectedEventId}
        upcomingEvents={upcomingEvents}
        onCreateEvent={() => setShowCreateModal(true)}
      />

      <div className="content-area">
        <div className="feed-col">
          <div className="feed-hdr">
            <div>
              <div className="fh-title-bn">ইভেন্ট আবিষ্কার করো</div>
              <div className="fh-title-en">
                {activeTab === 'hosting'
                  ? 'তুমি আয়োজন করছো / Hosting'
                  : activeTab === 'yours'
                  ? 'তোমার ইভেন্ট / Your Events'
                  : 'Discover Events · Near You & Online'}
              </div>
            </div>
            <div className="feed-sort">
              <span className="sort-label">Sort:</span>
              <select className="sort-select">
                <option>তারিখ / Date</option>
                <option>জনপ্রিয়তা / Popular</option>
              </select>
            </div>
          </div>

          <EventCategoryPillRow onPillChange={setActiveCategory} />

          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-light)' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
              <div>ইভেন্ট লোড হচ্ছে...</div>
            </div>
          ) : error ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#ef4444' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
              <div>{error}</div>
              <button
                onClick={loadEvents}
                style={{
                  marginTop: '12px', padding: '8px 20px', background: 'var(--teal)',
                  color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'
                }}
              >
                আবার চেষ্টা করুন
              </button>
            </div>
          ) : displayEvents.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-light)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
              <div>এখনো কোনো ইভেন্ট নেই। প্রথম ইভেন্ট তৈরি করুন!</div>
            </div>
          ) : (
            <div className="events-grid">
              {displayEvents.map((event, idx) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isWide={idx === 0}
                  selectedEventId={selectedEventId}
                  onSelectEvent={setSelectedEventId}
                  myRsvp={myRsvp}
                  onRsvpChange={handleRsvpChange}
                />
              ))}
            </div>
          )}
        </div>

        <EventDetailPanel
          event={selectedEvent ? {
            ...selectedEvent,
            goingCount: selectedEventRsvps.going_count,
            interestedCount: selectedEventRsvps.interested_count,
            guests: { going: selectedEventGuests, interested: [] },
          } : null}
          myRsvp={myRsvp}
          onRsvpChange={handleRsvpChange}
          eventId={selectedEventId}
        />
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '20px'
          }}
          onClick={() => !creating && setShowCreateModal(false)}
        >
          <div
            style={{
              background: 'white', borderRadius: '16px', padding: '28px',
              width: '100%', maxWidth: '520px', maxHeight: '90vh', overflow: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-bn)' }}>
              📅 নতুন ইভেন্ট তৈরি করো
            </h3>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', fontFamily: 'var(--font-bn)' }}>
                ইভেন্টের শিরোনাম *
              </label>
              <input
                type="text"
                value={createTitle}
                onChange={e => setCreateTitle(e.target.value)}
                placeholder="ইভেন্টের নাম লিখুন"
                style={{
                  width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb',
                  borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', fontFamily: 'var(--font-bn)' }}>
                বিবরণ *
              </label>
              <textarea
                value={createDesc}
                onChange={e => setCreateDesc(e.target.value)}
                placeholder="ইভেন্ট সম্পর্কে বিস্তারিত লিখুন..."
                rows={3}
                style={{
                  width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb',
                  borderRadius: '10px', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', fontFamily: 'var(--font-bn)' }}>
                  বিভাগ
                </label>
                <select
                  value={createCategory}
                  onChange={e => setCreateCategory(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb',
                    borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box'
                  }}
                >
                  {Object.entries(CATEGORY_MAP).map(([key, val]) => (
                    <option key={key} value={key}>{val.emoji} {val.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', fontFamily: 'var(--font-bn)' }}>
                  লোকেশন ধরন
                </label>
                <select
                  value={createLocationType}
                  onChange={e => setCreateLocationType(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb',
                    borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box'
                  }}
                >
                  <option value="physical">📍 ফিজিক্যাল / Physical</option>
                  <option value="online">🌐 অনলাইন / Online</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', fontFamily: 'var(--font-bn)' }}>
                লোকেশন / লিঙ্ক
              </label>
              <input
                type="text"
                value={createLocationText}
                onChange={e => setCreateLocationText(e.target.value)}
                placeholder={createLocationType === 'online' ? 'Zoom/Meet লিঙ্ক' : 'ঠিকানা'}
                style={{
                  width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb',
                  borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', fontFamily: 'var(--font-bn)' }}>
                ইভেন্টের তারিখ ও সময় *
              </label>
              <input
                type="datetime-local"
                value={createDate}
                onChange={e => setCreateDate(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb',
                  borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', fontFamily: 'var(--font-bn)' }}>
                কভার ছবি <span style={{ fontWeight: 400, color: 'var(--text-light)', fontSize: '11px' }}>(ঐচ্ছিক, সর্বোচ্চ 10MB)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setCreateCoverFile(e.target.files?.[0] || null)}
                style={{ width: '100%', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => !creating && setShowCreateModal(false)}
                disabled={creating}
                style={{
                  padding: '10px 20px', background: '#f3f4f6', border: 'none',
                  borderRadius: '10px', cursor: creating ? 'default' : 'pointer',
                  fontSize: '13px', fontFamily: 'var(--font-bn)'
                }}
              >
                বাতিল
              </button>
              <button
                onClick={handleCreateEvent}
                disabled={creating || !createTitle.trim() || !createDesc.trim() || !createDate}
                style={{
                  padding: '10px 24px', background: 'var(--teal)', color: 'white',
                  border: 'none', borderRadius: '10px',
                  cursor: creating || !createTitle.trim() || !createDesc.trim() || !createDate ? 'default' : 'pointer',
                  opacity: creating || !createTitle.trim() || !createDesc.trim() || !createDate ? 0.5 : 1,
                  fontSize: '13px', fontFamily: 'var(--font-bn)', fontWeight: 600
                }}
              >
                {creating ? 'তৈরি হচ্ছে...' : 'ইভেন্ট তৈরি করো'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
