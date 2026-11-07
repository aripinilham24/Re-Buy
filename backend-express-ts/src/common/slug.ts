export const slugify = (value: string) => {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return slug || "item";
};

export const buildUniqueSlug = async (
  value: string,
  exists: (slug: string) => Promise<boolean>,
) => {
  const base = slugify(value);
  let slug = base;
  let suffix = 1;

  while (await exists(slug)) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  return slug;
};
