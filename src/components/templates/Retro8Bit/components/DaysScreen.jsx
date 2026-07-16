import React, { useState, useEffect } from 'react';
import { Sfx } from './SfxEngine';

export default function DaysScreen({ data, onBack, startDate, onComplete }) {
  const [time, setTime] = useState({ days: '-', hr: '-', min: '-', sec: '-' });
  const [totalDays, setTotalDays] = useState('-');

  // mark the quest complete when this screen is opened (matches original behavior)
  useEffect(() => {
    if (typeof onComplete === 'function') onComplete();
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const start = new Date(startDate).getTime();
    
    const tick = () => {
      const diff = Date.now() - start;
      if (diff < 0) {
        setTotalDays('0');
        setTime({ days: '0', hr: '00', min: '00', sec: '00' });
        return;
      }
      
      const s = Math.floor(diff / 1000);
      const d = Math.floor(s / 86400);
      
      setTotalDays(d.toLocaleString("th-TH"));
      setTime({
        days: d.toLocaleString("th-TH"),
        hr: String(Math.floor(s / 3600) % 24).padStart(2, "0"),
        min: String(Math.floor(s / 60) % 60).padStart(2, "0"),
        sec: String(s % 60).padStart(2, "0")
      });
    };
    
    tick();
    const timerId = setInterval(tick, 1000);
    return () => clearInterval(timerId);
  }, [startDate]);

  return (
    <section className="screen active" id="s-days">
      <div className="quest-top">
        <button className="back-btn" onClick={() => { Sfx.click(); onBack(); }}>◀ กลับ</button>
        <span className="quest-title">⏳ เราคบกันมาแล้ว...</span>
      </div>

      <div className="polaroid">
        <div className="tape tc"></div>
        <div className="ph">
          <img
            src={data?.couplePhoto?.previewUrl || data?.couplePhoto?.imageKey || '/assets/couple_pics.jpg'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            alt={data?.couplePhoto?.cap || 'รูปความทรงจำ'}
          />
        </div>
        <div className="cap">{data?.couplePhoto?.cap || 'เราสองคน ♡'}</div>
      </div>

      <div className="days-big">รวมทั้งหมด <b>{totalDays}</b> วันแล้วนะ!</div>

      <div className="count-grid">
        <div className="count-cell"><b>{time.days}</b><span>วัน</span></div>
        <div className="count-cell"><b>{time.hr}</b><span>ชั่วโมง</span></div>
        <div className="count-cell"><b>{time.min}</b><span>นาที</span></div>
        <div className="count-cell"><b>{time.sec}</b><span>วินาที</span></div>
      </div>

      <p className="hand" style={{ marginTop: '16px', fontSize: '.9rem', color: 'var(--ink-soft)', textAlign: 'center', transform: 'rotate(-1deg)' }}>
        และจะเพิ่มขึ้นเรื่อยๆ ทุกวินาที... 💕
      </p>
    </section>
  );
}
