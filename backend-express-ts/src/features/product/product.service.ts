import type {
  AdminProductListQuery,
  ProductDto,
  ProductInput,
  ProductListQuery,
  UpdateProductInput,
} from "@rebuy/contracts";
import { AppError } from "../../common/errors.js";
import { buildUniqueSlug } from "../../common/slug.js";
import { deleteObject } from "../../common/storage.js";
import * as categoryRepository from "../category/category.repository.js";
import * as productRepository from "./product.repository.js";
import { toProductDto } from "./product.mapper.js";

const assertCategory = async (categoryId: string) => {
  const category = await categoryRepository.findCategoryById(categoryId);
  if (!category) throw AppError.badRequest("Category not found");
};

const resolveCategoryId = async (slug?: string) => {
  if (!slug) return undefined;
  const category = await categoryRepository.findCategoryBySlug(slug);
  if (!category) throw AppError.badRequest("Category not found");
  return category._id.toString();
};

export const listPublic = async (query: ProductListQuery) => {
  const categoryId = await resolveCategoryId(query.category);

  return productRepository.listProducts({
    q: query.q,
    categoryId,
    condition: query.condition,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    sort: query.sort,
    limit: query.limit,
    cursor: query.cursor,
    status: "active",
  });
};

export const listAdmin = async (query: AdminProductListQuery) => {
  const categoryId = await resolveCategoryId(query.category);

  return productRepository.listProducts({
    q: query.q,
    categoryId,
    condition: query.condition,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    status: query.status,
    sort: query.sort,
    limit: query.limit,
    cursor: query.cursor,
  });
};

export const getPublicBySlug = async (slug: string): Promise<ProductDto> => {
  const product = await productRepository.findProductBySlug(slug);
  if (!product || product.status !== "active") {
    throw AppError.notFound("Product not found");
  }

  return toProductDto(product);
};

export const getAdminById = async (productId: string): Promise<ProductDto> => {
  const product = await productRepository.findProductById(productId);
  if (!product) throw AppError.notFound("Product not found");

  return toProductDto(product);
};

export const createProduct = async (
  input: ProductInput,
): Promise<ProductDto> => {
  await assertCategory(input.categoryId);

  if (input.slug) {
    const exists = await productRepository.productSlugExists(input.slug);
    if (exists) throw AppError.conflict("Product slug already exists");
  }

  const slug =
    input.slug ??
    (await buildUniqueSlug(
      input.name,
      productRepository.productSlugExists,
    ));

  const created = await productRepository.createProduct({ ...input, slug });
  const product = await productRepository.findProductById(
    created._id.toString(),
  );
  if (!product) throw AppError.notFound("Product not found");

  return toProductDto(product);
};

export const updateProduct = async (
  productId: string,
  input: UpdateProductInput,
): Promise<ProductDto> => {
  const existing = await productRepository.findProductById(productId);
  if (!existing) throw AppError.notFound("Product not found");

  if (input.categoryId) {
    await assertCategory(input.categoryId);
  }

  let slug: string | undefined;
  if (input.slug && input.slug !== existing.slug) {
    const exists = await productRepository.productSlugExists(input.slug);
    if (exists) throw AppError.conflict("Product slug already exists");
    slug = input.slug;
  }

  await productRepository.updateProduct(productId, {
    ...input,
    ...(slug ? { slug } : {}),
  });

  const product = await productRepository.findProductById(productId);
  if (!product) throw AppError.notFound("Product not found");

  return toProductDto(product);
};

export const deleteProduct = async (productId: string) => {
  const product = await productRepository.findProductById(productId);
  if (!product) throw AppError.notFound("Product not found");

  await Promise.allSettled(
    product.images.map((image) => deleteObject(image.key)),
  );
  await productRepository.deleteProduct(productId);

  return { deleted: true };
};
