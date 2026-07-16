import { createClient } from '@supabase/supabase-js';
import { TEMPLATES } from '@/lib/templateRegistry';
import { notFound } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function RealGamePage({ params }) {
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
    notFound();
  }

  const templateId = order.template_id;
  const TemplateComponent = TEMPLATES[templateId];

  if (!TemplateComponent) {
    notFound();
  }

  // Minimal layout: full-bleed, no header/controls — just the game
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      <div style={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '720px', borderRadius: 0, overflow: 'hidden' }}>
          <TemplateComponent orderData={order} fullscreenMode={true} />
        </div>
      </div>
    </div>
  );
}
