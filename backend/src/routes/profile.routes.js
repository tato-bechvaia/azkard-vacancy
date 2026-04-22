const router   = require('express').Router();
const { getMyProfile, updateMyProfile } = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');
const upload   = require('../middleware/upload.middleware');
const supabase = require('../supabase');
const { uploadToStorage, deleteFromStorage } = require('../utils/storage');

router.get('/me',  protect, getMyProfile);
router.put('/me',  protect, updateMyProfile);

router.post('/avatar', protect, upload.single('avatar'), async (req, res, next) => {
  try {
    const avatarUrl = await uploadToStorage(
      'avatars', 'avatar',
      req.file.buffer, req.file.originalname, req.file.mimetype
    );

    if (req.user.role === 'CANDIDATE') {
      await supabase.from('candidate_profiles').update({ avatar_url: avatarUrl }).eq('user_id', req.user.id);
    } else {
      await supabase.from('employer_profiles').update({ avatar_url: avatarUrl }).eq('user_id', req.user.id);
    }

    res.json({ avatarUrl });
  } catch (err) { next(err); }
});

router.delete('/avatar', protect, async (req, res, next) => {
  try {
    const table = req.user.role === 'CANDIDATE' ? 'candidate_profiles' : 'employer_profiles';
    const { data: profile, error: fetchErr } = await supabase
      .from(table).select('avatar_url').eq('user_id', req.user.id).maybeSingle();
    if (fetchErr) throw fetchErr;

    if (profile?.avatar_url) {
      await deleteFromStorage('avatars', profile.avatar_url).catch(() => {});
      await supabase.from(table).update({ avatar_url: null }).eq('user_id', req.user.id);
    }

    res.json({ avatarUrl: null });
  } catch (err) { next(err); }
});

router.post('/cv', protect, upload.single('cv'), async (req, res, next) => {
  try {
    const cvUrl = await uploadToStorage(
      'cvs', 'cv',
      req.file.buffer, req.file.originalname, req.file.mimetype
    );
    await supabase.from('candidate_profiles').update({ cv_url: cvUrl }).eq('user_id', req.user.id);
    res.json({ cvUrl });
  } catch (err) { next(err); }
});

router.get('/company/:slug', async (req, res, next) => {
  try {
    const slug = req.params.slug.replace(/-/g, ' ');

    const { data: employer } = await supabase
      .from('employer_profiles')
      .select('*')
      .ilike('company_name', slug)
      .maybeSingle();
    if (!employer) return res.status(404).json({ message: 'კომპანია ვერ მოიძებნა' });

    const { data: jobs } = await supabase
      .from('jobs')
      .select('*, applications(count)')
      .eq('employer_profile_id', employer.id)
      .eq('status', 'HIRING')
      .order('created_at', { ascending: false });

    res.json({
      id: employer.id,
      userId: employer.user_id,
      companyName: employer.company_name,
      description: employer.description,
      website: employer.website,
      logoUrl: employer.logo_url,
      avatarUrl: employer.avatar_url,
      jobs: (jobs || []).map(j => ({
        id: j.id, title: j.title, location: j.location,
        salaryMin: j.salary_min, salaryMax: j.salary_max,
        jobRegime: j.job_regime, createdAt: j.created_at,
        _count: { applications: j.applications?.[0]?.count ?? 0 },
      })),
    });
  } catch (err) { next(err); }
});

module.exports = router;
