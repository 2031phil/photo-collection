import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req) {
  try {
    const body = await req.json();
    const { days } = body;

    if (!days || typeof days !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const rows = Object.entries(days)
      .filter(([date, count]) =>
        /^\d{4}-\d{2}-\d{2}$/.test(date) &&
        Number.isInteger(count) &&
        count > 0 &&
        count < 10_000 // sanity limit
      )
      .map(([date, count]) => ({
        date,
        count,
        source: 'chrome_extension'
      }));

    if (rows.length === 0) {
      return NextResponse.json({ ok: true });
    }

    // Upsert & increment
    for (const row of rows) {
      await supabaseAdmin.rpc('increment_tab_count', {
        p_date: row.date,
        p_count: row.count,
        p_source: row.source
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('track-tabs error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}