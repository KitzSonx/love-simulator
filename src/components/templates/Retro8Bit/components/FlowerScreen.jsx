import React from 'react';
import { Sfx } from './SfxEngine';

export default function FlowerScreen({ data, onContinue }) {
  const flowerSrc = data?.flowerImage || '/assets/flower.png';

  return (
    <section className="screen active" id="s-flower">
      <p className="eyebrow">▶ STAGE CLEAR!</p>
      <div className="flower-stage">
        <img className="flower-img" src={flowerSrc} alt="Flower" />
        <div className="sparkles-container">
          <span className="sparkle s1">✦</span>
          <span className="sparkle s2">✧</span>
          <span className="sparkle s3">✦</span>
          <span className="sparkle s4">💖</span>
          <span className="sparkle s5">🌸</span>
        </div>
      </div>
      <h1 className="hand">เก่งมาก! 🎉</h1>
      <p className="hand" style={{ fontSize: '1.05rem', color: 'var(--ink-soft)' }}>
        ดอกไม้ดอกนี้... สำหรับคนน่ารักโดยเฉพาะ 💐
      </p>
      <button className="btn" onClick={() => {
        Sfx.click();
        onContinue();
      }}>ไปต่อเลย ▶</button>
    </section>
  );
}
