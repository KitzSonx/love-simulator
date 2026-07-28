'use client';

import { useState, useMemo, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropUtils';

/* ─── Design Tokens ─── */
const PRIMARY = '#b60e3d';
const BG = '#fff8f7';

/* ─── Constants ─── */
const PASSWORD_PRESETS = ['คลั่งรัก101', 'รักกันตลอดไป', 'MyHeart123', 'FOREVERLOVE'];
const COUPLE_PHOTO_INPUT_ID = 'couple-photo-upload';
const AVATAR_OPTIONS = [
  { id: 'boy1.png', src: '/assets/boy1.png', label: 'The Hero' },
  { id: 'boy2.jpg', src: '/assets/boy2.jpg', label: 'The Dreamer' },
  { id: 'boy3.png', src: '/assets/boy3.png', label: 'The Companion' },
  { id: 'boy4.png', src: '/assets/boy4.png', label: 'The Helper' },
  { id: 'boy5.png', src: '/assets/boy5.png', label: 'The Knight' },
  { id: 'girl1.png', src: '/assets/girl1.png', label: 'The Muse' },
  { id: 'girl2.png', src: '/assets/girl2.png', label: 'The Angel' },
  { id: 'girl3.png', src: '/assets/girl3.png', label: 'The Star' },
  { id: 'girl4.png', src: '/assets/girl4.png', label: 'The Princess' },
];
const FLOWER_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  id: `flower${i + 1}.png`,
  src: `/assets/flower${i + 1}.png`,
}));
const MUSIC_OPTIONS = [
  { id: 'custom', label: 'เลือกเพลงจาก YouTube (วางลิงก์วิดีโอ)', emoji: '🎵' },
];

const TOTAL_STEPS = 5;
const STEP_LABELS = [
  'ตั้งต้นเรื่องราว',
  'เขียนความรู้สึก',
  'บรรยากาศ & สไตล์',
  'อัลบั้มความทรงจำ',
  'ความลับสุดท้าย',
];

/* ─── Shared Input Styles ─── */
const inputCls =
  'w-full h-14 px-5 bg-[#fbf1f1] border-2 border-transparent rounded-2xl text-base font-medium text-[#1f1b1b] placeholder:text-[#8e6f71]/60 focus:border-[#b60e3d] focus:bg-white focus:outline-none transition-all duration-200';
const textareaCls =
  'w-full px-5 py-4 bg-[#fbf1f1] border-2 border-transparent rounded-2xl text-base font-medium text-[#1f1b1b] placeholder:text-[#8e6f71]/60 focus:border-[#b60e3d] focus:bg-white focus:outline-none transition-all duration-200 resize-none';
const labelCls = 'block text-sm font-bold text-[#725477] mb-2 px-1 tracking-wide';

/* ─── Sub-components ─── */

function CropModal({ imageSrc, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = useCallback((_, pixels) => setCroppedAreaPixels(pixels), []);

  const handleConfirm = async () => {
    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(cropped);
    } catch (e) {
      console.error(e);
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 p-4">
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onCropComplete={handleCropComplete}
          onZoomChange={setZoom}
          cropShape="rect"
        />
      </div>
      <div className="mt-6 mb-4 flex justify-center gap-4">
        <button type="button" onClick={onCancel} className="rounded-2xl bg-slate-700 px-6 py-3 font-semibold text-white">
          ยกเลิก
        </button>
        <button type="button" onClick={handleConfirm} className="rounded-2xl bg-[#b60e3d] px-6 py-3 font-semibold text-white">
          ยืนยันการครอป
        </button>
      </div>
    </div>
  );
}

function ProgressPips({ current, total }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => {
        const done = i < current - 1;
        const active = i === current - 1;
        return (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              done
                ? 'w-3 h-3 bg-[#b60e3d]'
                : active
                ? 'w-4 h-4 bg-[#b60e3d] ring-4 ring-[#b60e3d]/20 scale-110'
                : 'w-3 h-3 bg-[#e2bec0]/50'
            }`}
          />
        );
      })}
    </div>
  );
}

function BottomNav({ onBack, onNext, isFirst, isLast, loading }) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[680px] px-5 pb-6 pt-4"
      style={{ background: 'linear-gradient(to top, #fff8f7 70%, transparent)' }}
    >
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          disabled={isFirst}
          className={`flex items-center gap-2 rounded-full border-2 px-7 py-3 font-bold text-sm transition-all duration-200 ${
            isFirst
              ? 'border-[#e2bec0]/40 text-[#e2bec0] cursor-not-allowed'
              : 'border-[#725477]/30 text-[#725477] hover:scale-105 hover:border-[#725477]/60 active:scale-95'
          }`}
        >
          <span className="material-symbols-outlined text-base">arrow_back_ios</span>
          Back
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={loading}
          className="flex items-center gap-2 rounded-full bg-[#b60e3d] text-white px-8 py-3 font-bold text-sm shadow-lg shadow-[#b60e3d]/30 hover:scale-105 hover:brightness-110 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ boxShadow: '0 0 20px rgba(182,14,61,0.35)' }}
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              กำลังสร้าง...
            </>
          ) : (
            <>
              {isLast ? 'Finish' : 'Next'}
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
              </span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
}

/* ─── Step Error Toast ─── */
function StepErrorToast({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-[560px] px-5 animate-in"
      style={{ animation: 'slideDown 0.25s ease-out' }}
    >
      <div className="flex items-center gap-3 rounded-2xl bg-white border-2 border-[#ffdad6] shadow-xl shadow-[#b60e3d]/10 px-5 py-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#ffdad6] flex items-center justify-center">
          <span className="material-symbols-outlined text-[#93000a] text-base">error</span>
        </div>
        <p className="flex-1 text-sm font-bold text-[#93000a] leading-snug">{message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ffdad6]/60 flex items-center justify-center text-[#93000a] hover:bg-[#ffdad6] transition-colors"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0);     }
        }
      `}</style>
    </div>
  );
}

/* ─── Step 1: Start Your Journey ─── */
function Step1({ data, onChange }) {
  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#b60e3d] leading-tight mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Start Your Journey
        </h1>
        <p className="text-sm text-[#5a4042]">Let's set the stage for your romantic simulation. Who are the stars of this story?</p>
      </div>

      <div className="group">
        <label className={labelCls} htmlFor="sender-name">Your Name (Sender)</label>
        <div className="relative">
          <input
            id="sender-name"
            type="text"
            className={inputCls + ' pr-12'}
            placeholder="Enter your name..."
            value={data.senderName}
            onChange={(e) => onChange({ senderName: e.target.value })}
          />
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#b60e3d]/40 group-focus-within:text-[#b60e3d] transition-colors pointer-events-none">
            person
          </span>
        </div>
      </div>

      <div className="group">
        <label className={labelCls} htmlFor="partner-name">Their Name (Partner)</label>
        <div className="relative">
          <input
            id="partner-name"
            type="text"
            className={inputCls + ' pr-12'}
            placeholder="Who's the lucky one?"
            value={data.recipientName}
            onChange={(e) => onChange({ recipientName: e.target.value })}
          />
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#b60e3d]/40 group-focus-within:text-[#b60e3d] transition-colors pointer-events-none">
            favorite
          </span>
        </div>
      </div>

      <div className="group">
        <label className={labelCls} htmlFor="special-date">Special Date (Anniversary / Birthday)</label>
        <div className="relative">
          <input
            id="special-date"
            type="date"
            className={inputCls + ' pr-12'}
            value={data.anniversaryDate}
            onChange={(e) => onChange({ anniversaryDate: e.target.value })}
          />
        </div>
      </div>

      <div className="group">
        <label className={labelCls} htmlFor="customer-email">อีเมลติดต่อ (สำหรับรับอัปเดต)</label>
        <div className="relative">
          <input
            id="customer-email"
            type="email"
            required
            className={inputCls + ' pr-12'}
            placeholder="your@email.com"
            value={data.customerEmail}
            onChange={(e) => onChange({ customerEmail: e.target.value })}
          />
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#b60e3d]/40 group-focus-within:text-[#b60e3d] transition-colors pointer-events-none">
            mail
          </span>
        </div>
      </div>

      <p className="text-center text-xs italic text-[#5a4042]/60 pt-2">
        "Every great love story starts with a single step."
      </p>
    </div>
  );
}

/* ─── Step 2: Write Your Story ─── */
function Step2({ data, onChange }) {
  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1f1b1b] leading-tight mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Write Your Story
        </h1>
        <p className="text-sm text-[#5a4042]">Pour your heart onto the digital parchment.</p>
      </div>

      {/* Love Note card */}
      <div className="relative bg-[#fbf1f1] border border-[#e2bec0]/40 rounded-[28px] p-6 shadow-inner overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#b60e3d]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-[#b60e3d] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>history_edu</span>
          <h3 className="font-bold text-[#1f1b1b] text-base">The Love Note</h3>
        </div>
        <textarea
          className={textareaCls + ' h-48'}
          placeholder="Once upon a time... I love you because..."
          value={data.letter}
          onChange={(e) => onChange({ letter: e.target.value })}
        />
        <div className="flex items-center gap-1 justify-end mt-2 opacity-40">
          <span className="material-symbols-outlined text-[#b60e3d] text-sm">ink_pen</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#5a4042]">Drafting...</span>
        </div>
      </div>

      {/* Signature */}
      <div className="group">
        <label className={labelCls}>ลายเซ็นท้ายจดหมาย</label>
        <input
          type="text"
          className={inputCls}
          placeholder="— จากคนที่รักเธอที่สุด ♡"
          value={data.signature}
          onChange={(e) => onChange({ signature: e.target.value })}
        />
      </div>

      {/* Mood chips */}
      <div>
        <p className={labelCls}>Tone / Mood</p>
        <div className="flex flex-wrap gap-2">
          {['Whimsical 🌀', 'Poetic 💌', 'Playful 🎈', 'Sincere 🤍'].map((mood) => (
            <button
              key={mood}
              type="button"
              className="px-4 py-2 rounded-full border-2 border-[#725477]/20 text-[#725477] text-sm font-bold hover:bg-[#725477]/10 hover:border-[#725477]/50 transition-all"
              onClick={() =>
                onChange({ letter: data.letter + (data.letter ? '\n\n' : '') + `[${mood}] ` })
              }
            >
              {mood}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 3: Vibe & Style ─── */
function Step3({ data, onChange, isRetro, isMinimal, isRecipe }) {
  const [selectedMusic, setSelectedMusic] = useState('custom');

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1f1b1b] leading-tight mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Set the Mood
        </h1>
        <p className="text-sm text-[#5a4042]">ใส่ลิงก์เพลงโปรดจาก YouTube เพื่อใช้เป็นเพลงประกอบมินิเกม</p>
      </div>

      {/* Music section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#725477] text-lg">music_note</span>
          <p className="text-xs font-bold uppercase tracking-widest text-[#725477]">Section 1: Music Picker</p>
        </div>

        <div className="flex flex-col gap-3">
          {MUSIC_OPTIONS.map((opt) => {
            const isActive = selectedMusic === opt.id;
            return (
              <div
                key={opt.id}
                className="flex items-center gap-4 px-5 py-3.5 rounded-full font-bold text-sm bg-[#b60e3d] text-white shadow-lg shadow-[#b60e3d]/25"
              >
                <span className="text-lg">{opt.emoji}</span>
                <span>{opt.label}</span>
                <span className="material-symbols-outlined ml-auto text-white text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <label className={labelCls}>ลิงก์ YouTube (ตัวอย่าง: https://www.youtube.com/watch?v=...)</label>
          <input
            type="url"
            className={inputCls}
            placeholder="https://www.youtube.com/watch?v=..."
            value={data.youtubeUrl || ''}
            onChange={(e) => onChange({ youtubeUrl: e.target.value })}
          />
        </div>
      </div>

      {/* Avatar section (retro & recipe) */}
      {(isRetro || isRecipe) && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[#725477] text-lg">face</span>
            <p className="text-xs font-bold uppercase tracking-widest text-[#725477]">
              {isRecipe ? 'Section 2: เลือกรูปอวาตาร์ประจำตัว (เชฟ / คนชิม)' : 'Section 2: Avatar Customization'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {AVATAR_OPTIONS.map((avatar) => {
              const selected = data.avatarImage === avatar.src;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => onChange({ avatarImage: avatar.src })}
                  className={`relative overflow-hidden rounded-2xl border-2 p-2 text-center transition-all duration-200 ${
                    selected
                      ? 'border-[#b60e3d] bg-[#ffdadb]/30 shadow-md shadow-[#b60e3d]/20'
                      : 'border-[#e2bec0]/60 bg-white hover:border-[#b60e3d]/40'
                  }`}
                >
                  {selected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#b60e3d] rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-xs">check</span>
                    </div>
                  )}
                  <img src={avatar.src} alt={avatar.label} className="h-20 w-full rounded-xl object-cover" />
                  <p className={`mt-2 text-xs font-bold ${selected ? 'text-[#b60e3d]' : 'text-[#5a4042]'}`}>{avatar.label}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Flower section (retro & minimal) */}
      {(isRetro || isMinimal) && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[#725477] text-lg">local_florist</span>
            <p className="text-xs font-bold uppercase tracking-widest text-[#725477]">
              {isRetro ? 'Section 3: Flower Selection (เลือกดอกไม้ที่จะเซอร์ไพรส์)' : 'เลือกดอกไม้ประดับ'}
            </p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {FLOWER_OPTIONS.map((flower) => {
              const selected = data.flowerImage === flower.src;
              return (
                <button
                  key={flower.id}
                  type="button"
                  onClick={() => onChange({ flowerImage: flower.src })}
                  className={`min-w-[84px] relative overflow-hidden rounded-2xl border-2 p-2 transition-all duration-200 ${
                    selected
                      ? 'border-[#b60e3d] bg-[#ffdadb]/30 shadow-md shadow-[#b60e3d]/20 scale-105'
                      : 'border-[#e2bec0]/60 bg-white hover:border-[#b60e3d]/40'
                  }`}
                >
                  {selected && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#b60e3d] rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-[10px]">check</span>
                    </div>
                  )}
                  <img src={flower.src} alt={flower.id} className="h-16 w-full rounded-xl object-cover" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Step 4: Capture Memories ─── */
function Step4({ data, onChange, onCropOpen, isRecipe, isFree }) {
  const updateMemoryPhoto = (index, file) => {
    const nextPhotos = data.memoryPhotos.map((photo, idx) => {
      if (idx !== index) return photo;
      return { ...photo, file, preview: file ? URL.createObjectURL(file) : photo.preview };
    });
    onChange({ memoryPhotos: nextPhotos });
  };

  const removeMemoryPhoto = (index) => {
    onChange({ memoryPhotos: data.memoryPhotos.filter((_, idx) => idx !== index) });
  };

  const addMemoryPhoto = () => {
    onChange({
      memoryPhotos: [
        ...data.memoryPhotos,
        { id: Date.now(), caption: 'ความทรงจำเพิ่มเติม', note: 'ใส่คำบรรยายสั้นๆ', file: null, preview: '' },
      ],
    });
  };

  const updateCouplePhoto = (file) => {
    onChange({ couplePhoto: { ...data.couplePhoto, file, preview: file ? URL.createObjectURL(file) : data.couplePhoto.preview } });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#b60e3d] leading-tight mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Capture Memories
        </h1>
        <p className="text-sm text-[#5a4042]">The soul of every connection lies in the moments shared.</p>
      </div>

      {/* Couple photo upload zone */}
      {!isRecipe && (
        <div>
          <p className={labelCls}>รูปคู่ (Cover Photo)</p>
          <label
            id={COUPLE_PHOTO_INPUT_ID}
            htmlFor="couple-input"
            className={`group relative flex flex-col items-center justify-center gap-3 rounded-[24px] border-2 border-dashed cursor-pointer transition-all duration-200 p-8 ${
              data.couplePhoto.preview
                ? 'border-[#b60e3d]/40 bg-[#ffdadb]/20'
                : 'border-[#e2bec0] bg-[#fbf1f1] hover:border-[#b60e3d]/60 hover:bg-[#ffdadb]/10'
            }`}
          >
            {data.couplePhoto.preview ? (
              <img
                src={data.couplePhoto.preview}
                alt="couple"
                className="h-48 w-full rounded-2xl object-cover shadow-md"
              />
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-[#b60e3d] flex items-center justify-center shadow-md shadow-[#b60e3d]/30">
                  <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                </div>
                <p className="font-bold text-[#b60e3d]">Upload your story</p>
                <p className="text-xs text-[#8e6f71]">Drag & drop or click to browse</p>
              </>
            )}
            <input
              id="couple-input"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => updateCouplePhoto(e.target.files?.[0] || null)}
            />
          </label>
        </div>
      )}

      {/* Memory gallery - Polaroid style */}
      {!isFree && !isRecipe && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className={labelCls + ' mb-0'}>รูปความทรงจำ (Polaroid Gallery)</p>
            <button
              type="button"
              onClick={addMemoryPhoto}
              className="text-xs font-bold text-[#b60e3d] border border-[#b60e3d]/30 rounded-full px-4 py-1.5 hover:bg-[#ffdadb]/30 transition-all"
            >
              + เพิ่มรูป
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {data.memoryPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="relative bg-white rounded-2xl shadow-md p-2.5 pb-8 border border-[#e2bec0]/40 rotate-1 even:-rotate-1 hover:rotate-0 transition-transform duration-200"
              >
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeMemoryPhoto(index)}
                  className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-[#b60e3d] text-white flex items-center justify-center text-xs z-10 shadow hover:scale-110 transition-transform"
                >
                  ×
                </button>

                <label className="block cursor-pointer">
                  {photo.preview ? (
                    <img
                      src={photo.preview}
                      alt={photo.caption}
                      className="w-full aspect-square rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-xl bg-[#fbf1f1] flex items-center justify-center text-[#e2bec0]">
                      <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => updateMemoryPhoto(index, e.target.files?.[0] || null)}
                  />
                </label>
                <div className="mt-2 px-0.5">
                  <input
                    value={photo.caption}
                    onChange={(e) => {
                      const next = data.memoryPhotos.map((item, idx) =>
                        idx === index ? { ...item, caption: e.target.value } : item
                      );
                      onChange({ memoryPhotos: next });
                    }}
                    className="w-full text-xs font-bold text-[#1f1b1b] bg-transparent border-b border-[#e2bec0]/60 focus:border-[#b60e3d] outline-none pb-0.5"
                    placeholder="Caption..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recipe photos */}
      {isRecipe && (
        <div>
          <p className={labelCls}>วัตถุดิบ 6 ชนิด — รูป + ชื่อ + คำบรรยาย</p>
          <p className="text-xs text-[#8e6f71] mb-4 -mt-2">ข้อความเหล่านี้จะแสดงในเกมตอนที่คนรับเล่น ✨</p>
          <div className="flex flex-col gap-5">
            {Array.from({ length: 6 }, (_, i) => {
              const photo = data.memoryPhotos[i] || { caption: '', note: '', file: null, preview: '' };
              const updateField = (field, value) => {
                const next = [...data.memoryPhotos];
                while (next.length <= i) next.push({ id: Date.now() + i, caption: '', note: '', file: null, preview: '' });
                next[i] = { ...next[i], [field]: value };
                onChange({ memoryPhotos: next });
              };
              return (
                <div key={i} className="flex gap-3 items-start bg-white rounded-2xl border border-[#e2bec0]/50 p-3 shadow-sm">
                  {/* Thumbnail */}
                  <label className="shrink-0 cursor-pointer">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#fbf1f1] border-2 border-dashed border-[#e2bec0]/60 flex items-center justify-center">
                      {photo.preview ? (
                        <img src={photo.preview} alt={`วัตถุดิบ ${i + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <span className="material-symbols-outlined text-[#e2bec0] text-2xl">add_photo_alternate</span>
                          <span className="text-[10px] font-bold text-[#c9a0a4]">รูปที่ {i + 1}</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => onCropOpen(i, e.target.files?.[0] || null)}
                    />
                  </label>
                  {/* Text fields */}
                  <div className="flex-1 flex flex-col gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#725477] mb-1 block">ชื่อวัตถุดิบ</label>
                      <input
                        type="text"
                        value={photo.caption || ''}
                        onChange={(e) => updateField('caption', e.target.value)}
                        className="w-full text-xs font-semibold text-[#1f1b1b] bg-[#fbf1f1] border border-[#e2bec0]/60 rounded-lg px-3 py-1.5 focus:border-[#b60e3d] focus:outline-none transition-colors"
                        placeholder={['เดทแรกของเรา', 'ทริปแรกด้วยกัน', 'รูปคู่ใบโปรด', 'โมเมนต์แสนหวาน', 'รอยยิ้มของเธอ', 'ความรักที่เบ่งบาน'][i]}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#725477] mb-1 block">คำบรรยาย</label>
                      <input
                        type="text"
                        value={photo.note || ''}
                        onChange={(e) => updateField('note', e.target.value)}
                        className="w-full text-xs text-[#5a4042] bg-[#fbf1f1] border border-[#e2bec0]/60 rounded-lg px-3 py-1.5 focus:border-[#b60e3d] focus:outline-none transition-colors"
                        placeholder={['รอยยิ้มแรกที่ทำให้ใจสั่น', 'หลงทางบ้างแต่ก็มีความสุข', 'รูปที่ถ่ายตอนเผลอๆ', 'ช่วงเวลาที่ได้อยู่ข้างเธอ', 'อบอุ่นเสมอเมื่อได้มอง', 'รดน้ำด้วยความใส่ใจ'][i]}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Step 5: Secrets & Quiz ─── */
function Step5({ data, onChange, isRetro }) {
  const updateQuiz = (index, field, value) => {
    const nextQuiz = data.quiz.map((item, idx) => (idx === index ? { ...item, [field]: value } : item));
    onChange({ quiz: nextQuiz });
  };

  const addQuiz = () => {
    onChange({ quiz: [...data.quiz, { q: 'คำถามใหม่', c: ['ตัวเลือก 1', 'ตัวเลือก 2', 'ตัวเลือก 3', 'ตัวเลือก 4'], answer: 0 }] });
  };

  const removeQuiz = (index) => {
    onChange({ quiz: data.quiz.filter((_, idx) => idx !== index) });
  };

  const updatePrize = (index, field, value) => {
    const nextPrizes = data.prizes.map((item, idx) => (idx === index ? { ...item, [field]: value } : item));
    onChange({ prizes: nextPrizes });
  };

  const addPrize = () => {
    onChange({ prizes: [...data.prizes, { id: `prize-${Date.now()}`, icon: '🎁', name: 'คูปองใหม่', desc: 'คำอธิบายรางวัลใหม่' }] });
  };

  const removePrize = (index) => {
    onChange({ prizes: data.prizes.filter((_, idx) => idx !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1f1b1b] leading-tight mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          The Final Secret
        </h1>
        <p className="text-sm text-[#5a4042]">Seal your romantic journey with a playful challenge and a secret code.</p>
      </div>

      {/* Quiz Creator */}
      {isRetro && (
        <div className="bg-white rounded-[24px] p-6 border border-[#e2bec0]/40 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#fad3fd]/60 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#725477] text-lg">quiz</span>
              </div>
              <h3 className="font-bold text-[#1f1b1b] text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Quiz Creator
              </h3>
            </div>
            <button
              type="button"
              onClick={addQuiz}
              className="text-xs font-bold text-[#b60e3d] border border-[#b60e3d]/30 rounded-full px-4 py-1.5 hover:bg-[#ffdadb]/30 transition-all"
            >
              + เพิ่มคำถาม
            </button>
          </div>

          <div className="space-y-5">
            {data.quiz.map(({ q, c, answer }, index) => (
              <div key={index} className="bg-[#fbf1f1] rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    value={q}
                    onChange={(e) => updateQuiz(index, 'q', e.target.value)}
                    placeholder="Your Question"
                    className="flex-1 h-11 px-4 bg-white border-2 border-transparent rounded-xl text-sm font-medium focus:border-[#b60e3d] focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => removeQuiz(index)}
                    className="w-9 h-9 rounded-xl bg-[#ffdad6] text-[#93000a] font-bold text-sm hover:bg-[#ffdad6]/80 transition-all flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>

                <p className="text-xs font-bold text-[#5a4042] px-1">Multiple Choice Options</p>
                <div className="space-y-2">
                  {c.map((choice, choiceIndex) => {
                    const isAnswer = answer === choiceIndex;
                    return (
                      <div key={choiceIndex} className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateQuiz(index, 'answer', choiceIndex)}
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all ${
                            isAnswer ? 'border-[#b60e3d] bg-[#b60e3d]' : 'border-[#e2bec0] bg-white hover:border-[#b60e3d]/50'
                          }`}
                        >
                          {isAnswer && (
                            <div className="w-full h-full rounded-full bg-[#b60e3d] flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                          )}
                        </button>
                        <input
                          value={choice}
                          onChange={(e) => {
                            const nextChoices = c.map((item, idx) => (idx === choiceIndex ? e.target.value : item));
                            updateQuiz(index, 'c', nextChoices);
                          }}
                          className={`flex-1 h-11 px-4 rounded-xl text-sm font-medium border-2 transition-all focus:outline-none ${
                            isAnswer
                              ? 'border-[#b60e3d]/30 bg-[#ffdadb]/20 text-[#b60e3d]'
                              : 'border-transparent bg-white text-[#1f1b1b] focus:border-[#b60e3d]/30'
                          }`}
                          placeholder={`ตัวเลือกที่ ${choiceIndex + 1}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Secret Passcode */}
      {isRetro && (
        <div className="bg-white rounded-[24px] p-6 border border-[#e2bec0]/40 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[#ffd9e2]/60 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#75525c] text-lg">lock</span>
            </div>
            <h3 className="font-bold text-[#1f1b1b] text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Secret Access
            </h3>
          </div>

          <label className={labelCls}>รหัสผ่าน (ให้แฟนใส่เพื่อเข้าเกม)</label>
          <input
            required
            value={data.password}
            onChange={(e) => onChange({ password: e.target.value })}
            className={inputCls + ' mb-4'}
            placeholder="รหัสลับของเรา..."
          />

          <p className="text-xs font-bold text-[#5a4042] mb-3 px-1">หรือเลือก Preset</p>
          <div className="grid grid-cols-2 gap-2">
            {PASSWORD_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange({ password: preset })}
                className={`rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all ${
                  data.password === preset
                    ? 'border-[#b60e3d] bg-[#ffdadb]/30 text-[#b60e3d]'
                    : 'border-[#e2bec0]/60 bg-white text-[#5a4042] hover:border-[#b60e3d]/40'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gacha Prizes */}
      {isRetro && (
        <div className="bg-white rounded-[24px] p-6 border border-[#e2bec0]/40 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#fad3fd]/60 flex items-center justify-center">
                <span className="text-lg">🎁</span>
              </div>
              <h3 className="font-bold text-[#1f1b1b] text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                กาชาปอง / รางวัลพิเศษ
              </h3>
            </div>
            <button
              type="button"
              onClick={addPrize}
              className="text-xs font-bold text-[#b60e3d] border border-[#b60e3d]/30 rounded-full px-4 py-1.5 hover:bg-[#ffdadb]/30 transition-all"
            >
              + เพิ่มคูปอง
            </button>
          </div>

          <div className="space-y-3">
            {data.prizes.map((prize, index) => (
              <div key={prize.id} className="bg-[#fbf1f1] rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    value={prize.icon}
                    onChange={(e) => updatePrize(index, 'icon', e.target.value)}
                    className="w-16 h-10 px-2 text-center bg-white border-2 border-transparent rounded-xl text-lg focus:border-[#b60e3d] focus:outline-none transition-all"
                  />
                  <input
                    value={prize.name}
                    onChange={(e) => updatePrize(index, 'name', e.target.value)}
                    placeholder="ชื่อรางวัล"
                    className="flex-1 h-10 px-4 bg-white border-2 border-transparent rounded-xl text-sm font-medium focus:border-[#b60e3d] focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => removePrize(index)}
                    className="w-9 h-9 rounded-xl bg-[#ffdad6] text-[#93000a] font-bold text-sm hover:bg-[#ffdad6]/80 transition-all flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
                <textarea
                  rows="2"
                  value={prize.desc}
                  onChange={(e) => updatePrize(index, 'desc', e.target.value)}
                  placeholder="รายละเอียดรางวัล..."
                  className="w-full px-4 py-2 bg-white border-2 border-transparent rounded-xl text-xs font-medium text-[#5a4042] focus:border-[#b60e3d] focus:outline-none transition-all resize-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main WizardForm ─── */
export default function WizardForm({
  formRef,
  data,
  onChange,
  loading,
  onSubmit,
  errorMessage,
  templateId,
  templateMeta,
}) {
  const [step, setStep] = useState(1);
  const [cropData, setCropData] = useState(null);
  const [stepError, setStepError] = useState('');

  const isRetro = templateId === 'retro-8bit';
  const isMinimal = templateId === 'minimal-romantic';
  const isRecipe = templateId === 'recipe-of-love';
  const isFree = templateId === 'love-letter-free';

  const handleCropOpen = (index, file) => {
    if (file) setCropData({ index, imageSrc: URL.createObjectURL(file) });
  };

  const handleCropComplete = (cropped) => {
    if (cropData) {
      const nextPhotos = [...data.memoryPhotos];
      while (nextPhotos.length < 6) {
        nextPhotos.push({ id: Date.now() + Math.random(), caption: '', note: '', file: null, preview: '' });
      }
      nextPhotos[cropData.index] = { ...nextPhotos[cropData.index], file: cropped.file, preview: cropped.preview };
      onChange({ memoryPhotos: nextPhotos });
    }
    setCropData(null);
  };

  /* ─── Per-step validation ─── */
  const validateStep = (currentStep) => {
    const needsCouplePhoto = ['retro-8bit', 'minimal-romantic', 'love-letter-free'].includes(templateId);

    switch (currentStep) {
      case 1:
        if (!data.senderName.trim())
          return 'กรุณาใส่ชื่อผู้ส่ง (Your Name) ก่อนนะ 💌';
        if (!data.recipientName.trim())
          return 'กรุณาใส่ชื่อคนพิเศษ (Their Name) ด้วยนะ 💕';
        if (!data.anniversaryDate)
          return 'อย่าลืมใส่วันที่พิเศษด้วยนะ 📅';
        if (!data.customerEmail.trim())
          return 'กรุณาใส่อีเมลสำหรับรับการยืนยัน 📧';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail))
          return 'รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง 📧';
        return null;

      case 2:
        if (!data.letter.trim())
          return 'เขียนข้อความในจดหมายรักให้หน่อยนะ ✍️';
        if (data.letter.trim().length < 10)
          return 'ข้อความในจดหมายสั้นไปหน่อยนะ ลองเขียนให้มากกว่านี้สักนิด 💬';
        return null;

      case 3:
        // Music & Avatar — optional fields, always pass
        return null;

      case 4:
        if (needsCouplePhoto && !data.couplePhoto?.preview)
          return 'กรุณาอัปโหลดรูปคู่ก่อนดำเนินการต่อนะ 📸';
        return null;

      case 5:
        if (isRetro && !data.password.trim())
          return 'กรุณาตั้งรหัสผ่านสักอย่างก่อนนะ 🔐';
        return null;

      default:
        return null;
    }
  };

  const goNext = () => {
    const error = validateStep(step);
    if (error) {
      setStepError(error);
      // Auto-dismiss after 4 seconds
      setTimeout(() => setStepError(''), 4000);
      return;
    }
    setStepError('');
    if (step < TOTAL_STEPS) setStep(step + 1);
    else onSubmit();
  };

  const goBack = () => {
    setStepError('');
    if (step > 1) setStep(step - 1);
  };

  return (
    <>
      <StepErrorToast message={stepError} onDismiss={() => setStepError('')} />
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-40 bg-[#fff8f7]/80 backdrop-blur-lg border-b border-[#e2bec0]/30">
        <div className="max-w-[680px] mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/pixellove.png"
              alt="Pixel Love Logo"
              className="h-8 w-auto object-contain rounded-xl"
            />
            <span className="font-extrabold text-[#b60e3d] text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Pixel Love
            </span>
          </div>
          <span className="text-xs font-bold text-[#5a4042] tracking-wide">
            {STEP_LABELS[step - 1]}
          </span>
        </div>
      </header>

      {/* Main canvas */}
      <main className="min-h-screen bg-[#fff8f7] flex flex-col items-center pt-24 pb-36 px-5">
        {/* Background decoration */}
        <div className="fixed top-0 right-0 w-64 h-64 bg-[#b60e3d]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-20 left-0 w-48 h-48 bg-[#725477]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[600px]">
          {/* Progress indicator */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border border-[#e2bec0]/30 flex items-center gap-5">
              <ProgressPips current={step} total={TOTAL_STEPS} />
              <span className="text-xs font-extrabold text-[#b60e3d] uppercase tracking-widest">
                Step {step} of {TOTAL_STEPS}
              </span>
            </div>
          </div>

          {/* Card */}
          <form ref={formRef} onSubmit={(e) => e.preventDefault()} noValidate>
            <div className="bg-white rounded-[32px] p-7 sm:p-10 shadow-[0_24px_60px_rgba(182,14,61,0.08)] border border-[#e2bec0]/20 transition-all duration-300">
              {errorMessage && (
                <div className="mb-5 rounded-2xl border border-[#ffdad6] bg-[#ffdad6]/50 p-4 text-sm text-[#93000a] font-medium">
                  {errorMessage}
                </div>
              )}

              {step === 1 && <Step1 data={data} onChange={onChange} />}
              {step === 2 && <Step2 data={data} onChange={onChange} />}
              {step === 3 && (
                <Step3 data={data} onChange={onChange} isRetro={isRetro} isMinimal={isMinimal} isRecipe={isRecipe} />
              )}
              {step === 4 && (
                <Step4
                  data={data}
                  onChange={onChange}
                  onCropOpen={handleCropOpen}
                  isRecipe={isRecipe}
                  isFree={isFree}
                />
              )}
              {step === 5 && <Step5 data={data} onChange={onChange} isRetro={isRetro} />}
            </div>
          </form>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        onBack={goBack}
        onNext={goNext}
        isFirst={step === 1}
        isLast={step === TOTAL_STEPS}
        loading={loading && step === TOTAL_STEPS}
      />

      {/* Crop Modal */}
      {cropData && (
        <CropModal
          imageSrc={cropData.imageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropData(null)}
        />
      )}
    </>
  );
}
