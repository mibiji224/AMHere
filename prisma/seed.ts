// @ts-nocheck
import { PrismaClient, Role, AttendanceStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Force load the .env file so the client can find the URL
dotenv.config();

// Initialize standard Prisma Client (No adapter needed for seeding)
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeder...');

  // Clear existing users
  await prisma.user.deleteMany();

  // 1. Create Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      password: hashedPassword,
      firstName: 'Desiree',
      lastName: 'Soronio',
      role: Role.ADMIN,
      hourlyRate: 50.00,
      position: 'Supervisor',
      employeeId: '999999',
    },
  });
  console.log(`✅ Created Admin: ${admin.email} (Pass: admin123)`);

  // 2. Create Employees
  for (let i = 0; i < 5; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`;
    
    // 👇 FIX: Guaranteed Unique 6-Digit ID
    const uniqueId = String(100000 + i); 

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
        employeeId: uniqueId, 
      },
    });

    console.log(`👤 Created Employee: ${firstName} ${lastName} | ID: ${uniqueId}`);
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