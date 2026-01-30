import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPerson } from "../api/api";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  placeOfBirth: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function CreatePersonForm({
  onCreated,
  setInfo,
  setError,
}: {
  onCreated: () => Promise<void>;
  setInfo: (msg: string) => void;
  setError: (e: any) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", dateOfBirth: "", placeOfBirth: "" },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: FormValues) {
    setInfo("");
    setError(null);

    try {
      await createPerson(values);
      setInfo("Person created");
      form.reset();
      await onCreated();
    } catch (e) {
      setError(e);
    }
  }

  return (
    <div className="card">
      <h3 className="cardTitle">Create Person</h3>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <label className="label">Name*</label>
        <input className="input" {...form.register("name")} />
        {form.formState.errors.name && <div className="fieldError">{form.formState.errors.name.message}</div>}

        <label className="label">Date of birth* (YYYY-MM-DD)</label>
        <input className="input" placeholder="1980-01-02" {...form.register("dateOfBirth")} />
        {form.formState.errors.dateOfBirth && (
          <div className="fieldError">{form.formState.errors.dateOfBirth.message}</div>
        )}

        <label className="label">Place of birth (optional)</label>
        <input className="input" {...form.register("placeOfBirth")} />

        <button className="btn" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}
