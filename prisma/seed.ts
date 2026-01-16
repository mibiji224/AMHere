// @ts-nocheck
import { PrismaClient, Role, AttendanceStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

// Force load the .env file so the client can find the URL
dotenv.config();

const connectionString = process.env.DATABASE_URL;

// Create a connection pool
const pool = new Pool({ connectionString });

// Create the Prisma Client with the adapter
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting Database Seeder...');

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      firstName: 'Desiree',
      lastName: 'Soronio',
      role: Role.ADMIN,
      hourlyRate: 50.00,
      position: 'Supervisor',
    },
  });

  console.log(`✅ Created Admin: ${admin.email}`);

  // Create Employees
  for (let i = 0; i < 5; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = `${firstName.toLowerCase()}@company.com`;
    
    const emp = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        firstName,
        lastName,
        role: Role.EMPLOYEE,
        hourlyRate: 3.00,
        position: 'Full Stack Developer',
      },
    });

    await prisma.attendance.create({
      data: {
        userId: emp.id,
        date: new Date(),
        timeIn: new Date(),
        status: AttendanceStatus.PRESENT, 
        dailyLog: {
          create: {
            userId: emp.id,
            ticketsDone: "Fixed bug",
            blockers: "None",
            actionItems: "Deploy",
          }
        }
      }
    });
  }
  console.log('✅ Generated employees.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });