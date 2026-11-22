import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Content-Type': 'application/json' }

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: cors })
  const form = await request.formData()
  const applicationId = String(form.get('application_id') ?? '')
  const receipt = form.get('receipt')
  if (!applicationId || !(receipt instanceof File) || receipt.size === 0) return new Response(JSON.stringify({ error: 'Application and receipt are required' }), { status: 422, headers: cors })
  if (receipt.size > 8 * 1024 * 1024) return new Response(JSON.stringify({ error: 'Receipt must be smaller than 8 MB' }), { status: 413, headers: cors })
  if (!['image/png', 'image/jpeg', 'application/pdf'].includes(receipt.type)) return new Response(JSON.stringify({ error: 'Receipt must be a PNG, JPEG or PDF' }), { status: 415, headers: cors })
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data: application } = await admin.from('applications').select('id, course:courses(standard_fee_minor)').eq('id', applicationId).single()
  if (!application) return new Response(JSON.stringify({ error: 'Application not found' }), { status: 404, headers: cors })
  const safeName = receipt.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-120)
  const receiptPath = `${application.id}/${crypto.randomUUID()}-${safeName}`
  const { error: uploadError } = await admin.storage.from('payment-receipts').upload(receiptPath, new Uint8Array(await receipt.arrayBuffer()), { contentType: receipt.type, upsert: false })
  if (uploadError) return new Response(JSON.stringify({ error: 'Unable to store payment receipt' }), { status: 400, headers: cors })
  const courseFee = Array.isArray(application.course) ? application.course[0]?.standard_fee_minor : application.course?.standard_fee_minor
  const amountMinor = Number(form.get('amount_minor') ?? 0) || Number(courseFee ?? 0)
  const { data: transaction, error: transactionError } = await admin.from('payment_transactions').insert({ application_id: application.id, amount_minor: amountMinor, status: 'submitted', provider: 'bank_transfer' }).select('id').single()
  if (transactionError) return new Response(JSON.stringify({ error: 'Unable to create payment submission' }), { status: 400, headers: cors })
  const { error } = await admin.from('bank_transfer_submissions').insert({ payment_transaction_id: transaction.id, receipt_path: receiptPath })
  if (error) return new Response(JSON.stringify({ error: 'Unable to save payment evidence' }), { status: 400, headers: cors })
  return new Response(JSON.stringify({ status: 'awaiting_verification' }), { status: 201, headers: cors })
})
