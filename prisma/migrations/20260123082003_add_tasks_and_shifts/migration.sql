-- AlterTable
ALTER TABLE "ScheduleChangeRequest" ADD COLUMN     "requestedEnd" TEXT,
ADD COLUMN     "requestedStart" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "shiftEnd" TEXT NOT NULL DEFAULT '17:00',
ADD COLUMN     "shiftStart" TEXT NOT NULL DEFAULT '08:00';

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
