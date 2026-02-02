
export async function wouldCreateCycle(
  parentId: string,
  childId: string,
  getParentIds: (childId: string) => Promise<string[]>
): Promise<boolean> {
  const visited = new Set<string>();

  async function dfs(currentId: string): Promise<boolean> {
    if (currentId === childId) return true;
    if (visited.has(currentId)) return false;
    visited.add(currentId);

    const parents = await getParentIds(currentId);
    for (const p of parents) {
      if (await dfs(p)) return true;
    }
    return false;
  }

  return dfs(parentId);
}
