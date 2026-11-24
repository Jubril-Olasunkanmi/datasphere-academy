import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Content-Type': 'application/json' }

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: cors })
  const { reference } = await request.json()
  if (!reference) return new Response(JSON.stringify({ error: 'Reference is required' }), { status: 422, headers: cors })
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data, error } = await admin.from('applications').select('reference, first_name, application_status, payment_transactions(status, bank_transfer_submissions(review_status, review_note))').eq('reference', String(reference).trim()).maybeSingle()
  if (error || !data) return new Response(JSON.stringify({ error: 'Application not found' }), { status: 404, headers: cors })
  const transactions = Array.isArray(data.payment_transactions) ? data.payment_transactions : []
  const transaction = transactions[transactions.length - 1]
  const submission = transaction?.bank_transfer_submissions?.[0]
  return new Response(JSON.stringify({ reference: data.reference, first_name: data.first_name, application_status: data.application_status, payment_status: transaction?.status ?? 'pending', review_status: submission?.review_status ?? 'pending', review_note: submission?.review_note ?? null }), { status: 200, headers: cors })
})
