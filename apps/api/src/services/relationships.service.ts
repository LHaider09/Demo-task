import { prisma } from "../prisma";
import { ApiError } from "../errors/apiError";
import type { CreateRelationshipInput } from "../validation/relationships.schema";

// FIX 1: Robust Age Calculation
// Handles edge cases where the birthday hasn't happened yet in the current year.
function getAgeDifference(older: Date, younger: Date) {
  let age = younger.getFullYear() - older.getFullYear();
  const m = younger.getMonth() - older.getMonth();

  // If the younger person's birth month/day hasn't occurred yet in the relative year, subtract 1
  if (m < 0 || (m === 0 && younger.getDate() < older.getDate())) {
    age--;
  }
  return age;
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

  // FIX 1 Usage: Check precise age difference
  const diff = getAgeDifference(parent.dateOfBirth, child.dateOfBirth);
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

  // FIX 2: Recursive Cycle Detection (DFS)
  // We must check ALL ancestors, not just the first one found.
  const checkForCycle = async (currentAncestorId: string, targetChildId: string) => {
    // 1. Fetch all parents of the current ancestor
    const parents = await prisma.relationship.findMany({
      where: { childId: currentAncestorId },
      select: { parentId: true },
    });

    for (const relation of parents) {
      // If we encounter the targetChildId in the ancestry, it's a cycle
      if (relation.parentId === targetChildId) {
        throw new ApiError(400, "CYCLE", "This relationship would create a cycle");
      }
      // Recursive step: check this parent's parents
      await checkForCycle(relation.parentId, targetChildId);
    }
  };

  // Start the check: Can 'childId' be found in 'parentId's ancestry?
  await checkForCycle(parentId, childId);

  // Create relationship
  try {
    const relationship = await prisma.relationship.create({
      data: { parentId, childId },
    });
    return relationship;
  } catch (err: any) {
    if (err?.code === "P2002") {
      throw new ApiError(409, "DUPLICATE", "This relationship already exists");
    }
    throw err;
  }
}