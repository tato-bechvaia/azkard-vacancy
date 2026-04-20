const prisma = require('../prisma');
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
    const employer = await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });
    if (!employer) return res.status(404).json({ message: 'Employer profile not found' });

    const { title, description } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: 'სათაური სავალდებულოა' });

    const box = await prisma.companyBox.create({
      data: {
        companyId: employer.id,
        title: title.trim(),
        description: description?.trim() || null,
      },
    });
    res.status(201).json(box);
  } catch (err) { next(err); }
};

// ── GET /api/company-boxes  (all active, for main page) ──────────────────
const listAllBoxes = async (req, res, next) => {
  try {
    const boxes = await prisma.companyBox.findMany({
      where: { isActive: true },
      include: {
        employer: { select: { companyName: true, avatarUrl: true, logoUrl: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(boxes);
  } catch (err) { next(err); }
};

// ── GET /api/company-boxes/:companyId ─────────────────────────────────────
const listBoxes = async (req, res, next) => {
  try {
    const boxes = await prisma.companyBox.findMany({
      where: {
        companyId: +req.params.companyId,
        isActive: true,
      },
      include: {
        employer: { select: { companyName: true, avatarUrl: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(boxes);
  } catch (err) { next(err); }
};

// ── POST /api/company-boxes/:boxId/submit ─────────────────────────────────
// Candidate-facing — no auth required; CV file via multipart/form-data
const submitCV = async (req, res, next) => {
  try {
    const box = await prisma.companyBox.findUnique({ where: { id: +req.params.boxId } });
    if (!box || !box.isActive) return res.status(404).json({ message: 'CV Box ვერ მოიძებნა' });

    if (!req.file) return res.status(400).json({ message: 'CV ფაილი სავალდებულოა' });

    const parsed = submissionSchema.safeParse(req.body);
    if (!parsed.success) {
      fs.unlinkSync(req.file.path); // clean up uploaded file on validation failure
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const { candidateName, candidateEmail, message } = parsed.data;
    const cvUrl = '/uploads/cv-boxes/' + req.file.filename;

    const submission = await prisma.cVSubmission.create({
      data: { companyBoxId: box.id, candidateName, candidateEmail, cvUrl, message: message || null },
    });
    res.status(201).json({ message: 'CV წარმატებით გაიგზავნა', submissionId: submission.id });
  } catch (err) { next(err); }
};

// ── GET /api/company-boxes/:boxId/submissions ─────────────────────────────
// Employer-only — auth + ownership check
const listSubmissions = async (req, res, next) => {
  try {
    const employer = await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });
    if (!employer) return res.status(403).json({ message: 'Forbidden' });

    const box = await prisma.companyBox.findUnique({ where: { id: +req.params.boxId } });
    if (!box) return res.status(404).json({ message: 'CV Box ვერ მოიძებნა' });
    if (box.companyId !== employer.id) return res.status(403).json({ message: 'Forbidden' });

    const submissions = await prisma.cVSubmission.findMany({
      where: { companyBoxId: box.id },
      orderBy: { submittedAt: 'desc' },
    });
    res.json(submissions);
  } catch (err) { next(err); }
};

// ── PATCH /api/company-boxes/:boxId ──────────────────────────────────────
const updateBox = async (req, res, next) => {
  try {
    const employer = await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });
    if (!employer) return res.status(403).json({ message: 'Forbidden' });

    const box = await prisma.companyBox.findUnique({ where: { id: +req.params.boxId } });
    if (!box) return res.status(404).json({ message: 'CV Box ვერ მოიძებნა' });
    if (box.companyId !== employer.id) return res.status(403).json({ message: 'Forbidden' });

    const { title, description, isActive } = req.body;
    const updated = await prisma.companyBox.update({
      where: { id: box.id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });
    res.json(updated);
  } catch (err) { next(err); }
};

module.exports = { createBox, listAllBoxes, listBoxes, submitCV, listSubmissions, updateBox, cvUpload };
