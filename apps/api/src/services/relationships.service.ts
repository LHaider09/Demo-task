import { prisma } from "../prisma";
import { ApiError } from "../errors/apiError";
import type { CreateRelationshipInput } from "../validation/relationships.schema";

// helper: calculate age difference in years (simple & explainable)
function yearsBetween(older: Date, younger: Date) {
  return younger.getFullYear() - older.getFullYear();
}

export async function createRelationship(input: CreateRelationshipInput) {
  const { parentId, childId } = input;

  // Rule: cannot be own parent
  if (parentId === childId) {
    throw new ApiError(400, "SELF_PARENT", "A person cannot be their own parent");
  }

  // Make sure both people exist
  const [parent, child] = await Promise.all([
    prisma.person.findUnique({ where: { id: parentId } }),
    prisma.person.findUnique({ where: { id: childId } }),
  ]);

  if (!parent || !child) {
    throw new ApiError(404, "PERSON_NOT_FOUND", "Parent or child was not found");
  }

  // Rule: parent must be at least 15 years older
  const diff = yearsBetween(parent.dateOfBirth, child.dateOfBirth);
  if (diff < 15) {
    throw new ApiError(
      400,
      "AGE_RULE",
      "Parent must be at least 15 years older than the child"
    );
  }

  // Rule: child can have max 2 parents
  const existingParentsCount = await prisma.relationship.count({
    where: { childId },
  });

  if (existingParentsCount >= 2) {
    throw new ApiError(400, "TOO_MANY_PARENTS", "A person can have at most 2 parents");
  }

  // Rule: prevent cycles (child cannot be ancestor of parent)
  // Idea: walk upwards from parent via parents-of-parent.
  // If we ever reach childId, adding this relation would create a cycle.
  let currentId = parentId;

  while (true) {
    const rel = await prisma.relationship.findFirst({
      where: { childId: currentId },
    });

    if (!rel) break;

    if (rel.parentId === childId) {
      throw new ApiError(400, "CYCLE", "This relationship would create a cycle");
    }

    currentId = rel.parentId;
  }

  // create relationship (unique constraint prevents duplicates)
  try {
    const relationship = await prisma.relationship.create({
      data: { parentId, childId },
    });
    return relationship;
  } catch (err: any) {
    // Prisma unique constraint error code is typically P2002
    if (err?.code === "P2002") {
      throw new ApiError(409, "DUPLICATE", "This relationship already exists");
    }
    throw err;
  }
}
