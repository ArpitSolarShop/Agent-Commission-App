const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const p = new PrismaClient();

async function main() {
  const u = await p.user.findUnique({ where: { email: 'admin@company.com' } });
  if (!u) {
    console.log('USER NOT FOUND');
    return;
  }
  console.log('User found:', u.email, u.role, u.password.substring(0, 10) + '...');
  const match = await bcrypt.compare('password123', u.password);
  console.log('Password match:', match);

  // Also test sub-agent
  const u2 = await p.user.findUnique({ where: { email: 'karan_sub@company.com' } });
  if (!u2) {
    console.log('SUBAGENT NOT FOUND');
  } else {
    const m2 = await bcrypt.compare('password123', u2.password);
    console.log('SubAgent match:', m2, u2.email);
  }
}

main().finally(() => p.$disconnect());
