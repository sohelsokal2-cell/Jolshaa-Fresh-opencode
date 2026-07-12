import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'bn', flag: '🇧🇩', native: 'বাংলা', en: 'Bengali · বর্তমান ভাষা' },
  { code: 'en', flag: '🇬🇧', native: 'English', en: 'English (UK)' },
  { code: 'hi', flag: '🇮🇳', native: 'हिंदी', en: 'Hindi · हिंदी' },
  { code: 'ar', flag: '🇸🇦', native: 'العربية', en: 'Arabic · عربی' },
  { code: 'ur', flag: '🇵🇰', native: 'اردو', en: 'Urdu · اردو' },
];

// Only these languages are wired to the real i18n system in this step.
const SUPPORTED_LANGS = ['bn', 'en'];

export default function LanguageSettingsPanel({ className }) {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'bn');

  const handleSelect = (code) => {
    setSelectedLanguage(code);
    if (SUPPORTED_LANGS.includes(code)) {
      i18n.changeLanguage(code);
    }
  };

  return (
    <div className={className || 'lang-settings-wrap'} aria-label="Language settings">
      <div className="lang-panel-title">
        <div className="lpt-icon">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
        </div>
        <div>
          <div className="lpt-bn">ভাষা নির্বাচন</div>
          <div className="lpt-en">Language · উদাহরণ / Preview</div>
        </div>
      </div>

      <div className="lang-card">
        {LANGUAGES.map((lang) => (
          <div
            key={lang.code}
            className={`lang-item ${selectedLanguage === lang.code ? 'selected' : ''}`}
            onClick={() => handleSelect(lang.code)}
          >
            <div className="lang-radio"><div className="lang-radio-dot" /></div>
            <span className="lang-flag">{lang.flag}</span>
            <div>
              <div className="lang-name-native">{lang.native}</div>
              <div className="lang-name-en">{lang.en}</div>
            </div>
            <div className="lang-check">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
        ))}
      </div>

      {/* App version info */}
      <div className="app-version">
        <div className="av-label">APP VERSION</div>
        <div className="av-value">Jolshaa v2.4.1 · Beta</div>
        <div className="av-note">সর্বশেষ আপডেট: ১০ জুলাই ২০২৫</div>
      </div>
    </div>
  );
}
