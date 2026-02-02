import type { TreeNode } from "../api/type";

export function TreeView({ node }: { node: TreeNode }) {
  const year = new Date(node.dateOfBirth).getFullYear();

  return (
    <li>
      {node.name} ({year})
      {node.children.length > 0 && (
        <ul>
          {node.children.map((c) => (
            <TreeView key={c.id} node={c} />
          ))}
        </ul>
      )}
    </li>
  );
}
