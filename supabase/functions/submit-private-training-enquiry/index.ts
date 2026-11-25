import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

const text = (value: unknown, max = 2000) => String(value ?? '').trim().slice(0, max)

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  try {
    const body = await request.json()
    if (text(body.website, 200)) return json({ ok: true })
    const name = text(body.name, 120)
    const email = text(body.email, 180).toLowerCase()
    const country = text(body.country, 100)
    const pathway = text(body.pathway, 120)
    const experienceLevel = text(body.experienceLevel, 80)
    const learningGoal = text(body.learningGoal, 3000)
    const consent = Boolean(body.consent)
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !country || !pathway || !experienceLevel || !learningGoal || !consent) return json({ error: 'Please complete all required fields.' }, 400)
    const url = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !serviceKey) return json({ error: 'The private training enquiry service is not configured.' }, 503)
    const admin = createClient(url, serviceKey)
    const recentCutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const { data: recent } = await admin.from('enquiries').select('id').eq('kind', 'private_training').eq('email', email).gte('created_at', recentCutoff).limit(1)
    if (recent?.length) return json({ error: 'A recent request is already being reviewed for this email address.' }, 429)
    const whatsapp = text(body.whatsapp, 50)
    const cityTimezone = text(body.cityTimezone, 100)
    const preferredTimes = text(body.preferredTimes, 180)
    const intendedStartDate = text(body.intendedStartDate, 20)
    const portfolioUrl = text(body.portfolioUrl, 500)
    const extraDetails = text(body.extraDetails, 3000)
    const { error } = await admin.from('enquiries').insert({ kind: 'private_training', name, email, whatsapp, country, pathway, experience_level: experienceLevel, learning_goal: learningGoal, city_timezone: cityTimezone, preferred_times: preferredTimes, intended_start_date: intendedStartDate || null, portfolio_url: portfolioUrl, extra_details: extraDetails, message: learningGoal, consent_at: new Date().toISOString() })
    if (error) return json({ error: 'We could not save your request.' }, 500)
    const resendKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('FROM_EMAIL')
    const notificationEmail = Deno.env.get('PRIVATE_TRAINING_NOTIFICATION_EMAIL')
    let notificationSent = false
    if (resendKey && fromEmail && notificationEmail) {
      const notification = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromEmail,
          to: [notificationEmail],
          reply_to: email,
          subject: `New private training request from ${name}`,
          text: [`Name: ${name}`, `Email: ${email}`, `WhatsApp: ${whatsapp || 'Not provided'}`, `Country: ${country}`, `Pathway: ${pathway}`, `Experience: ${experienceLevel}`, `Learning goal: ${learningGoal}`, `City / timezone: ${cityTimezone || 'Not provided'}`, `Preferred times: ${preferredTimes || 'Not provided'}`, `Intended start date: ${intendedStartDate || 'Flexible'}`, `Portfolio: ${portfolioUrl || 'Not provided'}`, `Additional details: ${extraDetails || 'Not provided'}`].join('\n')
        })
      })
      notificationSent = notification.ok
    }
    return json({ ok: true, notification_configured: Boolean(resendKey && fromEmail && notificationEmail), notification_sent: notificationSent })
  } catch {
    return json({ error: 'Invalid request.' }, 400)
  }
})
