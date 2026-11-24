import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Content-Type': 'application/json' }

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: cors })
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return new Response(JSON.stringify({ error: 'Account sign-in is required' }), { status: 401, headers: cors })
  const body = await request.json()
  const reference = `DSA-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } })
  const { data: userData } = await userClient.auth.getUser()
  if (!userData.user) return new Response(JSON.stringify({ error: 'Account sign-in is required' }), { status: 401, headers: cors })
  const { data: course } = await admin.from('courses').select('id').eq('slug', body.course_slug).single()
  if (!course) return new Response(JSON.stringify({ error: 'Course not found' }), { status: 404, headers: cors })
  const { data: application, error } = await admin.from('applications').insert({ user_id: userData.user.id, reference, course_id: course.id, first_name: body.first_name, last_name: body.last_name, email: body.email, whatsapp: body.whatsapp, country: body.country, city_state: body.city_state, occupation: body.occupation, experience_level: body.experience_level, laptop_os: body.laptop_os, payment_option: body.payment_option, consent_at: new Date().toISOString() }).select('id, reference').single()
  if (error) return new Response(JSON.stringify({ error: 'Unable to save application' }), { status: 400, headers: cors })
  return new Response(JSON.stringify(application), { status: 201, headers: cors })
})
