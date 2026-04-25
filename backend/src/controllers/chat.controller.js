const Anthropic = require('@anthropic-ai/sdk');
const supabase = require('../supabase');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a helpful assistant for the Azkard job platform — a Georgian job marketplace.

You have access to LIVE platform data injected below each message as [PLATFORM DATA]. This includes active jobs, companies, platform statistics, and user information.

Your capabilities:
- Suggest specific jobs or companies from the platform data that match what the user is looking for
- When suggesting jobs, ALWAYS include a clickable link using this markdown format: [Job Title](URL)
- When suggesting companies, link to them if a URL is provided
- Answer questions about how the platform works
- Help with filtering jobs by salary, category, location, regime (remote/hybrid/full-time), etc.
- Report platform statistics: total users, candidates, employers, active vacancies, categories breakdown
- Look up specific users/candidates/companies by name and share their profile details

Rules:
- Only answer questions about Azkard and job-related topics. Politely refuse anything off-topic.
- When the user asks for jobs matching criteria (salary, category, location, etc.), scan the platform data and suggest the best matches.
- If no jobs match, say so honestly and suggest broadening the search.
- Respond in the same language the user writes in (Georgian or English).
- Keep answers concise. When listing jobs, show max 5 at a time unless asked for more.
- When asked about a specific user or company, find them in the data and share relevant details.`;

async function buildPlatformContext() {
  // Fetch jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, salary, currency, location, job_regime, category, employer_profiles!employer_profile_id(company_name)')
    .eq('status', 'HIRING')
    .order('created_at', { ascending: false })
    .limit(80);

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const jobLines = (jobs || []).map(j => {
    const salary = `${j.salary} ${j.currency}`;
    const location = j.location || 'not specified';
    const url = `${clientUrl}/jobs/${j.id}`;
    return `- [${j.title}](${url}) | Company: ${j.employer_profiles?.company_name} | Salary: ${salary} | Location: ${location} | Regime: ${j.job_regime} | Category: ${j.category}`;
  });

  // Fetch companies
  const { data: companies } = await supabase
    .from('employer_profiles')
    .select('id, company_name, description, website')
    .limit(40);

  const companyLines = (companies || []).map(c =>
    `- ${c.company_name}${c.description ? ': ' + c.description.slice(0, 80) : ''}${c.website ? ' | Website: ' + c.website : ''}`
  );

  // Fetch user statistics
  const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const { count: candidateCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'CANDIDATE');
  const { count: employerCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'EMPLOYER');

  // Fetch candidate profiles for user lookups
  const { data: candidates } = await supabase
    .from('candidate_profiles')
    .select('user_id, first_name, last_name, profession, location')
    .limit(100);

  const candidateLines = (candidates || []).map(c =>
    `- ${c.first_name || ''} ${c.last_name || ''} | Profession: ${c.profession || 'N/A'} | Location: ${c.location || 'N/A'} | User ID: ${c.user_id}`
  );

  // Category breakdown
  const categoryBreakdown = {};
  (jobs || []).forEach(j => {
    categoryBreakdown[j.category] = (categoryBreakdown[j.category] || 0) + 1;
  });
  const categoryLines = Object.entries(categoryBreakdown).map(([cat, count]) => `  ${cat}: ${count}`);

  return [
    `[PLATFORM DATA]`,
    '',
    'PLATFORM STATISTICS:',
    `- Total registered users: ${totalUsers || 0}`,
    `- Candidates: ${candidateCount || 0}`,
    `- Employers/Companies: ${employerCount || 0}`,
    `- Active vacancies: ${(jobs || []).length}`,
    `- Companies on platform: ${(companies || []).length}`,
    '',
    'VACANCIES BY CATEGORY:',
    ...categoryLines,
    '',
    `ACTIVE JOBS (${(jobs || []).length}):`,
    ...jobLines,
    '',
    'COMPANIES ON PLATFORM:',
    ...companyLines,
    '',
    `REGISTERED CANDIDATES (${(candidates || []).length}):`,
    ...candidateLines,
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
