import React from 'react';
import { Sfx } from './SfxEngine';

export default function MemoryScreen({ onBack, data, onComplete }) {
  // Use only the explicit memories array for the "ความทรงจำ" quest.
  // The uploaded couple photo is intended for the Days/anniversary screen only
  // so we must avoid showing it again here to prevent duplication.
  const memories = data?.memories || [];

  return (
    <section className="screen active" id="s-memory">
      <div className="quest-top">
        <button className="back-btn" onClick={() => { Sfx.click(); onBack(); }}>◀ กลับ</button>
        <span className="quest-title">📷 ความทรงจำของเรา</span>
      </div>
      <p className="mem-note">~ แปะรูปไว้กันลืม เหมือนหัวใจที่ไม่เคยลืมเธอ ~</p>
      
      <div className="screen-inner">
        {memories.map((m, i) => (
          <div className="polaroid" key={i}>
            <div className={`tape ${i % 3 === 0 ? "tl" : i % 3 === 1 ? "tr mint" : "tc sun"}`}></div>
            <div className="ph">
              {m.previewUrl ? (
                <img src={m.previewUrl} alt={m.cap} />
              ) : m.imageKey ? (
                <img src={`/assets/${m.imageKey}`} alt={m.cap} />
              ) : (
                <>
                  <span style={{ fontSize: '2rem' }}>🖼️</span>
                  <span>ไม่มีรูปภาพ</span>
                </>
              )}
            </div>
            <div className="cap">
              {m.cap}{m.note ? <span> — <i>{m.note}</i></span> : ""}
            </div>
          </div>
        ))}
      </div>
      
      <button className="btn mint" style={{ marginTop: '8px' }} onClick={() => {
        Sfx.win();
        onComplete();
        onBack();
      }}>ดูครบแล้ว น่ารักมาก ✔</button>
    </section>
  );
}
