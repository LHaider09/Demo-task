import { z } from "zod";

export const createPersonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  placeOfBirth: z.string().optional(),
});

export type CreatePersonInput = z.infer<typeof createPersonSchema>;
