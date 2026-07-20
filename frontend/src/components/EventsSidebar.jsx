const EventsSidebar = ({ activeTab, onTabChange, activeCategory, onCategoryChange, onSelectEvent, upcomingEvents, onCreateEvent }) => {
  const tabs = [
    { id: 'yours', iconClass: 'sti-yours', icon: '👤', bn: 'তোমার ইভেন্ট', en: 'Your Events', badge: '৩' },
    { id: 'discover', iconClass: 'sti-disc', icon: '🔍', bn: 'আবিষ্কার করো', en: 'Discover' },
    { id: 'hosting', iconClass: 'sti-host', icon: '🛡️', bn: 'তুমি আয়োজন করছো', en: 'Hosting' },
  ];

  const categories = [
    { id: 'all', bn: 'সব বিভাগ', en: 'All Categories', count: '৪৭', dotClass: '' },
    { id: 'music', bn: 'সংগীত', en: 'Music', count: '১২', dotClass: 'cfi-music' },
    { id: 'sports', bn: 'খেলাধুলা', en: 'Sports', count: '৮', dotClass: 'cfi-sports' },
    { id: 'community', bn: 'সম্প্রদায়', en: 'Community', count: '১৫', dotClass: 'cfi-comm' },
    { id: 'education', bn: 'শিক্ষা', en: 'Education', count: '৭', dotClass: 'cfi-edu' },
    { id: 'arts', bn: 'শিল্পকলা', en: 'Arts & Culture', count: '৫', dotClass: 'cfi-arts' },
  ];

  return (
    <aside className="sidebar-left" aria-label="Events navigation">
      <div className="sb-hdr">
        <div className="sb-hdr-icon">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="3" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <div>
          <div className="sb-title-bn">ইভেন্ট</div>
          <div className="sb-title-en">Events · Jolshaa</div>
        </div>
      </div>

      <button className="btn-create-event" onClick={onCreateEvent}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        ইভেন্ট তৈরি করো
        <span style={{ fontFamily: 'var(--font-en)', fontSize: '10px', opacity: 0.8 }}>/ Create Event</span>
      </button>

      <div className="sb-nav-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`sb-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <div className={`st-icon ${tab.iconClass}`}>
              <span style={{ fontSize: '15px' }}>{tab.icon}</span>
            </div>
            <div>
              <div className="st-bn">{tab.bn}</div>
              <div className="st-en">{tab.en}</div>
            </div>
            {tab.badge && <span className="st-badge">{tab.badge}</span>}
          </button>
        ))}
      </div>

      <div className="sb-section-lbl">বিভাগ / Category</div>
      <div className="sb-cat-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`cat-filter-item ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat.id)}
          >
            <div
              className={`cfi-dot ${cat.dotClass}`}
              style={!cat.dotClass ? { background: 'linear-gradient(135deg,#1B6B5A,#2a9678)' } : {}}
            />
            <div>
              <div className="cfi-bn">{cat.bn}</div>
              <div className="cfi-en">{cat.en}</div>
            </div>
            <span className="cfi-count">{cat.count}</span>
          </button>
        ))}
      </div>

      <div className="sb-divider" />
      <div className="sb-upcoming">
        <div className="sb-upcoming-hdr">📅 আসছে শীঘ্রই</div>
        {upcomingEvents.map((event) => (
          <div
            key={event.id}
            className="upcoming-row"
            onClick={() => onSelectEvent(event.id)}
          >
            <div
              className="ur-date-badge"
              style={{
                background: event.dateBg,
                border: `1.5px solid ${event.dateBorder}`,
              }}
            >
              <div className="udb-day" style={event.dayColor ? { color: event.dayColor } : {}}>
                {event.day}
              </div>
              <div className="udb-mon">{event.month}</div>
            </div>
            <div className="ur-title">{event.title}</div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default EventsSidebar;
