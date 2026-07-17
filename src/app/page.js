'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { TEMPLATE_CATALOG } from '@/lib/templateCatalog';

/* ──────────────── floating pastel particles canvas ──────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // เปลี่ยนเป็นไอคอนโทนพาสเทล อ่อนโยน ไม่แย่งซีนสายตา
    const EMOJIS = ['🌸', '🤍', '✨', '🩷', '💌', '🌷', '💕'];
    for (let i = 0; i < 24; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        size: Math.random() * 14 + 10,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        opacity: Math.random() * 0.3 + 0.15, // ลดความเข้มลงให้ดูฟุ้งๆ อบอุ่น
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px sans-serif`;
        ctx.fillText(p.emoji, p.x, p.y);
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -30) p.y = canvas.height + 30;
        if (p.x < -30) p.x = canvas.width + 30;
        if (p.x > canvas.width + 30) p.x = -30;
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}

/* ──────────────── badge color map (Apple Style Soft Tones) ──────────────── */
const BADGE_COLORS = {
  rose: 'bg-rose-500 text-white shadow-md shadow-rose-500/20',
  violet: 'bg-purple-500 text-white shadow-md shadow-purple-500/20',
  emerald: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20',
  amber: 'bg-amber-500 text-white shadow-md shadow-amber-500/20',
};

/* ──────────────── preview gradient map ──────────────── */
const PREVIEW_BG = {
  free: 'from-emerald-50/80 via-teal-50/40 to-slate-50 text-emerald-500',
  standard: 'from-rose-50/80 via-pink-50/40 to-purple-50/50 text-rose-500',
  premium: 'from-amber-50/80 via-rose-100/50 to-pink-50 text-rose-600',
};

/* ──────────────── template card (Apple Card Design) ──────────────── */
function TemplateCard({ template }) {
  const {
    id,
    name,
    tagline,
    description,
    price,
    badge,
    badgeColor,
    available,
    features,
    tier,
  } = template;

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-[36px] border border-rose-100/80 bg-white/90 p-3 shadow-[0_15px_40px_-15px_rgba(244,114,182,0.15)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_25px_50px_-12px_rgba(244,114,182,0.25)] ${!available ? 'opacity-75' : ''
        }`}
    >
      {/* Badge มุมบนขวา */}
      {badge && (
        <span
          className={`absolute right-6 top-6 z-10 rounded-full px-3.5 py-1 text-xs font-semibold tracking-wide ${BADGE_COLORS[badgeColor] || BADGE_COLORS.rose
            }`}
        >
          {badge}
        </span>
      )}

      {/* Preview Image Area สไตล์ หน้าจอมินิมอล */}
      <div
        className={`relative flex h-52 w-full items-center justify-center overflow-hidden rounded-[26px] bg-gradient-to-br ${PREVIEW_BG[tier] || PREVIEW_BG.standard
          } transition-transform duration-500 group-hover:scale-[1.02]`}
      >
        {/* จำลองกรอบหน้าจอเล็กๆ ดึงดูดสายตา */}
        <div className="flex h-32 w-48 flex-col items-center justify-center rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-md transition-transform duration-500 group-hover:scale-105">
          <span className="text-4xl drop-shadow-sm">
            {tier === 'premium' ? '🎮' : tier === 'standard' ? '💖' : '💌'}
          </span>
          <span className="mt-2 text-xs font-semibold text-slate-600">
            {name}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-3">
          <h3 className="text-xl font-bold tracking-tight text-slate-800">
            {name}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-rose-500">{tagline}</p>
        </div>

        <p className="text-sm leading-relaxed text-slate-500 line-clamp-2">
          {description}
        </p>

        {/* Features แบบ Tag Pills (แทนลิสต์ติ๊กถูกแนว AI) */}
        <div className="mt-4 flex flex-1 flex-wrap gap-1.5 align-top">
          {features.map((f, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-lg bg-rose-50/80 px-2.5 py-1 text-xs font-medium text-slate-600 border border-rose-100/50"
            >
              {f}
            </span>
          ))}
        </div>

        {/* Price + CTA Button สไตล์ Apple */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            {price === 0 ? (
              <span className="text-2xl font-black tracking-tight text-emerald-600">
                ฟรี
              </span>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black tracking-tight text-slate-800">
                  {price}
                </span>
                <span className="text-xs font-bold text-slate-400">บาท</span>
              </div>
            )}
          </div>

          {available ? (
            <Link
              href={`/create?template=${id}`}
              className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/10 transition-all hover:bg-rose-500 hover:shadow-rose-500/25 active:scale-95"
            >
              เลือกดีไซน์นี้
            </Link>
          ) : (
            <span className="rounded-full bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed">
              เร็วๆ นี้
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────── main page ──────────────── */
export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#FAF7F5] text-slate-800 selection:bg-rose-200">
      <ParticleCanvas />

      {/* Background Subtle Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-rose-100/50 via-pink-50/20 to-transparent blur-3xl pointer-events-none -z-10" />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6 sm:pt-20">

        {/* Hero Section สไตล์ Clean Minimal */}
        <section className="mx-auto max-w-3xl text-center pb-16 sm:pb-20">

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl sm:leading-[1.15]">
            เซอร์ไพรส์คนพิเศษ <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              ด้วยเกมและจดหมายรัก
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
            สร้างเว็บเซอร์ไพรส์แฟนได้ง่ายๆ ใน 3 นาที เลือกดีไซน์ ใส่รูปและความรู้สึก
            ได้ลิงก์พร้อม QR Code ส่งให้แฟนเปิดดูได้ทันทีไม่ต้องโหลดแอป
          </p>
        </section>

        {/* Template Grid */}
        <section className="pb-20">
          <div className="mb-8 flex items-end justify-between px-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                เลือกรูปแบบความประทับใจ
              </h2>
              <p className="mt-1 text-sm text-slate-500">ดีไซน์สวยงาม รองรับการเปิดดูบนมือถือทุกรุ่น</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
            {TEMPLATE_CATALOG.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </section>

        {/* How It Works สไตล์ Clean Glass Card */}
        <section className="mt-10 rounded-[40px] border border-rose-100/80 bg-white/60 p-8 shadow-[0_20px_50px_-20px_rgba(244,114,182,0.15)] backdrop-blur-xl sm:p-12">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
              ขั้นตอนการสร้างเว็บไซต์
            </h2>
            <p className="mt-2 text-sm text-slate-500">โดยทำตาม 4 ขั้นตอนง่าย ๆ ดังต่อไปนี้</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
            {[
              { step: '01', icon: '🎨', title: 'เลือกดีไซน์', desc: 'เลือกรูปแบบเทมเพลตที่เหมาะกับคู่ของคุณ' },
              { step: '02', icon: '✍️', title: 'ใส่ความรู้สึก', desc: 'กรอกข้อความ รูปภาพ และความทรงจำร่วมกัน' },
              { step: '03', icon: <img src="/assets/Prompt%20pay.jpg" alt="Prompt Pay" className="h-full object-contain mix-blend-multiply" />, title: 'ชำระเงิน', desc: 'สแกน QR พร้อมเพย์ แล้วแนบสลิปยืนยัน', wide: true },
              { step: '04', icon: '🎁', title: 'ส่งให้แฟน', desc: 'รับลิงก์และ QR Code ส่งเซอร์ไพรส์ได้เลย!' },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative flex flex-col justify-between rounded-3xl bg-white/80 p-6 border border-slate-100 shadow-sm transition-all hover:border-rose-200 hover:shadow-md"
              >
                <span className="absolute top-4 right-4 text-xs font-black text-rose-200 group-hover:text-rose-400 transition-colors">
                  {item.step}
                </span>
                <div>
                  <div className={`mb-4 inline-flex h-12 items-center justify-center rounded-2xl bg-rose-50 text-2xl group-hover:scale-110 transition-transform overflow-hidden ${item.wide ? 'w-24' : 'w-12'}`}>
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 border-t border-slate-200/60 pt-8 text-center text-xs font-medium text-slate-400">
          <p>© {new Date().getFullYear()} Love Simulator — Crafted for couples with ❤️</p>
        </footer>

      </main>
    </div>
  );
}