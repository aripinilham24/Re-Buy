import bcrypt from "bcrypt";
import UserModel from "../features/user/user.model.js";
import CategoryModel from "../features/category/category.model.js";
import ProductModel from "../features/product/product.model.js";
import CouponModel from "../features/coupon/coupon.model.js";
import { env } from "../config/env.js";
import { connectDB, disconnectDB } from "../config/database.js";
import { logger } from "../common/logger.js";

const categories = [
  { name: "Elektronik", slug: "elektronik" },
  { name: "Fashion", slug: "fashion" },
  { name: "Buku", slug: "buku" },
  { name: "Perabot", slug: "perabot" },
];

const products = [
  {
    name: "Laptop Lenovo ThinkPad Bekas",
    slug: "laptop-lenovo-thinkpad-bekas",
    description:
      "Laptop bekas kondisi baik, sudah dirawat dan siap dipakai untuk kerja atau kuliah.",
    condition: "good",
    price: 3_500_000,
    stock: 1,
    categorySlug: "elektronik",
    location: "Bandung",
  },
  {
    name: "Kemeja Flanel Uniqlo",
    slug: "kemeja-flanel-uniqlo",
    description:
      "Kemeja flanel ukuran M, pemakaian ringan, tanpa sobek atau noda.",
    condition: "like_new",
    price: 120_000,
    stock: 1,
    categorySlug: "fashion",
    location: "Jakarta",
  },
  {
    name: "Buku Clean Code",
    slug: "buku-clean-code",
    description:
      "Buku Clean Code karya Robert C. Martin, kondisi baik, halaman lengkap.",
    condition: "good",
    price: 180_000,
    stock: 1,
    categorySlug: "buku",
    location: "Yogyakarta",
  },
  {
    name: "Meja Kerja Kayu Minimalis",
    slug: "meja-kerja-kayu-minimalis",
    description:
      "Meja kerja kayu minimalis 120x60 cm, kokoh, terdapat sedikit bekas pemakaian.",
    condition: "fair",
    price: 450_000,
    stock: 1,
    categorySlug: "perabot",
    location: "Surabaya",
  },
];

const seedAdmin = async () => {
  const email = env.ADMIN_EMAIL ?? "admin@rebuy.local";
  const password = env.ADMIN_PASSWORD ?? "Admin123!";
  const username = env.ADMIN_USERNAME ?? "admin";

  const existing = await UserModel.findOne({ email });
  if (existing) {
    logger.info({ email }, "Admin already exists, skipping");
    return existing;
  }

  const admin = await UserModel.create({
    username,
    email,
    password: await bcrypt.hash(password, env.BCRYPT_SALT),
    role: "admin",
    emailVerifiedAt: new Date(),
  });

  logger.info({ email }, "Admin user seeded");
  return admin;
};

const seedCategories = async () => {
  const result = new Map<string, string>();

  for (const category of categories) {
    const document = await CategoryModel.findOneAndUpdate(
      { slug: category.slug },
      { $setOnInsert: { ...category, isActive: true } },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
    result.set(category.slug, document!._id.toString());
  }

  logger.info(`${categories.length} categories seeded`);
  return result;
};

const seedProducts = async (categoryIds: Map<string, string>) => {
  for (const product of products) {
    const categoryId = categoryIds.get(product.categorySlug);
    if (!categoryId) continue;

    await ProductModel.findOneAndUpdate(
      { slug: product.slug },
      {
        $setOnInsert: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          categoryId,
          condition: product.condition,
          price: product.price,
          stock: product.stock,
          images: [],
          status: "active",
          location: product.location,
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
  }

  logger.info(`${products.length} products seeded`);
};

const seedCoupon = async () => {
  await CouponModel.findOneAndUpdate(
    { code: "HEMAT10" },
    {
      $setOnInsert: {
        code: "HEMAT10",
        type: "percent",
        value: 10,
        minSpend: 100_000,
        maxDiscount: 50_000,
        perUserLimit: 1,
        isActive: true,
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  logger.info("Coupon HEMAT10 seeded");
};

const run = async () => {
  await connectDB();
  await seedAdmin();
  const categoryIds = await seedCategories();
  await seedProducts(categoryIds);
  await seedCoupon();
  await disconnectDB();
};

run().catch(async (error) => {
  logger.error({ error }, "Seed failed");
  await disconnectDB().catch(() => undefined);
  process.exit(1);
});
