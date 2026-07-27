import React, { useState } from 'react';
import { Sfx } from './SfxEngine';

export default function BootScreen({ onStart, data }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    Sfx.click();
    setIsPlaying(true);
    setTimeout(() => {
      onStart();
    }, 350);
  };

  return (
    <section className="screen active" id="s-boot" style={{ paddingBottom: '32px' }}>
      <div className="stain" style={{ top: '6%', right: '-25px' }}></div>
      <div className="doodle" style={{ top: '10%', left: '8%', '--r': '-10deg' }}>✎</div>
      <div className="doodle" style={{ top: '18%', right: '8%', '--r': '8deg', color: 'var(--blush-deep)' }}>♡</div>
      <div className="doodle" style={{ bottom: '12%', left: '10%', '--r': '-6deg', color: 'var(--mint-deep)' }}>✦</div>

      <p className="eyebrow blink" style={{ letterSpacing: '0.08em', marginBottom: '4px', textAlign: 'center' }}>
        {"▶\uFE0E"} NEW GAME DELIVERY
      </p>
      <h1 className="hand" style={{ textAlign: 'center', fontSize: '1.4rem', marginBottom: '14px', color: '#2d1b2d' }}>
        📦 ตลับเกมมาส่งแล้ว!
      </h1>

      {/* Retro OS Pixel Music Player / Cartridge Window — fully SVG with foreignObject for play button */}
      <div className="pixel-player-container" style={{ width: '100%', maxWidth: '320px', margin: '0 auto', position: 'relative' }}>
        <div style={{ position: 'relative', width: '100%', filter: 'drop-shadow(0 10px 24px rgba(45, 27, 45, 0.18))' }}>
          <svg viewBox="0 0 320 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <defs>
              <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffb5cb" />
                <stop offset="50%" stopColor="#f49ac2" />
                <stop offset="100%" stopColor="#e29bd9" />
              </linearGradient>
              <linearGradient id="headerGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#b4b7f5" />
                <stop offset="100%" stopColor="#c3aef5" />
              </linearGradient>
              <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ff6584" />
                <stop offset="100%" stopColor="#ff9ebb" />
              </linearGradient>
              <filter id="shadowOffset" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="5" dy="5" stdDeviation="0" floodColor="#2d1b2d" floodOpacity="1" />
              </filter>
            </defs>

            {/* Outer Window Box — 452px tall to accommodate all rows */}
            <rect x="8" y="16" width="304" height="452" rx="22" fill="#FFF8FA" stroke="#2d1b2d" strokeWidth="4" filter="url(#shadowOffset)" />

            {/* Top Bar Header */}
            <path
              d="M 8 38 A 22 22 0 0 1 30 16 L 290 16 A 22 22 0 0 1 312 38 L 312 56 L 8 56 Z"
              fill="url(#headerGrad)"
              stroke="#2d1b2d"
              strokeWidth="4"
            />
            <line x1="8" y1="56" x2="312" y2="56" stroke="#2d1b2d" strokeWidth="4" />

            {/* Window Controls (Top Right) */}
            <circle cx="270" cy="36" r="7" fill="#ff7eb3" stroke="#2d1b2d" strokeWidth="2.5" />
            <circle cx="290" cy="36" r="7" fill="#ff4d7e" stroke="#2d1b2d" strokeWidth="2.5" />

            {/* Music Note Badge (Top Left) */}
            <g transform="translate(20, 24)">
              <rect x="0" y="0" width="32" height="24" rx="7" fill="#ffffff" stroke="#2d1b2d" strokeWidth="2.5" />
              <text x="16" y="17" textAnchor="middle" fontSize="14">🎵</text>
            </g>

            {/* ── Inner Screen Box ── */}
            <rect x="28" y="72" width="264" height="182" rx="16" fill="url(#screenGrad)" stroke="#2d1b2d" strokeWidth="4" />

            {/* Screen: LOVE SIMULATOR text */}
            <text x="160" y="108" textAnchor="middle" fontFamily="'Press Start 2P', monospace" fontSize="14" fontWeight="bold" fill="#ffffff" stroke="#2d1b2d" strokeWidth="3" paintOrder="stroke fill">
              LOVE
            </text>
            <text x="160" y="130" textAnchor="middle" fontFamily="'Press Start 2P', monospace" fontSize="11" fontWeight="bold" fill="#ffffff" stroke="#2d1b2d" strokeWidth="2.5" paintOrder="stroke fill">
              SIMULATOR
            </text>

            {/* Bunny Box */}
            <rect x="122" y="138" width="76" height="68" rx="14" fill="#ffffff" opacity="0.92" stroke="#2d1b2d" strokeWidth="2.5" />
            <text x="160" y="185" textAnchor="middle" fontSize="36">🐰</text>

            {/* Tagline */}
            <text x="160" y="238" textAnchor="middle" fontFamily="'Mali', cursive" fontWeight="700" fontSize="22" fill="#2d1b2d">
              ฉบับคนคลั่งรัก
            </text>

            {/* ── Row 1: 5 Dots ── (y=270) */}
            <g fill="#2d1b2d">
              <circle cx="120" cy="278" r="5" />
              <circle cx="140" cy="278" r="5" />
              <circle cx="160" cy="278" r="6" fill="#ff4d7e" stroke="#2d1b2d" strokeWidth="1.5" />
              <circle cx="180" cy="278" r="5" />
              <circle cx="200" cy="278" r="5" />
            </g>

            {/* ── Row 2: Progress Bar ── (y=294) */}
            <rect x="32" y="295" width="256" height="11" rx="5.5" fill="#f0e2e8" stroke="#2d1b2d" strokeWidth="2.5" />
            <rect x="32" y="295" width="165" height="11" rx="5.5" fill="url(#progressGrad)" stroke="#2d1b2d" strokeWidth="2.5" />

            {/* ── Row 3: Icon Controls (❤ ◀ [space] ▶ 🔁) ── (y=325) */}
            {/* Heart emoji left */}
            <text x="48" y="342" textAnchor="middle" fontSize="22">❤️</text>

            {/* Previous ◀ */}
            <g transform="translate(86, 326)" fill="#2d1b2d">
              <rect x="0" y="0" width="5" height="18" rx="2" />
              <polygon points="20,0 6,9 20,18" />
            </g>

            {/* Next ▶ */}
            <g transform="translate(214, 326)" fill="#2d1b2d">
              <polygon points="0,0 14,9 0,18" />
              <rect x="16" y="0" width="5" height="18" rx="2" />
            </g>

            {/* Repeat 🔁 right */}
            <g transform="translate(264, 322)" stroke="#2d1b2d" strokeWidth="3" fill="none">
              <path d="M 5 12 A 9 9 0 1 1 20 14" strokeLinecap="round" />
              <polygon points="20,19 26,12 16,12" fill="#2d1b2d" stroke="none" />
            </g>

            {/* ── Row 4: Play Button (foreignObject) ── (y=362–418) */}
            <foreignObject x="80" y="364" width="160" height="60">
              <div xmlns="http://www.w3.org/1999/xhtml" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <button
                  type="button"
                  onClick={handlePlay}
                  style={{
                    fontFamily: "'Mali', cursive",
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    color: '#ffffff',
                    background: 'linear-gradient(135deg, #ff4d7e 0%, #ff6584 100%)',
                    border: '3px solid #2d1b2d',
                    borderRadius: '9999px',
                    padding: '11px 28px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 0 #2d1b2d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    whiteSpace: 'nowrap',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onMouseDown={e => {
                    e.currentTarget.style.transform = 'translateY(3px)';
                    e.currentTarget.style.boxShadow = '0 1px 0 #2d1b2d';
                  }}
                  onMouseUp={e => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '0 4px 0 #2d1b2d';
                  }}
                  onTouchStart={e => {
                    e.currentTarget.style.transform = 'translateY(3px)';
                    e.currentTarget.style.boxShadow = '0 1px 0 #2d1b2d';
                  }}
                  onTouchEnd={e => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '0 4px 0 #2d1b2d';
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>
                    play_circle
                  </span>
                  เล่นเกม
                </button>
              </div>
            </foreignObject>
          </svg>
        </div>
      </div>

      {/* Recipient & Sender Paper Card */}
      <div
        className="paper-card"
        style={{
          marginTop: '20px',
          maxWidth: '320px',
          marginLeft: 'auto',
          marginRight: 'auto',
          position: 'relative',
          transform: 'rotate(-1deg)',
          background: '#FFFDF6',
          border: '2px solid #2d1b2d',
          boxShadow: '0 6px 16px rgba(45, 27, 45, 0.12)',
          padding: '14px 18px',
          borderRadius: '16px',
        }}
      >
        <div className="tape tc" style={{ width: '90px', top: '-12px' }}></div>
        <p className="hand" style={{ fontSize: '1rem', color: '#2d1b2d', margin: 0, textAlign: 'center', lineHeight: '1.6' }}>
          ถึง: <span style={{ color: '#b60e3d', fontWeight: 'bold' }}>{data.recipientName}</span> ♡<br />
          จาก: <span style={{ color: '#725477', fontWeight: 'bold' }}>{data.senderName}</span>
        </p>
      </div>
    </section>
  );
}
