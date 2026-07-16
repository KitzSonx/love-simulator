import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseServer';

export async function GET(req, ctx) {
  let params = ctx?.params;
  // support Next.js versions where params may be a Promise
  if (params && typeof params.then === 'function') params = await params;

  const id = params?.id;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const sb = getServerSupabase();
    const { data, error } = await sb.from('orders').select('*').eq('id', id).single();

    if (error) {
      console.error('Server supabase fetch error', error);
      return NextResponse.json({ error: error.message || error }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error('Unexpected server error when fetching order', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
