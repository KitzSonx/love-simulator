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
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-900">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-500 text-2xl">⚠️</div>
          <h1 className="text-xl font-bold text-slate-800">ไม่พบรูปแบบเทมเพลต</h1>
          <p className="mt-2 text-sm text-slate-600">เทมเพลตที่คุณเลือกอาจถูกยกเลิกหรือไม่มีอยู่ในระบบ</p>
          <Link href="/create" className="mt-6 inline-block rounded-2xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
            กลับไปเลือกเทมเพลตใหม่
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 py-8 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-3xl">
        
        {/* Header แบนเนอร์ด้านบน - โทนสว่าง คลีน */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 text-center">
          <span className="inline-block rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-pink-600 mb-2">
            PREVIEW MODE (โหมดทดลองเล่น)
          </span>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">ตัวอย่างเกมของคุณ</h1>
          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            นี่คือมุมมองจริงที่แฟนของคุณจะได้เห็น ลองเล่นดูให้แน่ใจก่อนตัดสินใจชำระเงินนะ ❤️
          </p>
        </div>

        {/* ปุ่ม Navigation แถบนำทาง */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/checkout/${order.id}`}
            className="flex-1 max-w-xs mx-auto sm:mx-0 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-400"
          >
            ← ย้อนกลับ
          </Link>
          <Link
            href={`/checkout/${order.id}?action=pay`}
            className="flex-1 max-w-xs mx-auto sm:mx-0 rounded-2xl bg-emerald-500 px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600"
          >
            ชำระเงิน ({order.price || 99}.-) →
          </Link>
        </div>

        {/* กรอบจำลองหน้าจอมือถือ (Mockup Frame) */}
        <div className="mt-8 flex flex-col items-center">
          <div className="w-full max-w-[420px] rounded-[40px] border-8 border-slate-800 bg-slate-900 p-2 shadow-2xl ring-1 ring-slate-900/5">
            {/* รอยแหว่งลำโพงมือถือ (Speaker Notch) เพื่อความสมจริง */}
            <div className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-slate-800"></div>
            
            {/* พื้นที่แสดงผลเกมจริง */}
            <div className="w-full overflow-hidden rounded-[30px] bg-white min-h-[600px] flex flex-col justify-center relative">
              <TemplateComponent orderData={order} />
            </div>
          </div>
          
          <p className="mt-4 text-xs text-slate-400 text-center">
            💡 หมายเหตุ: หน้าเว็บจริงสำหรับส่งให้แฟนจะได้ดูแบบเต็มจอ
          </p>
        </div>

      </div>
    </main>
  );
}