'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import CustomizerForm from '@/components/storefront/CustomizerForm';
import { getTemplateById, getPriceLabel } from '@/lib/templateCatalog';

const FORM_STORAGE_KEY = 'love-simulator-create-form';

const initialFormData = {
  senderName: 'คนที่คลั่งรักเธอ',
  recipientName: 'คนน่ารักที่สุดในโลก',
  customerEmail: '',
  anniversaryDate: new Date().toISOString().slice(0, 10),
  password: 'คลั่งรัก101',
  flowerImage: '/assets/flower1.png',
  avatarImage: '/assets/boy1.png',
  letter: 'ถึงคนน่ารักของเรา...\n\nขอบคุณที่อยู่ด้วยกันมาจนถึงวันนี้นะ\nทุกวันที่มีเธอ มันสนุกกว่าเกมทุกเกมที่เคยเล่นเลย\nต่อจากนี้ก็ฝากด้วยนะ ผู้เล่น 2 ของเรา 🎮\n\nรักที่สุดเลย ♡',
  signature: '— จากคนที่รักเธอที่สุด ♡',
  quiz: [
    { q: 'เดทแรกของเรา ไปที่ไหนกันนะ?', c: ['ดูหนัง 🎬', 'คาเฟ่ ☕', 'สวนสาธารณะ 🌳', 'ทะเล 🌊'], answer: 1 },
    { q: 'เครื่องดื่มที่เราชอบสั่งบ่อยสุดคือ?', c: ['ชาเขียว 🍵', 'โกโก้ 🍫', 'อเมริกาโน่ ☕', 'ชานมไข่มุก 🧋'], answer: 3 },
    { q: 'สีที่เธอชอบที่สุดคือสีอะไร?', c: ['ชมพู 🌸', 'ฟ้า 💙', 'เขียว 💚', 'ม่วง 💜'], answer: 0 },
    { q: 'เพลงที่เราฟังด้วยกันบ่อยที่สุด?', c: ['เพลง A', 'เพลง B', 'เพลง C', 'เพลง D'], answer: 0 },
    { q: 'ทริปต่อไป อยากไปเที่ยวไหนด้วยกัน?', c: ['ญี่ปุ่น 🗾', 'เกาหลี 🇰🇷', 'เชียงใหม่ ⛰️', 'ทะเลใต้ 🏝️'], answer: 0 },
  ],
  couplePhoto: { id: 'couple-1', caption: 'รูปคู่ของเรา 💑', note: 'รูปคู่ที่เราชอบที่สุด', file: null, preview: '' },
  memoryPhotos: [
    { id: 1, caption: 'เดทแรกของเรา 💘', note: 'ยังจำได้เลยว่าเขินแค่ไหน', file: null, preview: '' },
    { id: 2, caption: 'ทริปแรกของเรา ✈️', note: 'เหนื่อยแต่สนุกมากกก', file: null, preview: '' },
    { id: 3, caption: 'ความทรงจำของเรา 🎂', note: 'ปีนี้ก็ขอให้น่ารักแบบนี้ตลอดไปนะ', file: null, preview: '' },
  ],
  prizes: [
    { id: 'prize-1', icon: '✈️', name: 'คูปองพาไปเที่ยว 1 ทริป', desc: 'เลือกที่ได้เลย เดี๋ยวจัดให้!' },
    { id: 'prize-2', icon: '💆', name: 'คูปองนวดให้ 30 นาที', desc: 'นวดไหล่ นวดหัว จัดเต็ม' },
  ],
};

function CreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template') || 'retro-8bit';

  const templateMeta = getTemplateById(templateId);

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const formRef = useRef(null);

  // Redirect to landing if template not found or not available
  useEffect(() => {
    if (!templateMeta || !templateMeta.available) {
      router.replace('/');
    }
  }, [templateMeta, router]);

  const updateForm = (patch) => {
    setFormData((current) => ({ ...current, ...patch }));
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(FORM_STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        setFormData((current) => ({
          ...current,
          ...parsed,
          couplePhoto: {
            ...current.couplePhoto,
            ...parsed.couplePhoto,
            file: null,
          },
          memoryPhotos: Array.isArray(parsed.memoryPhotos)
            ? parsed.memoryPhotos.map((photo) => ({ ...photo, file: null }))
            : current.memoryPhotos,
        }));
      }
    } catch (error) {
      console.warn('Unable to restore saved form data', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const safeSave = {
      ...formData,
      couplePhoto: {
        ...formData.couplePhoto,
        file: undefined,
      },
      memoryPhotos: formData.memoryPhotos.map(({ file, ...rest }) => rest),
    };
    window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(safeSave));
  }, [formData]);

  const convertFileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve('');
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    if (formRef.current) {
      const valid = formRef.current.reportValidity();
      if (!valid) {
        const invalidField = formRef.current.querySelector(':invalid');
        if (invalidField) {
          invalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          invalidField.focus();
        }
        return;
      }
    }

    const needsCouplePhoto = ['retro-8bit', 'minimal-romantic', 'love-letter-free'].includes(templateId);
    if (needsCouplePhoto && !formData.couplePhoto?.preview) {
      setErrorMessage('กรุณาอัปโหลดรูปคู่ก่อนดำเนินการต่อ');
      const coupleBlock = formRef.current.querySelector('#couple-photo-upload');
      if (coupleBlock) coupleBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    try {
      const couplePhotoPreview = formData.couplePhoto.file
        ? await convertFileToDataUrl(formData.couplePhoto.file)
        : formData.couplePhoto.preview || '';

      const memories = await Promise.all(
        formData.memoryPhotos.map(async (photo) => ({
          caption: photo.caption,
          note: photo.note,
          previewUrl: photo.file ? await convertFileToDataUrl(photo.file) : photo.preview || '',
        }))
      );

      const price = templateMeta?.price ?? 99;

      const orderPayload = {
        template_id: templateId,
        status: price === 0 ? 'paid' : 'pending',
        customer_name: formData.senderName,
        customer_email: formData.customerEmail,
        price,
        custom_texts: {
          senderName: formData.senderName,
          recipientName: formData.recipientName,
          startDate: formData.anniversaryDate,
          password: formData.password,
          flowerImage: formData.flowerImage,
          avatarImage: formData.avatarImage,
          letter: formData.letter,
          signature: formData.signature,
          couplePhoto: {
            caption: formData.couplePhoto.caption,
            note: formData.couplePhoto.note,
            previewUrl: couplePhotoPreview,
          },
          memories,
          quiz: formData.quiz,
          prizes: formData.prizes,
        },
        image_urls: [
          formData.couplePhoto.file?.name || formData.couplePhoto.caption,
          ...formData.memoryPhotos.map((photo) => photo.file?.name || photo.caption),
        ],
      };

      console.log('Creating order, payload:', orderPayload);

      // Use a secure server-side endpoint that runs with the Supabase service role key.
      const resp = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const result = await resp.json();
      console.log('API /api/orders result:', result);

      setLoading(false);

      if (!resp.ok) {
        setErrorMessage(result?.error || result?.message || 'เกิดข้อผิดพลาดขณะสร้างคำสั่งซื้อ');
        return;
      }

      // If the template is free, skip checkout and go directly to play page
      if (price === 0) {
        router.push(`/play/${result.id}`);
      } else {
        router.push(`/checkout/${result.id}`);
      }
    } catch (err) {
      console.error('Unexpected error when creating order', err);
      setLoading(false);
      setErrorMessage(err?.message || String(err) || 'เกิดข้อผิดพลาดไม่คาดคิด');
    }
  };

  if (!templateMeta || !templateMeta.available) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
        {/* Template info banner */}
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{templateMeta.tier === 'premium' ? '🎮' : templateMeta.tier === 'standard' ? '💌' : '✉️'}</span>
            <div>
              <p className="text-sm font-bold text-slate-800">{templateMeta.name}</p>
              <p className="text-xs text-slate-500">{templateMeta.tagline}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-lg font-extrabold ${templateMeta.price === 0 ? 'text-emerald-600' : 'text-pink-600'}`}>
              {getPriceLabel(templateMeta.price)}
            </span>
          </div>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-xl">
          <h1 className="text-3xl font-semibold text-slate-900">Customize Your Love Simulator</h1>
          <p className="mt-2 text-slate-500">กรอกข้อมูลและดูตัวอย่างเมื่อสั่งซื้อเสร็จ</p>
            <CustomizerForm
              data={formData}
              formRef={formRef}
              onChange={updateForm}
              loading={loading}
              onSubmit={handleSubmit}
              errorMessage={errorMessage}
              templateId={templateId}
            />
        </section>
      </div>
    </main>
  );
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-100">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
        </main>
      }
    >
      <CreatePageContent />
    </Suspense>
  );
}
