import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseServer';
import generatePayload from 'promptpay-qr';
import qrcode from 'qrcode';

const promptpayNumber = process.env.NEXT_PUBLIC_PROMPTPAY_NUMBER;

function getAmount(order) {
  const amount = Number(order?.price ?? 99);
  return Number.isFinite(amount) && amount >= 0 ? amount : 99;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const orderId = body?.orderId;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    if (!promptpayNumber) {
      console.error('Missing NEXT_PUBLIC_PROMPTPAY_NUMBER env');
      return NextResponse.json({ error: 'System configuration error' }, { status: 500 });
    }

    const supabase = getServerSupabase();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, price, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: orderError?.message || 'Order not found' }, { status: 404 });
    }

    if (order.status === 'paid') {
      return NextResponse.json({
        ok: true,
        alreadyPaid: true,
      });
    }

    const amount = getAmount(order);
    
    // Generate PromptPay payload
    const payload = generatePayload(promptpayNumber, { amount });
    
    // Convert to QR Code Data URL
    const qrDataUrl = await qrcode.toDataURL(payload, {
        width: 400,
        margin: 2,
        color: {
            dark: '#0f172a', // Slate-900
            light: '#ffffff'
        }
    });

    return NextResponse.json({
      ok: true,
      amount,
      currency: 'THB',
      qrCode: qrDataUrl,
      sourceType: 'promptpay',
    });
  } catch (err) {
    console.error('Checkout error', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
