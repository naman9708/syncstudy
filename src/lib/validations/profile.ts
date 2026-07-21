import { z } from "zod";

export const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  college: z.string().max(100),
  branch: z.string().max(100),
  semester: z.string().max(20),
});
export type ProfileFormInput = z.infer<typeof profileFormSchema>;
