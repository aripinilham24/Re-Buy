import type { CategoryInput, CategoryDto } from "@rebuy/contracts";
import CategoryModel, { type CategoryDocument } from "./category.model.js";

export const listCategories = (includeInactive = false) =>
  CategoryModel.find(includeInactive ? {} : { isActive: true }).sort({
    name: 1,
  });

export const findCategoryById = (categoryId: string) =>
  CategoryModel.findById(categoryId);

export const findCategoryBySlug = (slug: string) =>
  CategoryModel.findOne({ slug });

export const categorySlugExists = async (slug: string) =>
  Boolean(await CategoryModel.exists({ slug }));

export const createCategory = (data: CategoryInput & { slug: string }) =>
  CategoryModel.create(data);

export const updateCategory = (
  categoryId: string,
  data: Partial<CategoryInput> & { slug?: string },
) =>
  CategoryModel.findByIdAndUpdate(categoryId, data, {
    returnDocument: "after",
    runValidators: true,
  });

export const deleteCategory = (categoryId: string) =>
  CategoryModel.findByIdAndDelete(categoryId);

export const countChildCategories = (categoryId: string) =>
  CategoryModel.countDocuments({ parentId: categoryId });

export const toCategoryDto = (category: CategoryDocument): CategoryDto => ({
  categoryId: category._id.toString(),
  name: category.name,
  slug: category.slug,
  description: category.description ?? undefined,
  parentId: category.parentId ? category.parentId.toString() : null,
  isActive: category.isActive,
  createdAt: new Date(category.createdAt).toISOString(),
});
