import { supabase } from '@/lib/supabaseClient';

export async function POST(request, { params }) {
  const id = params.id;

  // Step 1: Check if record exists
  const { data: existing, error: selectError } = await supabase
    .from('downloads')
    .select('count')
    .eq('image_id', id)
    .single();

  if (selectError && selectError.code !== 'PGRST116') {
    // PGRST116 = no rows found, safe to ignore
    return new Response(JSON.stringify({ error: selectError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Step 2: If not found, insert initial record
  if (!existing) {
    const { error: insertError } = await supabase
      .from('downloads')
      .insert({ image_id: id, count: 1 });

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ message: 'Download recorded (new)', count: 1 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Step 3: Increment count
  const { data: incremented, error: rpcError } = await supabase
    .rpc('increment_download_count', { target_id: id });

  if (rpcError) {
    return new Response(JSON.stringify({ error: rpcError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ message: 'Download recorded (incremented)', count: incremented }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}