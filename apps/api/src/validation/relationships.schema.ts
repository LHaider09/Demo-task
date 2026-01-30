import { z } from "zod";

export const createRelationshipSchema = z.object({
  parentId: z.string().uuid("parentId must be a valid UUID"),
  childId: z.string().uuid("childId must be a valid UUID"),
});

export type CreateRelationshipInput = z.infer<typeof createRelationshipSchema>;
