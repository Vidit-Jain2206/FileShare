/*
  Warnings:

  - You are about to drop the column `encryptedKey` on the `File` table. All the data in the column will be lost.
  - Added the required column `key` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('COMPLETED', 'PENDING', 'FAILED');

-- AlterTable
ALTER TABLE "File" DROP COLUMN "encryptedKey",
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "status" "Status" NOT NULL,
ALTER COLUMN "iv" DROP DEFAULT;
