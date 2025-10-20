-- CreateTable
CREATE TABLE "prescription" (
    "Id" UUID NOT NULL,
    "patientId" UUID,
    "docterId" UUID,
    "content" TEXT,
    "creat_time" DATE,
    "update_time" DATE,

    CONSTRAINT "prescription_pkey" PRIMARY KEY ("Id")
);
