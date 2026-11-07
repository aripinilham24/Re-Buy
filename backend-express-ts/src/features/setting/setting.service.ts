import type { AdminSettingsDto, UpdateSettingsInput } from "@rebuy/contracts";
import { env } from "../../config/env.js";
import SettingModel, { type SettingDocument } from "./setting.model.js";

const toSettingsDto = (setting: SettingDocument): AdminSettingsDto => ({
  storeName: setting.storeName,
  storeDescription: setting.storeDescription ?? undefined,
  shippingFlatRate: setting.shippingFlatRate,
  updatedAt: new Date(setting.updatedAt).toISOString(),
});

export const getSettings = async (): Promise<AdminSettingsDto> => {
  const setting = await SettingModel.findOne({ key: "store" });

  if (!setting) {
    return {
      storeName: "Re:Buy",
      storeDescription: "Sustainable marketplace for second-hand goods.",
      shippingFlatRate: env.SHIPPING_FLAT_RATE,
    };
  }

  return toSettingsDto(setting);
};

export const getShippingFlatRate = async () => {
  const setting = await SettingModel.findOne({ key: "store" });
  return setting?.shippingFlatRate ?? env.SHIPPING_FLAT_RATE;
};

export const updateSettings = async (
  input: UpdateSettingsInput,
): Promise<AdminSettingsDto> => {
  const setting = await SettingModel.findOneAndUpdate(
    { key: "store" },
    { $set: input },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  );
  if (!setting) {
    return getSettings();
  }

  return toSettingsDto(setting);
};
