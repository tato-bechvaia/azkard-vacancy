const supabase = require('../supabase');
const cache = require('../utils/cache');
const { z } = require('zod');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// ── Anonymous CV upload — no req.user dependency ──────────────────────────
const cvUploadsDir = path.join(__dirname, '../../uploads/cv-boxes');
if (!fs.existsSync(cvUploadsDir)) fs.mkdirSync(cvUploadsDir, { recursive: true });

const cvStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, cvUploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'cvbox-' + Date.now() + '-' + Math.random().toString(36).slice(2) + ext);
  },
});

const cvFileFilter = (_req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx'];
  if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
  else cb(new Error('მხოლოდ PDF და Word ფაილები დასაშვებია'));
};

const cvUpload = multer({ storage: cvStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: cvFileFilter });

// ── Zod schema for submission ─────────────────────────────────────────────
const submissionSchema = z.object({
  candidateName:  z.string().min(2, 'სახელი მოკლეა').max(120),
  candidateEmail: z.string().email('ელ-ფოსტა არასწორია'),
  message:        z.string().max(1000).optional(),
});

// ── POST /api/company-boxes ───────────────────────────────────────────────
const createBox = async (req, res, next) => {
  try {
    const { data: employer } = await supabase
      .from('employer_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();
    if (!employer) return res.status(404).json({ message: 'Employer profile not found' });

    const { title, description, category } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: 'სათაური სავალდებულოა' });

    const { data: box, error } = await supabase
      .from('company_boxes')
      .insert({ company_id: employer.id, title: title.trim(), description: description?.trim() || null, category: category || 'OTHER' })
      .select()
      .single();
    if (error) throw error;

    cache.del('company_boxes:all');
    res.status(201).json({
      id: box.id, companyId: box.company_id, title: box.title,
      description: box.description, isActive: box.is_active, createdAt: box.created_at,
      category: box.category || 'OTHER',
    });
  } catch (err) { next(err); }
};

// ── GET /api/company-boxes  (all active, for main page) ──────────────────
const listAllBoxes = async (req, res, next) => {
  try {
    const cached = cache.get('company_boxes:all');
    if (cached) return res.json(cached);

    const { data: boxes, error } = await supabase
      .from('company_boxes')
      .select(`
        *,
        employer_profiles!company_id(company_name, avatar_url, logo_url),
        cv_submissions(count)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const result = (boxes || []).map(b => ({
      id: b.id,
      companyId: b.company_id,
      title: b.title,
      description: b.description,
      isActive: b.is_active,
      createdAt: b.created_at,
      category: b.category || 'OTHER',
      employer: b.employer_profiles ? {
        companyName: b.employer_profiles.company_name,
        avatarUrl: b.employer_profiles.avatar_url,
        logoUrl: b.employer_profiles.logo_url,
      } : null,
      _count: { submissions: b.cv_submissions?.[0]?.count ?? 0 },
    }));
    cache.set('company_boxes:all', result, 120);
    res.json(result);
  } catch (err) { next(err); }
};

// ── GET /api/company-boxes/:companyId ─────────────────────────────────────
const listBoxes = async (req, res, next) => {
  try {
    const { data: boxes, error } = await supabase
      .from('company_boxes')
      .select(`
        *,
        employer_profiles!company_id(company_name, avatar_url),
        cv_submissions(count)
      `)
      .eq('company_id', +req.params.companyId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;

    res.json((boxes || []).map(b => ({
      id: b.id,
      companyId: b.company_id,
      title: b.title,
      description: b.description,
      isActive: b.is_active,
      createdAt: b.created_at,
      category: b.category || 'OTHER',
      employer: b.employer_profiles ? {
        companyName: b.employer_profiles.company_name,
        avatarUrl: b.employer_profiles.avatar_url,
      } : null,
      _count: { submissions: b.cv_submissions?.[0]?.count ?? 0 },
    })));
  } catch (err) { next(err); }
};

// ── POST /api/company-boxes/:boxId/submit ─────────────────────────────────
const submitCV = async (req, res, next) => {
  try {
    const { data: box } = await supabase
      .from('company_boxes')
      .select('id, is_active')
      .eq('id', +req.params.boxId)
      .maybeSingle();
    if (!box || !box.is_active) return res.status(404).json({ message: 'CV Box ვერ მოიძებნა' });

    if (!req.file) return res.status(400).json({ message: 'CV ფაილი სავალდებულოა' });

    const parsed = submissionSchema.safeParse(req.body);
    if (!parsed.success) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const { candidateName, candidateEmail, message } = parsed.data;
    const cvUrl = '/uploads/cv-boxes/' + req.file.filename;

    const { data: submission, error } = await supabase
      .from('cv_submissions')
      .insert({
        company_box_id: box.id,
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        cv_url: cvUrl,
        message: message || null,
      })
      .select()
      .single();
    if (error) throw error;

    res.status(201).json({ message: 'CV წარმატებით გაიგზავნა', submissionId: submission.id });
  } catch (err) { next(err); }
};

// ── GET /api/company-boxes/:boxId/submissions ─────────────────────────────
const listSubmissions = async (req, res, next) => {
  try {
    const { data: employer } = await supabase
      .from('employer_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();
    if (!employer) return res.status(403).json({ message: 'Forbidden' });

    const { data: box } = await supabase
      .from('company_boxes')
      .select('id, company_id')
      .eq('id', +req.params.boxId)
      .maybeSingle();
    if (!box) return res.status(404).json({ message: 'CV Box ვერ მოიძებნა' });
    if (box.company_id !== employer.id) return res.status(403).json({ message: 'Forbidden' });

    const { data: submissions, error } = await supabase
      .from('cv_submissions')
      .select('*')
      .eq('company_box_id', box.id)
      .order('submitted_at', { ascending: false });
    if (error) throw error;

    res.json((submissions || []).map(s => ({
      id: s.id,
      companyBoxId: s.company_box_id,
      candidateName: s.candidate_name,
      candidateEmail: s.candidate_email,
      cvUrl: s.cv_url,
      message: s.message,
      submittedAt: s.submitted_at,
    })));
  } catch (err) { next(err); }
};

// ── PATCH /api/company-boxes/:boxId ──────────────────────────────────────
const updateBox = async (req, res, next) => {
  try {
    const { data: employer } = await supabase
      .from('employer_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();
    if (!employer) return res.status(403).json({ message: 'Forbidden' });

    const { data: box } = await supabase
      .from('company_boxes')
      .select('id, company_id')
      .eq('id', +req.params.boxId)
      .maybeSingle();
    if (!box) return res.status(404).json({ message: 'CV Box ვერ მოიძებნა' });
    if (box.company_id !== employer.id) return res.status(403).json({ message: 'Forbidden' });

    const { title, description, isActive, category } = req.body;
    const { data: updated, error } = await supabase
      .from('company_boxes')
      .update({
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(isActive !== undefined && { is_active: Boolean(isActive) }),
        ...(category !== undefined && { category }),
      })
      .eq('id', box.id)
      .select()
      .single();
    if (error) throw error;

    cache.del('company_boxes:all');
    res.json({
      id: updated.id, companyId: updated.company_id, title: updated.title,
      description: updated.description, isActive: updated.is_active, createdAt: updated.created_at,
      category: updated.category || 'OTHER',
    });
  } catch (err) { next(err); }
};

module.exports = { createBox, listAllBoxes, listBoxes, submitCV, listSubmissions, updateBox, cvUpload };
