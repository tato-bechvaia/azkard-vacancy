const Anthropic = require('@anthropic-ai/sdk');
const prisma = require('../prisma');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a helpful assistant for the Azkard job platform — a Georgian job marketplace connecting employers and candidates.

You can ONLY answer questions about:
- Jobs and vacancies listed on Azkard
- Employers and companies on the platform
- How to use Azkard (applying to jobs, posting vacancies, profiles, etc.)
- General job-search advice related to the platform
- Application statuses, CV submission, company boxes

If a user asks about ANYTHING else (cooking, weather, general knowledge, coding unrelated to the platform, etc.), politely decline and say you can only help with Azkard platform topics.

Keep answers concise and helpful. Respond in the same language the user writes in (Georgian or English).`;

const chat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });

    // Fetch some live platform context
    const [jobCount, employerCount] = await Promise.all([
      prisma.job.count({ where: { status: 'HIRING' } }),
      prisma.employerProfile.count(),
    ]);

    const contextNote = `[Platform context: ${jobCount} active job listings, ${employerCount} registered employers]`;

    const messages = [
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: `${contextNote}\n\n${message}` },
    ];

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    });

    const reply = response.content[0]?.text || 'Sorry, I could not generate a response.';
    res.json({ reply });
  } catch (err) { next(err); }
};

module.exports = { chat };
