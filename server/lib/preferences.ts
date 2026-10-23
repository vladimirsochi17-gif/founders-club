import { z } from "zod";

// UI preferences are not an authorization or domain-data store.
export const preferencesSchema = z.object({
  themeMotion: z.boolean().optional(),
  onboardingGoal: z.string().max(120).optional(),
  saved: z.array(z.string().regex(/^[a-z0-9-]{3,80}$/)).max(500).optional(),
  notifications: z.array(z.string().max(120)).max(30).optional(),
  preferences: z.record(z.string().max(120), z.boolean()).refine(value => Object.keys(value).length <= 40).optional(),
});
export const safePreferences = (value: unknown) => {
  const parsed = preferencesSchema.safeParse(value || {});
  return parsed.success ? parsed.data : {};
};
