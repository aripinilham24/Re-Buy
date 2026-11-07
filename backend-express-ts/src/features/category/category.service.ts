import type {
  CategoryInput,
  CategoryDto,
  UpdateCategoryInput,
} from "@rebuy/contracts";
import { AppError } from "../../common/errors.js";
import { buildUniqueSlug, slugify } from "../../common/slug.js";
import * as categoryRepository from "./category.repository.js";
import { toCategoryDto } from "./category.repository.js";
import { countProductsByCategory } from "../product/product.repository.js";

const assertParent = async (parentId?: string | null) => {
  if (!parentId) return;
  const parent = await categoryRepository.findCategoryById(parentId);
  if (!parent) throw AppError.badRequest("Parent category not found");
};

export const listCategories = async (
  includeInactive = false,
): Promise<CategoryDto[]> => {
  const categories = await categoryRepository.listCategories(includeInactive);
  return categories.map(toCategoryDto);
};

export const createCategory = async (
  input: CategoryInput,
): Promise<CategoryDto> => {
  await assertParent(input.parentId);

  const slug =
    input.slug ??
    (await buildUniqueSlug(input.name, categoryRepository.categorySlugExists));

  if (input.slug) {
    const exists = await categoryRepository.categorySlugExists(input.slug);
    if (exists) throw AppError.conflict("Category slug already exists");
  }

  const category = await categoryRepository.createCategory({ ...input, slug });
  return toCategoryDto(category);
};

export const updateCategory = async (
  categoryId: string,
  input: UpdateCategoryInput,
): Promise<CategoryDto> => {
  const existing = await categoryRepository.findCategoryById(categoryId);
  if (!existing) throw AppError.notFound("Category not found");

  if (input.parentId === categoryId) {
    throw AppError.badRequest("Category cannot be its own parent");
  }
  await assertParent(input.parentId);

  let slug: string | undefined;
  if (input.slug && input.slug !== existing.slug) {
    const exists = await categoryRepository.categorySlugExists(input.slug);
    if (exists) throw AppError.conflict("Category slug already exists");
    slug = input.slug;
  }

  const category = await categoryRepository.updateCategory(categoryId, {
    ...input,
    ...(slug ? { slug } : {}),
  });
  if (!category) throw AppError.notFound("Category not found");

  return toCategoryDto(category);
};

export const deleteCategory = async (categoryId: string) => {
  const existing = await categoryRepository.findCategoryById(categoryId);
  if (!existing) throw AppError.notFound("Category not found");

  const children = await categoryRepository.countChildCategories(categoryId);
  if (children > 0) {
    throw AppError.conflict("Category still has child categories");
  }

  const products = await countProductsByCategory(categoryId);
  if (products > 0) {
    throw AppError.conflict("Category still has products");
  }

  await categoryRepository.deleteCategory(categoryId);
  return { deleted: true };
};

export const suggestSlug = (name: string) => slugify(name);
