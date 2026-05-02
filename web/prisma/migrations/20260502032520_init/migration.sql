-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PLATFORM_ADMIN', 'MAIN_ADMIN', 'SUB_ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LivingType" AS ENUM ('OWN_HOUSE', 'RENTED', 'MONTHLY_SUBSCRIPTION_MAIN', 'MONTHLY_SUBSCRIPTION_SUB');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "mainMahallaId" TEXT,
    "subMahallaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistrationRequest" (
    "id" TEXT NOT NULL,
    "licensePlan" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "mahallaName" TEXT NOT NULL,
    "selfieUrl" TEXT,
    "governmentIdUrl" TEXT,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistrationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MainMahalla" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "coverImage" TEXT,
    "registeredDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT,
    "address" TEXT,
    "country" TEXT,
    "province" TEXT,
    "district" TEXT,
    "area" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MainMahalla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubMahalla" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "coverImage" TEXT,
    "registeredDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT,
    "address" TEXT,
    "area" TEXT,
    "mainMahallaId" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubMahalla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyCard" (
    "id" TEXT NOT NULL,
    "mainMahallaCardNo" TEXT,
    "subMahallaCardNo" TEXT,
    "registeredDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "livingType" "LivingType" NOT NULL,
    "livingFromDate" TIMESTAMP(3),
    "attachments" TEXT[],
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "subMahallaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "nic" TEXT,
    "relationship" TEXT NOT NULL,
    "isBreadwinner" BOOLEAN NOT NULL DEFAULT false,
    "isStudent" BOOLEAN NOT NULL DEFAULT false,
    "school" TEXT,
    "grade" TEXT,
    "occupation" TEXT,
    "monthlyEarnings" DOUBLE PRECISION,
    "maritalStatus" TEXT,
    "dateOfDemise" TIMESTAMP(3),
    "attachments" TEXT[],
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "familyCardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterCountry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "currency" TEXT NOT NULL,

    CONSTRAINT "MasterCountry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterProvince" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MasterProvince_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterDistrict" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MasterDistrict_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterArea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MasterArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterSchool" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MasterSchool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterGrade" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MasterGrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterOccupation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MasterOccupation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationRequest_email_key" ON "RegistrationRequest"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyMember_nic_key" ON "FamilyMember"("nic");

-- CreateIndex
CREATE UNIQUE INDEX "MasterCountry_name_key" ON "MasterCountry"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MasterProvince_name_key" ON "MasterProvince"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MasterDistrict_name_key" ON "MasterDistrict"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MasterArea_name_key" ON "MasterArea"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MasterSchool_name_key" ON "MasterSchool"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MasterGrade_name_key" ON "MasterGrade"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MasterOccupation_name_key" ON "MasterOccupation"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_mainMahallaId_fkey" FOREIGN KEY ("mainMahallaId") REFERENCES "MainMahalla"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_subMahallaId_fkey" FOREIGN KEY ("subMahallaId") REFERENCES "SubMahalla"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubMahalla" ADD CONSTRAINT "SubMahalla_mainMahallaId_fkey" FOREIGN KEY ("mainMahallaId") REFERENCES "MainMahalla"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyCard" ADD CONSTRAINT "FamilyCard_subMahallaId_fkey" FOREIGN KEY ("subMahallaId") REFERENCES "SubMahalla"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_familyCardId_fkey" FOREIGN KEY ("familyCardId") REFERENCES "FamilyCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
