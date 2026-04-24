import { useState, useRef, useEffect } from 'react';
import { Button, Textarea } from '../ui';
import api from '../../api/axios';

function CloseIcon() {
  return (
    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round'>
      <line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/>
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round'>
      <path d='M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z'/>
      <polyline points='14 2 14 8 20 8'/>
      <line x1='16' y1='13' x2='8' y2='13'/><line x1='16' y1='17' x2='8' y2='17'/><polyline points='10 9 9 9 8 9'/>
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'>
      <circle cx='12' cy='12' r='10'/>
      <polyline points='9 12 11 14 15 10'/>
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width='36' height='36' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'>
      <circle cx='12' cy='12' r='10'/>
      <line x1='12' y1='8' x2='12' y2='12'/><line x1='12' y1='16' x2='12.01' y2='16'/>
    </svg>
  );
}

// Extract a readable filename from a URL or path
function extractFilename(url) {
  if (!url) return 'CV.pdf';
  try {
    const decoded = decodeURIComponent(url);
    const parts = decoded.split(/[/?#]/);
    const name = parts.filter(Boolean).pop() || 'CV.pdf';
    return name.length > 40 ? name.slice(0, 37) + '...' : name;
  } catch {
    return 'CV.pdf';
  }
}

export default function ApplyModal({ open, onClose, job, savedCv, onSuccess }) {
  const [coverLetter, setCoverLetter]   = useState('');
  const [replacementCv, setReplacementCv] = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState('');
  const [submitted, setSubmitted]       = useState(false);
  const fileInputRef                    = useRef(null);
  const overlayRef                      = useRef(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setCoverLetter('');
      setReplacementCv(null);
      setError('');
      setSubmitted(false);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const hasCv = !!(savedCv || replacementCv);
  const cvName = replacementCv ? replacementCv.name : extractFilename(savedCv);

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (coverLetter.trim()) formData.append('coverLetter', coverLetter);
      if (replacementCv)      formData.append('cv', replacementCv);
      await api.post('/applications/job/' + job.id, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'შეცდომა მოხდა. სცადეთ ხელახლა.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    /* Backdrop */
    <div
      ref={overlayRef}
      className='fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4'
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onMouseDown={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Modal card */}
      <div className='bg-surface-50 border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-card-lg'>

        {/* Header */}
        <div className='flex items-center justify-between px-6 pt-6 pb-4 border-b border-border-subtle'>
          <div>
            <h3 className='font-display font-semibold text-md text-text-primary tracking-tight'>
              განაცხადის გაგზავნა
            </h3>
            <p className='text-xs text-text-muted mt-0.5 truncate max-w-[22rem]'>{job.title}</p>
          </div>
          <button
            onClick={onClose}
            className='text-text-muted hover:text-text-secondary transition-colors duration-150 p-1.5 -mr-1.5 rounded-lg hover:bg-surface-100'
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className='px-6 py-5'>

          {/* ── State: submitted ── */}
          {submitted ? (
            <div className='flex flex-col items-center gap-3 py-6 text-center'>
              <span className='text-success'><CheckCircleIcon /></span>
              <div>
                <p className='font-semibold text-text-primary mb-1'>განაცხადი გაგზავნილია!</p>
                <p className='text-sm text-text-muted'>კომპანია მოგწერთ, როცა განიხილავს.</p>
              </div>
              <Button variant='secondary' size='md' onClick={onClose} className='mt-2'>
                დახურვა
              </Button>
            </div>
          ) : !hasCv ? (
            /* ── State: no CV ── */
            <div className='flex flex-col items-center gap-3 py-4 text-center'>
              <span className='text-warning'><WarningIcon /></span>
              <div>
                <p className='font-semibold text-text-primary mb-1'>CV არ გაქვს ატვირთული</p>
                <p className='text-sm text-text-muted'>
                  განაცხადის გასაგზავნად ჯერ ატვირთე შენი CV პროფილში.
                </p>
              </div>
              <div className='flex gap-2 mt-2'>
                <Button variant='ghost' size='sm' onClick={onClose}>გაუქმება</Button>
                <Button
                  variant='primary'
                  size='sm'
                  onClick={() => window.location.href = '/profile'}
                  trailingIcon={
                    <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                      <path d='M5 12h14M12 5l7 7-7 7'/>
                    </svg>
                  }
                >
                  ატვირთე ახლა
                </Button>
              </div>

              {/* Allow attaching a CV directly from this modal too */}
              <div className='mt-3 w-full border-t border-border-subtle pt-4'>
                <p className='text-xs text-text-muted mb-2'>ან შეგიძლია CV პირდაპირ დაურთო</p>
                <label className='flex items-center gap-3 h-10 px-4 rounded-xl border border-border cursor-pointer hover:border-border-strong transition-colors duration-150 bg-surface-100'>
                  <input
                    type='file'
                    accept='.pdf,.doc,.docx'
                    className='hidden'
                    onChange={e => setReplacementCv(e.target.files[0] || null)}
                  />
                  <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75'>
                    <path d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4'/><polyline points='17 8 12 3 7 8'/><line x1='12' y1='3' x2='12' y2='15'/>
                  </svg>
                  <span className='text-sm text-text-secondary'>CV-ის ატვირთვა (.pdf, .doc)</span>
                </label>
              </div>
            </div>
          ) : (
            /* ── State: has CV, ready to apply ── */
            <>
              {/* CV row */}
              <div className='flex items-center justify-between bg-surface-100 border border-border-subtle rounded-xl px-4 py-3 mb-4'>
                <div className='flex items-center gap-2.5 min-w-0'>
                  <span className='text-brand-400 flex-shrink-0'><PdfIcon /></span>
                  <span className='text-sm font-medium text-text-primary truncate'>{cvName}</span>
                </div>
                <label className='text-xs text-brand-400 hover:text-brand-300 cursor-pointer transition-colors duration-150 flex-shrink-0 ml-3'>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='.pdf,.doc,.docx'
                    className='hidden'
                    onChange={e => setReplacementCv(e.target.files[0] || null)}
                  />
                  შეცვლა
                </label>
              </div>

              {/* Cover letter */}
              <Textarea
                label='სამოტივაციო წერილი (სურვილისამებრ)'
                placeholder='მოკლედ მიუთითე, რატომ გინდა ამ პოზიციაზე მუშაობა...'
                rows={4}
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
              />

              {error && (
                <p className='text-xs text-danger mt-3'>{error}</p>
              )}
            </>
          )}
        </div>

        {/* Footer actions — only when ready to apply */}
        {!submitted && hasCv && (
          <div className='px-6 pb-6 flex items-center justify-end gap-2'>
            <Button variant='ghost' size='md' onClick={onClose} disabled={submitting}>
              გაუქმება
            </Button>
            <Button variant='primary' size='md' loading={submitting} onClick={handleSubmit}>
              განაცხადის გაგზავნა
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
