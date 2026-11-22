-- Editorial course rename keeps the legacy slug and all application/payment history intact.
update public.courses
set title = 'AI Automation & Agent Development',
    summary = 'Build AI-powered workflows, LLM apps and intelligent agents.',
    description = 'Build AI-powered workflows, integrate LLMs and APIs, and develop practical intelligent agents using n8n and Python.',
    duration_weeks = 8,
    standard_fee_minor = 6000000,
    updated_at = now()
where slug = 'ai-agent-developer';

insert into public.instructors (display_name, role, bio, verified, published) values
('Chimobi Maxwell', 'Data Scientist and BI Developer', null, false, false),
('Tobiloba Odukunle', 'Data Scientist and BI Developer', null, false, false),
('Teslim Olagoke', 'Machine Learning Engineer', null, false, false),
('Sodiq Adesina', 'Data Engineer', null, false, false),
('Agbons Ekata', 'Data Scientist and BI Developer', null, false, false)
on conflict do nothing;
