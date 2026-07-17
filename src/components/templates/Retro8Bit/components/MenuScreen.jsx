import React, { useEffect, useState } from 'react';
import { Sfx } from './SfxEngine';

export default function MenuScreen({ data, quests, onOpenMenu, onOpenGacha, animateToken = 0, onAnimated }) {
  const doneCount = Object.values(quests).filter(Boolean).length;
  const avatarSrc = data?.avatarImage || '/assets/face.png';
  const pct = doneCount * 25;
  const [animatedPct, setAnimatedPct] = useState(pct);

  useEffect(() => {
    // If animateToken is truthy (changed by parent when a quest completes), play animation from 0 to pct once.
    if (animateToken) {
      setAnimatedPct(0);
      const t = setTimeout(() => {
        setAnimatedPct(pct);
        if (typeof onAnimated === 'function') onAnimated();
      }, 30);
      return () => clearTimeout(t);
    }
    // otherwise set immediately without animation
    setAnimatedPct(pct);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animateToken, pct]);

  let say = "ยินดีต้อนรับผู้เล่น! เคลียร์เควสให้ครบทุกเมนูล่ะ! ✨";
  if (doneCount === 1) say = "เริ่มได้สวย! อีก 3 เควสนะ 💪";
  else if (doneCount === 2) say = "ครึ่งทางแล้ว! ความคลั่งรักกำลังพุ่ง 📈";
  else if (doneCount === 3) say = "อีกเควสเดียวว! สู้ๆ 🔥";
  else if (doneCount === 4) say = "สุดยอดดด คลั่งรักเต็มเกจแล้ว! 👑";

  const allDone = doneCount === 4;

  return (
    <section className="screen active" id="s-menu">
      <div className="stain" style={{ top: '40%', right: '-40px', width: '90px', height: '90px' }}></div>
      <p className="eyebrow">{"▶\uFE0E"} MAIN MENU</p>

      <div className="gauge-wrap">
        <div className="gauge-label">
          <span className="hand">เกจหัวใจคนคลั่งรัก</span>
          <span className="pct">{pct}%</span>
        </div>
        <div className="gauge">
          <div className="gauge-fill" style={{ width: `${animatedPct}%` }}></div>
        </div>
      </div>

      <div className="avatar-row">
        <div className="avatar">
          <img src={avatarSrc} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div className="bubble">{say}</div>
      </div>

      <div className="menu-grid">
        <button className={`cart-btn cart-1 ${quests.days ? 'done' : ''}`} onClick={() => { Sfx.click(); onOpenMenu('days'); }}>
          <span className="stamp-done">เคลียร์<br />แล้ว!</span>
          <div className="cart-body">
            <div className="lbl"><span className="ico">⏳</span>เราคบกันนาน<br />เท่าไหร่แล้วนะ</div>
          </div>
        </button>
        <button className={`cart-btn cart-2 ${quests.letter ? 'done' : ''}`} onClick={() => { Sfx.click(); onOpenMenu('letter'); }}>
          <span className="stamp-done">เคลียร์<br />แล้ว!</span>
          <div className="cart-body">
            <div className="lbl"><span className="ico">💌</span>จดหมายถึง<br />คนน่ารัก</div>
          </div>
        </button>
        <button className={`cart-btn cart-3 ${quests.quiz ? 'done' : ''}`} onClick={() => { Sfx.click(); onOpenMenu('quiz'); }}>
          <span className="stamp-done">เคลียร์<br />แล้ว!</span>
          <div className="cart-body">
            <div className="lbl"><span className="ico">🎮</span>เรารู้ใจกัน<br />มากแค่ไหน</div>
          </div>
        </button>
        <button className={`cart-btn cart-4 ${quests.memory ? 'done' : ''}`} onClick={() => { Sfx.click(); onOpenMenu('memory'); }}>
          <span className="stamp-done">เคลียร์<br />แล้ว!</span>
          <div className="cart-body">
            <div className="lbl"><span className="ico">📷</span>ความทรงจำ<br />ของเรา</div>
          </div>
        </button>
      </div>

      {!allDone ? (
        <p className="gacha-locked">🔒 เคลียร์ครบ 4 เควส เพื่อปลดล็อกตู้สุ่มรางวัล</p>
      ) : (
        <button className="btn" onClick={() => {
          Sfx.click();
          onOpenGacha();
        }}>🎰 เปิดตู้สุ่มรางวัล!</button>
      )}
    </section>
  );
}
