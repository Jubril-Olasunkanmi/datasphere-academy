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
  if (!adminUser || !['admin', 'finance'].includes(adminUser.role)) return new Response(JSON.stringify({ error: 'Not authorised to review payments' }), { status: 403, headers: cors })
  const { application_id, decision, note } = await request.json()
  if (!application_id || !['approved', 'rejected'].includes(decision)) return new Response(JSON.stringify({ error: 'Application and decision are required' }), { status: 422, headers: cors })
  const transactionStatus = decision === 'approved' ? 'verified' : 'rejected'
  const { data: transaction } = await admin.from('payment_transactions').select('id, application:applications(first_name, email, reference)').eq('application_id', application_id).order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (!transaction) return new Response(JSON.stringify({ error: 'Payment submission not found' }), { status: 404, headers: cors })
  const { error: updateError } = await admin.from('payment_transactions').update({ status: transactionStatus, verified_by: decision === 'approved' ? userData.user.id : null, verified_at: decision === 'approved' ? new Date().toISOString() : null }).eq('id', transaction.id)
  if (updateError) return new Response(JSON.stringify({ error: 'Could not update payment status' }), { status: 400, headers: cors })
  await admin.from('bank_transfer_submissions').update({ review_status: decision, review_note: note ?? null, reviewed_at: new Date().toISOString() }).eq('payment_transaction_id', transaction.id)
  await admin.from('applications').update({ application_status: decision === 'approved' ? 'verified' : 'received' }).eq('id', application_id)
  await admin.from('admin_audit_logs').insert({ actor_id: userData.user.id, action: `payment_${decision}`, entity_type: 'payment_transaction', entity_id: transaction.id, metadata: { application_id, note: note ?? null } })
  let notificationSent = false
  const recipient = Array.isArray(transaction.application) ? transaction.application[0] : transaction.application
  const resendKey = Deno.env.get('RESEND_API_KEY')
  const fromEmail = Deno.env.get('FROM_EMAIL')
  if (resendKey && fromEmail && recipient?.email) {
    const subject = decision === 'approved' ? 'Payment verified — Datasphere Academy' : 'Update on your Datasphere Academy payment'
    const text = decision === 'approved' ? `Hi ${recipient.first_name}, your payment has been verified and your enrolment is confirmed. Reference: ${recipient.reference}.` : `Hi ${recipient.first_name}, we could not approve the payment receipt for reference ${recipient.reference}. ${note ?? 'Please contact the Academy for help.'}`
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: fromEmail, to: [recipient.email], subject, text }) })
    notificationSent = response.ok
  }
  return new Response(JSON.stringify({ status: transactionStatus, notification_sent: notificationSent, notification_configured: Boolean(resendKey && fromEmail) }), { status: 200, headers: cors })
})
