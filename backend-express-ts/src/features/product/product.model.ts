import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const productImageSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },
    alt: { type: String, trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    condition: {
      type: String,
      enum: ["new", "like_new", "good", "fair"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
    images: {
      type: [productImageSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "active", "sold", "archived"],
      default: "draft",
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      trim: true,
    },
    ratingAvg: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ categoryId: 1, status: 1, price: 1 });
productSchema.index({ isFeatured: 1, status: 1, createdAt: -1 });
productSchema.index({ name: "text", description: "text" });

export type Product = InferSchemaType<typeof productSchema>;
export type ProductDocument = HydratedDocument<Product>;

export default model<Product>("Product", productSchema);
