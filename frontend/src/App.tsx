import { useEffect, useState } from "react";
import "./App.css";

import { usePeople } from "./hooks/usePeople";
import { useTree } from "./hooks/useTree";

import { CreatePersonForm } from "./components/CreatePersonForm";
import { AddRelationshipForm } from "./components/AddRelationshipForm";
import { FamilyTreeView } from "./components/FamilyTreeView";

export default function App() {
  const { people, refreshPeople } = usePeople();

  const [rootId, setRootId] = useState("");
  const { tree, loading: treeLoading, refreshTree } = useTree(rootId);

  const [info, setInfo] = useState("");

  // Auto-hide success messages after 3 seconds
  useEffect(() => {
    if (!info) return;

    const t = setTimeout(() => setInfo(""), 3000);
    return () => clearTimeout(t);
  }, [info]);

  // default root when people arrives
  useEffect(() => {
    if (!rootId && people.length > 0) setRootId(people[0].id);
  }, [people, rootId]);

  async function afterCreate() {
    const list = await refreshPeople();
    if (list.length > 0) setRootId(list[list.length - 1].id);
  }

  async function afterRelationship() {
    await refreshTree();
  }

  return (
    <div className="container">
      <h1 className="h1">Family Tree Builder</h1>
      <p className="subtitle">Create people and define parent–child relationships</p>
      <div className="grid">
        <div>
          <h2 className="sectionTitle">Create / Edit</h2>

          <CreatePersonForm
            onCreated={afterCreate}
            setInfo={setInfo}
            setError={() => {}}
          />

          <div style={{ height: 16 }} />

          <AddRelationshipForm
            people={people}
            onAdded={afterRelationship}
            setError={() => {}}
          />
        </div>

        <div>
          <h2 className="sectionTitle">Family Tree View</h2>
          <FamilyTreeView
            people={people}
            rootId={rootId}
            setRootId={setRootId}
            tree={tree}
            loading={treeLoading}
          />
        </div>
      </div>
    </div>
  );
}
