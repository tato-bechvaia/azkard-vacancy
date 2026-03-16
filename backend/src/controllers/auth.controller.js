const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../utils/jwt');

const prisma = new PrismaClient();

const register = async (req, res, next) => {
  try {
    const { email, password, role, fullName, companyName } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email, passwordHash, role,
        ...(role === 'EMPLOYER'
          ? { employerProfile: { create: { companyName } } }
          : { candidateProfile: { create: { fullName } } }
        ),
      },
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.status(201).json({ token, role: user.role });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.json({ token, role: user.role });
  } catch (err) { next(err); }
};

module.exports = { register, login };