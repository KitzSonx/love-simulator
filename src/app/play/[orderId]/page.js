import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { TEMPLATES } from '@/lib/templateRegistry';
import { notFound } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function PlayOrderPage({ params }) {
  let p = params;
  if (p && typeof p.then === 'function') p = await p;
  const orderId = p?.orderId;

  if (!orderId) {
    notFound();
  }

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY on server');
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    console.error('Order fetch error:', error);
    if (process.env.NODE_ENV === 'development') {
      const TemplateComponent = TEMPLATES['retro-8bit'];
      return (
        <main className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-slate-200">
            <TemplateComponent orderData={null} />
          </div>
        </main>
      );
    }
    notFound();
  }

  const templateId = order.template_id;
  const TemplateComponent = TEMPLATES[templateId];

  if (!TemplateComponent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f9fa] p-6 text-[#191c1d]" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
        <div className="w-full max-w-md rounded-3xl border border-[#e4bebc]/40 bg-white/80 backdrop-blur-xl p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f8dbdf] text-[#b7102a] text-2xl">⚠️</div>
          <h1 className="text-xl font-bold text-[#191c1d]">ไม่พบรูปแบบเทมเพลต</h1>
          <p className="mt-2 text-sm text-[#6e595c]">เทมเพลตที่คุณเลือกอาจถูกยกเลิกหรือไม่มีอยู่ในระบบ</p>
          <Link href="/create" className="mt-6 inline-block rounded-full bg-[#b7102a] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#92001c] transition">
            กลับไปเลือกเทมเพลตใหม่
          </Link>
        </div>
      </main>
    );
  }

  const price = order.price || 49;

  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] min-h-screen overflow-x-hidden relative" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#f8dbdf] rounded-full mix-blend-multiply filter blur-[120px] opacity-30" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ffb3b1] rounded-full mix-blend-multiply filter blur-[120px] opacity-30" />
      </div>

      {/* Sticky Top Bar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-5 md:px-16 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={`/checkout/${order.id}`} className="flex items-center gap-2 text-[#6e595c] hover:text-[#b7102a] transition-colors group">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              <span className="hidden md:inline font-bold text-sm">ย้อนกลับ</span>
            </Link>
            <div className="h-6 w-[1px] bg-[#e4bebc]/50 hidden md:block" />
            <div className="flex flex-col md:flex-row md:items-center md:gap-2">
              <span className="text-xs font-bold text-[#b7102a] tracking-widest uppercase">PREVIEW MODE</span>
              <span className="hidden md:inline text-[#6e595c]/30">•</span>
              <span className="text-sm text-[#6e595c] hidden md:inline">จำลองประสบการณ์การส่งความรัก</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/checkout/${order.id}?action=pay`}
              className="bg-[#b7102a] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-[#b7102a]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Proceed to Checkout ({price}฿)</span>
              <span className="material-symbols-outlined text-lg">shopping_cart</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-28 pb-16 px-5 flex flex-col items-center justify-center min-h-screen">
        {/* Mobile Frame Container */}
        <div className="relative w-full max-w-[360px] md:max-w-[420px] mx-auto">
          {/* Decorative Glow Behind Phone */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-[#b7102a]/20 to-[#d5e3ff]/20 blur-3xl opacity-50 rounded-full pointer-events-none" />

          {/* Physical Phone Frame */}
          <div className="relative w-full bg-[#191c1d] rounded-[3rem] border-[8px] border-[#191c1d] shadow-2xl p-1 overflow-hidden">
            {/* Screen Content */}
            <div className="w-full bg-white rounded-[2.5rem] overflow-hidden relative flex flex-col min-h-[640px]">
              {/* Top Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-[#191c1d] rounded-b-2xl z-30 pointer-events-none" />

              {/* Interactive Game Component */}
              <div className="w-full flex-1 flex flex-col overflow-y-auto">
                <TemplateComponent orderData={order} />
              </div>
            </div>
          </div>

          {/* Side Tooltips (Desktop Only) */}
          <div className="hidden lg:block absolute -right-52 top-1/4 w-44">
            <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-4 rounded-2xl text-left shadow-lg">
              <span className="material-symbols-outlined text-[#b7102a] mb-2 text-2xl">touch_app</span>
              <h3 className="font-bold text-sm text-[#191c1d] mb-1">Interactive</h3>
              <p className="text-xs text-[#6e595c] leading-snug">ลองกดปุ่มในหน้าจอเพื่อทดสอบระบบจำลอง</p>
            </div>
          </div>
          <div className="hidden lg:block absolute -left-52 bottom-1/4 w-44">
            <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-4 rounded-2xl text-left shadow-lg">
              <span className="material-symbols-outlined text-[#b7102a] mb-2 text-2xl">palette</span>
              <h3 className="font-bold text-sm text-[#191c1d] mb-1">Themes</h3>
              <p className="text-xs text-[#6e595c] leading-snug">ปรับแต่งสีและบรรยากาศได้ตามความชอบ</p>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-12 text-center max-w-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-[#191c1d] mb-3">
            ตรวจสอบความพร้อมก่อนส่งจริง
          </h2>
          <p className="text-sm md:text-base text-[#6e595c] mb-8 leading-relaxed">
            นี่คือสิ่งที่จะปรากฏบนหน้าจอของคนที่คุณรัก <br className="hidden md:block" />
            คุณสามารถปรับแต่งข้อความและรูปภาพเพิ่มเติมได้ในหน้าชำระเงิน
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 rounded-full bg-white/70 border border-[#e4bebc]/30 text-[#6e595c] font-semibold text-xs flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-base text-[#b7102a]">security</span>
              ระบบความปลอดภัยสูง
            </span>
            <span className="px-4 py-2 rounded-full bg-white/70 border border-[#e4bebc]/30 text-[#6e595c] font-semibold text-xs flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-base text-[#b7102a]">bolt</span>
              ส่งทันทีภายใน 5 วินาที
            </span>
          </div>
        </div>
      </main>

      {/* Simple Minimal Footer */}
      <footer className="w-full py-8 px-5 md:px-16 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-[#e4bebc]/30 bg-white/40 backdrop-blur-sm relative z-10">
        <div className="text-xs text-[#6e595c] font-medium">
          © 2024 Pixel Love. สร้างด้วยความรักเพื่อคนไทยทุกคน
        </div>
        <div className="flex gap-6 text-xs text-[#6e595c]">
          <a className="hover:text-[#b7102a] transition-all" href="#">ข้อกำหนดการใช้งาน</a>
          <a className="hover:text-[#b7102a] transition-all" href="#">นโยบายความเป็นส่วนตัว</a>
          <a className="hover:text-[#b7102a] transition-all" href="#">ติดต่อเรา</a>
        </div>
      </footer>
    </div>
  );
}