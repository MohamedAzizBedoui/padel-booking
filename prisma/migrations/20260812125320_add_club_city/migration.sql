/*
  Warnings:

  - You are about to drop the column `logo` on the `Club` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Club` table. All the data in the column will be lost.
  - Added the required column `city` to the `Club` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Club" DROP COLUMN "logo",
DROP COLUMN "phone",
ADD COLUMN     "city" TEXT NOT NULL;
