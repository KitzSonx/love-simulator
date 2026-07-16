import React, { useState } from 'react';
import { Sfx } from './SfxEngine';

export default function GachaScreen({ onBack, data }) {
  const [spinning, setSpinning] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [ballState, setBallState] = useState('hidden'); // hidden, dropping, open
  const [prize, setPrize] = useState(null);

  const prizes = data.prizes || [];

  const handleSpin = () => {
    if (spinning) return;
    
    setPrize(null);
    setBallState('hidden');
    setSpinning(true);
    Sfx.gacha();

    setTimeout(() => setShaking(true), 400);

    setTimeout(() => {
      setShaking(false);
      setSpinning(false);
      setBallState('dropping');
      Sfx.beep(600, .15, "triangle", .15);
    }, 1000);

    setTimeout(() => {
      setBallState('open');
      Sfx.win();
      
      // Random prize
      const p = prizes[Math.floor(Math.random() * prizes.length)];
      setPrize(p);
    }, 1800);

    setTimeout(() => {
      setBallState('hidden');
    }, 2300);
  };

  return (
    <section className="screen active" id="s-gacha">
      <div className="quest-top" style={{ justifyContent: 'flex-start' }}>
        <button className="back-btn" onClick={() => { Sfx.click(); onBack(); }}>◀ กลับ</button>
        <span className="quest-title">🎰 ตู้สุ่มรางวัลคนน่ารัก</span>
      </div>

      <div className={`gacha-machine ${shaking ? 'shake' : ''}`}>
        <img src="/assets/gacha pong.png" alt="ตู้กาชาปอง" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        <img 
          src="/assets/button.png" 
          alt="ปุ่มหมุน" 
          className={`gacha-knob ${spinning ? 'spinning' : ''}`} 
          onClick={handleSpin} 
        />
        <img 
          src="/assets/gacha pong ball.png" 
          alt="ลูกกาชา" 
          className={`gacha-ball ${ballState === 'dropping' ? 'dropping' : ''} ${ballState === 'open' ? 'open' : ''}`}
          style={{ opacity: ballState === 'hidden' ? 0 : undefined }}
        />
      </div>

      {!prize && (
        <p className="hand" style={{ fontSize: '.9rem', color: 'var(--ink-soft)' }}>กดที่ปุ่มหมุนเพื่อสุ่มรางวัล! 🌟</p>
      )}
      
      <div style={{ width: '100%' }}>
        {prize && (
          <div className="prize-card">
            <div className="pz">{prize.icon}</div>
            <h3>{prize.name}</h3>
            <p>{prize.desc}</p>
            <p className="coupon-note">✂ - - - แคปหน้าจอเก็บไว้เป็นคูปองได้เลย - - - ✂</p>
          </div>
        )}
      </div>
    </section>
  );
}
