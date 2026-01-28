import { z } from "zod";

export const lexicalContentSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val) return true;
      try {
        const parsed = JSON.parse(val);
        return parsed?.root !== undefined;
      } catch {
        return false;
      }
    },
    { message: "Invalid rich text content" },
  );
