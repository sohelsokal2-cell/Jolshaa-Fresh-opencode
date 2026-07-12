const SahajjoHero = ({ stats, onRequestHelp }) => {
  return (
    <div className="sahajjo-hero">
      <div className="hero-inner">
        <div className="hero-icon-wrap" aria-hidden="true">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 32 C8 28 10 26 13 26 L16 26 L16 22 C16 20 17.5 18.5 19.5 18.5 C21.5 18.5 23 20 23 22 L23 30" stroke="#1B6B5A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M44 32 C44 28 42 26 39 26 L36 26 L36 22 C36 20 34.5 18.5 32.5 18.5 C30.5 18.5 29 20 29 22 L29 30" stroke="#1B6B5A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M8 32 L8 38 C8 40 10 42 13 42 L39 42 C42 42 44 40 44 38 L44 32 C44 30 42 28 40 28 L12 28 C10 28 8 30 8 32 Z" fill="#E8F2EF" stroke="#1B6B5A" strokeWidth="1.8" />
            <path d="M26 26 C26 26 18 19 18 14.5 C18 11.5 20.5 9 23.5 9 C24.8 9 26 9.8 26 9.8 C26 9.8 27.2 9 28.5 9 C31.5 9 34 11.5 34 14.5 C34 19 26 26 26 26 Z" fill="#E85C4A" stroke="#c94030" strokeWidth="1.2" />
          </svg>
        </div>

        <div className="hero-text">
          <div className="hero-title">সাহায্য চাই</div>
          <span className="hero-title-en">Jolshaa · Need Help</span>
          <div className="hero-subtitle">প্রতিবেশী প্রতিবেশীর পাশে দাঁড়ায়। বিপদে একা নও — জলশার মানুষ আছে।</div>
          <span className="hero-subtitle-en">Neighbors standing together. You're never alone in a crisis — your Jolshaa community is here.</span>
        </div>

        <button className="btn-request-help" onClick={onRequestHelp}>
          <div className="brh-icon">🆘</div>
          <div>
            <div className="brh-bn">সাহায্যের অনুরোধ পাঠাও</div>
            <span className="brh-en">Request Help from Community</span>
          </div>
        </button>
      </div>

      <div className="hero-stats">
        <div className="hstat">
          <div className="hstat-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill="none" />
            </svg>
          </div>
          <div>
            <div className="hstat-val">{stats.resolved}</div>
            <div className="hstat-lbn">সাহায্য সম্পন্ন</div>
            <div className="hstat-len">Resolved</div>
          </div>
        </div>
        <div className="hstat-div" />
        <div className="hstat">
          <div className="hstat-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--urgent-red)" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <div className="hstat-val" style={{ color: 'var(--urgent-red)' }}>{stats.active}</div>
            <div className="hstat-lbn">সক্রিয় অনুরোধ</div>
            <div className="hstat-len">Active Requests</div>
          </div>
        </div>
        <div className="hstat-div" />
        <div className="hstat">
          <div className="hstat-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div>
            <div className="hstat-val" style={{ color: 'var(--teal)' }}>{stats.helpers}</div>
            <div className="hstat-lbn">সাহায্যকারী</div>
            <div className="hstat-len">Helpers</div>
          </div>
        </div>
        <div className="hstat-div" />
        <div className="hstat">
          <div className="hstat-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <div className="hstat-val" style={{ color: 'var(--amber)' }}>{stats.districts}</div>
            <div className="hstat-lbn">জেলায় সক্রিয়</div>
            <div className="hstat-len">Districts Active</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SahajjoHero;
