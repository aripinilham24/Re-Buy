import type { ProductDto } from "@rebuy/contracts";
import type { CategoryDocument } from "../category/category.model.js";
import { toPublicObjectUrl } from "../../config/s3.js";
import type { ProductDocument } from "./product.model.js";

export type PopulatedProduct = Omit<ProductDocument, "categoryId"> & {
  categoryId: CategoryDocument;
};

export const toProductDto = (product: PopulatedProduct): ProductDto => ({
  productId: product._id.toString(),
  name: product.name,
  slug: product.slug,
  description: product.description,
  category: {
    categoryId: product.categoryId._id.toString(),
    name: product.categoryId.name,
    slug: product.categoryId.slug,
  },
  condition: product.condition,
  price: product.price,
  stock: product.stock,
  images: [...product.images]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((image) => ({
      key: image.key,
      url: toPublicObjectUrl(image.key),
      alt: image.alt ?? undefined,
      order: image.order ?? 0,
    })),
  status: product.status,
  isFeatured: product.isFeatured,
  location: product.location ?? undefined,
  ratingAvg: product.ratingAvg,
  ratingCount: product.ratingCount,
  soldCount: product.soldCount,
  createdAt: new Date(product.createdAt).toISOString(),
  updatedAt: new Date(product.updatedAt).toISOString(),
});
