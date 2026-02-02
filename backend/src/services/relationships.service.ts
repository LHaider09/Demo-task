import { prisma } from "../prisma";
import { ApiError } from "../errors/apiError";
import type { CreateRelationshipInput } from "../validation/relationships.schema";

function getAgeDifference(older: Date, younger: Date) {
  let age = younger.getFullYear() - older.getFullYear();
  const m = younger.getMonth() - older.getMonth();

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

  // Check precise age difference
  const diff = getAgeDifference(parent.dateOfBirth, child.dateOfBirth);
  if (diff < 15) {
    throw new ApiError(
      400,
      "AGE_RULE",
      "Parent must be at least 15 years older than the child"
    );
  }

  const checkForCycle = async (
    currentAncestorId: string,
    targetChildId: string,
    visited: Set<string>
  ) => {
    if (visited.has(currentAncestorId)) return;
    visited.add(currentAncestorId);

    const parents = await prisma.relationship.findMany({
      where: { childId: currentAncestorId },
      select: { parentId: true },
    });

    for (const relation of parents) {
      if (relation.parentId === targetChildId) {
        throw new ApiError(400, "CYCLE", "This relationship would create a cycle");
      }
      await checkForCycle(relation.parentId, targetChildId, visited);
    }
  };

  await checkForCycle(parentId, childId, new Set<string>());

  try {
    const relationship = await prisma.$transaction(async (tx) => {
      const existingParentsCount = await tx.relationship.count({
        where: { childId },
      });

      if (existingParentsCount >= 2) {
        throw new ApiError(
          400,
          "TOO_MANY_PARENTS",
          "A person can have at most 2 parents"
        );
      }

      return tx.relationship.create({
        data: { parentId, childId },
      });
    });

    return relationship;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;

    if (err?.code === "P2002") {
      throw new ApiError(409, "DUPLICATE", "This relationship already exists");
    }
    throw err;
  }
}
