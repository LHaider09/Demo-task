import { prisma } from "../prisma";
import { ApiError } from "../errors/apiError";

export type TreeNode = {
  id: string;
  name: string;
  dateOfBirth: string; // ISO string
  placeOfBirth?: string | null;
  children: TreeNode[];
};

// Simple recursive function to build descendant tree
async function buildNode(personId: string, depth: number): Promise<TreeNode> {
  // Safety limit (prevents infinite loops if something goes wrong)
  if (depth > 10) {
    throw new ApiError(400, "TREE_TOO_DEEP", "Tree is too deep");
  }

  const person = await prisma.person.findUnique({ where: { id: personId } });
  if (!person) {
    throw new ApiError(404, "PERSON_NOT_FOUND", "Root person not found");
  }

  // Find children of this person
  const childRelations = await prisma.relationship.findMany({
    where: { parentId: personId },
  });

  const childIds = childRelations.map((r) => r.childId);

  // Build children nodes
  const children: TreeNode[] = [];
  for (const childId of childIds) {
    const childNode = await buildNode(childId, depth + 1);
    children.push(childNode);
  }

  return {
    id: person.id,
    name: person.name,
    dateOfBirth: person.dateOfBirth.toISOString(),
    placeOfBirth: person.placeOfBirth,
    children,
  };
}

export async function getTree(rootId: string): Promise<TreeNode> {
  return buildNode(rootId, 0);
}
