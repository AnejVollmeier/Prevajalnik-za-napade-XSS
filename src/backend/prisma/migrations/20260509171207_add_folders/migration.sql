-- CreateTable
CREATE TABLE "Folder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Folder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Analysis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "folderId" INTEGER,
    "name" TEXT NOT NULL DEFAULT 'Untitled Analysis',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "target" TEXT NOT NULL,
    "inputMode" TEXT NOT NULL,
    "scoreOverall" INTEGER NOT NULL,
    "highCount" INTEGER NOT NULL,
    "mediumCount" INTEGER NOT NULL,
    "lowCount" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "reportJson" TEXT NOT NULL,
    CONSTRAINT "Analysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Analysis_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Analysis" ("code", "createdAt", "highCount", "id", "inputMode", "lowCount", "mediumCount", "reportJson", "scoreOverall", "target", "userId") SELECT "code", "createdAt", "highCount", "id", "inputMode", "lowCount", "mediumCount", "reportJson", "scoreOverall", "target", "userId" FROM "Analysis";
DROP TABLE "Analysis";
ALTER TABLE "new_Analysis" RENAME TO "Analysis";
CREATE INDEX "Analysis_userId_idx" ON "Analysis"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Folder_userId_idx" ON "Folder"("userId");
