import { useEffect, useState } from "react";
import { getTree } from "../api/api";
import type { TreeNode } from "../api/type";

export function useTree(rootId: string) {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(false);

  async function refreshTree() {
    if (!rootId) {
      setTree(null);
      return;
    }
    setLoading(true);
    try {
      const res = await getTree(rootId);
      const treeNode = (res as any).data ?? res;
      setTree(treeNode as TreeNode);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshTree().catch(() => {});
  }, [rootId]);

  return { tree, loading, refreshTree };
}
