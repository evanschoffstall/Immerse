/**
 * Generates a URL-friendly slug from a string.
 * Converts to lowercase, replaces non-alphanumeric characters with hyphens,
 * and removes leading/trailing hyphens.
 *
 * @param name - The string to convert to a slug
 * @param providedSlug - Optional pre-generated slug to use instead
 * @returns A URL-friendly slug string
 *
 * @example
 * generateSlug("My Cool Campaign") // "my-cool-campaign"
 * generateSlug("Hello World!", "custom-slug") // "custom-slug"
 */
export function generateSlug(
  name: string,
  providedSlug?: string | null,
): string {
  if (providedSlug) return providedSlug;

  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
