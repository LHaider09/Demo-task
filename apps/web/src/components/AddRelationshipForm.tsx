import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRelationship } from "../api/api";
import type { Person } from "../api/type";

const schema = z.object({
  parentId: z.string().uuid("Select a parent"),
  childId: z.string().uuid("Select a child"),
});
type FormValues = z.infer<typeof schema>;

function label(p: Person) {
  const year = new Date(p.dateOfBirth).getFullYear();
  return `${p.name} (${year})`;
}

export function AddRelationshipForm({
  people,
  onAdded,
  setInfo,
  setError,
}: {
  people: Person[];
  onAdded: () => Promise<void>;
  setInfo: (msg: string) => void;
  setError: (e: any) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { parentId: "", childId: "" },
  });

  const { watch, formState } = form;
  const { isSubmitting } = formState;

  const childId = watch("childId");

  const parentOptions = useMemo(() => {
    // 1. Filter: Prevent selecting the same person as both parent and child
    const filtered = people.filter((p) => p.id !== childId);
    
    // 2. Sort: Alphabetize the list for better UX
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [people, childId]);

  async function onSubmit(values: FormValues) {
    setInfo("");
    setError(null);

    try {
      await createRelationship(values);
      setInfo("Relationship added");
      await onAdded();
    } catch (e) {
      setError(e);
    }
  }

  return (
    <div className="card">
      <h3 className="cardTitle">Add Relationship</h3>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <label className="label">Child</label>
        <select className="select" {...form.register("childId")}>
          <option value="">Select person</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {label(p)}
            </option>
          ))}
        </select>
        {form.formState.errors.childId && (
          <div className="fieldError">{form.formState.errors.childId.message}</div>
        )}

        <label className="label">Parent</label>
        <select className="select" {...form.register("parentId")}>
          <option value="">Select person</option>
          {parentOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {label(p)}
            </option>
          ))}
        </select>
        <div className="hint">Max 2 parents</div>
        {form.formState.errors.parentId && (
          <div className="fieldError">{form.formState.errors.parentId.message}</div>
        )}

        <button className="btn" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Adding..." : "Add Parent"}
        </button>
      </form>
    </div>
  );
}