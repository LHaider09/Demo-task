import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRelationship } from "../api/api";
import type { Person } from "../api/type";

const schema = z.object({
  parentId: z.uuid("Select a parent"),
  childId: z.uuid("Select a child"),
});
type FormValues = z.infer<typeof schema>;

function label(p: Person) {
  const year = new Date(p.dateOfBirth).getFullYear();
  return `${p.name} (${year})`;
}

export function AddRelationshipForm({
  people,
  onAdded,
  setError,
}: {
  people: Person[];
  onAdded: () => Promise<void>;
  setError: (e: any) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { parentId: "", childId: "" },
  });

  const { watch, formState, reset } = form;
  const { isSubmitting } = formState;

  const childId = watch("childId");
  const parentId = watch("parentId");
  useEffect(() => {
    if (serverError) setServerError(null);
  }, [childId, parentId]);

  useEffect(() => {
    if (!serverError) return;
    const t = setTimeout(() => setServerError(null), 5000);
    return () => clearTimeout(t);
  }, [serverError]);

  // Auto-hide success after 3 seconds
  useEffect(() => {
    if (!serverSuccess) return;
    const t = setTimeout(() => setServerSuccess(null), 3000);
    return () => clearTimeout(t);
  }, [serverSuccess]);

  const parentOptions = useMemo(() => {
    const filtered = people.filter((p) => p.id !== childId);
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [people, childId]);

async function onSubmit(values: FormValues) {
  setError(null);
  setServerError(null);
  setServerSuccess(null);

  try {
    await createRelationship(values);

    setServerSuccess("Relationship added successfully");

    reset();
    await onAdded();
  } catch (e: any) {
    const msg =
      e?.response?.data?.error?.message ??
      e?.response?.data?.message ??
      e?.message ??
      "Failed to add relationship";
    setServerError(msg);
    setError(e);
  }
}


  return (
    <div className="card">
      <h3 className="cardTitle">Add Relationship</h3>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <label className="label" htmlFor="childId">
          Child
        </label>
        <select className="select" id="childId" {...form.register("childId")}>
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

        <label className="label" htmlFor="parentId">
          Parent
        </label>
        <select className="select" id="parentId" {...form.register("parentId")}>
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

        {serverSuccess && (
          <div className="fieldSuccess" style={{ marginTop: "8px" }}>
            {serverSuccess}
          </div>
        )}

        {serverError && (
          <div className="fieldError" style={{ marginTop: "8px" }}>
            {serverError}
          </div>
        )}
      </form>
    </div>
  );
}
