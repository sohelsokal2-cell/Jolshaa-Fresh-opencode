import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import './Signup.css';

// Regexes (exact same as original HTML)
const BD_PHONE_REGEX = /^(\+?880|0)1[0-9]{9}$/;
const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Progress step mapping (exact same as original HTML)
const PROGRESS_MAP = {
  firstName: 1, lastName: 1,
  dobDay: 2, dobMonth: 2, dobYear: 2, gender: 2,
  contactInfo: 2,
  password: 3,
};

// Strength scoring (exact same logic as original HTML)
function getStrength(pw) {
  if (!pw) return { score: 0, cls: '', label: '' };
  let score = 0;
  if (pw.length >= 8)                                      score++;
  if (/[A-Z]/.test(pw) || /[\u0980-\u09FF]/.test(pw))    score++;
  if (/[0-9]/.test(pw))                                    score++;
  if (/[^A-Za-z0-9\u0980-\u09FF]/.test(pw))              score++;
  const cls    = ['', 'weak', 'medium', 'medium', 'strong'][score] || 'weak';
  const labels = ['', 'দুর্বল', 'মাঝারি', 'ভালো', 'শক্তিশালী'];
  return { score, cls, label: labels[score] || '' };
}

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  // --- DOB options generated once ---
  const dayOptions  = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(
    () => Array.from({ length: 96 }, (_, i) => currentYear - 5 - i),
    [currentYear]
  );

  // --- Local UI state ---
  const [activeStep,    setActiveStep]    = useState(1);
  const [showPassword,  setShowPassword]  = useState(false);
  const [pwValue,       setPwValue]       = useState('');
  const [contactValid,  setContactValid]  = useState(null); // true | false | null
  const [contactError,  setContactError]  = useState('');   // custom error text
  const [activeLang,    setActiveLang]    = useState('bn');
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [apiError,      setApiError]      = useState('');

  // --- react-hook-form ---
  const { register, handleSubmit, formState: { errors }, getValues } = useForm();

  // --- Progress strip ---
  const updateStep = (fieldName) => {
    const step = PROGRESS_MAP[fieldName];
    if (step) setActiveStep(step);
  };

  const stepState = (n) => {
    if (n < activeStep) return 'done';
    if (n === activeStep) return 'active';
    return 'idle';
  };

  // --- Contact blur validation ---
  const handleContactBlur = (e) => {
    const v = e.target.value.trim();
    if (!v) { setContactValid(null); setContactError(''); return; }
    const isPhone = BD_PHONE_REGEX.test(v.replace(/\s/g, ''));
    const isEmail = EMAIL_REGEX.test(v);
    if (isPhone) {
      // Phone-only: Supabase Auth requires email — show guidance
      setContactValid(false);
      setContactError('নিবন্ধনের জন্য ইমেইল প্রয়োজন। ফোন নম্বর পরে প্রোফাইলে যোগ করা যাবে। / Email is required to create an account. You can add your phone number from your profile later.');
    } else if (isEmail) {
      setContactValid(true);
      setContactError('');
    } else {
      setContactValid(false);
      setContactError('সঠিক ইমেইল লিখো / Please enter a valid email address');
    }
  };

  const handleContactFocus = () => {
    setContactValid(null);
    setContactError('');
  };

  // --- Submit ---
  const onSubmit = async (data) => {
    setApiError('');

    const cv = data.contactInfo?.trim() || '';
    const isEmail = EMAIL_REGEX.test(cv);
    if (!cv || !isEmail) {
      setContactValid(false);
      setContactError(!cv
        ? 'ইমেইল আবশ্যক / Email is required'
        : 'সঠিক ইমেইল লিখো / Please enter a valid email address');
      return;
    }

    if (!data.password || data.password.length < 8) return;

    setIsSubmitting(true);

    const fullName    = `${data.firstName.trim()} ${data.lastName.trim()}`;
    const dobDay      = data.dobDay   || '';
    const dobMonth    = data.dobMonth || '';
    const dobYear     = data.dobYear  || '';
    const dateOfBirth = (dobDay && dobMonth && dobYear)
      ? `${dobYear}-${String(dobMonth).padStart(2, '0')}-${String(dobDay).padStart(2, '0')}`
      : null;

    try {
      await signUp(cv, data.password, fullName, dateOfBirth, data.gender || null);
      setSubmitSuccess(true);
      setTimeout(() => navigate('/feed'), 1200);
    } catch (err) {
      const msg = err.message || '';

      if (msg.includes('already') || msg.includes('already registered')) {
        setContactValid(false);
        setContactError('এই ইমেইলে ইতিমধ্যে একটি অ্যাকাউন্ট আছে। / An account with this email already exists.');
      } else if (msg.includes('valid email')) {
        setContactValid(false);
        setContactError('সঠিক ইমেইল লিখো / Please enter a valid email address');
      } else if (msg.includes('Password')) {
        setApiError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে। / Password must be at least 6 characters.');
      } else {
        setApiError(msg || 'কিছু একটা ভুল হয়েছে। আবার চেষ্টা করো।');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Derive button label
  const btnLabel = submitSuccess
    ? '✓ হয়ে গেছে! রিডাইরেক্ট হচ্ছে...'
    : isSubmitting
      ? 'তৈরি হচ্ছে...'
      : 'যোগ দাও';

  const btnStyle = submitSuccess
    ? { background: 'linear-gradient(135deg, #15553F, #1B6B5A)' }
    : {};

  return (
    <div className="page-shell">

      {/* TOP BAR */}
      <header className="top-bar" role="banner">
        <button className="back-btn" aria-label="লগইন পেজে ফিরে যাও" onClick={() => navigate('/login')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          <span>ফিরে যাও</span>
        </button>

        <div className="logo-lockup" aria-label="জলশা লোগো">
          <div className="logo-badge-sm" role="img" aria-label="জলশা ব্যাজ">
            <span className="j-mark">জ</span>
          </div>
          <span className="logo-wordmark-sm">Jolshaa</span>
        </div>

        <div className="top-bar-spacer" aria-hidden="true"></div>
      </header>

      {/* SIGNUP CARD */}
      <main className="signup-card" role="main">

        {/* Decorative dots */}
        <svg className="deco-dots" width="80" height="80" viewBox="0 0 80 80" aria-hidden="true" fill="#1B6B5A">
          <circle cx="8"  cy="8"  r="3"/><circle cx="24" cy="8"  r="3"/>
          <circle cx="40" cy="8"  r="3"/><circle cx="56" cy="8"  r="3"/>
          <circle cx="8"  cy="24" r="3"/><circle cx="24" cy="24" r="3"/>
          <circle cx="40" cy="24" r="3"/><circle cx="8"  cy="40" r="3"/>
          <circle cx="24" cy="40" r="3"/>
        </svg>

        {/* Heading */}
        <div className="heading-block">
          <h1 className="heading-main">জলশায় যোগ দাও</h1>
          <p className="heading-sub">তোমার প্রিয় মানুষদের সাথে প্রতিদিনের গল্প ভাগ করো — পরিবার, বন্ধু, আর তোমার নিজের কমিউনিটির সাথে।</p>
        </div>

        {/* Progress strip */}
        <nav className="progress-strip" aria-label="নিবন্ধন অগ্রগতি" role="navigation">
          {[1, 2, 3].map((n, i) => (
            <React.Fragment key={n}>
              <div className="progress-step">
                <div className={`step-dot ${stepState(n)}`} aria-current={activeStep === n ? 'step' : undefined}>
                  {n}
                </div>
                <span className={`step-label ${activeStep === n ? 'active' : ''}`}>
                  {['ব্যক্তিগত', 'যোগাযোগ', 'নিরাপত্তা'][i]}
                </span>
              </div>
              {n < 3 && (
                <div className={`progress-line ${activeStep > n ? 'done' : ''}`} aria-hidden="true" />
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* FORM */}
        <form className="signup-form" onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* SECTION 1: নাম */}
          <section className="form-section" aria-labelledby="sec-name">
            <span className="section-label" id="sec-name">নাম</span>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label" htmlFor="firstName">
                  নামের প্রথম অংশ<span className="required-dot" aria-label="প্রয়োজনীয়">•</span>
                </label>
                <input
                  id="firstName"
                  className={`field-input ${errors.firstName ? 'invalid' : ''}`}
                  type="text"
                  placeholder="যেমন: সুমাইয়া"
                  autoComplete="given-name"
                  onFocus={() => updateStep('firstName')}
                  {...register('firstName', { required: true })}
                  onBlur={(e) => {
                    if (e.target.value.trim()) e.target.classList.add('valid');
                    else e.target.classList.remove('valid');
                  }}
                />
                {errors.firstName && <span className="field-error show">নামের প্রথম অংশ লিখো</span>}
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="lastName">
                  পদবী<span className="required-dot" aria-label="প্রয়োজনীয়">•</span>
                </label>
                <input
                  id="lastName"
                  className={`field-input ${errors.lastName ? 'invalid' : ''}`}
                  type="text"
                  placeholder="যেমন: আক্তার"
                  autoComplete="family-name"
                  onFocus={() => updateStep('lastName')}
                  {...register('lastName', { required: true })}
                  onBlur={(e) => {
                    if (e.target.value.trim()) e.target.classList.add('valid');
                    else e.target.classList.remove('valid');
                  }}
                />
                {errors.lastName && <span className="field-error show">পদবী লিখো</span>}
              </div>
            </div>
          </section>

          {/* SECTION 2: জন্মতারিখ ও লিঙ্গ */}
          <section className="form-section" aria-labelledby="sec-dob">
            <span className="section-label" id="sec-dob">জন্মতারিখ ও পরিচয়</span>
            <div className="field-group">
              <label className="field-label" htmlFor="dobDay">
                জন্মতারিখ<span className="required-dot" aria-label="প্রয়োজনীয়">•</span>
              </label>
              <div className="dob-row" role="group" aria-label="জন্মতারিখ">
                <div className="dob-wrap day">
                  <select
                    className="field-select"
                    id="dobDay"
                    onFocus={() => updateStep('dobDay')}
                    {...register('dobDay')}
                  >
                    <option value="" disabled>দিন</option>
                    {dayOptions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="dob-wrap month">
                  <select
                    className="field-select"
                    id="dobMonth"
                    onFocus={() => updateStep('dobMonth')}
                    {...register('dobMonth')}
                  >
                    <option value="" disabled>মাস</option>
                    {['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর']
                      .map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div className="dob-wrap year">
                  <select
                    className="field-select"
                    id="dobYear"
                    onFocus={() => updateStep('dobYear')}
                    {...register('dobYear')}
                  >
                    <option value="" disabled>বছর</option>
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="gender">লিঙ্গ</label>
              <div className="gender-wrap">
                <select
                  className="field-select"
                  id="gender"
                  onFocus={() => updateStep('gender')}
                  {...register('gender')}
                >
                  <option value="">তোমার লিঙ্গ নির্বাচন করো</option>
                  <option value="male">পুরুষ</option>
                  <option value="female">মহিলা</option>
                  <option value="other">অন্যান্য</option>
                  <option value="prefer_not">বলতে চাই না</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECTION 3: যোগাযোগ */}
          <section className="form-section" aria-labelledby="sec-contact">
            <span className="section-label" id="sec-contact">যোগাযোগ</span>
            <div className="field-group">
              <label className="field-label" htmlFor="contactInfo">
                ইমেইল<span className="required-dot" aria-label="প্রয়োজনীয়">•</span>
              </label>
              <input
                id="contactInfo"
                className={`field-input ${
                  contactValid === true ? 'valid' : contactValid === false ? 'invalid' : ''
                }`}
                type="text"
                placeholder="name@email.com"
                autoComplete="username"
                onFocus={() => { updateStep('contactInfo'); handleContactFocus(); }}
                onBlur={handleContactBlur}
                {...register('contactInfo', { required: true })}
              />
              {(contactError || (errors.contactInfo && !contactError)) && (
                <span className="field-error show">
                  {contactError || 'ইমেইল আবশ্যক / Email is required'}
                </span>
              )}
            </div>
          </section>

          {/* SECTION 4: নিরাপত্তা */}
          <section className="form-section" aria-labelledby="sec-security">
            <span className="section-label" id="sec-security">নিরাপত্তা</span>
            <div className="field-group">
              <label className="field-label" htmlFor="password">
                পাসওয়ার্ড<span className="required-dot" aria-label="প্রয়োজনীয়">•</span>
              </label>
              <div className="password-wrap">
                <input
                  id="password"
                  className={`field-input ${errors.password ? 'invalid' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="কমপক্ষে ৮টি অক্ষর"
                  autoComplete="new-password"
                  onFocus={() => updateStep('password')}
                  {...register('password', { required: true, minLength: 8 })}
                  onChange={(e) => setPwValue(e.target.value)}
                />
                <button
                  type="button"
                  className="pw-toggle"
                  aria-label={showPassword ? 'পাসওয়ার্ড লুকাও' : 'পাসওয়ার্ড দেখাও'}
                  onClick={() => setShowPassword(p => !p)}
                >
                  {/* Eye open */}
                  <svg style={{ display: showPassword ? 'none' : 'block' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  {/* Eye closed */}
                  <svg style={{ display: showPassword ? 'block' : 'none' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>

              {/* Strength meter */}
              {(() => {
                const { score, cls, label } = getStrength(pwValue);
                const segs = ['', 'weak', 'medium', 'medium', 'strong'];
                return (
                  <>
                    <div className="strength-bar-wrap" aria-hidden="true">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`strength-seg ${i <= score ? (segs[score] || 'weak') : ''}`} />
                      ))}
                    </div>
                    <div className={`strength-label ${cls}`} aria-live="polite">
                      {label ? `পাসওয়ার্ড শক্তি: ${label}` : ''}
                    </div>
                  </>
                );
              })()}

              {errors.password && (
                <span className="field-error show">
                  পাসওয়ার্ড কমপক্ষে ৮টি অক্ষর হতে হবে
                </span>
              )}
            </div>

            {/* Legal text */}
            <p className="legal-text">
              "যোগ দাও" বোতামে চাপ দিলে তুমি জলশার{' '}
              <a href="#" aria-label="শর্তাবলী পড়ো">শর্তাবলী</a> এবং{' '}
              <a href="#" aria-label="গোপনীয়তা নীতি পড়ো">গোপনীয়তা নীতি</a>
              -তে রাজি হচ্ছ বলে ধরা হবে। তোমার তথ্য আমাদের কাছে নিরাপদ।
            </p>
          </section>

          {/* API-level error */}
          {apiError && (
            <div style={{
              fontFamily: 'var(--font-bn)', fontSize: '12.5px', color: '#E85C4A',
              background: 'rgba(232,92,74,0.06)', border: '1px solid rgba(232,92,74,0.2)',
              borderRadius: '9px', padding: '10px 14px', textAlign: 'center',
            }}>
              {apiError}
            </div>
          )}

          {/* Submit */}
          <div className="form-section" style={{ gap: 0, animationDelay: '0.38s' }}>
            <button
              type="submit"
              className="btn-primary"
              id="submitBtn"
              disabled={isSubmitting || submitSuccess}
              style={btnStyle}
            >
              {btnLabel}
            </button>
            <p className="submit-nudge">
              <span className="nudge-icon">✦</span>
              মাত্র এক মিনিটেই তৈরি হয়ে যাবে তোমার জলশা অ্যাকাউন্ট
            </p>
          </div>

          {/* Login link */}
          <div className="login-link-row">
            <span className="login-link-label">ইতিমধ্যে অ্যাকাউন্ট আছে?</span>
            <button
              type="button"
              className="login-link"
              onClick={() => navigate('/login')}
            >
              লগ ইন করো →
            </button>
          </div>

        </form>
      </main>

      {/* FOOTER */}
      <footer className="page-footer" role="contentinfo">
        <nav className="lang-selector" aria-label="ভাষা নির্বাচন">
          <button className={`lang-item ${activeLang === 'bn' ? 'active' : ''}`} onClick={() => setActiveLang('bn')}>বাংলা</button>
          <span className="lang-dot" aria-hidden="true">●</span>
          <button className={`lang-item ${activeLang === 'en' ? 'active' : ''}`} onClick={() => setActiveLang('en')}>English</button>
          <span className="lang-dot" aria-hidden="true">●</span>
          <button className="lang-item" disabled style={{ cursor: 'not-allowed', opacity: 0.5 }}>हिन्दी</button>
          <span className="lang-dot" aria-hidden="true">●</span>
          <button className="lang-item" disabled style={{ cursor: 'not-allowed', opacity: 0.5 }}>اردو</button>
          <span className="lang-dot" aria-hidden="true">●</span>
          <button className="lang-item" disabled style={{ cursor: 'not-allowed', opacity: 0.5 }}>中文</button>
        </nav>
        <p className="footer-copy">© ২০২৬ জলশা · Jolshaa — All rights reserved</p>
      </footer>

    </div>
  );
}
