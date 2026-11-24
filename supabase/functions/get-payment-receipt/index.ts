import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Content-Type': 'application/json' }

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: cors })

  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return new Response(JSON.stringify({ error: 'Authentication required' }), { status: 401, headers: cors })

  const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } })
  const { data: userData } = await userClient.auth.getUser()
  if (!userData.user) return new Response(JSON.stringify({ error: 'Authentication required' }), { status: 401, headers: cors })

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data: adminUser } = await admin.from('admin_users').select('role').eq('user_id', userData.user.id).maybeSingle()
  if (!adminUser || !['admin', 'finance'].includes(adminUser.role)) return new Response(JSON.stringify({ error: 'Not authorised to view payment receipts' }), { status: 403, headers: cors })

  const { receipt_path } = await request.json()
  if (!receipt_path || typeof receipt_path !== 'string') return new Response(JSON.stringify({ error: 'Receipt path is required' }), { status: 422, headers: cors })

  const { data, error } = await admin.storage.from('payment-receipts').createSignedUrl(receipt_path, 600)
  if (error || !data?.signedUrl) return new Response(JSON.stringify({ error: error?.message ?? 'Receipt file not found' }), { status: 404, headers: cors })
  return new Response(JSON.stringify({ signedUrl: data.signedUrl }), { status: 200, headers: cors })
})
