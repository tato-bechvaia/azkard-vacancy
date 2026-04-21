const Anthropic = require('@anthropic-ai/sdk');
const supabase = require('../supabase');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a helpful assistant for the Azkard job platform — a Georgian job marketplace.

You have access to the LIVE list of active jobs and companies on the platform (injected below each message as [PLATFORM DATA]).

Your capabilities:
- Suggest specific jobs or companies from the platform data that match what the user is looking for
- When suggesting jobs, ALWAYS include a clickable link using this markdown format: [Job Title](URL)
- When suggesting companies, link to them if a URL is provided
- Answer questions about how the platform works
- Help with filtering jobs by salary, category, location, regime (remote/hybrid/full-time), etc.

Rules:
- Only answer questions about Azkard and job-related topics. Politely refuse anything off-topic.
- When the user asks for jobs matching criteria (salary, category, location, etc.), scan the platform data and suggest the best matches.
- If no jobs match, say so honestly and suggest broadening the search.
- Respond in the same language the user writes in (Georgian or English).
- Keep answers concise. When listing jobs, show max 5 at a time unless asked for more.`;

async function buildPlatformContext() {
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, salary_min, salary_max, currency, location, job_regime, category, employer_profiles!employer_profile_id(company_name)')
    .eq('status', 'HIRING')
    .order('created_at', { ascending: false })
    .limit(80);

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const jobLines = (jobs || []).map(j => {
    const salary = j.salary_max
      ? `${j.salary_min}–${j.salary_max} ${j.currency}`
      : `${j.salary_min}+ ${j.currency}`;
    const location = j.location || 'not specified';
    const url = `${clientUrl}/jobs/${j.id}`;
    return `- [${j.title}](${url}) | Company: ${j.employer_profiles?.company_name} | Salary: ${salary} | Location: ${location} | Regime: ${j.job_regime} | Category: ${j.category}`;
  });

  const { data: companies } = await supabase
    .from('employer_profiles')
    .select('company_name, description')
    .limit(40);

  const companyLines = (companies || []).map(c =>
    `- ${c.company_name}${c.description ? ': ' + c.description.slice(0, 80) : ''}`
  );

  return [
    `[PLATFORM DATA — ${(jobs || []).length} active jobs, ${(companies || []).length} companies]`,
    '',
    'ACTIVE JOBS:',
    ...jobLines,
    '',
    'COMPANIES ON PLATFORM:',
    ...companyLines,
  ].join('\n');
}

const chat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });

    const platformData = await buildPlatformContext();

    const messages = [
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: `${message}\n\n${platformData}` },
    ];

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const reply = response.content[0]?.text || 'Sorry, I could not generate a response.';
    res.json({ reply });
  } catch (err) { next(err); }
};

module.exports = { chat };
