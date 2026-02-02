import { prisma } from "../prisma";
import { ApiError } from "../errors/apiError";

export type TreeNode = {
  id: string;
  name: string;
  dateOfBirth: string;
  placeOfBirth?: string | null;
  children: TreeNode[];
};

export async function getTree(rootId: string): Promise<TreeNode> {
  const [allPeople, allRelations] = await Promise.all([
    prisma.person.findMany(),
    prisma.relationship.findMany(),
  ]);

  const personMap = new Map(allPeople.map((p) => [p.id, p]));
  const childrenMap = new Map<string, string[]>();

  for (const rel of allRelations) {
    if (!childrenMap.has(rel.parentId)) {
      childrenMap.set(rel.parentId, []);
    }
    childrenMap.get(rel.parentId)?.push(rel.childId);
  }
  if (!personMap.has(rootId)) {
    throw new ApiError(404, "PERSON_NOT_FOUND", "Root person not found");
  }

  const buildNode = (currentId: string, depth: number): TreeNode => {
    if (depth > 20) {
      throw new ApiError(400, "TREE_TOO_DEEP", "Tree is too deep");
    }

    const person = personMap.get(currentId)!;
    const childIds = childrenMap.get(currentId) || [];

    const children = childIds
      .map((cid) => buildNode(cid, depth + 1))
      .sort((a, b) => new Date(a.dateOfBirth).getTime() - new Date(b.dateOfBirth).getTime());

    return {
      id: person.id,
      name: person.name,
      dateOfBirth: person.dateOfBirth.toISOString(),
      placeOfBirth: person.placeOfBirth,
      children,
    };
  };

  return buildNode(rootId, 0);
}