import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import SettingsSidebar from '../components/SettingsSidebar';
import AccountSettingsPanel from '../components/AccountSettingsPanel';
import PrivacySettingsPanel from '../components/PrivacySettingsPanel';
import SecuritySettingsPanel from '../components/SecuritySettingsPanel';
import LanguageSettingsPanel from '../components/LanguageSettingsPanel';
import MoneySettingsPanel from '../components/MoneySettingsPanel';
import './Settings.css';

const CATEGORY_META = {
  account:  { bn: 'অ্যাকাউন্ট সেটিংস',  en: 'Account Settings' },
  privacy:  { bn: 'গোপনীয়তা',          en: 'Privacy' },
  security: { bn: 'নিরাপত্তা',          en: 'Security' },
  notif:    { bn: 'বিজ্ঞপ্তি',          en: 'Notifications' },
  lang:     { bn: 'ভাষা',               en: 'Language' },
  block:    { bn: 'ব্লক তালিকা',        en: 'Blocked List' },
  money:    { bn: 'মনিটাইজেশন',          en: 'Monetization' },
  help:     { bn: 'সাহায্য ও সাপোর্ট',  en: 'Help & Support' },
};

const DEFAULT_CATEGORY = { bn: 'সেটিংস', en: 'Settings' };

export default function Settings() {
  const { user, setUser } = useAuth();
  const [activeCategory, setActiveCategory] = useState('account');
  const isLanguageView = activeCategory === 'lang';

  const handleCategoryChange = (cat) => setActiveCategory(cat);

  const sidebarUser = user ? {
    name: user.full_name || user.name || '',
    handle: user.email ? `@${user.email.split('@')[0]} · Jolshaa` : 'Jolshaa',
    initial: (user.full_name || user.name || '?').charAt(0),
  } : {};

  const handleSettingsUpdate = (updates) => {
    if (user) setUser({ ...user, ...updates });
  };

  const renderPanel = () => {
    switch (activeCategory) {
      case 'account':
        return <AccountSettingsPanel />;
      case 'privacy':
        return <PrivacySettingsPanel settings={user} onUpdate={handleSettingsUpdate} />;
      case 'security':
        return <SecuritySettingsPanel />;
      case 'money':
        return <MoneySettingsPanel />;
      default:
        return (
          <div className="settings-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 22 }}>শীঘ্রই আসছে</div>
            <div style={{ fontFamily: 'var(--font-en)', fontSize: 12, color: 'var(--text-light)', marginTop: 6 }}>
              {(CATEGORY_META[activeCategory] || DEFAULT_CATEGORY).bn} — Coming soon
            </div>
          </div>
        );
    }
  };

  return (
    <div className="settings-page">
      <Navbar />

      <div className="page-body">
        <SettingsSidebar
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          user={sidebarUser}
        />

        <div className="content-area">
          <div className="main-panel">
            <div className="page-title-row">
              <div className="pt-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M12 15v2"/><path d="M9 9a3 3 0 116 0c0 1.5-1 2-1.5 2.5L12 15h-1l-1.5-1.5C9 13 8 12.5 8 11z"/></svg>
              </div>
              <div>
                <div className="pt-title-bn">{(CATEGORY_META[activeCategory] || DEFAULT_CATEGORY).bn}</div>
                <div className="pt-title-en">{(CATEGORY_META[activeCategory] || DEFAULT_CATEGORY).en}</div>
              </div>
            </div>
            {isLanguageView ? <LanguageSettingsPanel /> : renderPanel()}
          </div>

          {!isLanguageView && (
            <aside className="lang-panel">
              <LanguageSettingsPanel className="lang-panel-inner" />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
