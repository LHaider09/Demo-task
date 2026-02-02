import { useEffect, useState } from "react";
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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", dateOfBirth: "", placeOfBirth: "" },
  });

  const { isSubmitting } = form.formState;

  //  Prevent future dates in the picker
  const today = new Date().toISOString().split("T")[0];

  // Auto-hide local success message after 3 seconds
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 3000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const name = form.watch("name");
  const dob = form.watch("dateOfBirth");
  const pob = form.watch("placeOfBirth");

  useEffect(() => {
    if (serverError) setServerError(null);
  }, [name, dob, pob]);

  async function onSubmit(values: FormValues) {
    setInfo("");
    setError(null);
    setSuccessMsg(null);
    setServerError(null);

    try {
      await createPerson(values);

      setSuccessMsg("Person created (now selectable)");
      setInfo("Person created");

      form.reset();
      await onCreated();
    } catch (e: any) {
      const msg =
        e?.response?.data?.error?.message ??
        e?.response?.data?.message ??
        e?.message ??
        "Failed to create person";

      setServerError(msg);
      setError(e);
    }
  }

  return (
    <div className="card">
      <h3 className="cardTitle">Create Person</h3>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <label className="label" htmlFor="name">
          Name*
        </label>
        <input className="input" id="name" {...form.register("name")} />
        {form.formState.errors.name && (
          <div className="fieldError">{form.formState.errors.name.message}</div>
        )}

        <label className="label" htmlFor="dateOfBirth">
          Date of birth*
        </label>
        <input
          className="input"
          id="dateOfBirth"
          type="date"
          max={today}
          {...form.register("dateOfBirth")}
        />
        {form.formState.errors.dateOfBirth && (
          <div className="fieldError">
            {form.formState.errors.dateOfBirth.message}
          </div>
        )}

        <div className="hint">You cannot select a future date.</div>

        <label className="label" htmlFor="placeOfBirth">
          Place of birth (optional)
        </label>
        <input
          className="input"
          id="placeOfBirth"
          {...form.register("placeOfBirth")}
        />

        <button className="btn" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating..." : "Create"}
        </button>

        {successMsg && (
          <div style={{ color: "limegreen", marginTop: "8px" }}>
            {successMsg}
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
