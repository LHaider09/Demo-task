import { prisma } from "../prisma";
import { ApiError } from "../errors/apiError";

export type TreeNode = {
  id: string;
  name: string;
  dateOfBirth: string; // ISO string
  placeOfBirth?: string | null;
  children: TreeNode[];
};

export async function getTree(rootId: string): Promise<TreeNode> {
  // 1. Fetch ALL data in just 2 queries (O(1) database load)
  // For a "mini" app, fetching all rows is much faster than N+1 recursive queries.
  const [allPeople, allRelations] = await Promise.all([
    prisma.person.findMany(),
    prisma.relationship.findMany(),
  ]);

  // 2. Create Lookup Maps for O(1) access
  const personMap = new Map(allPeople.map((p) => [p.id, p]));
  const childrenMap = new Map<string, string[]>();

  for (const rel of allRelations) {
    if (!childrenMap.has(rel.parentId)) {
      childrenMap.set(rel.parentId, []);
    }
    childrenMap.get(rel.parentId)?.push(rel.childId);
  }

  // 3. Verify Root Exists
  if (!personMap.has(rootId)) {
    throw new ApiError(404, "PERSON_NOT_FOUND", "Root person not found");
  }

  // 4. Recursive Builder (Synchronous & Fast)
  const buildNode = (currentId: string, depth: number): TreeNode => {
    // Safety check for infinite loops (though cycle detection in createRelationship prevents this)
    if (depth > 20) {
      throw new ApiError(400, "TREE_TOO_DEEP", "Tree is too deep");
    }

    const person = personMap.get(currentId)!; // We know it exists from the map
    const childIds = childrenMap.get(currentId) || [];

    // Recursively build children
    const children = childIds
      .map((cid) => buildNode(cid, depth + 1))
      // Bonus: Sort children by age (Oldest to Youngest)
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