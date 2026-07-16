import React, { useState, useEffect } from 'react';
import { Sfx } from './SfxEngine';

export default function LetterScreen({ onBack, data, onComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!isOpen || isDone) return;
    
    let i = 0;
    const txt = data.letter || '';
    setTypedText('');
    // start continuous keyboard sound loop for letter typing
    if (typeof Sfx.startKeyLoop === 'function') Sfx.startKeyLoop();

    const interval = setInterval(() => {
      if (i >= txt.length) {
        clearInterval(interval);
        // stop keyboard loop when finished
        if (typeof Sfx.stopKeyLoop === 'function') Sfx.stopKeyLoop();
        setIsDone(true);
        onComplete();
        return;
      }
      setTypedText(txt.substring(0, i + 1));
      i++;
    }, 55);

    return () => {
      clearInterval(interval);
      if (typeof Sfx.stopKeyLoop === 'function') Sfx.stopKeyLoop();
    };
  }, [isOpen, data.letter, isDone]);

  const handleOpen = () => {
    Sfx.beep(700, .1, "triangle", .15);
    setIsOpen(true);
  };

  return (
    <section className="screen active" id="s-letter">
      <div className="quest-top">
        <button className="back-btn" onClick={() => { Sfx.click(); onBack(); }}>◀ กลับ</button>
        <span className="quest-title">💌 จดหมายถึงคนน่ารัก</span>
      </div>

      {!isOpen && (
        <>
          <div className="envelope" onClick={handleOpen}>
            <svg viewBox="0 0 300 210">
              <rect x="5" y="30" width="290" height="175" rx="10" fill="#F6E7EC" stroke="#4A3527" strokeWidth="3" />
              <path d="M5 40 L150 130 L295 40" fill="none" stroke="#4A3527" strokeWidth="3" />
              <path d="M5 32 L150 118 L295 32 L295 40 L150 130 L5 40 Z" fill="#EFD3DC" />
              <circle cx="150" cy="120" r="24" fill="#D45C7C" stroke="#4A3527" strokeWidth="3" />
              <text x="150" y="129" textAnchor="middle" fontSize="22">🤍</text>
              <text x="150" y="180" textAnchor="middle" fontFamily="'Mali',cursive" fontWeight="700" fontSize="17" fill="#4A3527">Happy Anniversary</text>
            </svg>
          </div>
          <p className="hand" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>แตะซองเพื่อเปิดอ่าน ✉️</p>
        </>
      )}

      {isOpen && (
        <>
          <div className="letter-paper">
            <div className="tape tl"></div>
            <div className="tape tr sun"></div>
            <h2>Happy Anniversary 💗</h2>
            <div className="letter-body">
              <span>{typedText}</span>
              {!isDone && <span className="caret2"></span>}
            </div>
            <p className="sign">{data.signature}</p>
          </div>
          {isDone && (
            <button className="btn ghost" style={{ marginTop: '14px' }} onClick={() => { Sfx.click(); onBack(); }}>
              ปิดจดหมาย ✕
            </button>
          )}
        </>
      )}
    </section>
  );
}
