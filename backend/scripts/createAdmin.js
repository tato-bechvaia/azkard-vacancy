const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'bechvaiatato01@gmail.com';
  const password = '12345678';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Just make sure isAdmin is set
    await prisma.user.update({ where: { email }, data: { isAdmin: true } });
    console.log('User already exists — isAdmin set to true.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: 'CANDIDATE',
      isAdmin: true,
      isVerified: true,
      candidateProfile: {
        create: { firstName: 'Tato', lastName: 'Bechvaia' },
      },
    },
  });

  console.log('Admin user created: bechvaiatato01@gmail.com');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
