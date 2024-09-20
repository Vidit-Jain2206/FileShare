-- AlterTable
ALTER TABLE "File" ADD COLUMN     "encryptedKey" TEXT NOT NULL DEFAULT 'Frwef',
ADD COLUMN     "iv" TEXT NOT NULL DEFAULT 'Vdfs';
