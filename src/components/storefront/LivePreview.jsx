'use client';

import Retro8Bit from '@/components/templates/Retro8Bit/Retro8Bit';

export default function LivePreview({ data }) {
  console.log('LivePreview data', data);
  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950 p-4 shadow-2xl shadow-slate-900/50">
      <div className="relative mx-auto h-[640px] max-w-[360px] overflow-hidden rounded-[36px] border-8 border-slate-800 bg-black shadow-[0_35px_120px_-45px_rgba(15,23,42,0.7)]">
        <div className="absolute left-1/2 top-4 h-2.5 w-24 -translate-x-1/2 rounded-full bg-slate-600 shadow-inner"></div>
        <div className="absolute right-6 top-14 h-3 w-3 rounded-full bg-emerald-400 shadow-lg"></div>
        <div className="absolute left-6 top-14 h-3 w-3 rounded-full bg-rose-400 shadow-lg"></div>
        <div className="absolute inset-x-0 top-20 mx-auto h-12 w-28 rounded-3xl bg-slate-900/80" />
        <div className="relative h-full overflow-hidden rounded-[22px] bg-slate-900 p-4">
          <Retro8Bit orderData={{ custom_texts: {
              senderName: data.senderName,
            recipientName: data.recipientName,
            startDate: data.anniversaryDate,
            letter: data.letter,
            signature: data.signature,
            quiz: data.quiz,
            memories: data.memoryPhotos.map((photo) => ({ previewUrl: photo.preview || '', cap: photo.caption, note: photo.note })),
          },
          image_urls: data.memoryPhotos.map((photo) => photo.preview || ''),
          }} />
        </div>
      </div>
    </div>
  );
}
