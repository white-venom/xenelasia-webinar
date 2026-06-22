const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const query = process.argv.slice(2).join(' ');
  if (!query) {
    console.error('Please provide a SQL query. Example: node query.js "SELECT * FROM Webinar"');
    process.exit(1);
  }
  try {
    const result = await prisma.$queryRawUnsafe(query);
    console.table(result);
  } catch (error) {
    console.error('Query execution error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
