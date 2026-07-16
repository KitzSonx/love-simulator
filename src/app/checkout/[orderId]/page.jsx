'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';

function buildGameUrl(orderId) {
  if (!orderId || typeof window === 'undefined') {
    return '';
  }
  return `${window.location.origin}/play/${orderId}`;
}

function CheckoutPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = params?.orderId;
  const actionParam = searchParams.get('action');

  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [qrUrl, setQrUrl] = useState('');
  const [amount, setAmount] = useState(99);

  const [gameUrl, setGameUrl] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const [showPayment, setShowPayment] = useState(actionParam === 'pay');

  // Slip upload state
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const fileInputRef = useRef(null);

  // ดึงข้อมูลคำสั่งซื้อและสร้าง QR Code
  useEffect(() => {
    let isCancelled = false;

    async function loadOrderAndGenerateQR() {
      if (!orderId) {
        setError('ไม่พบคำสั่งซื้อ');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        // 1. ดึงข้อมูล Order พื้นฐาน
        const resOrder = await fetch(`/api/orders/${orderId}`);
        const orderData = await resOrder.json();

        if (isCancelled) return;

        if (!resOrder.ok) {
          setError(orderData?.error || 'ไม่พบคำสั่งซื้อ');
          setIsLoading(false);
          return;
        }

        setOrder(orderData);
        setAmount(orderData.price || 99);

        // ถ้าจ่ายเงินแล้ว
        if (orderData?.status === 'paid') {
          setQrUrl('');
          setGameUrl(buildGameUrl(orderId));
          setReceipt({
            orderId: orderData.id,
            status: 'paid',
            paidAt: orderData.paid_at || new Date().toISOString(),
            amount: orderData.price || 99,
          });
          setIsLoading(false);
          return;
        }

        // 2. ถ้ายังไม่จ่าย ให้เรียก API สร้าง QR
        const resCheckout = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
        const checkoutData = await resCheckout.json();

        if (isCancelled) return;

        if (!resCheckout.ok) {
          setError(checkoutData?.error || 'สร้างคิวอาร์โค้ดไม่สำเร็จ');
        } else if (checkoutData.alreadyPaid) {
          // เผื่อ status อัปเดตระหว่างนั้น
          setOrder(prev => ({ ...prev, status: 'paid' }));
          setGameUrl(buildGameUrl(orderId));
          setQrUrl('');
          setReceipt({
            orderId,
            status: 'paid',
            paidAt: new Date().toISOString(),
            amount: checkoutData.amount || 99,
          });
        } else {
          setQrUrl(checkoutData.qrCode);
          setAmount(checkoutData.amount);
        }

      } catch (err) {
        if (!isCancelled) {
          setError(err?.message || 'โหลดข้อมูลไม่สำเร็จ');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadOrderAndGenerateQR();

    return () => {
      isCancelled = true;
    };
  }, [orderId]);

  // Handle Slip Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์ใหญ่เกินไป (สูงสุด 5MB)');
      return;
    }

    setSlipFile(file);
    const objectUrl = URL.createObjectURL(file);
    setSlipPreview(objectUrl);
  };

  // Handle Slip Upload and Verification
  const handleVerifySlip = async () => {
    if (!slipFile || !orderId) return;

    setIsVerifying(true);
    setError('');

    const formData = new FormData();
    formData.append('orderId', orderId);
    formData.append('files', slipFile);

    try {
      const res = await fetch('/api/verify-slip', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'ตรวจสอบสลิปไม่สำเร็จ');
        setIsVerifying(false);
        return;
      }

      if (data.success) {
        router.push(`/play/${orderId}`);
      } else {
        setError('ไม่สามารถยืนยันสลิปได้');
        setIsVerifying(false);
      }

    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      setIsVerifying(false);
    }
  }


  const handleCopyLink = () => {
    if (!gameUrl) return;
    navigator.clipboard.writeText(gameUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadQR = async () => {
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(gameUrl)}`;
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `love-surprise-qr-${orderId.slice(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      window.open(qrImageUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-900">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
          <p className="font-medium text-slate-600">กำลังเตรียมข้อมูล...</p>
        </div>
      </main>
    );
  }

  // ==========================================
  // 1. หน้าจอเมื่อ "ชำระเงินสำเร็จแล้ว (PAID)"
  // ==========================================
  if (order?.status === 'paid') {
    return (
      <main className="min-h-screen bg-slate-100 p-4 py-10 text-slate-900 sm:p-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">ชำระเงินสำเร็จ!</h1>
            <p className="mt-1 text-sm text-slate-600 sm:text-base">ของขวัญสุดเซอร์ไพรส์พร้อมส่งมอบให้คนพิเศษแล้ว ❤️</p>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-dashed border-slate-300 pb-3">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">✔ ชำระเงินแล้ว (PAID)</span>
              <span className="text-lg font-bold text-slate-800">{receipt?.amount || 99} บาท</span>
            </div>
            <div className="mt-3 space-y-1.5 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>ผู้ส่ง:</span> <span className="font-semibold text-slate-800">{order.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span>ผู้รับ:</span> <span className="font-semibold text-slate-800">{order.custom_texts?.recipientName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>วันที่:</span> <span>{receipt?.paidAt ? new Date(receipt.paidAt).toLocaleString('th-TH') : '—'}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 pt-1">
                <span>รหัสอ้างอิง:</span> <span>#{order.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-pink-200 bg-pink-50/50 p-4 sm:p-5">
            <label className="block text-sm font-semibold text-slate-800">🔗 ลิงก์เกมจริง (สำหรับส่งให้แฟนกดเปิดดู):</label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                readOnly
                value={gameUrl}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-600 shadow-inner focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className={`flex items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all sm:w-44 ${isCopied ? 'bg-emerald-500' : 'bg-pink-500 hover:bg-pink-600'
                  }`}
              >
                {isCopied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <h3 className="font-semibold text-slate-800">📱 QR Code สำหรับสแกนเข้าเกม</h3>
            <p className="mt-1 text-xs text-slate-500">(ไอเดีย: เซฟรูปนี้ไปปริ้นท์ลงบนการ์ดของขวัญให้แฟนสแกนได้นะ! 🎁)</p>
            <div className="my-4 flex justify-center">
              <img
                src={gameUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(gameUrl)}` : ''}
                alt="QR Code สำหรับเข้าเกม"
                className="h-48 w-48 rounded-2xl border border-slate-100 p-2 shadow-sm"
              />
            </div>
            <button
              onClick={handleDownloadQR}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 sm:text-sm"
            >
              📥 ดาวน์โหลด QR Code
            </button>
          </div>

          <div className="mt-8">
            <Link
              href={`/game/${order.id}`}
              className="block w-full rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 py-4 text-center text-base font-bold text-white shadow-lg shadow-pink-500/30 transition hover:from-pink-600 hover:to-rose-600 sm:text-lg"
            >
              เปิดหน้าเกมจริง
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // 2. หน้าจอเมื่อ "ยังไม่ชำระเงิน (UNPAID)" 
  // ==========================================

  if (!showPayment) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 py-10 text-slate-900 sm:p-8">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 sm:text-2xl">กรอกฟอร์มสำเร็จ!</h1>
            <p className="mt-2 text-sm text-slate-600">ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว เลือกสิ่งที่คุณต้องการทำต่อไป</p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href={`/play/${orderId}`}
              className="w-full rounded-2xl border border-indigo-200 bg-indigo-50 py-4 text-center text-base font-bold text-indigo-700 transition hover:bg-indigo-100"
            >
              🎮 ดูตัวอย่างเกมก่อน
            </Link>

            <button
              onClick={() => setShowPayment(true)}
              className="w-full rounded-2xl bg-emerald-500 py-4 text-center text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600"
            >
              💳 ชำระเงินทันที
            </button>

            <Link
              href={`/create?template=${order?.template_id || 'retro-8bit'}`}
              className="w-full rounded-2xl border border-slate-200 bg-white py-4 text-center text-base font-bold text-slate-600 transition hover:bg-slate-50"
            >
              ✏️ กลับไปแก้ไขฟอร์ม
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // แสดง QR Code & Slip Upload
  return (
    <main className="min-h-screen bg-slate-100 p-4 py-10 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl text-center">สแกนชำระเงิน</h1>
        <p className="mt-2 text-sm text-slate-600 text-center">สแกนคิวอาร์โค้ดผ่านแอปธนาคารใดก็ได้เพื่อชำระเงิน</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 text-center">
            ❌ {error}
          </div>
        )}

        {/* ยอดชำระ */}
        <div className="mt-6 flex flex-col items-center justify-center">
          <span className="text-sm font-semibold text-slate-500">ยอดชำระสุทธิ</span>
          <span className="text-4xl font-extrabold text-pink-600 my-1">{amount} <span className="text-xl">บาท</span></span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 mt-2">พร้อมเพย์ (PromptPay)</span>
        </div>

        {/* พื้นที่แสดง QR Code พร้อมเพย์ */}
        <div className="mt-6 flex justify-center">
          {qrUrl ? (
            <div className="rounded-2xl border-4 border-slate-100 bg-white p-4 shadow-md w-64 h-64 flex items-center justify-center">
              <img src={qrUrl} alt="PromptPay QR" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 w-64 h-64 flex items-center justify-center text-slate-400 text-sm flex-col">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mb-2"></div>
              กำลังโหลด QR Code...
            </div>
          )}
        </div>

        {/* File Upload Zone */}
        <div className="mt-8 border-t border-slate-200 pt-6">
          <h3 className="font-semibold text-slate-800 text-center mb-4">📸 อัปโหลดสลิปเพื่อยืนยัน</h3>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {!slipFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer group relative overflow-hidden rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-pink-400 hover:bg-pink-50"
            >
              <div className="text-4xl mb-3 opacity-50 group-hover:opacity-100 transition-opacity">🧾</div>
              <p className="font-semibold text-slate-700">คลิกเพื่อเลือกไฟล์สลิป</p>
              <p className="mt-1 text-xs text-slate-500">รองรับ .jpg, .png, .webp</p>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-200">
                <img src={slipPreview} alt="Slip Preview" className="w-full h-full object-contain" />
                {!isVerifying && (
                  <button
                    onClick={() => {
                      setSlipFile(null);
                      setSlipPreview('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 bg-white/90 text-slate-700 rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                onClick={handleVerifySlip}
                disabled={isVerifying}
                className="mt-4 w-full rounded-2xl bg-emerald-500 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center"
              >
                {isVerifying ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    กำลังตรวจสอบสลิปด้วย AI...
                  </>
                ) : (
                  'ยืนยันการชำระเงิน'
                )}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowPayment(false)}
            className="text-sm font-semibold text-slate-500 hover:text-slate-700 underline underline-offset-4"
          >
            ย้อนกลับไปตัวเลือกก่อนหน้า
          </button>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}