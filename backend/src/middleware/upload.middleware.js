const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'avatar' ? 'avatar' : 'cv';
    cb(null, prefix + '-' + req.user.id + '-' + Date.now() + ext);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'avatar') {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('მხოლოდ სურათის ფაილები დასაშვებია'));
  } else {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('მხოლოდ PDF და Word ფაილები დასაშვებია'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;
