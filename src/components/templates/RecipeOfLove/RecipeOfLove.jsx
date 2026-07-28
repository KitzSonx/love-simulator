'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import YouTubeAudioPlayer from '@/components/shared/YouTubeAudioPlayer';

function IngIcon({ ing, className = "", imgClassName = "" }) {
  if (ing.image) {
    return (
      <img
        src={ing.image}
        alt={ing.name}
        className={`object-cover rounded-xl sm:rounded-2xl inline-block drop-shadow-md border-[0.08em] border-white/80 pointer-events-none ${imgClassName || "w-[1.6em] h-[1.6em]"
          } ${className}`}
        draggable="false"
      />
    );
  }
  return <span className={className}>{ing.emoji}</span>;
}

/* ---------- tiny utils ---------- */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
function mixHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(lerp(pa >> 16, pb >> 16, t));
  const g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t));
  const bl = Math.round(lerp(pa & 255, pb & 255, t));
  return `rgb(${r},${g},${bl})`;
}

function getLocalPos(e, rootEl) {
  const rect = rootEl.getBoundingClientRect();
  const scaleX = rootEl.offsetWidth / rect.width;
  const scaleY = rootEl.offsetHeight / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

/* ---------- sound (Web Audio, no assets needed) ---------- */
function useKitchenAudio() {
  const ctxRef = useRef(null);
  const ensure = () => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctxRef.current = new AC();
    }
    if (ctxRef.current && ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  };
  const chop = useCallback(() => {
    const ctx = ensure(); if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(190, t);
    o.frequency.exponentialRampToValueAtTime(55, t + 0.09);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.14);
    const len = Math.floor(ctx.sampleRate * 0.03);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 1800;
    const ng = ctx.createGain(); ng.gain.value = 0.22;
    src.connect(f).connect(ng).connect(ctx.destination); src.start(t);
  }, []);
  const pop = useCallback(() => {
    const ctx = ensure(); if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(420, t);
    o.frequency.exponentialRampToValueAtTime(720, t + 0.09);
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.15);
  }, []);
  const ding = useCallback(() => {
    const ctx = ensure(); if (!ctx) return;
    const t = ctx.currentTime;
    [660, 880].forEach((fq, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = fq;
      g.gain.setValueAtTime(0.001, t + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.28, t + i * 0.12 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.6);
      o.connect(g).connect(ctx.destination);
      o.start(t + i * 0.12); o.stop(t + i * 0.12 + 0.65);
    });
  }, []);
  const blub = useCallback(() => {
    const ctx = ensure(); if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(320, t + 0.12);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.2);
  }, []);
  return { chop, pop, ding, blub };
}

/* ---------- shared UI bits ---------- */
const WOOD = {
  backgroundColor: "#8a5a33",
  backgroundImage:
    "repeating-linear-gradient(90deg,#8f5e36 0 26px,#7e5130 26px 28px,#93633a 28px 55px,#7a4e2d 55px 57px), radial-gradient(ellipse at 30% 20%, rgba(255,235,200,.14), transparent 60%)",
};
const WOOD_DARK = {
  backgroundColor: "#6e4525",
  backgroundImage:
    "repeating-linear-gradient(90deg,#734a28 0 24px,#63401f 24px 26px,#78502c 26px 52px,#5e3c1d 52px 54px)",
};

function CTA({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="mt-4 sm:mt-5 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full font-extrabold text-base sm:text-lg text-[#3A2A1A] shadow-lg transition-transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/60"
      style={{
        background: "linear-gradient(180deg,#FBD064,#F0A93B)",
        boxShadow: "0 6px 0 #B87A1E, 0 12px 24px rgba(120,70,10,.35)",
        fontFamily: "'Nunito','Noto Sans Thai',system-ui,sans-serif",
      }}
    >
      {children}
    </button>
  );
}

function StageShell({ title, subtitle, children }) {
  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pb-10 sm:pb-16 anim-fadeUp">
      <h2
        className="text-center text-2xl sm:text-3xl md:text-4xl font-black text-[#4A2E14] px-2"
        style={{ fontFamily: "'Fraunces','Noto Sans Thai',Georgia,serif" }}
      >
        {title}
      </h2>
      <p className="text-center mt-1 mb-4 sm:mb-6 text-sm sm:text-base text-[#7A5A33] font-semibold px-2" style={{ fontFamily: "'Nunito','Noto Sans Thai',sans-serif" }}>
        {subtitle}
      </p>
      {children}
    </div>
  );
}

function ProgressRail({ stage }) {
  if (!stage || stage === 0) return null;
  const steps = [
    { icon: "🧺", label: "เก็บวัตถุดิบ" },
    { icon: "🔪", label: "หั่น" },
    { icon: "🍲", label: "ปรุง" },
    { icon: "🥄", label: "ชิม" },
  ];
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-3 py-3 sm:py-4 flex-wrap px-2">
      {steps.map((s, i) => {
        const stepNum = i + 1;
        const done = stage > stepNum, active = stage === stepNum;
        return (
          <div key={s.label} className="flex items-center gap-1.5 sm:gap-3">
            <div
              className={`flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-4 py-1 sm:py-1.5 border-2 transition-all ${active ? "scale-105" : ""
                }`}
              style={{
                fontFamily: "'Nunito','Noto Sans Thai',sans-serif",
                background: done ? "#7E8F5A" : active ? "#FFF3D6" : "rgba(255,248,231,.55)",
                borderColor: done ? "#5F7040" : active ? "#E0A73C" : "#D8BE8E",
                color: done ? "#FFFDF4" : "#4A2E14",
                boxShadow: active ? "0 4px 14px rgba(160,100,20,.3)" : "none",
              }}
            >
              <span className="text-base sm:text-lg">{done ? "✓" : s.icon}</span>
              <span className="text-xs sm:text-sm font-extrabold hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className="w-3 sm:w-8 h-0.5 rounded" style={{ background: "#CBA96F" }} />}
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════ STAGE 0 · WELCOME KITCHEN COVER ════════════════════ */
function WelcomeKitchenStage({ onStart, TASTER_NAME, TASTER_AVATAR }) {
  return (
    <div className="w-full max-w-xl mx-auto px-3 sm:px-4 py-3 sm:py-6 flex flex-col items-center text-center anim-fadeUp">
      {/* Striped Canopy / Awning Roof */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border-3 sm:border-4 border-[#8A5A33] shadow-2xl bg-[#FFFDF6]">
        <div
          className="h-10 sm:h-12 w-full"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, #F3C998 0 28px, #E5B47B 28px 56px)",
            boxShadow: "inset 0 -4px 8px rgba(0,0,0,0.15)",
          }}
        />
        {/* Scalloped Awning Trim */}
        <div className="flex justify-between -mt-1 px-0.5 overflow-hidden">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="w-5 sm:w-7 h-3.5 rounded-b-full bg-[#E5B47B] border-b-2 border-amber-900/30 shrink-0"
            />
          ))}
        </div>

        {/* Store Title Board */}
        <div className="p-4 sm:p-7 flex flex-col items-center bg-[#FFFDF6]">
          <div className="px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-[10px] sm:text-xs font-black tracking-widest uppercase mb-2 shadow-xs">
            ✨ PURRFECT KITCHEN TALE ✨
          </div>

          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black text-[#4A2E14] leading-tight drop-shadow-xs"
            style={{ fontFamily: "'Fraunces', 'Mali', 'Noto Sans Thai', Georgia, serif" }}
          >
            Recipe of Our Love
          </h2>
          <p
            className="mt-1 text-sm sm:text-base text-[#8A5A33] font-bold"
            style={{ fontFamily: "'Mali', 'Nunito', sans-serif" }}
          >
            🍳 ครัวสูตรลับความรักเพื่อคุณและ {TASTER_NAME} 💖
          </p>

          {/* Bakery / Kitchen Shelf Showcase */}
          <div
            className="mt-5 w-full max-w-sm rounded-2xl border-4 p-3.5 sm:p-4 flex flex-col items-center relative shadow-md"
            style={{ ...WOOD, borderColor: "#5E3C1D" }}
          >
            <div className="w-full rounded-xl p-3 bg-[#FFF8EB]/95 border border-amber-300 flex items-center justify-around gap-2 shadow-inner">
              {/* Left Item */}
              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl anim-wiggle">🥐</span>
                <span className="text-[10px] sm:text-xs font-bold text-[#6E4525] mt-1" style={{ fontFamily: "'Mali', sans-serif" }}>ครัวซองต์</span>
              </div>

              {/* Center Chef Avatar */}
              <div className="relative flex flex-col items-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-amber-400 overflow-hidden bg-amber-100 shadow-md">
                  <img
                    src={TASTER_AVATAR || "/assets/girl4.png"}
                    alt={TASTER_NAME}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
                {/* Chef Hat Badge */}
                <div className="absolute -top-3 -right-2 text-2xl anim-pop">👨‍🍳</div>
                <div className="mt-1.5 px-2.5 py-0.5 rounded-full bg-[#6E4525] text-amber-100 text-[10px] sm:text-[11px] font-black shadow-xs">
                  เชฟ {TASTER_NAME}
                </div>
              </div>

              {/* Right Item */}
              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl anim-wiggle" style={{ animationDelay: "0.5s" }}>
                  🍰
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-[#6E4525] mt-1" style={{ fontFamily: "'Mali', sans-serif" }}>เค้กสตรอว์เบอร์รี</span>
              </div>
            </div>

            {/* Bottom Shelf Wooden Plank */}
            <div
              className="w-full h-3 rounded-md mt-3"
              style={{ ...WOOD_DARK, boxShadow: "0 4px 6px rgba(0,0,0,.3)" }}
            />
          </div>

          {/* Welcome Message */}
          <p
            className="mt-4 text-xs sm:text-sm text-[#7A5A33] font-bold leading-relaxed max-w-xs"
            style={{ fontFamily: "'Nunito','Noto Sans Thai',sans-serif" }}
          >
            ยินดีต้อนรับสู่ห้องครัวของเรา! พร้อมเข้าครัวมาเก็บวัตถุดิบและปรุงอาหารจานโปรดกันหรือยัง? 🥖
          </p>

          {/* Start CTA Button */}
          <button
            onClick={onStart}
            className="mt-5 px-7 py-3 rounded-full font-black text-base sm:text-lg text-[#3A2A1A] shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border-2 border-amber-300 cursor-pointer"
            style={{
              background: "linear-gradient(180deg,#FBD064,#F0A93B)",
              boxShadow: "0 5px 0 #B87A1E, 0 10px 20px rgba(120,70,10,.35)",
              fontFamily: "'Mali', 'Nunito', 'Noto Sans Thai', sans-serif",
            }}
          >
            <span>🍳 เข้าครัวกันเลย!</span>
            <span className="text-xl sm:text-2xl anim-wiggle">✨</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════ STAGE 1 · COLLECT ════════════════════ */
/* ════════════════════ STAGE 1 · COLLECT [UX/UI REDESIGNED] ════════════════════ */
function CollectStage({ collected, onCollect, audio, onDone, INGREDIENTS, rootRef }) {
  const [drag, setDrag] = useState(null); // {id,x,y}
  const dragRef = useRef(null);
  const basketRef = useRef(null);
  const stageRef = useRef(null);
  const [basketHot, setBasketHot] = useState(false);

  useEffect(() => {
    if (!drag) return;
    const mv = (e) => {
      const r = basketRef.current?.getBoundingClientRect();
      setBasketHot(!!(r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom));
      const sr = stageRef.current.getBoundingClientRect();
      setDrag((d) => (d ? { ...d, x: e.clientX - sr.left, y: e.clientY - sr.top } : d));
    };
    const up = (e) => {
      const cur = dragRef.current;
      const r = basketRef.current?.getBoundingClientRect();
      const over = r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (over && cur) { onCollect(cur.id); audio.pop(); }
      dragRef.current = null; setDrag(null); setBasketHot(false);
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); };
  }, [drag ? drag.id : null]); // eslint-disable-line

  const startDrag = (ing) => (e) => {
    if (collected.includes(ing.id)) return;
    e.preventDefault();
    const sr = stageRef.current.getBoundingClientRect();
    const d = { id: ing.id, x: e.clientX - sr.left, y: e.clientY - sr.top };
    dragRef.current = d; setDrag(d);
  };
  const keyCollect = (ing) => (e) => {
    if ((e.key === "Enter" || e.key === " ") && !collected.includes(ing.id)) {
      e.preventDefault(); onCollect(ing.id); audio.pop();
    }
  };

  const dragIng = drag ? INGREDIENTS.find((i) => i.id === drag.id) : null;
  const remaining = INGREDIENTS.length - collected.length;
  const allDone = remaining === 0;

  return (
    <div ref={stageRef} className="relative w-full h-full">
      <StageShell
        subtitle={allDone ? "ตะกร้าเต็มไปด้วยพวกเราแล้ว 🧺" : `ลากความทรงจำแต่ละอย่างจากตู้กับข้าวลงตะกร้า · เหลืออีก ${remaining} ชิ้น`}
      >
        {/* cupboard - ปรับ Grid และดีไซน์การ์ดแบบ Polaroid โชว์รูปใหญ่จุใจ */}
        <div className="rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl border-4" style={{ ...WOOD, borderColor: "#5E3C1D" }}>
          <div className="rounded-xl sm:rounded-2xl p-2.5 sm:p-5" style={{ background: "rgba(45,26,10,.35)", boxShadow: "inset 0 8px 24px rgba(0,0,0,.45)" }}>
            {[0, 1].map((row) => (
              <div key={row}>
                <div className="grid grid-cols-3 gap-2.5 sm:gap-4 md:gap-5 px-1 pt-3 pb-3">
                  {INGREDIENTS.slice(row * 3, row * 3 + 3).map((ing) => {
                    const got = collected.includes(ing.id);
                    const ghosted = drag && drag.id === ing.id;
                    return (
                      <div
                        key={ing.id}
                        role="button"
                        tabIndex={got ? -1 : 0}
                        aria-label={got ? `เก็บ${ing.name}แล้ว` : `เก็บ${ing.name}`}
                        onPointerDown={startDrag(ing)}
                        onKeyDown={keyCollect(ing)}
                        className={`select-none rounded-xl sm:rounded-2xl border-2 sm:border-4 p-2 sm:p-3 flex flex-col items-center justify-between text-center transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 ${got
                          ? "opacity-35 grayscale scale-95 border-dashed border-amber-800/40 bg-amber-950/10"
                          : "cursor-grab hover:-translate-y-1.5 hover:scale-[1.03] hover:shadow-2xl active:cursor-grabbing"
                          } ${ghosted ? "opacity-20 scale-90" : ""}`}
                        style={{
                          touchAction: "none",
                          background: got ? "rgba(255,248,235,0.4)" : "linear-gradient(180deg,#FFFDF7,#FEEECB)",
                          borderColor: got ? "#C4A46B" : "#E2C18B",
                          boxShadow: got ? "none" : "0 8px 20px -4px rgba(60,35,10,.35), inset 0 2px 4px rgba(255,255,255,.8)",
                        }}
                      >
                        {/* Photo Frame Container - ขยายรูปภาพเป็นสี่เหลี่ยมจัตุรัสใหญ่เต็มการ์ด */}
                        <div className="w-full aspect-square max-w-[4.5rem] sm:max-w-[5.5rem] md:max-w-[6.5rem] flex items-center justify-center rounded-lg sm:rounded-xl mb-1.5 sm:mb-2 overflow-hidden shadow-inner bg-amber-500/10 border border-amber-500/20 mx-auto">
                          <IngIcon
                            ing={ing}
                            imgClassName="w-full h-full object-cover rounded-none border-0 shadow-none hover:scale-110 transition-transform duration-300"
                            className="text-4xl sm:text-5xl md:text-6xl"
                          />
                        </div>
                        {/* Memory Label */}
                        <div className="w-full px-1">
                          <div
                            className="text-[11px] sm:text-sm md:text-base font-black text-[#4A2E14] leading-tight line-clamp-1 drop-shadow-sm"
                            style={{ fontFamily: "'Nunito','Noto Sans Thai',sans-serif" }}
                          >
                            {ing.name}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* shelf plank */}
                <div className="h-2.5 sm:h-3 rounded-md mb-2" style={{ ...WOOD_DARK, boxShadow: "0 4px 6px rgba(0,0,0,.4)" }} />
              </div>
            ))}
          </div>
        </div>

        {/* basket - ขยายตะกร้าและขนาดรูปที่เก็บแล้วให้เห็นชัดขึ้น */}
        <div className="flex flex-col items-center mt-5 sm:mt-6">
          <div
            ref={basketRef}
            className={`relative w-52 sm:w-64 md:w-72 h-32 sm:h-36 md:h-40 rounded-b-[2.5rem] sm:rounded-b-[3.5rem] rounded-t-xl border-4 transition-all ${basketHot ? "scale-110" : ""}`}
            style={{
              borderColor: basketHot ? "#E0A73C" : "#6e4525",
              background: "#B07A3E",
              backgroundImage:
                "repeating-linear-gradient(45deg,#B8834A 0 12px,#9c6a35 12px 24px), repeating-linear-gradient(-45deg, rgba(255,240,210,.12) 0 12px, transparent 12px 24px)",
              boxShadow: basketHot ? "0 0 0 6px rgba(240,180,60,.35), 0 14px 28px rgba(80,45,10,.4)" : "0 14px 28px rgba(80,45,10,.4)",
            }}
          >
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-36 sm:w-44 h-9 rounded-full border-4" style={{ borderColor: "#6e4525", background: "transparent" }} />
            <div className="absolute inset-x-3 top-3 flex flex-wrap gap-1.5 sm:gap-2 justify-center items-center">
              {collected.map((id) => (
                <span key={id} className="text-2xl sm:text-3xl md:text-4xl anim-pop transition-transform hover:scale-110">
                  <IngIcon ing={INGREDIENTS.find((i) => i.id === id)} imgClassName="w-[1.4em] h-[1.4em] border-2 border-white shadow-md rounded-xl" />
                </span>
              ))}
            </div>
            {collected.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-center text-[#5E3C1D] font-extrabold text-xs sm:text-sm px-2" style={{ fontFamily: "'Nunito','Noto Sans Thai',sans-serif" }}>
                วางความทรงจำไว้ตรงนี้ ⤵
              </div>
            )}
          </div>
          <div className="mt-8 flex justify-center">
            {allDone && <CTA onClick={onDone}>ไปหั่นวัตถุดิบกัน 🔪</CTA>}
          </div>
        </div>
      </StageShell>

      {/* drag ghost - ทำเป็นแผ่นโพลารอยด์ใหญ่ตอนกำลังดึง */}
      {drag && dragIng && (
        <div
          className="absolute z-50 pointer-events-none rounded-2xl border-4 p-2 sm:p-3 text-center flex flex-col items-center w-28 sm:w-36"
          style={{
            left: drag.x, top: drag.y, transform: "translate(-50%,-60%) rotate(-6deg) scale(1.1)",
            background: "linear-gradient(180deg,#FFFDF7,#FEEECB)", borderColor: "#F0A93B",
            boxShadow: "0 20px 35px -5px rgba(60,35,10,.4), 0 0 0 4px rgba(240,169,59,.3), inset 0 2px 4px rgba(255,255,255,.8)"
          }}
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-xl overflow-hidden shadow-inner bg-amber-500/10 mb-1.5 w-full">
            <IngIcon ing={dragIng} imgClassName="w-full h-full object-cover rounded-none border-0 shadow-none" className="text-4xl sm:text-5xl" />
          </div>
          <div className="text-xs sm:text-sm font-black text-[#4A2E14]" style={{ fontFamily: "'Nunito','Noto Sans Thai',sans-serif" }}>
            {dragIng.name}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════ STAGE 2 · CHOP [UPDATED - INSTANT SPAWN & NO GUIDE] ════════════════════ */
function ChopStage({ audio, onDone, INGREDIENTS, CHOPS_PER_INGREDIENT }) {
  const [idx, setIdx] = useState(0);
  const [chops, setChops] = useState(0);
  const [bits, setBits] = useState([]);
  const [knife, setKnife] = useState(null); // {x,y,swing}
  const [flash, setFlash] = useState(false);

  // เก็บตำแหน่ง (เปอร์เซ็นต์ X, Y) เริ่มต้นที่ตรงกลาง (50, 50)
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const boardRef = useRef(null);
  const activeRef = useRef(false);
  const lastSideRef = useRef(0);
  const lastChopRef = useRef(0);
  const finishedRef = useRef(false);
  const chopsRef = useRef(0);

  const ing = INGREDIENTS[idx];
  const done = idx >= INGREDIENTS.length;

  // ฟังก์ชันสุ่มตำแหน่งแบบปลอดภัย (20% ถึง 80%)
  const randomizePosition = () => {
    const randomX = 20 + Math.random() * 60;
    const randomY = 20 + Math.random() * 60;
    setPos({ x: randomX, y: randomY });
  };

  const registerChop = (knifeX, knifeY) => {
    if (chopsRef.current >= CHOPS_PER_INGREDIENT) return;
    chopsRef.current += 1;
    const n = chopsRef.current;

    audio.chop();
    setFlash(true); setTimeout(() => setFlash(false), 90);

    // 2 pieces per chop
    const newBits = Array.from({ length: 2 }).map((_, i) => {
      const angle = (Math.random() * Math.PI) + (i === 0 ? 0 : Math.PI);
      const dist = 55 + Math.random() * 55;
      return {
        key: Math.random(),
        bx: knifeX,
        by: knifeY,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist * 0.6 + 18,
        rot: (Math.random() - 0.5) * 200,
        scale: 0.7 + Math.random() * 0.35,
      };
    });

    setBits((b) => [...b, ...newBits]);
    setChops(n);

    if (n === CHOPS_PER_INGREDIENT) {
      setTimeout(() => {
        audio.pop();
        setBits([]); setChops(0);
        chopsRef.current = 0;

        // วาร์ปไปตำแหน่งใหม่ทันทีสำหรับวัตถุดิบชิ้นถัดไป
        randomizePosition();
        setIdx((i) => i + 1);
      }, 450);
    }
  };

  const onDown = (e) => {
    if (done) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    activeRef.current = true;
    const r = boardRef.current.getBoundingClientRect();
    lastSideRef.current = Math.sign(e.clientX - (r.left + r.width / 2)) || 1;
    setKnife({ x: e.clientX - r.left, y: e.clientY - r.top, swing: 0 });
  };

  const onMove = (e) => {
    if (!activeRef.current || done) return;
    const r = boardRef.current.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    setKnife({ x, y, swing: clamp((e.movementX || 0) * 1.2, -25, 25) });

    const ingCenterX = (pos.x / 100) * r.width;
    const side = Math.sign(x - ingCenterX) || lastSideRef.current;
    const now = performance.now();

    // เช็คระยะห่างเพื่อให้ผู้เล่นต้องสับให้โดนตัววัตถุดิบ
    const ingCenterY = (pos.y / 100) * r.height;
    const distToIng = Math.hypot(x - ingCenterX, y - ingCenterY);

    if (side !== lastSideRef.current && now - lastChopRef.current > 150 && chopsRef.current < CHOPS_PER_INGREDIENT && distToIng < 85) {
      lastSideRef.current = side;
      lastChopRef.current = now;
      registerChop(x, y);
    }
  };

  const onUp = () => { activeRef.current = false; setKnife(null); };

  useEffect(() => {
    if (done && !finishedRef.current) { finishedRef.current = true; audio.ding(); }
  }, [done]); // eslint-disable-line

  const scale = ing ? 1 - (chops / CHOPS_PER_INGREDIENT) * 0.45 : 1;

  return (
    <StageShell
      title="หั่นรูปภาพให้ละเอียดเลยย"
      subtitle={done ? "หั่นเสร็จเรียบร้อยแล้ว พร้อมปรุงต่อ 🎉" : `เลื่อนมีดไปมาบน${ing.name} · ${idx + 1}/${INGREDIENTS.length}`}
    >
      <div className="flex flex-col items-center">
        {/* tally */}
        <div className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-4 flex-wrap justify-center">
          {INGREDIENTS.map((it, i) => (
            <span key={it.id} className={`text-xl sm:text-2xl transition-all ${i < idx ? "" : i === idx && !done ? "anim-wiggle" : "opacity-30 grayscale"}`}>
              {i < idx ? "✅" : <IngIcon ing={it} />}
            </span>
          ))}
        </div>

        <div
          ref={boardRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className="relative w-full max-w-xl h-56 sm:h-64 md:h-72 rounded-[1.5rem] sm:rounded-[2rem] border-4 sm:border-8 overflow-hidden cursor-crosshair select-none"
          style={{ ...WOOD, borderColor: "#5E3C1D", touchAction: "none", boxShadow: "0 18px 40px rgba(70,40,10,.45), inset 0 4px 16px rgba(255,235,200,.25)" }}
        >
          {/* flash on chop */}
          {flash && <div className="absolute inset-0" style={{ background: "rgba(255,240,200,.4)" }} />}

          {done ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="text-5xl">🥣</div>
              <div className="font-extrabold text-[#FFF6E2] text-base sm:text-lg drop-shadow text-center px-4" style={{ fontFamily: "'Nunito','Noto Sans Thai',sans-serif" }}>
                หั่นได้สวยงามมาก!
              </div>
            </div>
          ) : (
            <>
              {/* เปลี่ยนเป็น transition-transform ทำให้ left/top ไม่อืดและขยับทันที */}
              <div
                className="absolute text-6xl sm:text-7xl md:text-8xl transition-transform duration-150 pointer-events-none"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: `translate(-50%,-50%) scale(${scale}) rotate(${flash ? -6 : 0}deg)`
                }}
              >
                <IngIcon ing={ing} />
              </div>

              {/* chopped bits */}
              {bits.map((b) => (
                <div
                  key={b.key}
                  className="absolute anim-chop-fly text-2xl sm:text-3xl pointer-events-none z-10"
                  style={{
                    left: b.bx,
                    top: b.by,
                    '--tx': `${b.dx}px`,
                    '--ty': `${b.dy}px`,
                    '--rot': `${b.rot}deg`,
                    '--sc': b.scale,
                  }}
                >
                  <IngIcon ing={ing} />
                </div>
              ))}

              {/* knife */}
              {knife && (
                <div
                  className="absolute text-5xl sm:text-6xl pointer-events-none drop-shadow-xl z-20"
                  style={{ left: knife.x, top: knife.y, transform: `translate(-30%,-85%) rotate(${90 + knife.swing}deg)` }}
                >
                  🔪
                </div>
              )}
              {!knife && (
                <div className="absolute bottom-3 inset-x-0 text-center text-[#FFF0D2] font-bold text-xs sm:text-sm drop-shadow px-4 pointer-events-none" style={{ fontFamily: "'Nunito','Noto Sans Thai',sans-serif" }}>
                  กดค้างแล้วปาดซ้าย ↔ ขวาบนตัววัตถุดิบเพื่อหั่น
                </div>
              )}

              {/* chop progress notches */}
              <div className="absolute top-3 inset-x-0 flex justify-center gap-1.5 pointer-events-none">
                {Array.from({ length: CHOPS_PER_INGREDIENT }).map((_, i) => (
                  <div key={i} className="w-5 sm:w-6 h-1.5 sm:h-2 rounded-full" style={{ background: i < chops ? "#F2B93B" : "rgba(255,245,220,.35)" }} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* คำอธิบายวัตถุดิบตรงด้านล่างเขียง */}
        {ing && !done && (
          <div className="mt-3 sm:mt-4 px-4 py-2.5 rounded-2xl border-2 border-[#D8BE8E] bg-[#FFF8EB]/95 shadow-md flex items-center gap-3 max-w-md w-full anim-pop">
            <div className="w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0 rounded-xl overflow-hidden border border-amber-400/60 bg-amber-100 flex items-center justify-center shadow-inner">
              <IngIcon ing={ing} imgClassName="w-full h-full object-cover" className="text-2xl sm:text-3xl" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-black text-[#4A2E14] truncate" style={{ fontFamily: "'Nunito','Noto Sans Thai',sans-serif" }}>
                วัตถุดิบ: {ing.name} ({ing.amount || "1 ชิ้น"})
              </div>
              <div className="text-[11px] sm:text-xs text-[#7A5A33] font-semibold line-clamp-1" style={{ fontFamily: "'Nunito','Noto Sans Thai',sans-serif" }}>
                {ing.note || "ความทรงจำแสนหวานของเรา"}
              </div>
            </div>
          </div>
        )}

        {done && <CTA onClick={onDone}>ลงหม้อกันเลย 🍲</CTA>}
      </div>
    </StageShell>
  );
}

/* ════════════════════ STAGE 3 · COOK (stir) [UPDATED] ════════════════════ */
function CookStage({ audio, onDone, INGREDIENTS, STIR_ROTATIONS }) {
  const [progress, setProgress] = useState(0); // 0..100
  const [angle, setAngle] = useState(-90);
  const [stirring, setStirring] = useState(false);
  const [pointerPos, setPointerPos] = useState(null); // {x,y} relative to zoneRef
  const accumRef = useRef(0);
  const lastAngRef = useRef(null);
  const lastBlubRef = useRef(0);
  const doneRef = useRef(false);
  const zoneRef = useRef(null);
  const potRef = useRef(null); // ref ของ outer pot container สำหรับแปลง coords ช้อน

  const target = STIR_ROTATIONS * 360;
  const cooked = progress >= 100;

  const angleAt = (e) => {
    const r = zoneRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = e.clientX - cx, dy = e.clientY - cy;
    const radius = Math.hypot(dx, dy);
    return { ang: (Math.atan2(dy, dx) * 180) / Math.PI, radius, rmax: r.width / 2 };
  };

  const onDown = (e) => {
    if (cooked) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const { ang } = angleAt(e);
    lastAngRef.current = ang;
    setStirring(true);
    setAngle(ang);
  };

  const onMove = (e) => {
    if (!stirring || cooked || lastAngRef.current === null) return;
    const r = zoneRef.current.getBoundingClientRect();
    // เก็บเป็น viewport absolute เพื่อแปลงเป็น pot-relative ตอน render
    setPointerPos({ clientX: e.clientX, clientY: e.clientY });

    const { ang, radius, rmax } = angleAt(e);
    // ขยาย Deadzone ตรงกลางเป็น 25% กันการลากผ่านจุดศูนย์กลาง
    if (radius < rmax * 0.25) return;

    let delta = ang - lastAngRef.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    lastAngRef.current = ang;
    setAngle(ang);

    let step = Math.abs(delta);

    if (step > 40) {
      step = 3;
    } else if (step > 12) {
      step = 8;
    }

    if (step > 0.3) {
      accumRef.current += step;
    }

    const p = Math.min(100, (accumRef.current / target) * 100);
    setProgress(p);

    const now = performance.now();
    if (now - lastBlubRef.current > 700 && p > 8 && p < 100) {
      lastBlubRef.current = now;
      audio.blub();
    }
    if (p >= 100 && !doneRef.current) {
      doneRef.current = true;
      audio.ding();
      setStirring(false);
    }
  };

  const onUp = () => { setStirring(false); setPointerPos(null); lastAngRef.current = null; };

  const t = progress / 100;
  const soupBG = `radial-gradient(circle at 38% 32%, ${mixHex("#EFD9A8", "#F2A93B", t)} 0%, ${mixHex(
    "#D9B878", "#C96A1E", t
  )} 55%, ${mixHex("#B98F4E", "#8A3E0E", t)} 100%)`;

  const spoonR = 34;
  const rad = (angle * Math.PI) / 180;

  return (
    <StageShell
      title="ตั้งใจคนนะสู้ ๆ"
      subtitle={cooked ? "โหห คนเข้ากันขนาดนี้ ดูเข้มข้น น่าทานมากก ✨" : "กดค้างในหม้อแล้วคนเป็นวงกลม ดูสีมันเปลี่ยนเป็นสีทอง"}
    >
      <div className="flex flex-col items-center">
        {/* progress ladle bar */}
        <div className="w-full max-w-md h-3 sm:h-4 rounded-full mb-5 sm:mb-6 border-2 overflow-hidden" style={{ borderColor: "#B98A4A", background: "rgba(255,248,231,.6)" }}>
          <div className="h-full rounded-full transition-all duration-75" style={{ width: `${progress}%`, background: "linear-gradient(90deg,#F2B93B,#D96A1E)" }} />
        </div>

        <div ref={potRef} className="relative" style={{ width: "min(80vw,340px)", height: "min(80vw,340px)" }}>
          {/* steam */}
          {t > 0.5 &&
            [0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute text-3xl sm:text-4xl anim-steam"
                style={{ left: `${28 + i * 18}%`, top: "-8%", animationDelay: `${i * 0.7}s`, opacity: clamp((t - 0.5) * 2, 0, 0.9) }}
              >
                ♨️
              </div>
            ))}

          {/* pot rim (top-down) */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle at 32% 28%, #D97B45, #A34A20 55%, #6E2C0E)",
              boxShadow: "0 22px 44px rgba(90,40,5,.5), inset 0 -6px 18px rgba(0,0,0,.35)",
            }}
          />
          {/* handles */}
          <div className="absolute top-1/2 -left-5 sm:-left-6 w-8 sm:w-10 h-5 sm:h-6 -translate-y-1/2 rounded-full border-[6px] sm:border-8" style={{ borderColor: "#7A3512" }} />
          <div className="absolute top-1/2 -right-5 sm:-right-6 w-8 sm:w-10 h-5 sm:h-6 -translate-y-1/2 rounded-full border-[6px] sm:border-8" style={{ borderColor: "#7A3512" }} />

          {/* soup surface = stir zone */}
          <div
            ref={zoneRef}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            className="absolute rounded-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
            style={{
              inset: "11%",
              background: soupBG,
              touchAction: "none",
              boxShadow: "inset 0 10px 26px rgba(90,40,0,.45), inset 0 -6px 14px rgba(255,230,170,.25)",
            }}
          >
            {/* swirl layer rotates with your stirring */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                transform: `rotate(${angle}deg)`,
                background:
                  "conic-gradient(from 0deg, rgba(255,240,200,.22), transparent 25%, rgba(120,50,10,.18) 50%, transparent 75%, rgba(255,240,200,.22))",
              }}
            />
            {/* floating ingredient bits swirl too - ขยายขนาดรูปวัตถุดิบในหม้อให้ใหญ่จุใจ */}
            <div className="absolute inset-0 pointer-events-none" style={{ transform: `rotate(${angle * 0.7}deg)` }}>
              {INGREDIENTS.map((ing, i) => {
                const a = (i / INGREDIENTS.length) * Math.PI * 2;
                return (
                  <span
                    key={ing.id}
                    className="absolute text-3xl sm:text-4xl md:text-5xl"
                    style={{
                      left: `${50 + Math.cos(a) * 28}%`,
                      top: `${50 + Math.sin(a) * 28}%`,
                      transform: "translate(-50%,-50%)",
                      opacity: 0.95 - t * 0.35,
                      filter: `saturate(${1 - t * 0.3})`,
                    }}
                  >
                    <IngIcon ing={ing} imgClassName="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 border-2 border-white/90 shadow-md rounded-xl object-cover" />
                  </span>
                );
              })}
            </div>
            {/* bubbles appear as it cooks — เพิ่มฟองเดือดให้ดูเดือดปุดๆ */}
            {t > 0.15 && (() => {
              // ฟองหลัก — กระจายทั่วหม้อ, หลากหลายขนาดและความเร็ว
              const bubbles = [
                // ฟองเล็ก — เดือดเร็ว, ผุดถี่ๆ
                { x: 15, sz: 6,  del: 0,    spd: 'fast' },
                { x: 25, sz: 8,  del: 0.3,  spd: 'fast' },
                { x: 38, sz: 5,  del: 0.8,  spd: 'fast' },
                { x: 52, sz: 7,  del: 0.15, spd: 'fast' },
                { x: 65, sz: 6,  del: 0.55, spd: 'fast' },
                { x: 78, sz: 8,  del: 0.9,  spd: 'fast' },
                { x: 45, sz: 5,  del: 1.1,  spd: 'fast' },
                { x: 32, sz: 6,  del: 1.3,  spd: 'fast' },
                // ฟองกลาง — เด้งช้าลงนิด
                { x: 20, sz: 12, del: 0.2,  spd: 'med' },
                { x: 42, sz: 14, del: 0.6,  spd: 'med' },
                { x: 58, sz: 11, del: 1.0,  spd: 'med' },
                { x: 72, sz: 13, del: 0.4,  spd: 'med' },
                { x: 35, sz: 12, del: 1.2,  spd: 'med' },
                // ฟองใหญ่ — ลอยช้า ดูน่ารัก
                { x: 28, sz: 18, del: 0.5,  spd: 'slow' },
                { x: 50, sz: 22, del: 0.0,  spd: 'slow' },
                { x: 68, sz: 16, del: 0.7,  spd: 'slow' },
                { x: 40, sz: 20, del: 1.4,  spd: 'slow' },
                { x: 60, sz: 17, del: 0.9,  spd: 'slow' },
              ];
              const intensity = clamp((t - 0.15) * 1.5, 0, 1);
              return bubbles.map((b, i) => (
                <div
                  key={`bub-${i}`}
                  className={`absolute rounded-full pointer-events-none ${
                    b.spd === 'fast' ? 'anim-bubble-fast' : b.spd === 'med' ? 'anim-bubble' : 'anim-bubble-slow'
                  }`}
                  style={{
                    width: b.sz, height: b.sz,
                    left: `${b.x}%`,
                    bottom: `${8 + (i % 4) * 5}%`,
                    background: b.spd === 'slow'
                      ? 'radial-gradient(circle at 35% 30%, rgba(255,255,255,.75), rgba(255,244,214,.3))'
                      : 'rgba(255,248,230,.6)',
                    border: b.sz > 14 ? '1px solid rgba(255,255,255,.4)' : 'none',
                    animationDelay: `${b.del}s`,
                    opacity: intensity * (b.spd === 'fast' ? 0.85 : b.spd === 'med' ? 0.75 : 0.65),
                  }}
                />
              ));
            })()}
            {/* spoon follows cursor when stirring, otherwise rides the rim - ขยายขนาดช้อนให้ใหญ่ขึ้น */}
            {stirring && pointerPos ? (
              <div
                className="absolute text-6xl sm:text-7xl md:text-8xl pointer-events-none drop-shadow-xl z-20"
                style={{
                  left: pointerPos.x,
                  top: pointerPos.y,
                  transform: `translate(-50%,-50%) rotate(${angle + 135}deg)`,
                }}
              >
                🥄
              </div>
            ) : (
              <div
                className="absolute text-6xl sm:text-7xl md:text-8xl pointer-events-none drop-shadow-xl z-20"
                style={{
                  left: `${50 + Math.cos(rad) * spoonR}%`,
                  top: `${50 + Math.sin(rad) * spoonR}%`,
                  transform: `translate(-50%,-50%) rotate(${angle + 135}deg)`,
                }}
              >
                🥄
              </div>
            )}
            {!stirring && !cooked && progress < 5 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-3xl sm:text-4xl anim-spinSlow">🌀</span>
              </div>
            )}
          </div>

          {/* ============================================================
              ช้อน — อยู่นอก overflow-hidden ของ soup
              แปลง viewport coords → pot-container-relative coords
          ============================================================ */}
          {stirring && pointerPos ? (() => {
            // แปลง clientX/Y → relative ต่อ pot container
            const potR = potRef.current?.getBoundingClientRect();
            if (!potR) return null;
            const px = pointerPos.clientX - potR.left;
            const py = pointerPos.clientY - potR.top;
            return (
              <div
                className="absolute pointer-events-none drop-shadow-2xl z-30"
                style={{
                  fontSize: 'clamp(3rem, 10vw, 5rem)',
                  left: px,
                  top: py,
                  transform: `translate(-50%,-50%) rotate(${angle + 135}deg)`,
                }}
              >
                🥄
              </div>
            );
          })() : (
            <div
              className="absolute pointer-events-none drop-shadow-2xl z-30"
              style={{
                fontSize: 'clamp(3rem, 10vw, 5rem)',
                // ช้อนวนรอบขอบ soup zone บน pot container
                // soup zone: inset 11% → center = 50%, ขนาด = 78% ของ pot
                // spoonR (34) เป็น % ของ zone → แปลงเป็น % ของ pot = 34 * 0.78
                left: `${50 + Math.cos(rad) * (spoonR * 0.78)}%`,
                top: `${50 + Math.sin(rad) * (spoonR * 0.78)}%`,
                transform: `translate(-50%,-50%) rotate(${angle + 135}deg)`,
              }}
            >
              🥄
            </div>
          )}
        </div>

        {cooked && <CTA onClick={onDone}>ได้เวลาชิมแล้ว 😋</CTA>}
      </div>
    </StageShell>
  );
}

/* ════════════════════ STAGE 4 · TASTE ════════════════════ */
function TasteStage({ audio, onTasted, TASTER_NAME, TASTER_AVATAR, rootRef }) {
  const [drag, setDrag] = useState(null);
  const dragRef = useRef(null);
  const stageRef = useRef(null);
  const [hot, setHot] = useState(false);
  const [tasted, setTasted] = useState(false);
  const [hearts, setHearts] = useState([]);
  const avatarRef = useRef(null);

  useEffect(() => {
    if (!drag) return;
    const mv = (e) => {
      const r = avatarRef.current?.getBoundingClientRect();
      setHot(!!(r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom));
      const sr = stageRef.current.getBoundingClientRect();
      setDrag((d) => (d ? { ...d, x: e.clientX - sr.left, y: e.clientY - sr.top } : d));
    };
    const up = (e) => {
      const r = avatarRef.current?.getBoundingClientRect();
      const over = r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      dragRef.current = null; setDrag(null); setHot(false);
      if (over && !tasted) {
        setTasted(true);
        audio.ding();
        setHearts(Array.from({ length: 10 }).map((_, i) => ({ key: i, dx: (Math.random() - 0.5) * 140, delay: i * 0.12 })));
        setTimeout(onTasted, 1100);
      }
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); };
  }, [drag ? 1 : 0, tasted]); // eslint-disable-line

  const startDrag = (e) => {
    if (tasted) return;
    e.preventDefault();
    const sr = stageRef.current.getBoundingClientRect();
    const d = { x: e.clientX - sr.left, y: e.clientY - sr.top };
    dragRef.current = d; setDrag(d);
  };

  return (
    <div ref={stageRef} className="relative w-full h-full">
      <StageShell
        title="ถึงเวลาอาหารแล้ว"
        subtitle={tasted ? "อร่อยมาก… รสชาติเหมือนพวกเราเลย 💛" : `ลากช้อนไปหา${TASTER_NAME}เพื่อชิมฝีมือสักหน่อย`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 md:gap-24 mt-4">
          {/* little pot with the spoon */}
          <div className="flex flex-col items-center">
            <div
              className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full"
              style={{ background: "radial-gradient(circle at 32% 28%, #D97B45, #A34A20 55%, #6E2C0E)", boxShadow: "0 16px 32px rgba(90,40,5,.45)" }}
            >
              <div className="absolute rounded-full" style={{ inset: "12%", background: "radial-gradient(circle at 38% 32%, #F2A93B, #C96A1E 60%, #8A3E0E)", boxShadow: "inset 0 8px 18px rgba(90,40,0,.45)" }} />
              {!tasted && (
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="ลากช้อนชิม"
                  onPointerDown={startDrag}
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl sm:text-6xl cursor-grab select-none anim-wiggle focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 rounded-full ${drag ? "opacity-30" : ""}`}
                  style={{ touchAction: "none" }}
                >
                  🥄
                </div>
              )}
            </div>
            <div className="mt-2 text-sm sm:text-base font-extrabold text-[#5E3C1D]" style={{ fontFamily: "'Nunito','Noto Sans Thai',sans-serif" }}>อาหารสุดอร่อย</div>
          </div>

          {/* taster avatar - รองรับรูปคน (Default: girl4.png) */}
          <div className="flex flex-col items-center relative">
            {hearts.map((h) => (
              <span key={h.key} className="absolute text-2xl sm:text-3xl anim-heart z-30" style={{ animationDelay: `${h.delay}s`, transform: `translateX(${h.dx}px)` }}>
                ❤️
              </span>
            ))}
            <div
              ref={avatarRef}
              className={`relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden flex items-center justify-center border-[6px] sm:border-8 transition-all ${
                hot ? "scale-110 shadow-2xl ring-4 ring-amber-400/50" : ""
              }`}
              style={{
                background: "linear-gradient(180deg,#FFF3D6,#F7DFAC)",
                borderColor: hot ? "#E0A73C" : "#D9B879",
                boxShadow: hot ? "0 0 0 8px rgba(240,180,60,.35), 0 16px 32px rgba(120,70,10,.35)" : "0 16px 32px rgba(120,70,10,.3)",
              }}
            >
              <img
                src={TASTER_AVATAR || "/assets/girl4.png"}
                alt={TASTER_NAME}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  tasted ? "scale-110" : hot ? "scale-105" : "scale-100"
                }`}
              />
              {tasted ? (
                <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md text-2xl sm:text-3xl anim-pop border border-pink-300">
                  🥰
                </div>
              ) : hot ? (
                <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md text-2xl sm:text-3xl anim-wiggle border border-amber-300">
                  😮
                </div>
              ) : null}
            </div>
            <div className="mt-2 text-sm sm:text-base font-extrabold text-[#5E3C1D]" style={{ fontFamily: "'Nunito','Noto Sans Thai',sans-serif" }}>{TASTER_NAME}</div>
          </div>
        </div>
      </StageShell>

      {/* spoon drag ghost */}
      {drag && (
        <div className="absolute z-50 pointer-events-none text-6xl drop-shadow-2xl" style={{ left: drag.x, top: drag.y, transform: "translate(-50%,-60%) rotate(-20deg)" }}>
          🥄
        </div>
      )}
    </div>
  );
}

/* ════════════════════ SURPRISE MODAL (LOVE LETTER - COMPACT SINGLE-SCREEN) ════════════════════ */
function SurpriseModal({ onClose, SECRET_MESSAGE, VIDEO_URL }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4"
      style={{
        background: "rgba(30,15,5,.80)",
        backdropFilter: "blur(6px)",
      }}
    >
      {/* Compact Love Letter Container - Fits Entirely on Screen */}
      <div
        className="relative w-full max-w-[420px] rounded-2xl p-4 sm:p-5 anim-pop my-auto shadow-2xl border-2 sm:border-4 flex flex-col justify-between"
        style={{
          background: "#FFFDF6",
          backgroundImage: `
            linear-gradient(to right, transparent 24px, rgba(230,170,150,0.2) 24px, rgba(230,170,150,0.2) 25px, transparent 25px),
            repeating-linear-gradient(to bottom, transparent 0 24px, rgba(210,180,150,0.18) 24px 25px)
          `,
          borderColor: "#E5C396",
          boxShadow: "0 20px 50px -10px rgba(0,0,0,0.5), inset 0 0 30px rgba(210,160,100,0.12)",
        }}
      >
        {/* Top Right Mini Love Stamp */}
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-90 pointer-events-none">
          <div className="px-2 py-0.5 border border-dashed border-rose-400 bg-rose-50/90 rounded text-[9px] font-black text-rose-600 tracking-wider uppercase shadow-xs flex items-center gap-1">
            <span>💌</span>
            <span>LOVE POST</span>
          </div>
        </div>

        {/* Top Header */}
        <div className="text-center pt-1 pb-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs sm:text-sm font-bold shadow-xs mb-1">
            <span>💖</span>
            <span>จดหมายลับถึงเธอ</span>
          </div>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#C9A15C] to-transparent mx-auto mt-1" />
        </div>

        {/* Letter Body - Clean Lined Paper Layout */}
        <div className="my-2 px-2 py-1 max-h-[220px] overflow-y-auto">
          <p
            className="text-sm sm:text-base text-[#4A2E14] font-medium whitespace-pre-wrap text-left"
            style={{
              fontFamily: "'Mali', 'Charm', 'Nunito', 'Noto Sans Thai', cursive",
              lineHeight: "1.65",
            }}
          >
            {SECRET_MESSAGE}
          </p>
        </div>

        {/* Video or Compact Romantic Note */}
        {VIDEO_URL ? (
          <div className="my-2 p-1.5 rounded-xl bg-white border border-amber-300 shadow-sm max-h-[160px] overflow-hidden">
            <video src={VIDEO_URL} controls autoPlay playsInline className="w-full h-full object-cover rounded-lg" />
          </div>
        ) : (
          <div className="my-2 py-2 px-3 rounded-xl border border-dashed border-amber-300/80 bg-amber-50/60 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xl shrink-0">📜</span>
              <div className="text-left text-xs font-bold text-[#4A2E14]" style={{ fontFamily: "'Mali', sans-serif" }}>
                สูตรลับของเราเป็นเสร็จแล้ว ✨
              </div>
            </div>
            <span className="text-xs shrink-0">♡</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-5 rounded-full font-black text-sm sm:text-base text-[#3A2A1A] shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border border-amber-300 cursor-pointer"
            style={{
              background: "linear-gradient(180deg,#FBD064,#F0A93B)",
              boxShadow: "0 4px 0 #B87A1E, 0 8px 16px rgba(120,70,10,.25)",
              fontFamily: "'Mali', 'Nunito', 'Noto Sans Thai', sans-serif",
            }}
          >
            <span>ดูใบเสร็จ</span>
            <span className="text-lg">📜</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════ STAGE 5 · RECIPE CARD (RECEIPT STYLE) ════════════════════ */
function RecipeCardStage({ onRestart, INGREDIENTS, SIGNATURE, TASTER_NAME }) {
  const currentDate = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const currentTime = new Date().toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col items-center px-3 sm:px-4 pb-10 sm:pb-16 anim-fadeUp">
      <p className="mb-4 text-sm sm:text-base font-extrabold text-[#7A5A33] text-center" style={{ fontFamily: "'Nunito','Noto Sans Thai',sans-serif" }}>
        🧾 ใบเสร็จสูตรลับความรักของเรา (สามารถแคปหน้าจอเก็บไว้ได้เลย)
      </p>

      {/* Receipt Container */}
      <div
        className="relative w-full flex flex-col overflow-hidden bg-[#FAF8F5] text-[#2D231E] shadow-2xl rounded-t-xl transition-transform hover:scale-[1.01]"
        style={{
          maxWidth: 380,
          boxShadow: "0 20px 45px rgba(80,50,20,.25), 0 2px 10px rgba(0,0,0,.08)",
          fontFamily: "'Courier New', Courier, monospace, 'Noto Sans Thai', sans-serif",
        }}
      >
        <div className="p-5 sm:p-6 flex flex-col gap-3">
          {/* Header Store Info */}
          <div className="text-center space-y-1">
            <div className="text-lg sm:text-xl font-black tracking-normal text-[#3D2C2E] whitespace-nowrap flex items-center justify-center gap-1.5">
              <span>🧾</span>
              <span>RECIPE OF LOVE</span>
            </div>
            <div className="text-xs font-bold text-[#8C6E75] tracking-widest uppercase">
              ใบเสร็จบันทึกความทรงจำ
            </div>
            <div className="text-[11px] text-[#6E555A]">
              สาขา: หัวใจเซ็นเตอร์ · โต๊ะพิเศษ #01
            </div>
          </div>

          <div className="border-b border-dashed border-[#C8B8B0] my-1" />

          {/* Transaction Metadata */}
          <div className="text-[11px] sm:text-xs text-[#554245] space-y-1">
            <div className="flex justify-between items-start gap-2">
              <span className="shrink-0">เลขที่ใบเสร็จ:</span>
              <span className="font-bold text-right shrink-0">#LOVE-20260728</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="shrink-0">วันที่ & เวลา:</span>
              <span className="text-right shrink-0">{currentDate} ({currentTime} น.)</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="shrink-0">เชฟผู้ปรุง:</span>
              <span className="font-bold text-right leading-snug max-w-[65%] break-words">{SIGNATURE || "คนพิเศษของคุณ"}</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="shrink-0">ผู้รับประทาน:</span>
              <span className="font-bold text-[#B60E3D] text-right leading-snug max-w-[65%] break-words">{TASTER_NAME}</span>
            </div>
          </div>

          <div className="border-b border-dashed border-[#C8B8B0] my-1" />

          {/* Itemized List Header */}
          <div className="flex justify-between text-[11px] font-bold text-[#7A6368] uppercase tracking-wider">
            <span>รายการวัตถุดิบ</span>
            <span>ความทรงจำ</span>
          </div>

          <div className="border-b border-dashed border-[#C8B8B0]" />

          {/* Itemized List */}
          <div className="space-y-2.5 my-1">
            {INGREDIENTS.map((ing, i) => (
              <div key={ing.id || i} className="flex justify-between items-start text-xs leading-tight">
                <div className="flex items-start gap-1.5 max-w-[72%]">
                  <span className="text-base shrink-0"><IngIcon ing={ing} /></span>
                  <div>
                    <div className="font-bold text-[#3D2C2E]">{ing.name}</div>
                    <div className="text-[10px] text-[#8C6E75] italic">{ing.note}</div>
                  </div>
                </div>
                <div className="text-right font-bold text-[#B60E3D]">
                  {ing.amount || "100% ♡"}
                </div>
              </div>
            ))}
          </div>

          <div className="border-b border-dashed border-[#C8B8B0] my-1" />

          {/* Summary / Totals */}
          <div className="space-y-1 text-xs text-[#554245]">
            <div className="flex justify-between">
              <span>รวมวัตถุดิบทั้งหมด:</span>
              <span>{INGREDIENTS.length} รายการ</span>
            </div>
            <div className="flex justify-between">
              <span>ส่วนลดความเหงา:</span>
              <span className="text-emerald-700 font-bold">-100%</span>
            </div>
            <div className="flex justify-between text-sm font-black text-[#3D2C2E] pt-1.5 border-t border-solid border-[#E2D8D2]">
              <span>ยอดชำระสุทธิ:</span>
              <span className="text-[#B60E3D]">รักตลอดไป ♡</span>
            </div>
          </div>

          {/* PAID STAMP */}
          <div className="relative my-2 py-1 flex items-center justify-center">
            <div className="px-4 py-1.5 border-2 border-red-600/80 rounded-md text-red-600 font-black text-xs tracking-widest transform -rotate-6 shadow-sm opacity-90">
              ✓ PAID WITH LOVE
            </div>
          </div>

          {/* Message & Barcode Footer */}
          <div className="text-center space-y-2 border-t border-dashed border-[#C8B8B0] pt-3">
            <p className="text-[11px] text-[#6E555A] font-bold leading-relaxed">
              "ขอบคุณที่เข้ามาเป็นเรื่องราวดีๆ ในชีวิตนะ<br />
              ขอให้มีความสุขด้วยกัน ♡"
            </p>

            {/* Fake Barcode SVG */}
            <div className="pt-2 flex flex-col items-center">
              <svg className="h-9 w-48 text-[#3D2C2E]" viewBox="0 0 100 30" fill="currentColor">
                <rect x="0" width="2" height="30"/>
                <rect x="3" width="1" height="30"/>
                <rect x="5" width="3" height="30"/>
                <rect x="10" width="1" height="30"/>
                <rect x="12" width="2" height="30"/>
                <rect x="16" width="4" height="30"/>
                <rect x="22" width="1" height="30"/>
                <rect x="25" width="2" height="30"/>
                <rect x="29" width="3" height="30"/>
                <rect x="34" width="1" height="30"/>
                <rect x="37" width="2" height="30"/>
                <rect x="41" width="4" height="30"/>
                <rect x="47" width="1" height="30"/>
                <rect x="50" width="3" height="30"/>
                <rect x="55" width="2" height="30"/>
                <rect x="59" width="1" height="30"/>
                <rect x="62" width="4" height="30"/>
                <rect x="68" width="2" height="30"/>
                <rect x="72" width="1" height="30"/>
                <rect x="75" width="3" height="30"/>
                <rect x="80" width="2" height="30"/>
                <rect x="84" width="4" height="30"/>
                <rect x="90" width="1" height="30"/>
                <rect x="93" width="2" height="30"/>
                <rect x="97" width="3" height="30"/>
              </svg>
              <div className="text-[9px] tracking-widest text-[#8C6E75] font-mono mt-1">
                999-RECIPE-OF-LOVE-2026
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="mt-6 text-xs sm:text-sm font-extrabold text-[#8A6A3E] underline underline-offset-4 hover:text-[#B0632E] focus:outline-none rounded"
        style={{ fontFamily: "'Nunito','Noto Sans Thai',sans-serif" }}
      >
        ↺ เริ่มทำเมนูรักใหม่อีกครั้ง
      </button>
    </div>
  );
}

/* ════════════════════ APP ════════════════════ */
export default function RecipeOfLoveTemplate({ orderData }) {
  const customTexts = orderData?.custom_texts || {};

  const TASTER_NAME = customTexts.recipientName || "คนที่ฉันรัก";
  const TASTER_AVATAR = orderData?.avatarImage || customTexts.avatarImage || "/assets/girl4.png";
  const SIGNATURE = customTexts.signature || "คนที่รักเธอที่สุด";
  const VIDEO_URL = "";
  const SECRET_MESSAGE = customTexts.letter || "ทุกวันที่มีเธอคือสูตรอาหารโปรดของฉัน ฉันรักเธอ — วันนี้ พรุ่งนี้ และตลอดไป";
  const youtubeUrl = customTexts.youtubeUrl;

  // image_urls[0] = couple photo, image_urls[1..6] = memory photos
  const rawImageUrls = orderData?.image_urls || [];
  // Also read from custom_texts.memories as fallback
  const memoryTexts = customTexts.memories || [];
  const memories = rawImageUrls.slice(1); // skip couple photo at index 0

  // Build a merged list: prefer image_urls first, fallback to memories[].previewUrl
  const getMemoryImage = (index) => {
    if (memories[index] && memories[index].startsWith && (memories[index].startsWith('data:') || memories[index].startsWith('http') || memories[index].startsWith('/'))) {
      return memories[index];
    }
    if (memoryTexts[index]?.previewUrl) {
      return memoryTexts[index].previewUrl;
    }
    return null;
  };

  const defaultIngredients = [
    { id: "memory1", image: getMemoryImage(0) || "/assets/first_date.jpg", emoji: "☕", name: memoryTexts[0]?.caption || "เดทแรกของเรา", amount: "1 ความทรงจำ", note: memoryTexts[0]?.note || "รอยยิ้มแรกที่ทำให้ใจสั่น" },
    { id: "memory2", image: getMemoryImage(1) || "/assets/first_trip.jpg", emoji: "🌧️", name: memoryTexts[1]?.caption || "ทริปแรกด้วยกัน", amount: "1 การเดินทาง", note: memoryTexts[1]?.note || "หลงทางบ้างแต่ก็มีความสุข" },
    { id: "memory3", image: getMemoryImage(2) || "/assets/couple_pics.jpg", emoji: "😂", name: memoryTexts[2]?.caption || "รูปคู่ใบโปรด", amount: "หลายร้อยรูป", note: memoryTexts[2]?.note || "รูปที่ถ่ายตอนเผลอๆ" },
    { id: "memory4", image: getMemoryImage(3) || "/assets/our_memories.jpg", emoji: "🌅", name: memoryTexts[3]?.caption || "โมเมนต์แสนหวาน", amount: "ทุกๆวัน", note: memoryTexts[3]?.note || "ช่วงเวลาที่ได้อยู่ข้างเธอ" },
    { id: "memory5", image: getMemoryImage(4) || "/assets/boy2.jpg", emoji: "🎶", name: memoryTexts[4]?.caption || "รอยยิ้มของเธอ", amount: "มองกี่ครั้งก็หลงรัก", note: memoryTexts[4]?.note || "อบอุ่นเสมอเมื่อได้มอง" },
    { id: "memory6", image: getMemoryImage(5) || "/assets/flower1.png", emoji: "🤗", name: memoryTexts[5]?.caption || "ความรักที่เบ่งบาน", amount: "เติบโตขึ้นทุกวัน", note: memoryTexts[5]?.note || "รดน้ำด้วยความใส่ใจ" },
  ];

  const INGREDIENTS = defaultIngredients;
  const CHOPS_PER_INGREDIENT = 4;
  const STIR_ROTATIONS = 7;

  const rootRef = useRef(null);
  const [stage, setStage] = useState(0); // 0 collect · 1 chop · 2 cook · 3 taste · 4 card
  const [collected, setCollected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const audio = useKitchenAudio();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(true);

  useEffect(() => {
    const unlock = () => setHasInteracted(true);
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const restart = () => { setStage(0); setCollected([]); setShowModal(false); };

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden relative "
      ref={rootRef}
      style={{
        background: "linear-gradient(180deg,#F8E9C9 0%,#F0D8A4 62%,#E4C288 100%)",
        userSelect: "none",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Charm:wght@400;700&family=Fraunces:opsz,wght@9..144,600;9..144,900&family=Mali:wght@500;700&family=Nunito:wght@400;700;800;900&family=Noto+Sans+Thai:wght@400;700;800;900&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px);} to { opacity:1; transform:none;} }
        .anim-fadeUp { animation: fadeUp .5s ease both; }
        @keyframes pop { 0% { transform:scale(.4); opacity:0;} 70% { transform:scale(1.12);} 100% { transform:scale(1); opacity:1;} }
        .anim-pop { animation: pop .35s ease both; }
        @keyframes wiggle { 0%,100% { transform:rotate(-6deg);} 50% { transform:rotate(6deg);} }
        .anim-wiggle { animation: wiggle 1.4s ease-in-out infinite; display:inline-block; }
        @keyframes steam { 0% { transform:translateY(0) scale(.8); opacity:.0;} 25% { opacity:.8;} 100% { transform:translateY(-60px) scale(1.5); opacity:0;} }
        .anim-steam { animation: steam 2.6s ease-out infinite; }
        @keyframes bubble { 0% { transform:translateY(0) scale(.6); opacity:.9;} 50% { opacity:1;} 100% { transform:translateY(-65px) scale(1.15); opacity:0;} }
        .anim-bubble { animation: bubble 1.8s ease-in infinite; }
        @keyframes bubbleFast { 0% { transform:translateY(0) scale(.4); opacity:.8;} 40% { opacity:.9;} 100% { transform:translateY(-45px) scale(.9); opacity:0;} }
        .anim-bubble-fast { animation: bubbleFast 1.0s ease-in infinite; }
        @keyframes bubbleSlow { 0% { transform:translateY(0) scale(.5); opacity:.6;} 30% { transform:translateY(-15px) scale(.9); opacity:.8;} 100% { transform:translateY(-80px) scale(1.4); opacity:0;} }
        .anim-bubble-slow { animation: bubbleSlow 2.8s ease-in-out infinite; }
        @keyframes heart { 0% { transform:translateY(0) scale(.6); opacity:0;} 20% { opacity:1;} 100% { transform:translateY(-140px) scale(1.25) rotate(12deg); opacity:0;} }
        .anim-heart { animation: heart 1.6s ease-out both; }
        @keyframes spinSlow { from { transform:rotate(0);} to { transform:rotate(360deg);} }
        .anim-spinSlow { animation: spinSlow 5s linear infinite; opacity:.5; }
        @keyframes chopFly {
          0%   { transform: translate(-50%,-50%) translate(0px,0px) rotate(0deg) scale(0.65); opacity: 1; }
          65%  { opacity: 0.95; }
          100% { transform: translate(-50%,-50%) translate(var(--tx),var(--ty)) rotate(var(--rot)) scale(var(--sc)); opacity: 0; }
        }
        .anim-chop-fly { animation: chopFly 2.8s cubic-bezier(0.15,0.85,0.35,1) both; pointer-events:none; }
        @media (prefers-reduced-motion: reduce) {
          .anim-fadeUp,.anim-pop,.anim-wiggle,.anim-steam,.anim-bubble,.anim-heart,.anim-spinSlow,.anim-chop-fly { animation:none !important; }
        }
      `}</style>

      {/* soft lamp glow */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 45% at 50% -5%, rgba(255,244,210,.85), transparent 70%)" }} />

      {/* header */}
      <header className="relative pt-6 sm:pt-8 pb-1 text-center px-3 sm:px-4">
        <h1 className="mt-1 text-3xl sm:text-4xl md:text-5xl font-black text-[#4A2E14] drop-shadow-sm px-2" style={{ fontFamily: "'Fraunces','Noto Sans Thai',Georgia,serif" }}>
          มาทำเมนูรักกันนน
        </h1>
        <ProgressRail stage={stage} />
      </header>

      <main className="min-h-[560px] sm:min-h-[600px]">
        {stage === 0 && (
          <WelcomeKitchenStage
            onStart={() => { audio.pop(); setStage(1); }}
            TASTER_NAME={TASTER_NAME}
            TASTER_AVATAR={TASTER_AVATAR}
          />
        )}
        {stage === 1 && (
          <CollectStage
            collected={collected}
            onCollect={(id) => setCollected((c) => (c.includes(id) ? c : [...c, id]))}
            audio={audio}
            onDone={() => { audio.ding(); setStage(2); }}
            rootRef={rootRef}
            INGREDIENTS={INGREDIENTS}
          />
        )}
        {stage === 2 && <ChopStage audio={audio} onDone={() => setStage(3)} INGREDIENTS={INGREDIENTS} CHOPS_PER_INGREDIENT={CHOPS_PER_INGREDIENT} />}
        {stage === 3 && <CookStage audio={audio} onDone={() => setStage(4)} INGREDIENTS={INGREDIENTS} STIR_ROTATIONS={STIR_ROTATIONS} />}
        {stage === 4 && <TasteStage audio={audio} onTasted={() => setShowModal(true)} TASTER_NAME={TASTER_NAME} TASTER_AVATAR={TASTER_AVATAR} rootRef={rootRef} />}
        {stage === 5 && <RecipeCardStage onRestart={restart} INGREDIENTS={INGREDIENTS} SIGNATURE={SIGNATURE} TASTER_NAME={TASTER_NAME} />}
      </main>

      {/* Win Modal / Surprise */}
      {showModal && <SurpriseModal onClose={() => { setShowModal(false); setStage(5); }} SECRET_MESSAGE={SECRET_MESSAGE} VIDEO_URL={VIDEO_URL} />}

      {/* Speaker Toggle Button */}
      {youtubeUrl && (
        <button
          onClick={() => setMusicPlaying(p => !p)}
          className="fixed top-3 right-3 z-[90] flex items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-amber-200/60 text-xl transition-all hover:scale-110 active:scale-95"
          style={{ fontFamily: "'Nunito',sans-serif" }}
          aria-label={musicPlaying ? 'ปิดเสียงเพลง' : 'เปิดเสียงเพลง'}
        >
          {musicPlaying ? '🔊' : '🔇'}
        </button>
      )}

      {/* YouTube Background Audio */}
      <YouTubeAudioPlayer url={youtubeUrl} playing={musicPlaying} />

      {/* wooden counter footer */}
      <div className="absolute bottom-0 inset-x-0 h-5 sm:h-6 pointer-events-none z-10" style={{ ...WOOD_DARK, boxShadow: "0 -6px 16px rgba(60,35,10,.35)" }} />
    </div>
  );
}