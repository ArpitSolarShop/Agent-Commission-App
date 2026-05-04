import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Migrating Agent Roles...');
  
  const updatedAgents1 = await prisma.$executeRaw`UPDATE "agents" SET "type" = 'SALES_AGENT' WHERE "type" = 'CHANNEL_PARTNER'`;
  console.log(`Updated ${updatedAgents1} CHANNEL_PARTNER to SALES_AGENT`);
  
  const updatedAgents2 = await prisma.$executeRaw`UPDATE "agents" SET "type" = 'SUB_SALES_AGENT' WHERE "type" = 'SUB_AGENT'`;
  console.log(`Updated ${updatedAgents2} SUB_AGENT to SUB_SALES_AGENT`);
  
  const updatedRequests1 = await prisma.$executeRaw`UPDATE "recruitment_requests" SET "requested_role" = 'SALES_AGENT' WHERE "requested_role" = 'CHANNEL_PARTNER'`;
  console.log(`Updated ${updatedRequests1} recruitment requests to SALES_AGENT`);
  
  const updatedRequests2 = await prisma.$executeRaw`UPDATE "recruitment_requests" SET "requested_role" = 'SUB_SALES_AGENT' WHERE "requested_role" = 'SUB_AGENT'`;
  console.log(`Updated ${updatedRequests2} recruitment requests to SUB_SALES_AGENT`);
  
  console.log('Migration Complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
