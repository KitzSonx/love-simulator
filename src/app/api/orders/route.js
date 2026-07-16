import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseServer';

export async function POST(req) {
  const body = await req.json();

  try {
    const sb = getServerSupabase();
    const { data, error } = await sb.from('orders').insert(body).select('id').single();

    if (error) {
      console.error('Server supabase insert error', error);
      return NextResponse.json({ error: error.message || error }, { status: 400 });
    }

    return NextResponse.json({ id: data.id }, { status: 200 });
  } catch (err) {
    console.error('Unexpected server error when inserting order', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
