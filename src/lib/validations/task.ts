import { z } from "zod";

import { TASK_CATEGORIES, TASK_PRIORITIES } from "@/types";

export const taskFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(80),
  description: z.string().max(300),
  durationMinutes: z.number().int().min(1, "Must be at least 1 minute").max(600),
  category: z.enum(TASK_CATEGORIES as [string, ...string[]]),
  priority: z.enum(TASK_PRIORITIES as [string, ...string[]]),
});
export type TaskFormInput = z.infer<typeof taskFormSchema>;
