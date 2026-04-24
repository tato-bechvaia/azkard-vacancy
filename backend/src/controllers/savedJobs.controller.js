const supabase = require('../supabase');
const cache    = require('../utils/cache');

const userCacheKey  = (userId) => `saved_jobs:${userId}`;
const bustUserCache = (userId) => cache.delByPrefix(`saved_jobs:${userId}`);

// POST /api/saved-jobs/:jobId — save a job
const saveJob = async (req, res, next) => {
  try {
    const jobId = +req.params.jobId;
    const userId = req.user.id;

    const { data: job } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .maybeSingle();
    if (!job) return res.status(404).json({ message: 'ვაკანსია ვერ მოიძებნა' });

    const { error } = await supabase
      .from('saved_jobs')
      .insert({ user_id: userId, job_id: jobId });

    if (error) {
      if (error.code === '23505') return res.status(200).json({ saved: true }); // already saved
      throw error;
    }
    bustUserCache(userId);
    res.status(201).json({ saved: true });
  } catch (err) { next(err); }
};

// DELETE /api/saved-jobs/:jobId — unsave a job
const unsaveJob = async (req, res, next) => {
  try {
    const jobId = +req.params.jobId;
    const userId = req.user.id;

    await supabase
      .from('saved_jobs')
      .delete()
      .eq('user_id', userId)
      .eq('job_id', jobId);

    bustUserCache(userId);
    res.json({ saved: false });
  } catch (err) { next(err); }
};

// GET /api/saved-jobs — list my saved jobs
const listSavedJobs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cacheKey = `${userCacheKey(userId)}:list`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    // Step 1: get saved job IDs + timestamps
    const { data: saved, error: savedError } = await supabase
      .from('saved_jobs')
      .select('job_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (savedError) {
      console.error('[listSavedJobs] Supabase error:', savedError.message);
      return res.json([]); // degrade gracefully
    }
    if (!saved?.length) return res.json([]);

    const jobIds = saved.map(s => s.job_id);

    // Step 2: fetch job details (simple join to employer_profiles)
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, title, salary, currency, location, job_regime, category, status, employer_profile_id')
      .in('id', jobIds);
    if (jobsError) throw jobsError;

    // Step 3: fetch employer profiles for those jobs
    const employerIds = [...new Set((jobs || []).map(j => j.employer_profile_id).filter(Boolean))];
    let employerMap = {};
    if (employerIds.length) {
      const { data: employers } = await supabase
        .from('employer_profiles')
        .select('id, company_name, avatar_url, logo_url')
        .in('id', employerIds);
      employerMap = Object.fromEntries((employers || []).map(e => [e.id, e]));
    }

    const jobMap = Object.fromEntries((jobs || []).map(j => [j.id, j]));

    const result = saved.map(s => {
      const j = jobMap[s.job_id];
      if (!j) return null;
      const emp = employerMap[j.employer_profile_id];
      return {
        savedAt: s.created_at,
        job: {
          id: j.id, title: j.title,
          salary: j.salary, currency: j.currency,
          location: j.location, jobRegime: j.job_regime, category: j.category, status: j.status,
          employer: emp ? { companyName: emp.company_name, avatarUrl: emp.avatar_url, logoUrl: emp.logo_url } : null,
        },
      };
    }).filter(Boolean);
    cache.set(cacheKey, result, 60);
    res.json(result);
  } catch (err) { next(err); }
};

// GET /api/saved-jobs/ids — just the saved job IDs (for button state)
const savedJobIds = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cacheKey = `${userCacheKey(userId)}:ids`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const { data, error } = await supabase
      .from('saved_jobs')
      .select('job_id')
      .eq('user_id', userId);
    if (error) {
      console.error('[savedJobIds] Supabase error:', error.message);
      return res.json([]);
    }
    const ids = (data || []).map(r => r.job_id);
    cache.set(cacheKey, ids, 60);
    res.json(ids);
  } catch (err) { next(err); }
};

module.exports = { saveJob, unsaveJob, listSavedJobs, savedJobIds };
