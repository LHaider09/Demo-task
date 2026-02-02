import type { Person, TreeNode } from "../api/type";
import { TreeView } from "./TreeView";

function label(p: Person) {
  const year = new Date(p.dateOfBirth).getFullYear();
  return `${p.name} (${year})`;
}

export function FamilyTreeView({
  people,
  rootId,
  setRootId,
  tree,
  loading,
}: {
  people: Person[];
  rootId: string;
  setRootId: (id: string) => void;
  tree: TreeNode | null;
  loading: boolean;
}) {
  return (
    <div className="card">
      <div className="row">
        <label className="labelInline">Root person:</label>
        <select className="select" value={rootId} onChange={(e) => setRootId(e.target.value)}>
          <option value="">Select person</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {label(p)}
            </option>
          ))}
        </select>
      </div>

      <div className="hint">Tree updates automatically</div>

      {!rootId && <div className="muted">Select a root person to view the tree.</div>}
      {loading && rootId && <div className="muted">Loading tree...</div>}

      {tree && !loading && (
        <ul className="treeList">
          <TreeView node={tree} />
        </ul>
      )}
    </div>
  );
}
