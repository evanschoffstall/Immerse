import { generateSlug } from "./slug";

/**
 * Extracts and processes name, slug, and content fields from FormData
 * Commonly used for entity creation/update actions
 *
 * @param formData - The FormData object containing form fields
 * @returns Object with processed name, slug, and content fields
 */
export function extractNameSlugContent(formData: FormData): {
  name: string;
  slug: string;
  content: string | undefined;
} {
  const name = formData.get("name") as string;
  const slug = generateSlug(name, formData.get("slug") as string);
  const content = formData.get("content") as string | null;

  return {
    name,
    slug,
    content: content || undefined,
  };
}
