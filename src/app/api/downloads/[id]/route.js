import { supabase } from '@/lib/supabaseClient';

export async function POST(request, { params }) {
  const id = params.id;

  // Try to increment count
  const { data, error } = await supabase
    .from('downloads')
    .upsert({ image_id: id, count: 1 }, { onConflict: 'image_id', ignoreDuplicates: false })
    .select();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Increment count
  const updated = await supabase.rpc('increment_download_count', { target_id: id });

  if (updated.error) {
    return new Response(JSON.stringify({ error: updated.error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ message: 'Download recorded' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}