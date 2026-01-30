-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "placeOfBirth" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Relationship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Relationship_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Relationship_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Relationship_childId_idx" ON "Relationship"("childId");

-- CreateIndex
CREATE INDEX "Relationship_parentId_idx" ON "Relationship"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Relationship_parentId_childId_key" ON "Relationship"("parentId", "childId");
