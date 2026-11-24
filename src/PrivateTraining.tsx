import { useState } from 'react'
import { ArrowRight, Check, Clock3, MessageCircle, Send, Users } from 'lucide-react'
import { supabase } from './lib/supabase'
import './private-training.css'

const pathways = [
  'Data Analytics & BI',
  'Data Science & ML',
  'Data Engineering',
  'AI Engineering & LLM Apps',
  'AI Automation & Agent Development',
  'Bespoke Technical Mentorship',
]

type FormState = {
  name: string
  email: string
  country: string
  pathway: string
  experienceLevel: string
  learningGoal: string
  whatsapp: string
  cityTimezone: string
  preferredTimes: string
  intendedStartDate: string
  portfolioUrl: string
  extraDetails: string
  website: string
  consent: boolean
}

const initialForm: FormState = { name: '', email: '', country: '', pathway: pathways[0], experienceLevel: '', learningGoal: '', whatsapp: '', cityTimezone: '', preferredTimes: '', intendedStartDate: '', portfolioUrl: '', extraDetails: '', website: '', consent: false }

export function PrivateTrainingPage() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const setField = (field: keyof FormState, value: string | boolean) => setForm(current => ({ ...current, [field]: value }))
  const choosePathway = (pathway: string) => {
    setField('pathway', pathway)
    document.getElementById('private-consultation')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (!form.name.trim() || !form.email.trim() || !form.country.trim() || !form.pathway || !form.experienceLevel || !form.learningGoal.trim() || !form.consent) {
      setState('error')
      setError('Please complete the required fields and confirm the privacy notice.')
      return
    }
    if (!supabase) {
      setState('error')
      setError('The consultation form is temporarily unavailable because the Academy database is not configured on this deployment.')
      return
    }
    setState('loading')
    const { error: submitError } = await supabase.functions.invoke('submit-private-training-enquiry', { body: { ...form, name: form.name.trim(), email: form.email.trim().toLowerCase(), learningGoal: form.learningGoal.trim(), website: form.website.trim() } })
    if (submitError) {
      setState('error')
      setError(submitError.message || 'We could not send your request. Please try again or contact the Academy directly.')
      return
    }
    setState('success')
  }

  return <main className="private-training-page">
    <section className="private-hero"><div className="container private-hero-grid"><div className="private-hero-copy"><span className="private-eyebrow">DATASPHERE PRIVATE</span><h1>Exceptional guidance.<br /><em>Entirely yours.</em></h1><p>One-to-one online training in Data Analytics, Data Science, Data Engineering, AI Engineering and AI Automation — tailored to your goals, experience and schedule.</p><div className="private-hero-actions"><a className="private-button private-button-primary" href="#private-consultation">Request a private consultation <ArrowRight size={17} /></a><a className="private-button private-button-quiet" href="#private-pathways">Explore learning pathways <ArrowRight size={17} /></a></div><span className="private-supporting-detail">For professionals, career changers &amp; researchers</span></div><div className="private-hero-image-wrap"><img src="/images/private-training/one-to-one-mentoring.webp" alt="Illustration of a learner receiving individual online SQL instruction" width="960" height="640" loading="eager" /></div></div></section>

    <section className="private-section private-benefits"><div className="container"><div className="private-section-heading"><span className="private-eyebrow">WHY PRIVATE TRAINING</span><h2>A learning plan shaped around the work you want to do.</h2></div><div className="private-benefit-grid"><article><span>01</span><h3>Built around your goals</h3><p>Start from your context, then focus the learning on the skills and outcomes that matter most.</p></article><article><span>02</span><h3>Learn with experienced practitioners</h3><p>Get clear explanations and practical guidance from professionals who understand applied technology work.</p></article><article><span>03</span><h3>Projects, feedback &amp; progress</h3><p>Practise with real-world use cases, receive individual feedback and build with confidence.</p></article></div></div></section>

    <section className="private-section private-pathways" id="private-pathways"><div className="container"><div className="private-section-heading"><span className="private-eyebrow">LEARNING PATHWAYS</span><h2>Choose a direction. We’ll shape the route.</h2><p>Select a pathway to prefill the consultation request. We’ll review your goals before recommending scope, schedule and fee.</p></div><div className="private-pathway-list">{pathways.map((pathway, index) => <button key={pathway} className={form.pathway === pathway ? 'private-pathway selected' : 'private-pathway'} type="button" onClick={() => choosePathway(pathway)}><span>0{index + 1}</span><strong>{pathway}</strong><ArrowRight size={18} /></button>)}</div></div></section>

    <section className="private-section private-process"><div className="container"><div className="private-section-heading"><span className="private-eyebrow">HOW IT WORKS</span><h2>A clear conversation before any commitment.</h2></div><div className="private-process-grid">{['Tell us your goals', 'We recommend a learning plan', 'Agree schedule and quote', 'Start live individual training'].map((step, index) => <article key={step}><span>0{index + 1}</span><h3>{step}</h3><p>{['Share where you are, what you want to build and what you need next.', 'We use your context to suggest a focused pathway and realistic scope.', 'We confirm the details together in a tailored proposal.', 'Begin the agreed learning journey with individual support.'][index]}</p></article>)}</div></div></section>

    <section className="private-section private-audience"><div className="container private-audience-grid"><div><span className="private-eyebrow">WHO IT IS FOR</span><h2>Focused support for a specific next move.</h2></div><div className="private-audience-copy"><p><strong>Career changers</strong> who want a structured path into data or AI.</p><p><strong>Working professionals</strong> who need to apply new technical skills to real work.</p><p><strong>Researchers and teams</strong> who need bespoke technical mentorship for a defined project.</p></div></div></section>

    <section className="private-section private-pricing"><div className="container private-pricing-card"><div><span className="private-eyebrow">PRIVATE ENGAGEMENT</span><h2>From <strong>₦200,000</strong></h2><p>Your final quote depends on learning goals, scope, duration and mentor availability. Exact pricing is shared in a proposal after review.</p></div><a className="private-button private-button-primary" href="#private-consultation">Request a tailored quote <ArrowRight size={17} /></a></div></section>

    <section className="private-section private-consultation" id="private-consultation"><div className="container private-consultation-grid"><div className="private-form-intro"><span className="private-eyebrow">START WITH A CONVERSATION</span><h2>Tell us what you want to achieve.</h2><p>Send a few details and the Academy will review your request. This is not an appointment booking or a confirmed enrolment.</p><div className="private-contact-links"><a href="mailto:Datasphereacademy@gmail.com"><Send size={16} /> Datasphereacademy@gmail.com</a><a href="https://wa.me/2348108672692" target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp the Academy</a></div></div><form className="private-form" onSubmit={submit} noValidate><div className="private-form-grid"><label>Full name *<input required value={form.name} onChange={event => setField('name', event.target.value)} /></label><label>Email address *<input required type="email" value={form.email} onChange={event => setField('email', event.target.value)} /></label><label>Country *<input required value={form.country} onChange={event => setField('country', event.target.value)} placeholder="Nigeria, United Kingdom..." /></label><label>Preferred pathway *<select required value={form.pathway} onChange={event => setField('pathway', event.target.value)}>{pathways.map(pathway => <option key={pathway}>{pathway}</option>)}</select></label><label>Current experience level *<select required value={form.experienceLevel} onChange={event => setField('experienceLevel', event.target.value)}><option value="">Select one</option><option>New to the field</option><option>Some experience</option><option>Working professional</option><option>Experienced practitioner</option></select></label><label>WhatsApp number <input value={form.whatsapp} onChange={event => setField('whatsapp', event.target.value)} placeholder="+234..." /></label><label className="private-wide">Learning goal *<textarea required rows={3} value={form.learningGoal} onChange={event => setField('learningGoal', event.target.value)} placeholder="What would you like to learn, build or improve?" /></label><label>City / time zone <input value={form.cityTimezone} onChange={event => setField('cityTimezone', event.target.value)} placeholder="Lagos / GMT+1" /></label><label>Preferred days / times <input value={form.preferredTimes} onChange={event => setField('preferredTimes', event.target.value)} placeholder="Weekday evenings..." /></label><label>Intended start date <input type="date" value={form.intendedStartDate} onChange={event => setField('intendedStartDate', event.target.value)} /></label><label>Portfolio or project URL <input type="url" value={form.portfolioUrl} onChange={event => setField('portfolioUrl', event.target.value)} placeholder="https://..." /></label><label className="private-wide">Additional context <textarea rows={3} value={form.extraDetails} onChange={event => setField('extraDetails', event.target.value)} /></label><label className="private-honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={event => setField('website', event.target.value)} /></label><label className="private-consent private-wide"><input required type="checkbox" checked={form.consent} onChange={event => setField('consent', event.target.checked)} /> I agree that Datasphere Academy may use these details to review my request and contact me about private training.</label></div>{state === 'error' && <div className="private-form-message error" role="alert">{error}</div>}{state === 'success' ? <div className="private-form-message success" role="status"><Check size={19} /> Request received. The Academy will review it and follow up manually.</div> : <button className="private-button private-button-primary private-submit" type="submit" disabled={state === 'loading'}>{state === 'loading' ? 'Sending request...' : 'Send consultation request'} <ArrowRight size={17} /></button>}</form></div></section>

    <section className="private-section private-faq"><div className="container"><div className="private-section-heading"><span className="private-eyebrow">QUESTIONS, ANSWERED</span><h2>Private training, made clear.</h2></div><div className="private-faq-list"><details><summary>How is training delivered?</summary><p>Sessions are delivered online, live and individually. The exact format is agreed after we understand your goals.</p></details><details><summary>Can you work with international clients?</summary><p>Yes. The Academy serves learners in Nigeria and internationally. We’ll discuss time zones and scheduling during the consultation.</p></details><details><summary>How is this different from a cohort?</summary><p>Private training is shaped around your goals, pace, project context and feedback needs rather than a shared cohort curriculum.</p></details><details><summary>How does pricing work?</summary><p>Private training starts from ₦200,000. The final quote depends on scope, duration, learning goals and mentor availability.</p></details><details><summary>What happens after I submit the form?</summary><p>Your request is reviewed manually. The Academy will contact you with follow-up questions or a proposed learning plan. Submitting the form does not book an appointment.</p></details></div></div></section>
  </main>
}
