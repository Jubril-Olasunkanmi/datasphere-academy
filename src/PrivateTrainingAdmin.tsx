import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from './lib/supabase'

type Enquiry = {
  id: string
  name: string
  email: string
  whatsapp: string | null
  country: string | null
  pathway: string | null
  experience_level: string | null
  learning_goal: string | null
  city_timezone: string | null
  preferred_times: string | null
  intended_start_date: string | null
  portfolio_url: string | null
  extra_details: string | null
  status: string | null
  created_at: string
}

const label = (value: string | null | undefined) => value?.trim() || 'Not provided'

export function PrivateTrainingAdmin() {
  const [session, setSession] = useState<any>(null)
  const [rows, setRows] = useState<Enquiry[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    if (!supabase) return
    setBusy(true)
    setError('')
    const { data, error: queryError } = await supabase
      .from('enquiries')
      .select('id, name, email, whatsapp, country, pathway, experience_level, learning_goal, city_timezone, preferred_times, intended_start_date, portfolio_url, extra_details, status, created_at')
      .eq('kind', 'private_training')
      .order('created_at', { ascending: false })
    if (queryError) setError(queryError.message)
    else setRows((data ?? []) as Enquiry[])
    setBusy(false)
  }

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) load()
  }, [session])

  if (!supabase) {
    return <section className="section"><div className="container narrow"><h1>Supabase is not configured.</h1><p className="muted">Add the production Supabase environment variables before opening the admin queue.</p></div></section>
  }

  if (!session) {
    return <section className="section"><div className="container narrow"><h1>Sign in required.</h1><p className="muted">Use the Academy admin account to review private-training requests.</p><Link className="button primary" to="/admin">Go to admin sign in</Link></div></section>
  }

  return <section className="section"><div className="container dashboard">
    <div className="dashboard-top"><div><span className="section-label">PRIVATE TRAINING</span><h1>Consultation requests</h1><p className="muted">Review new enquiries, then contact each learner to agree scope, schedule and price.</p></div><div className="admin-actions"><button className="button ghost" disabled={busy} onClick={load}>{busy ? 'Refreshing…' : 'Refresh'}</button><button className="button ghost" onClick={() => supabase!.auth.signOut()}>Sign out</button></div></div>
    {error && <div className="form-error">{error}</div>}
    <div className="metric-grid"><div className="metric"><span>Requests</span><strong>{rows.length}</strong><small>Private training</small></div><div className="metric"><span>Latest request</span><strong>{rows[0] ? new Date(rows[0].created_at).toLocaleDateString() : '—'}</strong><small>Most recent enquiry</small></div><div className="metric"><span>Follow-up</span><strong>Manual</strong><small>Contact after review</small></div></div>
    <div className="admin-table private-training-queue"><div className="table-head"><strong>Enquiries</strong><span>{busy ? 'Refreshing…' : 'Live'}</span></div>
      {rows.length === 0 && <div className="table-row"><span>No private-training enquiries yet.</span></div>}
      {rows.map(row => <article className="private-training-enquiry" key={row.id}>
        <div className="private-training-enquiry-top"><div><strong>{row.name}</strong><small>{row.email} · {label(row.country)} · {new Date(row.created_at).toLocaleString()}</small></div><span className="status-pill">{label(row.status)}</span></div>
        <div className="private-training-enquiry-grid"><div><small>Pathway</small><strong>{label(row.pathway)}</strong></div><div><small>Experience</small><strong>{label(row.experience_level)}</strong></div><div><small>Start date</small><strong>{row.intended_start_date ? new Date(row.intended_start_date).toLocaleDateString() : 'Flexible'}</strong></div><div><small>Timezone / city</small><strong>{label(row.city_timezone)}</strong></div></div>
        <p><b>Learning goal:</b> {label(row.learning_goal)}</p>
        {row.preferred_times && <p><b>Preferred times:</b> {row.preferred_times}</p>}
        {row.extra_details && <p><b>Additional details:</b> {row.extra_details}</p>}
        <div className="private-training-enquiry-actions"><a className="text-link-button" href={`mailto:${row.email}?subject=Datasphere Academy private training enquiry`}>Email learner</a>{row.whatsapp && <a className="text-link-button" href={`https://wa.me/${row.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">WhatsApp</a>}{row.portfolio_url && <a className="text-link-button" href={row.portfolio_url} target="_blank" rel="noreferrer">View portfolio</a>}</div>
      </article>)}
    </div>
  </div></section>
}
