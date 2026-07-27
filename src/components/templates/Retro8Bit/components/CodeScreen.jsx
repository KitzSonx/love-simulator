import React, { useState } from 'react';
import { Sfx } from './SfxEngine';
import { burst } from './Effects';

export default function CodeScreen({ data, onComplete }) {
  const [codeIdx, setCodeIdx] = useState(0);
  const password = data?.password || 'คลั่งรัก101';
  const CODE_CHUNKS = Array.from(password);

  const handlePress = () => {
    if (codeIdx >= CODE_CHUNKS.length) {
      Sfx.type();
      return;
    }
    Sfx.type();
    setCodeIdx((prev) => prev + 1);

    if (codeIdx + 1 >= CODE_CHUNKS.length) {
      Sfx.beep(880, 0.15, 'triangle', 0.15);
    }
  };

  const handleConfirm = () => {
    Sfx.fanfare();
    burst(10);
    setTimeout(() => onComplete(), 900);
  };

  const codeString = CODE_CHUNKS.slice(0, codeIdx).join('');
  const isComplete = codeIdx >= CODE_CHUNKS.length;

  return (
    <section className="screen active" id="s-code" style={{ paddingBottom: '32px' }}>
      <div className="stain" style={{ bottom: '6%', left: '-34px' }}></div>
      <div className="doodle" style={{ top: '8%', right: '8%', '--r': '8deg', color: 'var(--blush-deep)' }}>♡</div>
      <div className="doodle" style={{ bottom: '12%', left: '10%', '--r': '-6deg', color: 'var(--mint-deep)' }}>✦</div>

      <p className="eyebrow blink" style={{ letterSpacing: '0.08em', marginBottom: '4px', textAlign: 'center' }}>
        {"▶\uFE0E"} STAGE 1 : PASSWORD
      </p>
      <h1 className="hand" style={{ textAlign: 'center', fontSize: '1.4rem', marginBottom: '14px', color: '#2d1b2d' }}>
        🔐 กรุณาพิมพ์รหัสลับ
      </h1>

      {/* Retro OS Pixel Cartridge Window */}
      <div className="pixel-player-container" style={{ width: '100%', maxWidth: '320px', margin: '0 auto', position: 'relative' }}>
        <div style={{ position: 'relative', width: '100%', filter: 'drop-shadow(0 10px 24px rgba(45, 27, 45, 0.18))' }}>
          <svg viewBox="0 0 320 390" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <defs>
              <linearGradient id="screenGradCode" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffb5cb" />
                <stop offset="50%" stopColor="#f49ac2" />
                <stop offset="100%" stopColor="#e29bd9" />
              </linearGradient>
              <linearGradient id="headerGradCode" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#b4b7f5" />
                <stop offset="100%" stopColor="#c3aef5" />
              </linearGradient>
              <filter id="shadowOffsetCode" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="5" dy="5" stdDeviation="0" floodColor="#2d1b2d" floodOpacity="1" />
              </filter>
            </defs>

            {/* Outer Window Box */}
            <rect x="8" y="16" width="304" height="360" rx="22" fill="#FFF8FA" stroke="#2d1b2d" strokeWidth="4" filter="url(#shadowOffsetCode)" />

            {/* Top Bar Header */}
            <path
              d="M 8 38 A 22 22 0 0 1 30 16 L 290 16 A 22 22 0 0 1 312 38 L 312 56 L 8 56 Z"
              fill="url(#headerGradCode)"
              stroke="#2d1b2d"
              strokeWidth="4"
            />
            <line x1="8" y1="56" x2="312" y2="56" stroke="#2d1b2d" strokeWidth="4" />

            {/* Window Controls (Top Right Pink Dots) */}
            <circle cx="270" cy="36" r="7" fill="#ff7eb3" stroke="#2d1b2d" strokeWidth="2.5" />
            <circle cx="290" cy="36" r="7" fill="#ff4d7e" stroke="#2d1b2d" strokeWidth="2.5" />

            {/* Top-Left Music Note Badge */}
            <g transform="translate(20, 24)">
              <rect x="0" y="0" width="32" height="24" rx="7" fill="#ffffff" stroke="#2d1b2d" strokeWidth="2.5" />
              <text x="16" y="17" textAnchor="middle" fontSize="14">🎵</text>
            </g>

            {/* Inner Pixel Screen Box */}
            <rect x="28" y="72" width="264" height="136" rx="16" fill="url(#screenGradCode)" stroke="#2d1b2d" strokeWidth="4" />

            {/* Title in Screen */}
            <text x="160" y="98" textAnchor="middle" fontFamily="'Press Start 2P', monospace" fontSize="10" fontWeight="bold" fill="#ffffff" stroke="#2d1b2d" strokeWidth="2.5" paintOrder="stroke fill">
              ENTER SECRET CODE
            </text>

            {/* Single SVG foreignObject for LCD Display - Vector-locked to SVG coordinate space */}
            <foreignObject x="42" y="106" width="236" height="88">
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  width: '100%',
                  height: '100%',
                  background: '#231524',
                  borderRadius: '14px',
                  border: '3.5px solid #2d1b2d',
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxSizing: 'border-box',
                  boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.6)',
                }}
              >
                <span style={{ fontSize: '11px', color: '#ffb5cb', fontFamily: "'Press Start 2P', monospace", letterSpacing: '1px', marginBottom: '4px' }}>
                  PASSCODE:
                </span>
                <div style={{ fontSize: '24px', color: '#55ff99', fontFamily: "var(--font-mali), var(--font-itim), sans-serif", fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', textShadow: '0 0 8px rgba(85,255,153,0.6)', minHeight: '34px' }}>
                  {codeString}
                  <span className="caret" style={{ display: 'inline-block', width: '10px', height: '22px', background: '#55ff99', marginLeft: '4px' }} />
                </div>
              </div>
            </foreignObject>
          </svg>

          {/* D-Pad Container */}
          <div
            style={{
              position: 'absolute',
              bottom: '38px',
              left: '18px',
              width: '108px',
              height: '108px',
              zIndex: 10,
            }}
          >
            <button
              type="button"
              className="dbtn up"
              onClick={handlePress}
              style={{
                position: 'absolute',
                top: '0',
                left: '36px',
                width: '36px',
                height: '38px',
                background: '#2d1b2d',
                color: '#fff',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 4px 0 #180d19',
                transition: 'all 0.08s ease',
              }}
            >
              {"\u25b2\uFE0E"}
            </button>
            <button
              type="button"
              className="dbtn left"
              onClick={handlePress}
              style={{
                position: 'absolute',
                top: '36px',
                left: '0',
                width: '38px',
                height: '36px',
                background: '#2d1b2d',
                color: '#fff',
                border: 'none',
                borderRadius: '8px 0 0 8px',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 4px 0 #180d19',
                transition: 'all 0.08s ease',
              }}
            >
              {"\u25c0\uFE0E"}
            </button>
            <div
              style={{
                position: 'absolute',
                top: '36px',
                left: '36px',
                width: '36px',
                height: '36px',
                background: '#2d1b2d',
              }}
            />
            <button
              type="button"
              className="dbtn right"
              onClick={handlePress}
              style={{
                position: 'absolute',
                top: '36px',
                right: '0',
                width: '38px',
                height: '36px',
                background: '#2d1b2d',
                color: '#fff',
                border: 'none',
                borderRadius: '0 8px 8px 0',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 4px 0 #180d19',
                transition: 'all 0.08s ease',
              }}
            >
              {"\u25b6\uFE0E"}
            </button>
            <button
              type="button"
              className="dbtn down"
              onClick={handlePress}
              style={{
                position: 'absolute',
                bottom: '0',
                left: '36px',
                width: '36px',
                height: '38px',
                background: '#2d1b2d',
                color: '#fff',
                border: 'none',
                borderRadius: '0 0 8px 8px',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 4px 0 #180d19',
                transition: 'all 0.08s ease',
              }}
            >
              {"\u25bc\uFE0E"}
            </button>
          </div>

          {/* A/B Action Buttons Container */}
          <div
            style={{
              position: 'absolute',
              bottom: '48px',
              right: '16px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              transform: 'rotate(-14deg)',
              zIndex: 10,
            }}
          >
            <button
              type="button"
              onClick={handlePress}
              className="pixel-btn-ab"
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff4d7e 0%, #ff6584 100%)',
                color: '#ffffff',
                border: '3px solid #2d1b2d',
                fontSize: '15px',
                fontWeight: 'bold',
                fontFamily: "'Press Start 2P', monospace",
                cursor: 'pointer',
                boxShadow: '0 4px 0 #2d1b2d',
                userSelect: 'none',
                transition: 'transform 0.08s ease, box-shadow 0.08s ease',
              }}
            >
              B
            </button>
            <button
              type="button"
              onClick={handlePress}
              className="pixel-btn-ab"
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff6584 0%, #ff8fa3 100%)',
                color: '#ffffff',
                border: '3px solid #2d1b2d',
                fontSize: '15px',
                fontWeight: 'bold',
                fontFamily: "'Press Start 2P', monospace",
                cursor: 'pointer',
                boxShadow: '0 4px 0 #2d1b2d',
                transform: 'translateY(-10px)',
                userSelect: 'none',
                transition: 'transform 0.08s ease, box-shadow 0.08s ease',
              }}
            >
              A
            </button>
          </div>
        </div>
      </div>

      {/* Hint Note */}
      <div
        className="paper-card"
        style={{
          marginTop: '20px',
          maxWidth: '320px',
          marginLeft: 'auto',
          marginRight: 'auto',
          position: 'relative',
          background: '#FFFDF6',
          border: '2px solid #2d1b2d',
          boxShadow: '0 6px 16px rgba(45, 27, 45, 0.12)',
          padding: '12px 16px',
          borderRadius: '16px',
          textAlign: 'center',
        }}
      >
        <div className="tape tc" style={{ width: '80px', top: '-12px' }}></div>
        <p className="hint-note" style={{ margin: 0, fontSize: '0.95rem', color: '#2d1b2d', fontFamily: "'Itim', cursive" }}>
          {isComplete
            ? `รหัสคือ "${password}" นี่เอง! กดยืนยันเลย 💗`
            : `คำใบ้รหัสของคุณคือ '${password}' กดปุ่มด้านบนจนขึ้นรหัสครบแล้วยืนยันได้เลย`}
        </p>
      </div>

      {/* Confirm Button */}
      <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'center' }}>
        <button
          type="button"
          className="btn mint"
          disabled={!isComplete}
          onClick={handleConfirm}
          style={{
            fontFamily: "'Mali', cursive",
            fontWeight: 700,
            fontSize: '1.05rem',
            padding: '12px 36px',
            borderRadius: '9999px',
            border: '3px solid #2d1b2d',
            boxShadow: '0 4px 0 #2d1b2d, 0 8px 16px rgba(94, 156, 130, 0.35)',
            cursor: isComplete ? 'pointer' : 'not-allowed',
            opacity: isComplete ? 1 : 0.5,
            transition: 'all 0.15s ease',
          }}
        >
          ยืนยันรหัส ✔
        </button>
      </div>

      {/* CSS for button depress animation */}
      <style>{`
        .pixel-btn-ab:active {
          transform: translateY(2px) !important;
          box-shadow: 0 1px 0 #2d1b2d !important;
        }
      `}</style>
    </section>
  );
}
