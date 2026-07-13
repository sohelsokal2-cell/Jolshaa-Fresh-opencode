import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import './Login.css';

// Import assets so Vite bundles them
import mealImg from '../assets/card_meal_1783598025690.png';
import rickshawImg from '../assets/card_rickshaw_1783598075647.png';
import videoCallImg from '../assets/card_video_call_1783598116850.png';
import teaShopImg from '../assets/card_tea_shop_1783598165220.png';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [variation, setVariation] = useState(1);
  const [time, setTime] = useState('--:--');
  const [activeLang, setActiveLang] = useState('bn');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Clock effect
  useEffect(() => {
    function updateClock() {
      const t = new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setTime(t);
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Image error fallback
  const handleImageError = (e, index) => {
    const gradients = [
      'linear-gradient(135deg,#F4A261,#E76F51)',
      'linear-gradient(135deg,#2A9678,#1B6B5A)',
      'linear-gradient(135deg,#E9C46A,#F4A261)',
      'linear-gradient(135deg,#264653,#2A9678)',
    ];
    e.target.parentElement.style.background = gradients[index % 4];
    e.target.style.display = 'none';
  };

  // Submit Handler
  const onSubmit = async (formData) => {
    setSubmitError('');
    setIsSubmitting(true);

    try {
      await signIn(formData.emailPhone, formData.password);
      navigate('/feed');
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.message || '';

      if (msg.includes('Invalid login credentials') || msg.includes('invalid')) {
        setSubmitError('ভুল ইমেইল বা পাসওয়ার্ড। আবার চেষ্টা করো। / Invalid email or password. Please try again.');
      } else if (msg.includes('Email not confirmed')) {
        setSubmitError('ইমেইল যাচাই করা হয়নি। ইনবক্স চেক করো। / Email not confirmed. Please check your inbox.');
      } else {
        setSubmitError(msg || 'সার্ভার ত্রুটি। পরে আবার চেষ্টা করো।');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* ===== LEFT BRAND SIDE ===== */}
      <div className="brand-side" id="brandSide">
        {/* Variation Toggle */}
        <div className="variation-toggle">
          <button
            className={`var-btn ${variation === 1 ? 'active' : ''}`}
            onClick={() => setVariation(1)}
          >
            Variation 1 — Cascade
          </button>
          <button
            className={`var-btn ${variation === 2 ? 'active' : ''}`}
            onClick={() => setVariation(2)}
          >
            Variation 2 — Orbit
          </button>
        </div>

        {/* VARIATION 1: DIAGONAL CASCADE */}
        <div className={`collage ${variation === 1 ? 'active' : ''}`} id="v1">
          <div
            className="photo-card c1-meal"
            style={{ width: '240px', height: '170px', top: '12%', left: '6%', '--rot': '-4deg', transform: 'rotate(-4deg)' }}
          >
            <img
              src={mealImg}
              alt="Family sharing home-cooked meal"
              onError={(e) => handleImageError(e, 0)}
            />
          </div>
          <div
            className="photo-card c1-rickshaw"
            style={{ width: '210px', height: '155px', top: '28%', left: '32%', '--rot': '3.5deg', transform: 'rotate(3.5deg)' }}
          >
            <img
              src={rickshawImg}
              alt="Colorful Dhaka rickshaw"
              onError={(e) => handleImageError(e, 1)}
            />
          </div>
          <div
            className="photo-card c1-video"
            style={{ width: '200px', height: '145px', top: '14%', left: '55%', '--rot': '-2deg', transform: 'rotate(-2deg)' }}
          >
            <img
              src={videoCallImg}
              alt="Family video call"
              onError={(e) => handleImageError(e, 2)}
            />
          </div>
          <div
            className="photo-card c1-tea"
            style={{ width: '225px', height: '160px', top: '54%', left: '10%', '--rot': '2.5deg', transform: 'rotate(2.5deg)' }}
          >
            <img
              src={teaShopImg}
              alt="Local tea shop"
              onError={(e) => handleImageError(e, 3)}
            />
          </div>

          {/* Floating Badges */}
          <div className="float-badge badge-sahajjo" style={{ top: '42%', left: '4%' }}>
            <span className="dot"></span>
            <span style={{ fontFamily: "'Hind Siliguri', sans-serif", fontSize: '11px' }}>সাহায্য চাই</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: '#aaa', fontWeight: 400 }}> · need help</span>
          </div>
          <div className="float-badge badge-clock" style={{ top: '7%', left: '42%' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span style={{ fontSize: '11px', letterSpacing: '0.05em' }}>{time}</span>
            <span style={{ fontSize: '10px', opacity: 0.75 }}>লাইভ</span>
          </div>
          <div className="float-badge badge-verified" style={{ top: '70%', left: '38%' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1B6B5A" strokeWidth="2.5">
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span style={{ fontFamily: "'Hind Siliguri', sans-serif", fontSize: '11px', color: '#1B6B5A' }}>যাচাইকৃত কমিউনিটি</span>
          </div>
          <div className="float-badge badge-reaction" style={{ top: '48%', left: '52%', fontSize: '17px' }}>❤️ 🎉 😂</div>
          <div className="float-badge badge-reaction" style={{ top: '23%', left: '27%', fontSize: '15px' }}>🍛 👋</div>
        </div>

        {/* VARIATION 2: SCATTERED ORBIT */}
        <div className={`collage ${variation === 2 ? 'active' : ''}`} id="v2">
          <div
            className="photo-card c2-meal"
            style={{ width: '280px', height: '200px', top: '22%', left: '18%', '--rot': '-2deg', transform: 'rotate(-2deg)' }}
          >
            <img
              src={mealImg}
              alt="Family sharing home-cooked meal"
              onError={(e) => handleImageError(e, 0)}
            />
          </div>
          <div
            className="photo-card c2-rickshaw"
            style={{ width: '175px', height: '125px', top: '8%', left: '60%', '--rot': '6deg', transform: 'rotate(6deg)' }}
          >
            <img
              src={rickshawImg}
              alt="Colorful Dhaka rickshaw"
              onError={(e) => handleImageError(e, 1)}
            />
          </div>
          <div
            className="photo-card c2-video"
            style={{ width: '185px', height: '135px', top: '56%', left: '54%', '--rot': '-5deg', transform: 'rotate(-5deg)' }}
          >
            <img
              src={videoCallImg}
              alt="Family video call"
              onError={(e) => handleImageError(e, 2)}
            />
          </div>
          <div
            className="photo-card c2-tea"
            style={{ width: '160px', height: '120px', top: '6%', left: '4%', '--rot': '3deg', transform: 'rotate(3deg)' }}
          >
            <img
              src={teaShopImg}
              alt="Local tea shop"
              onError={(e) => handleImageError(e, 3)}
            />
          </div>

          {/* Floating Badges */}
          <div className="float-badge badge-sahajjo" style={{ top: '46%', left: '52%' }}>
            <span className="dot"></span>
            <span style={{ fontFamily: "'Hind Siliguri', sans-serif", fontSize: '11px' }}>সাহায্য চাই</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: '#aaa', fontWeight: 400 }}> · need help</span>
          </div>
          <div className="float-badge badge-clock" style={{ top: '32%', left: '5%' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span style={{ fontSize: '11px', letterSpacing: '0.05em' }}>{time}</span>
            <span style={{ fontSize: '10px', opacity: 0.75 }}>লাইভ</span>
          </div>
          <div className="float-badge badge-verified" style={{ top: '72%', left: '22%' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1B6B5A" strokeWidth="2.5">
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span style={{ fontFamily: "'Hind Siliguri', sans-serif", fontSize: '11px', color: '#1B6B5A' }}>যাচাইকৃত কমিউনিটি</span>
          </div>
          <div className="float-badge badge-reaction" style={{ top: '18%', left: '38%', fontSize: '17px' }}>❤️ 🎉 😂</div>
          <div className="float-badge badge-reaction" style={{ top: '65%', left: '58%', fontSize: '15px' }}>🍛 👋</div>
        </div>

        {/* Decorative Motifs */}
        <svg className="deco-motif deco-paper-boat" viewBox="0 0 100 80" fill="none">
          <path d="M10 55 L50 10 L90 55 Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
          <path d="M10 55 Q50 70 90 55" stroke="currentColor" strokeWidth="2.5" />
          <path d="M50 10 L50 55" stroke="currentColor" strokeWidth="2" strokeDasharray="4,3" />
        </svg>
        <svg className="deco-motif deco-rickshaw-sil" viewBox="0 0 120 80" fill="none">
          <ellipse cx="35" cy="65" rx="12" ry="12" stroke="currentColor" strokeWidth="3" />
          <ellipse cx="95" cy="65" rx="12" ry="12" stroke="currentColor" strokeWidth="3" />
          <rect x="30" y="25" width="60" height="32" rx="6" stroke="currentColor" strokeWidth="2.5" />
          <path d="M30 40 L5 55" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M90 40 L115 40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>

        {/* Headline */}
        <div className="headline-block">
          <div className="headline-bn">তোমার মানুষদের<br />কাছাকাছি থাকো</div>
          <div className="headline-en">Stay close to the people who matter most</div>
          <div className="subline">
            <span className="subline-bn">বাংলাদেশের নিজের সোশ্যাল মিডিয়া</span>
            <span className="subline-sep">·</span>
            <span className="subline-en">Bangladesh's own community platform</span>
          </div>
        </div>
      </div>

      {/* ===== RIGHT LOGIN SIDE ===== */}
      <div className="login-side">
        <div className="login-card">
          {/* Logo */}
          <div className="logo-badge" role="img" aria-label="Jolshaa logo">
            <span className="j-mark">জ</span>
          </div>

          {/* Wordmark */}
          <div className="brand-wordmark">জলশা · Jolshaa</div>

          {/* Welcome */}
          <div className="welcome-block">
            <div className="welcome-bn">আবার দেখা হলো! 👋</div>
            <div className="welcome-en">Welcome back! Sign in to continue.</div>
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="field-group">
              <div className="field-label">
                <span className="field-label-bn">ইমেইল বা ফোন নম্বর</span>
                <span className="field-label-sep">/</span>
                <span className="field-label-en">Email or Phone</span>
              </div>
              <input
                id="emailPhone"
                type="text"
                className="field-input"
                placeholder="example@email.com or 017XXXXXXXX"
                autoComplete="username"
                {...register('emailPhone', { required: true })}
              />
              {errors.emailPhone && (
                <span className="text-red-500 text-xs font-semibold mt-1">
                  Email or phone is required / ইমেইল বা ফোন নম্বর আবশ্যক
                </span>
              )}
            </div>

            <div className="field-group">
              <div className="field-label">
                <span className="field-label-bn">পাসওয়ার্ড</span>
                <span className="field-label-sep">/</span>
                <span className="field-label-en">Password</span>
              </div>
              <input
                id="password"
                type="password"
                className="field-input"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('password', { required: true })}
              />
              {errors.password && (
                <span className="text-red-500 text-xs font-semibold mt-1">
                  Password is required / পাসওয়ার্ড আবশ্যক
                </span>
              )}
            </div>

            {/* Submit error display */}
            {submitError && (
              <div className="text-red-500 text-sm font-semibold text-center mt-1 leading-snug">
                {submitError}
              </div>
            )}

            <button type="submit" className="btn-primary" id="loginBtn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="btn-bn">লগ ইন করা হচ্ছে...</span>
                  <span className="btn-en">Logging In...</span>
                </>
              ) : (
                <>
                  <span className="btn-bn">লগ ইন করুন</span>
                  <span className="btn-en">Log In</span>
                </>
              )}
            </button>

            <div className="forgot-row">
              <a href="#" className="forgot-link">
                <span className="forgot-bn">পাসওয়ার্ড ভুলে গেছেন?</span>
                <span className="forgot-en">/ Forgot password?</span>
              </a>
            </div>

            <div className="divider">
              <div className="divider-line"></div>
              <div className="divider-text">
                <span className="divider-bn">অথবা</span>
                <span className="divider-sep">·</span>
                <span className="divider-en">OR</span>
              </div>
              <div className="divider-line"></div>
            </div>

            <button
              type="button"
              className="btn-secondary"
              id="createAccountBtn"
              onClick={() => navigate('/signup')}
            >
              <span className="btn-bn">নতুন অ্যাকাউন্ট তৈরি করুন</span>
              <span className="btn-en">Create New Account</span>
            </button>
          </form>

          {/* Language Selector */}
          <nav className="lang-selector" aria-label="Language selector">
            <button
              className={`lang-item ${activeLang === 'bn' ? 'active' : ''}`}
              onClick={() => setActiveLang('bn')}
            >
              বাংলা
            </button>
            <span className="lang-dot">●</span>
            <button
              className={`lang-item ${activeLang === 'en' ? 'active' : ''}`}
              onClick={() => setActiveLang('en')}
            >
              English
            </button>
            <span className="lang-dot">●</span>
            <button className="lang-item" style={{ cursor: 'not-allowed', opacity: 0.6 }} disabled>
              हिन्दी
            </button>
            <span className="lang-dot">●</span>
            <button className="lang-item" style={{ cursor: 'not-allowed', opacity: 0.6 }} disabled>
              اردو
            </button>
            <span className="lang-dot">●</span>
            <button className="lang-item" style={{ cursor: 'not-allowed', opacity: 0.6 }} disabled>
              中文
            </button>
          </nav>

          {/* Footer */}
          <div className="login-footer">
            <span className="footer-bn">© ২০২৬ জলশা</span>
            <span className="footer-sep">·</span>
            <span className="footer-en">© 2026 Jolshaa — All rights reserved</span>
          </div>
        </div>
      </div>

      <div className="mobile-note">
        📱 মোবাইলে: ব্র্যান্ড কোলাজ উপরে, লগইন প্যানেল নিচে স্ট্যাক হয়। | Mobile: Brand story stacks above login panel.
      </div>
    </div>
  );
}
