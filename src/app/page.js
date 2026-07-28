'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { TEMPLATE_CATALOG, getPriceLabel } from '@/lib/templateCatalog';

/* ──────────────── Soft pastel particles canvas ──────────────── */
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

    const EMOJIS = ['🌸', '💖', '✨', '🩷', '💌', '🌷', '💕', '🎀'];
    for (let i = 0; i < 22; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.35 - 0.1,
        size: Math.random() * 14 + 10,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        opacity: Math.random() * 0.3 + 0.15,
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
      className="pointer-events-none fixed inset-0 z-0 opacity-90"
      aria-hidden="true"
    />
  );
}

/* ──────────────── Preview Modal Component ──────────────── */
function PreviewModal({ isOpen, onClose, title, previewSrc }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-[#ffccd5]/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#ffe5ec] text-[#ff477e] flex items-center justify-center font-bold hover:bg-[#ff5376] hover:text-white transition-all shadow"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#ff6584] to-[#ff8fa3] flex items-center justify-center text-white shadow-md shadow-[#ff6584]/25">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              play_circle
            </span>
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-[#3d2c2e]">
              {title || 'ตัวอย่างการทำงานเว็บไซต์'}
            </h3>
            <p className="text-xs text-[#8c6e75]">ตัวอย่างคลิปการเล่นและบรรยากาศในเกม</p>
          </div>
        </div>

        {/* Media Preview Container */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-black border border-[#ffccd5]/40 shadow-inner max-h-[65vh] flex items-center justify-center">
          {previewSrc ? (
            <img
              src={previewSrc}
              alt="Game Preview"
              className="w-full h-auto max-h-[60vh] object-contain"
            />
          ) : (
            <div className="py-16 text-center text-[#8c6e75] px-4">
              <span className="material-symbols-outlined text-4xl mb-2 text-[#ff6584]">lock</span>
              <p className="text-sm font-bold text-[#3d2c2e]">คลิปตัวอย่างสำหรับธีมนี้จะเปิดให้บริการเร็วๆ นี้ 🔒</p>
              <p className="text-xs text-[#8c6e75] mt-1">สามารถทดลองเล่นธีม Retro Arcade ได้ก่อนเลยครับ</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 flex justify-between items-center flex-wrap gap-3 pt-2 border-t border-[#ffccd5]/30">
          <p className="text-xs text-[#8c6e75] italic">
            * ตัวอย่างประสบการณ์จริงเมื่อคู่ของคุณเปิดลิงก์บนมือถือหรือคอมพิวเตอร์
          </p>
          <Link
            href="/create?template=retro-8bit"
            onClick={onClose}
            className="bg-gradient-to-r from-[#ff6584] to-[#ff8fa3] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md shadow-[#ff6584]/25 hover:from-[#ff5376] hover:to-[#ff7b98] transition-all active:scale-95"
          >
            เริ่มสร้างธีมนี้ 🎮
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Main Landing Page Component ──────────────── */
export default function HomePage() {
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    title: '',
    src: '',
  });

  const openPreview = (title = 'ตัวอย่างเกม Retro Arcade 🎮', src = '/assets/examclip.gif') => {
    setPreviewModal({
      isOpen: true,
      title,
      src,
    });
  };

  const closePreview = () => {
    setPreviewModal({ isOpen: false, title: '', src: '' });
  };

  return (
    <div className="font-google-sans relative min-h-screen bg-[#fff8f9] text-[#3d2c2e] selection:bg-[#ffe5ec] selection:text-[#ff477e]">
      <ParticleCanvas />

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/75 backdrop-blur-xl border-b border-[#ffccd5]/40 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-5 md:px-16 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-xl md:text-2xl tracking-tight"
          >
            <img
              src="/assets/pixellove.png"
              alt="Pixel Love Logo"
              className="h-9 md:h-10 w-auto object-contain rounded-xl hover:scale-105 transition-transform duration-300"
            />
            <span className="bg-gradient-to-r from-[#ff5376] to-[#ff7eb3] bg-clip-text text-transparent drop-shadow-sm font-extrabold">
              Pixel Love
            </span>
          </Link>

          <div className="hidden md:flex gap-8 items-center">
            <a
              href="#"
              className="text-[#ff5376] font-bold border-b-2 border-[#ff5376] pb-1 text-sm md:text-base"
            >
              หน้าแรก
            </a>
            <a
              href="#packages"
              className="text-[#8c6e75] hover:text-[#ff5376] transition-colors text-sm md:text-base font-medium"
            >
              แพ็คเกจ
            </a>
            <a
              href="#how-it-works"
              className="text-[#8c6e75] hover:text-[#ff5376] transition-colors text-sm md:text-base font-medium"
            >
              วิธีใช้งาน
            </a>
            <a
              href="#reviews"
              className="text-[#8c6e75] hover:text-[#ff5376] transition-colors text-sm md:text-base font-medium"
            >
              รีวิว
            </a>
          </div>

          <Link
            href="/create?template=retro-8bit"
            className="bg-gradient-to-r from-[#ff6584] to-[#ff8fa3] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:from-[#ff5376] hover:to-[#ff7b98] transition-all active:scale-95 shadow-md shadow-[#ff6584]/25"
          >
            เริ่มสร้างเลย
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-5 md:px-16 min-h-[850px] flex items-center overflow-hidden max-w-[1280px] mx-auto">
        {/* Atmospheric Background Elements */}
        <div className="absolute top-20 right-[-8%] w-96 h-96 bg-[#ff6584]/10 rounded-full blur-[100px] floating" />
        <div
          className="absolute bottom-10 left-[-5%] w-80 h-80 bg-[#ffe5ec] rounded-full blur-[90px] floating"
          style={{ animationDelay: '-2s' }}
        />

        <div className="w-full grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <h1 className="text-[34px] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#3d2c2e] leading-[1.22] tracking-tight">
              สร้างเว็บไซต์บอกรักที่ <br className="block sm:hidden" />
              <span className="bg-gradient-to-r from-[#ff5376] to-[#ff85a1] bg-clip-text text-transparent inline-block">
                พิเศษที่สุด
              </span>{' '}
              ในไม่กี่นาที
            </h1>
            <p className="text-base sm:text-lg text-[#7c6066] max-w-lg leading-relaxed">
              ส่งต่อความรู้สึกผ่านเว็บไซต์ มินิเกม และจดหมายรักดิจิทัลที่ออกแบบมาเพื่อคุณและคนพิเศษโดยเฉพาะ เปลี่ยนความทรงจำให้เป็นของขวัญล้ำค่า
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="#packages"
                className="bg-gradient-to-r from-[#ff6584] to-[#ff8fa3] hover:from-[#ff5376] hover:to-[#ff7a98] text-white px-8 py-4 rounded-full text-base sm:text-lg font-semibold shadow-lg shadow-[#ff6584]/30 hover:scale-105 transition-all text-center"
              >
                เริ่มสร้างเลย
              </Link>
              <button
                type="button"
                onClick={() => openPreview('ตัวอย่างเกม Retro Arcade 🎮', '/assets/examclip.gif')}
                className="bg-[#ffe5ec] text-[#ff477e] px-8 py-4 rounded-full text-base sm:text-lg font-semibold border border-[#ffb3c1]/40 hover:bg-white hover:border-[#ff758c]/40 transition-all text-center flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_circle
                </span>
                ดูตัวอย่าง
              </button>
            </div>
          </div>

          {/* Canvas Card & Floating Badge */}
          <div className="relative">
            <div className="love-letter-canvas p-6 sm:p-8 md:p-12 rotate-2 hover:rotate-0 transition-transform duration-500 border border-[#ffccd5]/50">
              <div className="flex justify-between items-start mb-8">
                <span className="material-symbols-outlined text-[#ff5376] text-4xl">
                  favorite
                </span>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#8c6e75]">February 14, 2024</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 w-3/4 bg-[#ff6584]/15 rounded-full" />
                <div className="h-4 w-full bg-[#ff6584]/8 rounded-full" />
                <div className="h-4 w-5/6 bg-[#ff6584]/8 rounded-full" />
                <div
                  className="h-48 sm:h-56 w-full rounded-2xl bg-cover bg-center mt-6 shadow-inner border border-white/80 transition-transform duration-500 hover:scale-[1.02] cursor-pointer"
                  onClick={() => openPreview('ตัวอย่างเกม Retro Arcade 🎮', '/assets/examclip.gif')}
                  style={{
                    backgroundImage: "url('/assets/lovemessage.png')",
                  }}
                />
              </div>
              <div className="mt-8 pt-8 border-t border-[#ffccd5]/40 flex justify-center">
                <div className="text-[#ff5376] font-bold text-base md:text-lg">
                  จากใจ... ถึงเธอคนพิเศษ
                </div>
              </div>
            </div>

            {/* Floating Mini Card */}
            <div
              onClick={() => openPreview('ตัวอย่างเกม Retro Arcade 🎮', '/assets/examclip.gif')}
              className="absolute -bottom-6 -left-6 glass-card p-4 flex items-center gap-4 animate-bounce border border-[#ffccd5]/80 shadow-xl bg-white/95 cursor-pointer hover:scale-105 transition-transform"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-[#ff6584] to-[#ff8fa3] rounded-full flex items-center justify-center text-white shadow-md shadow-[#ff6584]/30">
                <span className="material-symbols-outlined text-2xl">gamepad</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-[#3d2c2e]">มินิเกมใหม่!</p>
                <p className="text-xs text-[#8c6e75]">กดเพื่อดูตัวอย่างคลิป</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Template Selection Section */}
      <section className="py-24 px-5 md:px-16 bg-[#fff0f3]" id="packages">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3d2c2e]">
              เลือกธีมที่ใช่สำหรับคู่ของคุณ
            </h2>
            <p className="text-base text-[#8c6e75]">
              ดีไซน์หลากหลายรูปแบบที่ตอบโจทย์ทุกนิยามความรักของคุณ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {TEMPLATE_CATALOG.map((template) => {
              const isFree = template.price === 0;
              const isAvailable = template.available;
              const hasClip = template.id === 'retro-8bit';

              return (
                <div
                  key={template.id}
                  className={`glass-card flex flex-col overflow-hidden h-full group bg-white/90 border border-[#ffccd5]/50 transition-all duration-300 shadow-sm ${
                    isAvailable
                      ? 'hover:-translate-y-2 hover:shadow-xl hover:shadow-[#ff6584]/10'
                      : 'opacity-85'
                  }`}
                >
                  <div className="h-48 overflow-hidden relative">
                    <div
                      className={`w-full h-full bg-cover bg-center transition-transform duration-500 ${
                        isAvailable ? 'group-hover:scale-110' : 'grayscale-[20%]'
                      }`}
                      style={{ backgroundImage: `url('${template.previewImage}')` }}
                    />
                    {template.badge && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm text-xs font-bold text-[#b60e3d] border border-[#ffccd5]/60">
                        {template.badge}
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-lg text-[#3d2c2e]">
                          {template.name}
                        </h3>
                        <span
                          className={`font-bold text-base ${
                            isFree ? 'text-[#8c6e75]' : 'text-[#ff5376]'
                          }`}
                        >
                          {getPriceLabel(template.price)}
                        </span>
                      </div>
                      <p className="text-sm text-[#7c6066] mb-6 leading-relaxed">
                        {template.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          openPreview(
                            `ตัวอย่างธีม ${template.name}`,
                            template.previewClip || '/assets/examclip.gif'
                          )
                        }
                        className="w-full py-2.5 rounded-xl font-bold text-xs border border-[#ffb3c1]/70 bg-[#ffe5ec]/60 text-[#ff477e] hover:bg-[#ffe5ec] hover:border-[#ff5376]/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                      >
                        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                          play_circle
                        </span>
                        ดูตัวอย่าง
                      </button>

                      {isAvailable ? (
                        <Link
                          href={`/create?template=${template.id}`}
                          className={`w-full py-3 rounded-xl font-bold text-xs text-center transition-all duration-200 block ${
                            isFree
                              ? 'bg-[#8c6e75] text-white hover:bg-[#785b62] active:scale-[0.98]'
                              : 'bg-gradient-to-r from-[#ff6584] to-[#ff8fa3] text-white hover:from-[#ff5376] hover:to-[#ff7a98] active:scale-[0.98] shadow-md shadow-[#ff6584]/20'
                          }`}
                        >
                          เลือกใช้งาน
                        </Link>
                      ) : (
                        <button
                          disabled
                          type="button"
                          className="w-full py-3 rounded-xl font-bold text-xs text-center bg-[#e2bec0]/40 text-[#8c6e75] cursor-not-allowed border border-[#e2bec0]/60"
                        >
                          🔒 เร็วๆ นี้
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-5 md:px-16 bg-[#fff8f9]" id="how-it-works">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3d2c2e]">
              สร้างง่ายๆ ใน 4 ขั้นตอน
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-[2px] bg-[#ffccd5] -z-0" />

            {/* Step 1 */}
            <div className="text-center space-y-6 relative z-10">
              <div className="w-24 h-24 bg-white shadow-xl shadow-[#ff6584]/10 rounded-full flex items-center justify-center mx-auto border-4 border-[#ffe5ec] text-[#ff5376]">
                <span className="material-symbols-outlined text-4xl">palette</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#3d2c2e] mb-2">1. เลือกดีไซน์</h3>
                <p className="text-sm text-[#7c6066] leading-relaxed">
                  Choose your favorite theme จากห้องสมุดธีมสุดพิเศษของเรา
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-6 relative z-10">
              <div className="w-24 h-24 bg-white shadow-xl shadow-[#ff6584]/10 rounded-full flex items-center justify-center mx-auto border-4 border-[#ffe5ec] text-[#ff5376]">
                <span className="material-symbols-outlined text-4xl">edit_note</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#3d2c2e] mb-2">2. ใส่เนื้อหา</h3>
                <p className="text-sm text-[#7c6066] leading-relaxed">
                  Add your photos and messages บอกเล่าเรื่องราวผ่านปลายนิ้ว
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-6 relative z-10">
              <div className="w-24 h-24 bg-white shadow-xl shadow-[#ff6584]/10 rounded-full flex items-center justify-center mx-auto border-4 border-[#ffe5ec] text-[#ff5376]">
                <span className="material-symbols-outlined text-4xl">payments</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#3d2c2e] mb-2">3. ชำระเงิน</h3>
                <p className="text-sm text-[#7c6066] leading-relaxed">
                  Secure payment for premium themes มั่นใจด้วยระบบชำระเงินมาตรฐาน
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="text-center space-y-6 relative z-10">
              <div className="w-24 h-24 bg-white shadow-xl shadow-[#ff6584]/10 rounded-full flex items-center justify-center mx-auto border-4 border-[#ffe5ec] text-[#ff5376]">
                <span className="material-symbols-outlined text-4xl">qr_code_2</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#3d2c2e] mb-2">4. ส่งต่อความรัก</h3>
                <p className="text-sm text-[#7c6066] leading-relaxed">
                  Get QR code/link to send พร้อมส่งให้คนพิเศษของคุณทันที
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-5 md:px-16 bg-gradient-to-r from-[#ff6584] via-[#ff758c] to-[#ff8fa3] text-white text-center overflow-hidden relative shadow-inner">
        <div className="max-w-2xl mx-auto relative z-10 space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight drop-shadow-sm">
            พร้อมสร้างช่วงเวลาที่น่าจดจำแล้วหรือยัง?
          </h2>
          <p className="text-lg opacity-95 leading-relaxed font-medium">
            เริ่มสร้างเว็บไซต์ความรักของคุณวันนี้ และเปลี่ยนวันธรรมดาให้เป็นวันที่แสนพิเศษ
          </p>
          <div className="pt-4">
            <Link
              href="/create?template=retro-8bit"
              className="inline-block bg-white text-[#ff477e] px-12 py-5 rounded-full text-lg sm:text-xl font-bold hover:bg-[#fff0f3] hover:scale-105 transition-all shadow-2xl shadow-[#ff477e]/20"
            >
              เริ่มสร้างเดี๋ยวนี้เลย
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 px-5 md:px-16 bg-[#fff8f9] border-t border-[#ffccd5]/50">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[#ff5376]">
            <img
              src="/assets/pixellove.png"
              alt="Pixel Love Logo"
              className="h-8 w-auto object-contain rounded-xl"
            />
            <span className="bg-gradient-to-r from-[#ff5376] to-[#ff7eb3] bg-clip-text text-transparent font-extrabold">
              Pixel Love
            </span>
          </Link>
          <p className="text-xs sm:text-sm text-[#8c6e75]">
            © 2026 Pixel Love. สร้างด้วยความรักเพื่อคนไทยทุกคน
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-xs sm:text-sm text-[#8c6e75] hover:text-[#ff5376] underline transition-all"
            >
              ข้อกำหนดการใช้งาน
            </a>
            <a
              href="#"
              className="text-xs sm:text-sm text-[#8c6e75] hover:text-[#ff5376] underline transition-all"
            >
              นโยบายความเป็นส่วนตัว
            </a>
            <a
              href="#"
              className="text-xs sm:text-sm text-[#8c6e75] hover:text-[#ff5376] underline transition-all"
            >
              ติดต่อเรา
            </a>
          </div>
        </div>
      </footer>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreview}
        title={previewModal.title}
        previewSrc={previewModal.src}
      />
    </div>
  );
}