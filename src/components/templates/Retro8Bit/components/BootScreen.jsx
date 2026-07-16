import React from 'react';
import { Sfx } from './SfxEngine';

export default function BootScreen({ onStart, data }) {
  return (
    <section className="screen active" id="s-boot">
      <div className="stain" style={{ top: '8%', right: '-30px' }}></div>
      <div className="doodle" style={{ top: '12%', left: '14%', '--r': '-10deg' }}>✎</div>
      <div className="doodle" style={{ top: '20%', right: '12%', '--r': '8deg', color: 'var(--blush-deep)' }}>♡</div>
      <div className="doodle" style={{ bottom: '14%', left: '16%', '--r': '-6deg', color: 'var(--mint-deep)' }}>✦</div>

      <p className="eyebrow blink">▶ NEW GAME DELIVERY</p>
      <h1 className="hand" style={{ textAlign: 'center' }}>📦 ตลับเกมมาส่งแล้ว!</h1>

      <div className="cartridge">
        <svg viewBox="0 0 210 250" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="8" width="190" height="226" rx="14" fill="#8FBFA8" stroke="#4A3527" strokeWidth="3" />
          <rect x="10" y="196" width="190" height="38" rx="10" fill="#5E9C82" stroke="#4A3527" strokeWidth="3" />
          <g stroke="#4A3527" strokeWidth="2.5" opacity=".6">
            <line x1="30" y1="206" x2="30" y2="226" />
            <line x1="45" y1="206" x2="45" y2="226" />
            <line x1="165" y1="206" x2="165" y2="226" />
            <line x1="180" y1="206" x2="180" y2="226" />
          </g>
          <rect x="30" y="30" width="150" height="140" rx="8" fill="#FFFDF6" stroke="#4A3527" strokeWidth="3" />
          <text x="105" y="66" textAnchor="middle" fontFamily="'Press Start 2P',monospace" fontSize="13" fill="#D45C7C">LOVE</text>
          <text x="105" y="92" textAnchor="middle" fontFamily="'Press Start 2P',monospace" fontSize="10" fill="#4A3527">SIMULATOR</text>
          <text x="105" y="136" textAnchor="middle" fontSize="34">💘</text>
          <text x="105" y="160" textAnchor="middle" fontFamily="'Mali',cursive" fontWeight="700" fontSize="12" fill="#7A6350">ฉบับคนคลั่งรัก</text>
          <circle cx="26" cy="24" r="6" fill="#F2C14E" stroke="#4A3527" strokeWidth="2" />
        </svg>
        <div className="tape tc" style={{ width: '100px' }}></div>
      </div>

      <p className="hand" style={{ fontSize: '.92rem', color: 'var(--ink-soft)', transform: 'rotate(-1deg)' }}>
        ถึง: {data.recipientName} ♡<br />จาก: {data.senderName}
      </p>
      <button className="btn" onClick={() => {
        Sfx.click();
        onStart();
      }}>▶ เล่นเกม</button>
    </section>
  );
}
