const supabase = require('../supabase');
const { sendNotification } = require('../utils/notify');

const applyToJob = async (req, res, next) => {
  try {
    const { coverLetter } = req.body;

    const { data: candidate } = await supabase
      .from('candidate_profiles')
      .select('id, first_name, last_name, cv_url')
      .eq('user_id', req.user.id)
      .maybeSingle();
    if (!candidate) return res.status(404).json({ message: 'კანდიდატის პროფილი ვერ მოიძებნა' });

    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', +req.params.jobId)
      .eq('candidate_profile_id', candidate.id)
      .maybeSingle();
    if (existing) return res.status(409).json({ message: 'უკვე გაგზავნილი გაქვთ განაცხადი' });

    let cvUrl = candidate.cv_url || null;
    if (req.file) cvUrl = '/uploads/' + req.file.filename;

    const { data: application, error } = await supabase
      .from('applications')
      .insert({
        job_id: +req.params.jobId,
        candidate_profile_id: candidate.id,
        cover_letter: coverLetter || null,
        cv_url: cvUrl,
      })
      .select()
      .single();
    if (error) throw error;

    // Fetch job + employer for notification
    const { data: job } = await supabase
      .from('jobs')
      .select('title, employer_profile_id, employer_profiles!employer_profile_id(user_id)')
      .eq('id', +req.params.jobId)
      .maybeSingle();

    const candidateName = candidate.first_name + ' ' + candidate.last_name;
    const employerUserId = job?.employer_profiles?.user_id;

    if (employerUserId) {
      await sendNotification(
        req.app,
        employerUserId,
        candidateName + '-მ გამოაგზავნა განაცხადი — ' + job.title
      );
    }

    res.status(201).json(application);
  } catch (err) { next(err); }
};

const myApplications = async (req, res, next) => {
  try {
    const { data: candidate } = await supabase
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs!job_id(
          title, location,
          employer_profiles!employer_profile_id(company_name, avatar_url)
        )
      `)
      .eq('candidate_profile_id', candidate.id)
      .order('applied_at', { ascending: false });
    if (error) throw error;

    // Normalize to match original response shape
    const result = (applications || []).map(a => ({
      id: a.id,
      jobId: a.job_id,
      candidateProfileId: a.candidate_profile_id,
      status: a.status,
      coverLetter: a.cover_letter,
      cvUrl: a.cv_url,
      appliedAt: a.applied_at,
      job: a.jobs ? {
        title: a.jobs.title,
        location: a.jobs.location,
        employer: a.jobs.employer_profiles ? {
          companyName: a.jobs.employer_profiles.company_name,
          avatarUrl: a.jobs.employer_profiles.avatar_url,
        } : null,
      } : null,
    }));

    res.json(result);
  } catch (err) { next(err); }
};

const jobApplicants = async (req, res, next) => {
  try {
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        candidate_profiles!candidate_profile_id(first_name, last_name, headline, cv_url)
      `)
      .eq('job_id', +req.params.jobId)
      .order('applied_at', { ascending: false });
    if (error) throw error;

    const result = (applications || []).map(a => ({
      id: a.id,
      jobId: a.job_id,
      candidateProfileId: a.candidate_profile_id,
      status: a.status,
      coverLetter: a.cover_letter,
      cvUrl: a.cv_url,
      appliedAt: a.applied_at,
      candidate: a.candidate_profiles ? {
        firstName: a.candidate_profiles.first_name,
        lastName: a.candidate_profiles.last_name,
        headline: a.candidate_profiles.headline,
        cvUrl: a.candidate_profiles.cv_url,
      } : null,
    }));

    res.json(result);
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const { data: application, error } = await supabase
      .from('applications')
      .update({ status: req.body.status })
      .eq('id', +req.params.id)
      .select(`
        *,
        jobs!job_id(title),
        candidate_profiles!candidate_profile_id(user_id)
      `)
      .single();
    if (error) throw error;

    const STATUS_GEO = {
      PENDING:     'განხილვის მოლოდინში',
      REVIEWING:   'განიხილება',
      SHORTLISTED: 'შორტლისტში',
      REJECTED:    'უარყოფილია',
      HIRED:       'აყვანილია',
    };

    const candidateUserId = application.candidate_profiles?.user_id;
    if (candidateUserId) {
      await sendNotification(
        req.app,
        candidateUserId,
        'თქვენი სტატუსი შეიცვალა — ' + STATUS_GEO[req.body.status] + ' (' + application.jobs?.title + ')'
      );
    }

    res.json(application);
  } catch (err) { next(err); }
};

const viewCv = async (req, res, next) => {
  try {
    const { data: application } = await supabase
      .from('applications')
      .select(`
        jobs!job_id(title),
        candidate_profiles!candidate_profile_id(user_id)
      `)
      .eq('id', +req.params.id)
      .maybeSingle();

    const { data: employer } = await supabase
      .from('employer_profiles')
      .select('company_name')
      .eq('user_id', req.user.id)
      .maybeSingle();

    const candidateUserId = application?.candidate_profiles?.user_id;
    if (candidateUserId) {
      await sendNotification(
        req.app,
        candidateUserId,
        employer.company_name + '-მ გახსნა თქვენი CV — ' + application.jobs?.title
      );
    }

    res.json({ success: true });
  } catch (err) { next(err); }
};

module.exports = { applyToJob, myApplications, jobApplicants, updateStatus, viewCv };
