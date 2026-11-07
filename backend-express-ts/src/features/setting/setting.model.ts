import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const settingSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "store",
    },
    storeName: {
      type: String,
      trim: true,
      default: "Re:Buy",
    },
    storeDescription: {
      type: String,
      trim: true,
      default: "Sustainable marketplace for second-hand goods.",
    },
    shippingFlatRate: {
      type: Number,
      min: 0,
      default: 15_000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type Setting = InferSchemaType<typeof settingSchema>;
export type SettingDocument = HydratedDocument<Setting>;

export default model<Setting>("Setting", settingSchema);
