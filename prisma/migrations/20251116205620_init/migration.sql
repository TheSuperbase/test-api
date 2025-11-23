-- CreateTable
CREATE TABLE "Tournament" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "applyStartDate" TIMESTAMP(3) NOT NULL,
    "applyEndDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "organizer" TEXT,
    "fee" INTEGER NOT NULL,
    "url" TEXT,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);
