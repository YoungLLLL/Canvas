import { z } from "zod";

export const locales = ["zh", "en"] as const;
export const localeSchema = z.enum(locales);
export type Locale = z.infer<typeof localeSchema>;
export const defaultLocale: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return localeSchema.safeParse(value).success;
}

export function assertLocale(value: string): Locale {
  return localeSchema.parse(value);
}
