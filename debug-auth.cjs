
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAdmin() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@company.com' }
  });
  if (!user) {
    console.log('Admin not found!');
  } else {
    console.log('Admin found:', user.email);
    const match = await bcrypt.compare('password123', user.password);
    console.log('Password match:', match);
  }
  await prisma.$disconnect();
}

checkAdmin();
