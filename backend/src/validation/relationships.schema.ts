import { z } from "zod";

export const createRelationshipSchema = z.object({
  parentId: z.uuid("parentId must be a valid UUID"),
  childId: z.uuid("childId must be a valid UUID"),
});

export type CreateRelationshipInput = z.infer<typeof createRelationshipSchema>;
