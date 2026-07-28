'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';
import { getTemplateById } from '@/lib/templateCatalog';

function buildGameUrl(orderId) {
  if (!orderId || typeof window === 'undefined') {
    return '';
  }
  return `${window.location.origin}/play/${orderId}`;
}

/* ─── Shared style helpers ─── */
const glassCard = `bg-white/70 backdrop-blur-xl border border-white/30 shadow-[0_20px_40px_rgba(183,16,42,0.08)]`;

function BrandLogo({ size = 'md' }) {
  const isLg = size === 'lg';
  return (
    <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight hover:opacity-90 transition-opacity">
      <img
        src="/assets/pixellove.png"
        alt="Pixel Love Logo"
        className={`${isLg ? 'h-9 md:h-10' : 'h-7 md:h-8'} w-auto object-contain rounded-xl hover:scale-105 transition-transform duration-300`}
      />
      <span className={`bg-gradient-to-r from-[#ff5376] to-[#ff7eb3] bg-clip-text text-transparent drop-shadow-sm ${isLg ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'}`}>
        Pixel Love
      </span>
    </Link>
  );
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
        // Show the "paid" receipt screen directly — no redirect to /play
        setGameUrl(buildGameUrl(orderId));
        setReceipt({
          orderId,
          status: 'paid',
          paidAt: new Date().toISOString(),
          amount: amount,
        });
        setOrder(prev => ({ ...prev, status: 'paid' }));
        setShowPayment(false);
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

  const templateMeta = getTemplateById(order?.template_id);

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(circle at top left, #f8dbdf 0%, #f8f9fa 50%, #d5e3ff 100%)' }}>
        <div className={`${glassCard} rounded-[32px] p-12 flex flex-col items-center gap-4`}>
          <div className="w-12 h-12 rounded-full border-4 border-[#b7102a]/20 border-t-[#b7102a] animate-spin" />
          <p className="text-[#6e595c] font-semibold" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>กำลังเตรียมข้อมูล...</p>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════
     SCREEN 1 — PAID / RECEIPT
  ══════════════════════════════════════════════ */
  if (order?.status === 'paid') {
    const shortId = (receipt?.orderId || order.id || '').slice(0, 8).toUpperCase();
    const paidDate = receipt?.paidAt ? new Date(receipt.paidAt) : new Date();
    const qrCodeUrl = gameUrl
      ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(gameUrl)}`
      : '';

    return (
      <div className="min-h-screen relative overflow-x-hidden" style={{ fontFamily: "'Be Vietnam Pro', sans-serif", background: '#f8f9fa' }}>
        {/* Ambient bg */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#f8dbdf] rounded-full mix-blend-multiply blur-[120px] opacity-30" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ffb3b1] rounded-full mix-blend-multiply blur-[120px] opacity-30" />
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex justify-between items-center px-5 md:px-16 py-6">
          <BrandLogo size="lg" />
        </nav>

        <main className="relative z-10 pb-16 px-5 md:px-16 max-w-[1280px] mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="relative inline-flex mb-4">
              <div className="absolute inset-0 bg-[#b7102a]/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
              <div className="relative z-10 w-16 h-16 bg-[#b7102a] rounded-full flex items-center justify-center shadow-lg shadow-[#b7102a]/30">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
            </div>
            <h1 className="text-[28px] md:text-[40px] font-bold text-[#b7102a] leading-tight mb-2">ชำระเงินสำเร็จ! 🎉</h1>
            <p className="text-[#6e595c] text-base md:text-lg max-w-md mx-auto leading-relaxed">
              ขอบคุณที่เลือกใช้บริการ Pixel Love<br className="hidden md:block" />
              ของขวัญความรักของคุณพร้อมส่งต่อความรู้สึกดีๆ แล้ว
            </p>
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Left — Receipt Card */}
            <div className={`${glassCard} rounded-[24px] overflow-hidden`}>
              {/* Receipt header */}
              <div className="bg-[#b7102a] px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-0.5">Digital Receipt</p>
                  <p className="text-white font-extrabold text-lg flex items-center gap-2">
                    <img src="/assets/pixellove.png" alt="Pixel Love Logo" className="h-6 w-auto object-contain rounded-lg" />
                    Pixel Love
                  </p>
                </div>
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">PAID</span>
              </div>
              {/* Receipt body */}
              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#e4bebc]/40">
                  <div>
                    <p className="text-[10px] text-[#6e595c] font-bold uppercase tracking-widest mb-0.5">Order ID</p>
                    <p className="text-[#b7102a] font-bold text-sm">#{shortId}-LOVE</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6e595c] font-bold uppercase tracking-widest mb-0.5">Date</p>
                    <p className="text-[#191c1d] font-medium text-sm">
                      {paidDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pb-4 border-b border-[#e4bebc]/40">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-9 h-9 rounded-full bg-[#f8dbdf] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#b7102a] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#6e595c] font-bold uppercase tracking-widest">Sender</p>
                      <p className="text-[#191c1d] font-semibold text-sm truncate">{order.customer_name || '—'}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#b7102a]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-9 h-9 rounded-full bg-[#f8dbdf] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#b7102a] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#6e595c] font-bold uppercase tracking-widest">Receiver</p>
                      <p className="text-[#191c1d] font-semibold text-sm truncate">{order.custom_texts?.recipientName || '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#6e595c] font-bold uppercase tracking-widest mb-0.5">Package</p>
                    <p className="text-[#191c1d] font-semibold text-sm">{templateMeta?.fullName || 'Premium Love Letter'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#6e595c] font-bold uppercase tracking-widest mb-0.5">Total Amount</p>
                    <p className="text-[#b7102a] font-bold text-lg">{receipt?.amount || amount}.00 ฿</p>
                  </div>
                </div>

                {/* Barcode section with bars ABOVE "THANK YOU FOR YOUR LOVE" */}
                <div className="pt-5 border-t border-dashed border-[#e4bebc]/60 flex flex-col items-center">
                  <div className="flex gap-[3px] h-10 w-full items-end justify-center px-4 opacity-75">
                    {[3,1,4,1,5,9,2,6,5,3,5,8,9,7,9,3,2,3,8,4,6,2,6,4,3,3,8,3,2,7,9,5,0,2,8,8,4,1,9,7,1,6,9,3,9,9,3,7,5,1,0].map((w, idx) => (
                      <div
                        key={idx}
                        className="bg-[#191c1d] rounded-sm"
                        style={{
                          width: `${(idx % 3 === 0 ? 3 : 2)}px`,
                          height: `${(idx % 2 === 0 ? 100 : idx % 3 === 0 ? 80 : 65)}%`
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-center text-[10px] text-[#6e595c] font-bold uppercase tracking-[0.25em] mt-2.5">
                    THANK YOU FOR YOUR LOVE
                  </p>
                </div>
              </div>
            </div>

            {/* Right — Share & QR */}
            <div className="flex flex-col gap-6">
              {/* Link share card */}
              <div className={`${glassCard} rounded-[24px] p-6`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[#b7102a] text-xl">link</span>
                  <p className="text-[#b7102a] font-bold text-sm uppercase tracking-widest">ลิงก์สำหรับส่งต่อ</p>
                </div>
                <p className="text-[#6e595c] text-sm mb-4 leading-relaxed">
                  คัดลอกลิงก์นี้เพื่อส่งให้คนที่คุณรักได้ทันที ผ่าน Messenger, Line หรือแอปอื่นๆ
                </p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={gameUrl}
                    className="flex-1 bg-[#f3f4f5] border border-[#e4bebc]/60 rounded-xl px-3.5 py-2.5 text-sm text-[#6e595c] focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 ${
                      isCopied
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[#b7102a] text-white hover:bg-[#92001c] shadow-md shadow-[#b7102a]/30'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{isCopied ? 'check' : 'content_copy'}</span>
                    {isCopied ? 'คัดลอกแล้ว!' : 'คัดลอก'}
                  </button>
                </div>
              </div>

              {/* QR card */}
              <div className={`${glassCard} rounded-[24px] p-6`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#b7102a] text-xl">qr_code_2</span>
                  <p className="text-[#b7102a] font-bold text-sm uppercase tracking-widest">QR Code ส่วนตัว</p>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="bg-white p-3 rounded-2xl border border-[#e4bebc]/40 shadow-sm shrink-0">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24 rounded-lg" />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-[#f3f4f5] flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-[#b7102a]/30 border-t-[#b7102a] rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[#191c1d] font-semibold text-sm mb-1">ดาวน์โหลด QR Code เพื่อพิมพ์ใส่การ์ด หรือส่งเป็นภาพ</p>
                    <p className="text-[#6e595c] text-xs mb-3">ความทรงจำพิเศษในรูปแบบดิจิทัล 🎁</p>
                    <button
                      onClick={handleDownloadQR}
                      className="bg-[#f8dbdf] text-[#b7102a] font-bold text-xs px-4 py-2 rounded-full hover:bg-[#ffb3b1] transition-colors"
                    >
                      ดาวน์โหลดรูปภาพ
                    </button>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link
                href={`/game/${order.id}`}
                className="w-full bg-[#b7102a] text-white font-bold py-4 rounded-full text-center flex items-center justify-center gap-2 shadow-lg shadow-[#b7102a]/30 hover:bg-[#92001c] hover:shadow-xl hover:shadow-[#b7102a]/40 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                เปิดหน้าเกมจริงเลย
              </Link>

              <Link href="/" className="text-center text-[#6e595c] text-sm hover:text-[#b7102a] transition-colors underline underline-offset-4 decoration-[#b7102a]/30">
                หรือ กลับไปยัง <span className="font-semibold">หน้าหลัก</span>
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 mt-16 py-8 px-5 md:px-16 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-[#e4bebc]/30">
          <BrandLogo size="md" />
          <div className="flex gap-6 text-xs text-[#6e595c]">
            <a href="#" className="hover:text-[#b7102a] transition-colors">ข้อกำหนดการใช้งาน</a>
            <a href="#" className="hover:text-[#b7102a] transition-colors">นโยบายความเป็นส่วนตัว</a>
            <a href="#" className="hover:text-[#b7102a] transition-colors">ติดต่อเรา</a>
          </div>
          <p className="text-xs text-[#6e595c]">© 2024 Pixel Love. สร้างด้วยความรักเพื่อคนไทยทุกคน</p>
        </footer>
      </div>
    );
  }

  /* ══════════════════════════════════════════════
     SCREEN 2 — FORM SUCCESS (showPayment = false)
  ══════════════════════════════════════════════ */
  if (!showPayment) {
    const coverImage = templateMeta?.previewImage || '/assets/firsttemplate.png';

    return (
      <div
        className="min-h-screen flex items-center justify-center p-5 md:p-16 relative overflow-hidden"
        style={{ fontFamily: "'Be Vietnam Pro', sans-serif", background: 'radial-gradient(circle at top left, #f8dbdf 0%, #f8f9fa 50%, #d5e3ff 100%)' }}
      >
        {/* Ambient glow */}
        <div className="absolute w-[400px] h-[400px] bg-[#b7102a]/10 rounded-full blur-[80px] top-[-100px] left-[-100px] pointer-events-none" />
        <div className="absolute w-[400px] h-[400px] bg-[#b7102a]/10 rounded-full blur-[80px] bottom-[-100px] right-[-100px] pointer-events-none" />

        {/* Decorative hearts */}
        <div className="absolute -top-12 -right-12 hidden md:block opacity-[0.12] rotate-12 pointer-events-none">
          <span className="material-symbols-outlined text-[140px] text-[#b7102a]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
        </div>
        <div className="absolute -bottom-12 -left-12 hidden md:block opacity-[0.12] -rotate-12 pointer-events-none">
          <span className="material-symbols-outlined text-[140px] text-[#b7102a]">auto_awesome</span>
        </div>

        <main className="w-full max-w-[480px] z-10">
          <div className={`${glassCard} rounded-[32px] p-8 md:p-10 flex flex-col items-center text-center gap-7`}>
            {/* Success icon */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#b7102a]/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
              <div className="relative z-10 w-14 h-14 bg-[#b7102a] rounded-full flex items-center justify-center shadow-lg shadow-[#b7102a]/30">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-[28px] md:text-[32px] font-bold text-[#b7102a] leading-tight">กรอกฟอร์มสำเร็จ!</h1>
              <p className="text-[#6e595c] text-base max-w-[300px] mx-auto leading-relaxed">
                ข้อมูลความรักของคุณถูกบันทึกไว้ในระบบจำลองเรียบร้อยแล้ว เตรียมสัมผัสประสบการณ์สุดพิเศษได้เลย
              </p>
            </div>

            {/* Template Cover Preview Card */}
            <div className="w-full rounded-2xl overflow-hidden relative aspect-video shadow-sm border border-white/50 bg-slate-900">
              <img
                src={coverImage}
                alt={templateMeta?.name || 'Template Cover'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#b7102a] animate-pulse" />
                <span className="text-[10px] text-white font-bold uppercase tracking-widest">READY TO SIMULATE</span>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={() => setShowPayment(true)}
                className="w-full bg-[#b7102a] text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-[#b7102a]/30 hover:bg-[#92001c] hover:shadow-xl hover:shadow-[#b7102a]/40 active:scale-95 transition-all"
              >
                <span>ชำระเงินทันที ({amount}฿)</span>
                <span className="material-symbols-outlined text-xl">payments</span>
              </button>

              <Link
                href={`/play/${orderId}`}
                className="w-full bg-white/40 border border-[#b7102a]/20 text-[#b7102a] font-bold py-4 rounded-full backdrop-blur-md flex items-center justify-center gap-2 hover:bg-white/60 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-xl">sports_esports</span>
                <span>ดูตัวอย่างเกมก่อน</span>
              </Link>

              <Link
                href={`/create?template=${order?.template_id || 'retro-8bit'}`}
                className="text-[#6e595c] font-semibold text-sm py-2 hover:text-[#b7102a] transition-colors underline underline-offset-4 decoration-[#b7102a]/30"
              >
                กลับไปแก้ไขฟอร์ม
              </Link>
            </div>

            {/* Footer badge */}
            <div className="flex items-center gap-2 opacity-50 pt-2">
              <span className="material-symbols-outlined text-sm text-[#6e595c]">lock</span>
              <span className="text-[11px] text-[#6e595c] font-semibold uppercase tracking-widest">Secured by Pixel Love Encryption</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ══════════════════════════════════════════════
     SCREEN 3 — PAYMENT (QR + Slip Upload)
  ══════════════════════════════════════════════ */
  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif", background: '#f8f9fa' }}
    >
      {/* Ambient bg */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#f8dbdf] rounded-full mix-blend-multiply blur-[120px] opacity-30" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ffb3b1] rounded-full mix-blend-multiply blur-[120px] opacity-30" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex justify-between items-center px-5 md:px-16 py-6">
        <BrandLogo size="lg" />
      </nav>

      <main className="relative z-10 pb-16 px-5 md:px-16 max-w-[1280px] mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-[28px] md:text-[40px] font-bold text-[#191c1d] leading-tight mb-2">ยืนยันการชำระเงิน</h1>
          <p className="text-[#6e595c] text-base">ปลดล็อกเรื่องราวความรักที่สมบูรณ์แบบของคุณ</p>
        </header>

        {/* Error */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6 rounded-2xl border border-[#ffdad6] bg-[#ffdad6]/50 px-5 py-4 text-sm text-[#93000a] font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        {/* Bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-4xl mx-auto">

          {/* Left — Summary */}
          <div className="lg:col-span-5 flex flex-col gap-6 order-2 lg:order-1">
            {/* Transaction card */}
            <div className={`${glassCard} rounded-[24px] p-7 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#b7102a]/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start relative z-10 mb-6">
                <div>
                  <p className="text-[10px] text-[#6e595c] font-bold uppercase tracking-widest mb-1">Total Amount</p>
                  <h2 className="text-[40px] font-bold text-[#b7102a] leading-none">฿{amount}.00</h2>
                </div>
                <span className="material-symbols-outlined text-[#b7102a] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </div>
              <div className="space-y-0.5 relative z-10 mb-6">
                <p className="text-xs text-[#6e595c] font-semibold">Premium Subscription</p>
                <p className="text-sm font-bold text-[#191c1d]">Unlimited Romance Simulations</p>
              </div>
              <div className="flex justify-between items-end relative z-10">
                <div className="flex -space-x-2">
                  <div className="w-9 h-9 rounded-full border-2 border-white bg-[#b7102a] flex items-center justify-center text-white font-bold text-xs">P</div>
                  <div className="w-9 h-9 rounded-full border-2 border-white bg-[#6e595c] flex items-center justify-center text-white font-bold text-xs">L</div>
                </div>
                <span className="text-xs text-[#6e595c] font-semibold">Secure Transaction</span>
              </div>
            </div>

            {/* Order detail */}
            <div className={`${glassCard} rounded-[24px] p-7 space-y-3`}>
              <h3 className="text-[10px] text-[#b7102a] font-bold uppercase tracking-widest mb-2">รายละเอียดออเดอร์</h3>
              <div className="flex justify-between text-sm text-[#191c1d] py-2 border-b border-[#e4bebc]/30">
                <span>แพ็กเกจเริ่มต้น</span>
                <span>฿{amount}.00</span>
              </div>
              <div className="flex justify-between text-sm text-[#191c1d] py-2 border-b border-[#e4bebc]/30">
                <span>ภาษีมูลค่าเพิ่ม (7%)</span>
                <span>฿0.00</span>
              </div>
              <div className="flex justify-between font-bold text-[#b7102a] text-base pt-1">
                <span>ยอดรวมสุทธิ</span>
                <span>฿{amount}.00</span>
              </div>
            </div>
          </div>

          {/* Right — QR + Slip */}
          <div className="lg:col-span-7 flex flex-col gap-6 order-1 lg:order-2">
            {/* QR section with PromptPay Logo above */}
            <div className={`${glassCard} rounded-[24px] p-7`}>
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                {/* QR display & PromptPay Logo */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                  {/* PromptPay logo image */}
                  <div className="h-10 w-36 relative flex items-center justify-center">
                    <img
                      src="/assets/Prompt pay.jpg"
                      alt="PromptPay"
                      className="h-full object-contain rounded-md"
                    />
                  </div>
                  {/* QR Box */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e4bebc]/30">
                    {qrUrl ? (
                      <img src={qrUrl} alt="PromptPay QR" className="w-44 h-44 object-contain" />
                    ) : (
                      <div className="w-44 h-44 flex items-center justify-center flex-col gap-2">
                        <div className="w-8 h-8 rounded-full border-4 border-[#b7102a]/20 border-t-[#b7102a] animate-spin" />
                        <p className="text-xs text-[#6e595c]">กำลังโหลด...</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[#6e595c] text-center font-medium">สแกนเพื่อจ่ายด้วยแอปธนาคารของคุณ</p>
                </div>

                {/* Slip upload */}
                <div className="flex-1 w-full">
                  <p className="text-[10px] text-[#b7102a] font-bold uppercase tracking-widest mb-3">อัปโหลดหลักฐานการโอน</p>
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
                      className="cursor-pointer rounded-2xl border-2 border-dashed border-[#b7102a]/20 bg-[#f8f9fa] hover:border-[#b7102a]/60 hover:bg-[#f8dbdf]/30 transition-all p-6 flex flex-col items-center gap-2 text-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#b7102a] flex items-center justify-center shadow-md shadow-[#b7102a]/30 mb-1">
                        <span className="material-symbols-outlined text-white text-2xl">upload</span>
                      </div>
                      <p className="font-semibold text-[#191c1d] text-sm">อัปโหลดสลิปเพื่อยืนยัน</p>
                      <p className="text-xs text-[#6e595c]">ลากไฟล์มาวาง หรือ คลิกเพื่อเลือก</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-[#e4bebc]/40 bg-white p-3 space-y-3">
                      <div className="relative h-36 rounded-xl overflow-hidden bg-[#f3f4f5]">
                        <img src={slipPreview} alt="Slip" className="w-full h-full object-contain" />
                        {!isVerifying && (
                          <button
                            onClick={() => {
                              setSlipFile(null);
                              setSlipPreview('');
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-red-50 hover:text-[#b7102a] text-[#6e595c] transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        )}
                      </div>
                      <button
                        onClick={handleVerifySlip}
                        disabled={isVerifying}
                        className="w-full bg-[#b7102a] disabled:bg-[#8f6f6e] text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 shadow-md shadow-[#b7102a]/30 hover:bg-[#92001c] active:scale-95 transition-all disabled:cursor-not-allowed disabled:shadow-none"
                      >
                        {isVerifying ? (
                          <>
                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            กำลังตรวจสอบด้วย AI...
                          </>
                        ) : (
                          <>ยืนยันและเริ่มใช้งานเลย</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Trust badge */}
            <div className={`${glassCard} rounded-[24px] px-6 py-4 flex items-center gap-4`}>
              <div className="w-10 h-10 rounded-full bg-[#f8dbdf] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#b7102a] text-xl">shield</span>
              </div>
              <div>
                <p className="font-semibold text-[#191c1d] text-sm">การชำระเงินปลอดภัย 100%</p>
                <p className="text-xs text-[#6e595c]">ข้อมูลของคุณจะถูกเก็บเป็นความลับและประมวลผลทันที</p>
              </div>
            </div>

            {/* Back link */}
            <button
              onClick={() => setShowPayment(false)}
              className="flex items-center justify-center gap-2 text-[#6e595c] text-sm font-semibold hover:text-[#b7102a] transition-colors"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to preview
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-16 py-8 px-5 md:px-16 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-[#e4bebc]/30">
        <BrandLogo size="md" />
        <div className="flex gap-6 text-xs text-[#6e595c]">
          <a href="#" className="hover:text-[#b7102a] transition-colors">ข้อกำหนดการใช้งาน</a>
          <a href="#" className="hover:text-[#b7102a] transition-colors">นโยบายความเป็นส่วนตัว</a>
          <a href="#" className="hover:text-[#b7102a] transition-colors">ติดต่อเรา</a>
        </div>
        <p className="text-xs text-[#6e595c]">© 2024 Pixel Love. สร้างด้วยความรักเพื่อคนไทยทุกคน</p>
      </footer>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}