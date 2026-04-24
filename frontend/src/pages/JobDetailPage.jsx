import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';
import { PageShell, Container, Tag, LoadingScreen } from '../components/ui';
import { REGIME_LABELS, EXP_LABELS, CATEGORY_LABELS } from '../utils/constants';
import JobHeroCard   from '../components/jobdetail/JobHeroCard';
import StickyApplyBar from '../components/jobdetail/StickyApplyBar';
import JobSection    from '../components/jobdetail/JobSection';
import CompanyCard   from '../components/jobdetail/CompanyCard';
import SimilarJobs   from '../components/jobdetail/SimilarJobs';
import ApplyModal    from '../components/jobdetail/ApplyModal';

export default function JobDetailPage() {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── Data ────────────────────────────────────────────────────────────────────
  const [job,     setJob]     = useState(null);
  const [savedCv, setSavedCv] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [applied, setApplied] = useState(false);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    api.get('/jobs/' + id).then(({ data }) => setJob(data)).catch(() => {});

    if (user?.role === 'CANDIDATE') {
      api.get('/profiles/me').then(({ data }) => {
        if (data.cvUrl) setSavedCv(data.cvUrl);
      }).catch(() => {});
      api.get('/saved-jobs/ids').then(({ data }) => {
        setIsSaved(data.includes(+id));
      }).catch(() => {});
    }
  }, [id, user?.role]);

  // ── Save / unsave ────────────────────────────────────────────────────────────
  const toggleSave = useCallback(async () => {
    if (!user) return navigate('/login?returnTo=/jobs/' + id);
    const prev = isSaved;
    setIsSaved(!prev);
    try {
      if (prev) await api.delete('/saved-jobs/' + id);
      else       await api.post('/saved-jobs/' + id);
    } catch {
      setIsSaved(prev);
    }
  }, [user, isSaved, id, navigate]);

  // ── Apply CTA handler ────────────────────────────────────────────────────────
  const handleApplyCta = useCallback(() => {
    if (!user) return navigate('/login?returnTo=/jobs/' + id);
    if (user.role !== 'CANDIDATE') return; // employer — button is already hidden
    setModalOpen(true);
  }, [user, id, navigate]);

  // ── Share ────────────────────────────────────────────────────────────────────
  const handleShare = useCallback(() => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: job?.title, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).catch(() => {});
    }
  }, [job?.title]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (!job) return <LoadingScreen text='ვაკანსია იტვირთება...' />;

  const REGIME_TAG_VARIANT = { REMOTE: 'teal', HYBRID: 'blue', FULL_TIME: 'violet' };

  return (
    <PageShell>
      {/* Extra bottom padding so fixed mobile bar never covers content */}
      <div className='pb-20 md:pb-0'>
        <Container size='lg'>

          {/* Breadcrumb */}
          <button
            onClick={() => navigate('/')}
            className='inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors duration-150 mb-6 group'
          >
            <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'
              className='group-hover:-translate-x-0.5 transition-transform duration-150'>
              <path d='M19 12H5M12 19l-7-7 7-7'/>
            </svg>
            ყველა ვაკანსია
          </button>

          {/* Hero */}
          <JobHeroCard job={job} />

          {/* Sticky apply bar — hidden for employers */}
          <StickyApplyBar
            job={job}
            user={user}
            applied={applied}
            isSaved={isSaved}
            onApply={handleApplyCta}
            onSave={toggleSave}
            onShare={handleShare}
          />

          {/* Key detail chips */}
          <div className='flex flex-wrap gap-2 mb-8'>
            {job.jobRegime && (
              <Tag variant={REGIME_TAG_VARIANT[job.jobRegime] || 'default'} dot>
                {REGIME_LABELS[job.jobRegime]}
              </Tag>
            )}
            {job.experience && (
              <Tag variant='default'>{EXP_LABELS[job.experience]}</Tag>
            )}
            {job.location && (
              <Tag variant='default'>
                <span className='flex items-center gap-1'>
                  <svg width='9' height='9' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z'/><circle cx='12' cy='10' r='3'/>
                  </svg>
                  {job.location}
                </span>
              </Tag>
            )}
            {job.category && job.category !== 'OTHER' && (
              <Tag variant='brand'>{CATEGORY_LABELS[job.category]}</Tag>
            )}
          </div>

          {/* Job description */}
          <JobSection title='სამუშაოს აღწერა'>
            {job.description}
          </JobSection>

          {/* Company card */}
          <CompanyCard employer={job.employer} />

          {/* Similar jobs */}
          <SimilarJobs jobs={job.similarJobs} />

        </Container>
      </div>

      {/* Apply modal */}
      <ApplyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        job={job}
        savedCv={savedCv}
        onSuccess={() => {
          setApplied(true);
          setModalOpen(false);
        }}
      />
    </PageShell>
  );
}
