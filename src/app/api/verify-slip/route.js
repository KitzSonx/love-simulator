import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseServer';

const SLIPOK_API_KEY = process.env.SLIPOK_API_KEY;
const SLIPOK_BRANCH_ID = process.env.SLIPOK_BRANCH_ID;
// Placeholder for bank account name validation. Set this to your actual bank account name to enable validation.
const EXPECTED_RECEIVER_NAME = ''; 

export async function POST(req) {
  try {
    const formData = await req.formData();
    const orderId = formData.get('orderId');
    const file = formData.get('files');

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'Missing slip image file' }, { status: 400 });
    }

    if (!SLIPOK_API_KEY || !SLIPOK_BRANCH_ID) {
      console.error('Missing SlipOK credentials');
      return NextResponse.json({ error: 'System configuration error' }, { status: 500 });
    }

    const supabase = getServerSupabase();
    
    // 1. Fetch order to verify price
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, price, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: orderError?.message || 'Order not found' }, { status: 404 });
    }

    if (order.status === 'paid') {
      return NextResponse.json({ success: true, alreadyPaid: true });
    }

    const expectedAmount = Number(order.price ?? 99);

    // 2. Prepare request to SlipOK API
    const slipFormData = new FormData();
    slipFormData.append('files', file);
    slipFormData.append('amount', expectedAmount.toString());
    slipFormData.append('log', 'true'); // For duplicate checking and logging

    // 3. Call SlipOK API
    const slipOkResponse = await fetch(`https://api.slipok.com/api/line/apikey/${SLIPOK_BRANCH_ID}`, {
      method: 'POST',
      headers: {
        'x-authorization': SLIPOK_API_KEY,
      },
      body: slipFormData,
    });

    const slipResult = await slipOkResponse.json();

    if (!slipOkResponse.ok || !slipResult.success) {
      console.error('SlipOK API error', slipResult);
      // Determine user-friendly error message based on common error patterns (adapt based on actual SlipOK error codes)
      let errorMessage = 'การตรวจสอบสลิปไม่สำเร็จ โปรดตรวจสอบว่าสลิปถูกต้องและอัปโหลดอีกครั้ง';
      if (slipResult.data?.message) {
         errorMessage = slipResult.data.message;
      }
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const slipData = slipResult.data;

    // 4. Validate Amount (Double check even though we passed amount to API)
    if (slipData.amount && Number(slipData.amount) !== expectedAmount) {
        return NextResponse.json({ error: `ยอดเงินไม่ถูกต้อง (คาดหวัง ${expectedAmount} บาท แต่โอนมา ${slipData.amount} บาท)` }, { status: 400 });
    }

    // 5. Validate Receiver Name (Optional but recommended)
    if (EXPECTED_RECEIVER_NAME && slipData.receiver?.name) {
        // Simple includes check to handle formatting differences (e.g. "MR. JOHN DOE" vs "JOHN DOE")
        if (!slipData.receiver.name.toLowerCase().includes(EXPECTED_RECEIVER_NAME.toLowerCase())) {
             return NextResponse.json({ error: 'ชื่อบัญชีผู้รับไม่ถูกต้อง' }, { status: 400 });
        }
    }

    // 6. Double spending protection: Check if transRef already exists in paid orders
    const transRef = slipData.transRef;
    if (transRef) {
        // Need to add slip_trans_ref column to your orders table if not exists, for now we will query it if it's there or just update if we assume uniqueness is handled by log:true on SlipOK side.
        // SlipOK with log:true should handle duplicate slips (error 1014 or similar), but it's good to check locally if possible.
        // Assuming we might not have slip_trans_ref column yet, we will skip explicit local duplicate check and rely on SlipOK's log:true for now, or you can add the column to Supabase.
        // For robust implementation, consider adding 'slip_trans_ref' column with UNIQUE constraint to Supabase.
    }

    // 7. Update Order in Supabase
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
          status: 'paid', 
          paid_at: new Date().toISOString(),
          // slip_trans_ref: transRef // uncomment if you add this column
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to update order status', updateError);
      return NextResponse.json({ error: 'อัปเดตสถานะคำสั่งซื้อไม่สำเร็จ โปรดติดต่อแอดมิน' }, { status: 500 });
    }

    return NextResponse.json({ success: true, orderId: orderId });

  } catch (err) {
    console.error('Slip verification error', err);
    return NextResponse.json({ error: err?.message || 'เกิดข้อผิดพลาดในการตรวจสอบสลิป' }, { status: 500 });
  }
}
