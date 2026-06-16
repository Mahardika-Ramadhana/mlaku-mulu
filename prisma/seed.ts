import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as bcrypt from 'bcrypt';

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const defaultEmployeeEmail = 'pegawai@mlakumulu.com';
  const existingEmployee = await prisma.employee.findUnique({
    where: { email: defaultEmployeeEmail },
  });

  if (!existingEmployee) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const employee = await prisma.employee.create({
      data: {
        email: defaultEmployeeEmail,
        password: hashedPassword,
        name: 'Pegawai Utama',
      },
    });
    console.log('Default employee created:', employee.email);
  } else {
    console.log('Default employee already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
