import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Content-Type': 'application/json' }
Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return new Response(JSON.stringify({ error: 'Sign-in required' }), { status: 401, headers: cors })
  const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } })
  const { data: userData } = await userClient.auth.getUser()
  if (!userData.user) return new Response(JSON.stringify({ error: 'Sign-in required' }), { status: 401, headers: cors })
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data, error } = await admin.from('applications').select('id, reference, created_at, course:courses(title), payment_transactions(status, bank_transfer_submissions(review_status, review_note))').eq('user_id', userData.user.id).order('created_at', { ascending: false })
  if (error) return new Response(JSON.stringify({ error: 'Unable to load applications' }), { status: 500, headers: cors })
  return new Response(JSON.stringify(data ?? []), { status: 200, headers: cors })
})
