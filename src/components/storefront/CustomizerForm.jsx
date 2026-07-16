'use client';

import { useMemo } from 'react';

const PASSWORD_PRESETS = ['คลั่งรัก101', 'รักกันตลอดไป', 'MyHeart123', 'FOREVERLOVE'];
const COUPLE_PHOTO_INPUT_ID = 'couple-photo-upload';
const FLOWER_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  id: `flower${i + 1}.png`,
  src: `/assets/flower${i + 1}.png`,
}));
const AVATAR_OPTIONS = [
  { id: 'boy1.png', src: '/assets/boy1.png' },
  { id: 'boy2.jpg', src: '/assets/boy2.jpg' },
  { id: 'boy3.png', src: '/assets/boy3.png' },
  { id: 'boy4.png', src: '/assets/boy4.png' },
  { id: 'boy5.png', src: '/assets/boy5.png' },
  { id: 'girl1.png', src: '/assets/girl1.png' },
  { id: 'girl2.png', src: '/assets/girl2.png' },
  { id: 'girl3.png', src: '/assets/girl3.png' },
  { id: 'girl4.png', src: '/assets/girl4.png' },
];
export default function CustomizerForm({ data, formRef, onChange, loading, onSubmit, errorMessage, templateId }) {
  const quizInputs = useMemo(() => data.quiz.map((quiz, index) => ({ ...quiz, index })), [data.quiz]);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const updateQuiz = (index, field, value) => {
    const nextQuiz = data.quiz.map((item, idx) => (idx === index ? { ...item, [field]: value } : item));
    onChange({ quiz: nextQuiz });
  };

  const addQuiz = () => {
    const nextQuiz = [...data.quiz, { q: 'คำถามใหม่', c: ['ตัวเลือก 1', 'ตัวเลือก 2', 'ตัวเลือก 3', 'ตัวเลือก 4'], answer: 0 }];
    onChange({ quiz: nextQuiz });
  };

  const removeQuiz = (index) => {
    const nextQuiz = data.quiz.filter((_, idx) => idx !== index);
    onChange({ quiz: nextQuiz });
  };

  const updateMemoryPhoto = (index, file) => {
    const nextPhotos = data.memoryPhotos.map((photo, idx) => {
      if (idx !== index) return photo;
      return {
        ...photo,
        file,
        preview: file ? URL.createObjectURL(file) : photo.preview,
      };
    });
    onChange({ memoryPhotos: nextPhotos });
  };

  const addMemoryPhoto = () => {
    const nextPhotos = [
      ...data.memoryPhotos,
      { id: Date.now(), caption: 'ความทรงจำเพิ่มเติม', note: 'ใส่คำบรรยายสั้นๆ', file: null, preview: '' },
    ];
    onChange({ memoryPhotos: nextPhotos });
  };

  const removeMemoryPhoto = (index) => {
    const nextPhotos = data.memoryPhotos.filter((_, idx) => idx !== index);
    onChange({ memoryPhotos: nextPhotos });
  };

  const updatePrize = (index, field, value) => {
    const nextPrizes = data.prizes.map((item, idx) => (idx === index ? { ...item, [field]: value } : item));
    onChange({ prizes: nextPrizes });
  };

  const addPrize = () => {
    const nextPrizes = [
      ...data.prizes,
      { id: `prize-${Date.now()}`, icon: '🎁', name: 'คูปองใหม่', desc: 'คำอธิบายรางวัลใหม่', },
    ];
    onChange({ prizes: nextPrizes });
  };

  const removePrize = (index) => {
    const nextPrizes = data.prizes.filter((_, idx) => idx !== index);
    onChange({ prizes: nextPrizes });
  };

  const updateCouplePhoto = (file) => {
    onChange({ couplePhoto: { ...data.couplePhoto, file, preview: file ? URL.createObjectURL(file) : data.couplePhoto.preview } });
  };

  const isRetro = templateId === 'retro-8bit';
  const isMinimal = templateId === 'minimal-romantic';
  const isRecipe = templateId === 'recipe-of-love';
  const isFree = templateId === 'love-letter-free';

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mt-6 space-y-6">
      {errorMessage && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMessage}</div>}

      {/* ข้อมูลผู้สั่ง (ทุกคนต้องกรอก) */}
      <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-lg font-semibold text-slate-900">ข้อมูลเบื้องต้น</h3>
        <label className="block text-sm font-medium text-slate-700">ชื่อผู้ส่ง (ชื่อคุณ)</label>
        <input
          value={data.senderName}
          onChange={(e) => onChange({ senderName: e.target.value })}
          className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
        />
        <label className="block text-sm font-medium text-slate-700">ชื่อผู้รับ (แฟนของคุณ)</label>
        <input
          value={data.recipientName}
          onChange={(e) => onChange({ recipientName: e.target.value })}
          className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
        />
        <label className="block text-sm font-medium text-slate-700">อีเมลติดต่อ (สำหรับรับสลิปหรืออัปเดต)</label>
        <input
          type="email"
          value={data.customerEmail}
          onChange={(e) => onChange({ customerEmail: e.target.value })}
          required
          className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
        />
      </div>

      {/* ข้อมูลเซอร์ไพรส์ (ข้อความ) */}
      <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-lg font-semibold text-slate-900">ข้อความเซอร์ไพรส์</h3>
        
        {(!isRecipe && !isFree) && (
          <>
            <label className="block text-sm font-medium text-slate-700">วันครบรอบ</label>
            <input
              type="date"
              value={data.anniversaryDate}
              onChange={(e) => onChange({ anniversaryDate: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
          </>
        )}

        <label className="block text-sm font-medium text-slate-700">ข้อความในจดหมายบอกรัก</label>
        <textarea
          rows="7"
          value={data.letter}
          onChange={(e) => onChange({ letter: e.target.value })}
          className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
        />
        <label className="block text-sm font-medium text-slate-700">ลายเซ็นท้ายจดหมาย</label>
        <input
          value={data.signature}
          onChange={(e) => onChange({ signature: e.target.value })}
          className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
        />
      </div>

      {/* ข้อมูลรหัสผ่าน (เฉพาะ retro) */}
      {isRetro && (
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-lg font-semibold text-slate-900">ข้อมูลรหัสผ่าน</h3>
          <p className="text-sm text-slate-500">เลือกรหัสลับสำหรับด่านเกม หรือพิมพ์รหัสที่คุณต้องการเอง</p>
          <input
            value={data.password}
            onChange={(e) => onChange({ password: e.target.value })}
            required
            className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
          <div className="grid grid-cols-2 gap-2">
            {PASSWORD_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange({ password: preset })}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${data.password === preset ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-300 bg-white text-slate-900 hover:border-pink-400'}`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* เลือกอวาตาร์ (เฉพาะ retro) */}
      {isRetro && (
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-lg font-semibold text-slate-900">เลือกอวาตาร์สำหรับเมนูเควส</h3>
          <p className="text-sm text-slate-500">เลื่อนดูรูปผู้ชายหรือผู้หญิง แล้วเลือกแบบที่ใช่</p>
          <div className="flex gap-3 overflow-x-auto py-2">
            {AVATAR_OPTIONS.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => onChange({ avatarImage: avatar.src })}
                className={`min-w-[92px] rounded-3xl border p-2 ${data.avatarImage === avatar.src ? 'border-pink-500 bg-pink-50' : 'border-slate-300 bg-white hover:border-pink-400'}`}
              >
                <img src={avatar.src} alt={avatar.id} className="h-20 w-full rounded-2xl object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* เลือกดอกไม้ (เฉพาะ minimal) */}
      {isMinimal && (
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-lg font-semibold text-slate-900">เลือกดอกไม้ประดับจดหมาย</h3>
          <p className="text-sm text-slate-500">เลื่อนไปดูแล้วเลือกดอกไม้ที่ชอบ</p>
          <div className="flex gap-3 overflow-x-auto py-2">
            {FLOWER_OPTIONS.map((flower) => (
              <button
                key={flower.id}
                type="button"
                onClick={() => onChange({ flowerImage: flower.src })}
                className={`min-w-[120px] rounded-3xl border p-2 ${data.flowerImage === flower.src ? 'border-pink-500 bg-pink-50' : 'border-slate-300 bg-white hover:border-pink-400'}`}
              >
                <img src={flower.src} alt={flower.id} className="h-24 w-full rounded-2xl object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* รูปคู่และความทรงจำ (ยกเว้น recipe-of-love) */}
      {!isRecipe && (
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">รูปคู่และความทรงจำ</h3>
            {(!isFree) && (
              <button type="button" onClick={addMemoryPhoto} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                เพิ่มรูปความทรงจำ
              </button>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <label htmlFor={COUPLE_PHOTO_INPUT_ID} className="group relative overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-white p-4 text-center transition hover:border-pink-400 cursor-pointer">
              {data.couplePhoto.preview ? (
                <img src={data.couplePhoto.preview} alt={data.couplePhoto.caption} className="mx-auto h-32 w-full rounded-2xl object-cover" />
              ) : (
                <div className="flex h-32 items-center justify-center text-slate-400">อัปโหลดรูปคู่</div>
              )}
              <input
                id={COUPLE_PHOTO_INPUT_ID}
                type="file"
                accept="image/*"
                required={!data.couplePhoto.preview}
                className="sr-only"
                onChange={(e) => updateCouplePhoto(e.target.files?.[0] || null)}
              />
              <div className="mt-3 text-left">
                <p className="font-semibold text-slate-900">{data.couplePhoto.caption}</p>
                <p className="mt-1 text-sm text-slate-500">{data.couplePhoto.note}</p>
              </div>
            </label>

            {(!isFree) && data.memoryPhotos.map((photo, index) => (
              <div key={photo.id} className="group relative rounded-3xl border border-dashed border-slate-300 bg-white p-4 text-left transition hover:border-pink-400">
                <label className="block cursor-pointer">
                  {photo.preview ? (
                    <img src={photo.preview} alt={photo.caption} className="mx-auto h-32 w-full rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-32 items-center justify-center text-slate-400">อัปโหลดรูป</div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => updateMemoryPhoto(index, e.target.files?.[0] || null)}
                  />
                </label>
                <div className="mt-3">
                  <input
                    value={photo.caption}
                    onChange={(e) => {
                      const next = data.memoryPhotos.map((item, idx) => idx === index ? { ...item, caption: e.target.value } : item);
                      onChange({ memoryPhotos: next });
                    }}
                    className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
                  />
                  <textarea
                    rows="2"
                    value={photo.note}
                    onChange={(e) => {
                      const next = data.memoryPhotos.map((item, idx) => idx === index ? { ...item, note: e.target.value } : item);
                      onChange({ memoryPhotos: next });
                    }}
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeMemoryPhoto(index)}
                    className="mt-2 rounded-2xl bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
                  >
                    ลบรูปนี้
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* คำถามควิซ (เฉพาะ retro) */}
      {isRetro && (
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">คำถามควิซทดสอบความรู้ใจ</h3>
            <button type="button" onClick={addQuiz} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">เพิ่มคำถาม</button>
          </div>
          <div className="space-y-4">
            {quizInputs.map(({ q, c, answer, index }) => (
              <div key={index} className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <input
                    value={q}
                    onChange={(e) => updateQuiz(index, 'q', e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
                  />
                  <button type="button" onClick={() => removeQuiz(index)} className="rounded-2xl bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-200">ลบ</button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {c.map((choice, choiceIndex) => (
                    <div key={choiceIndex} className="relative">
                      <input
                        value={choice}
                        onChange={(e) => {
                          const nextChoices = c.map((choiceItem, idx) => (idx === choiceIndex ? e.target.value : choiceItem));
                          updateQuiz(index, 'c', nextChoices);
                        }}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-500 shadow-sm opacity-90 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
                      />
                      <button
                        type="button"
                        onClick={() => updateQuiz(index, 'answer', choiceIndex)}
                        className={`mt-2 w-full rounded-2xl px-3 py-2 text-sm font-semibold ${answer === choiceIndex ? 'bg-pink-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                      >
                        {answer === choiceIndex ? 'ตัวเลือกถูก' : 'ตั้งเป็นคำตอบ'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* รางวัล (เฉพาะ retro) */}
      {isRetro && (
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">กาชาปอง / รางวัลพิเศษ</h3>
            <button type="button" onClick={addPrize} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">เพิ่มคูปอง</button>
          </div>
          <div className="space-y-4">
            {data.prizes.map((prize, index) => (
              <div key={prize.id} className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <input
                    value={prize.icon}
                    onChange={(e) => updatePrize(index, 'icon', e.target.value)}
                    className="w-20 rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
                  />
                  <button type="button" onClick={() => removePrize(index)} className="rounded-2xl bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-200">ลบ</button>
                </div>
                <input
                  value={prize.name}
                  onChange={(e) => updatePrize(index, 'name', e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
                <textarea
                  rows="2"
                  value={prize.desc}
                  onChange={(e) => updatePrize(index, 'desc', e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-500 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-3xl bg-pink-500 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-pink-200 transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {loading ? 'กำลังสร้างคำสั่งซื้อ...' : 'ยืนยันและไปยังเช็คเอาต์'}
      </button>
    </form>
  );
}
