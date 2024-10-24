-- CreateTable
CREATE TABLE "ProposedExample" (
    "id" SERIAL NOT NULL,
    "input" TEXT NOT NULL,
    "completions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposedExample_pkey" PRIMARY KEY ("id")
);
