const bcrypt   = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const prisma = require('../prisma');

const register = async (req, res, next) => {
  try {
    const { email, password, role, firstName, lastName, companyName, phone } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ message: 'ელ-ფოსტა უკვე გამოყენებულია' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email, passwordHash, role, phone,
        ...(role === 'EMPLOYER'
          ? { employerProfile: { create: { companyName } } }
          : { candidateProfile: { create: { firstName, lastName } } }
        ),
      },
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const displayName = role === 'EMPLOYER' ? companyName : firstName + ' ' + lastName;
    res.status(201).json({ token, role: user.role, displayName });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        employerProfile: true,
        candidateProfile: true,
      }
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ message: 'არასწორი ელ-ფოსტა ან პაროლი' });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const displayName = user.role === 'EMPLOYER'
      ? user.employerProfile?.companyName || ''
      : (user.candidateProfile?.firstName || '') + ' ' + (user.candidateProfile?.lastName || '');

    res.json({ token, role: user.role, displayName: displayName.trim() });
  } catch (err) { next(err); }
};

module.exports = { register, login };