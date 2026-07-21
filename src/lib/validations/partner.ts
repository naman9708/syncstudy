import { z } from "zod";

export const searchPartnerSchema = z.object({
  email: z.string().min(1, "Enter your partner's email").email("Enter a valid email"),
});
export type SearchPartnerInput = z.infer<typeof searchPartnerSchema>;
