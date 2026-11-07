"use client";

import { useState } from "react";
import Image from "next/image";
import type {
  ProductImageDto,
  ProductImageInput,
  UploadContentType,
} from "@rebuy/contracts";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { Input } from "@/components/ui/input";
import {
  presignUploadService,
  uploadFileToStorage,
} from "../services/productAdminServices";

const ALLOWED_TYPES: UploadContentType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

interface ImageUploaderProps {
  images: ProductImageInput[];
  initialImages?: ProductImageDto[];
  onChange: (images: ProductImageInput[]) => void;
}

export function ImageUploader({
  images,
  initialImages,
  onChange,
}: ImageUploaderProps) {
  const [previews, setPreviews] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (initialImages ?? []).map((image) => [image.key, image.url]),
    ),
  );
  const [uploading, setUploading] = useState(false);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type as UploadContentType)) {
      toast.error("Format gambar harus JPG, PNG, WEBP, atau AVIF");
      event.target.value = "";
      return;
    }

    if (images.length >= 8) {
      toast.error("Maksimal 8 gambar per produk");
      event.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const presigned = await presignUploadService({
        filename: file.name,
        contentType: file.type as UploadContentType,
        folder: "products",
      });
      await uploadFileToStorage(presigned.uploadUrl, file);

      setPreviews((current) => ({
        ...current,
        [presigned.key]: presigned.publicUrl,
      }));
      onChange([...images, { key: presigned.key, order: images.length }]);
      toast.success("Gambar berhasil diunggah");
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal mengunggah gambar"));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((image) => (
          <div
            key={image.key}
            className="relative aspect-square overflow-hidden rounded-lg border border-gray-800 bg-gray-900"
          >
            {previews[image.key] ? (
              <Image
                src={previews[image.key]}
                alt="Gambar produk"
                fill
                sizes="120px"
                className="object-cover"
              />
            ) : null}
            <button
              type="button"
              onClick={() =>
                onChange(images.filter((item) => item.key !== image.key))
              }
              className="absolute top-1 right-1 rounded bg-black/70 px-2 py-1 text-xs text-white"
            >
              Hapus
            </button>
          </div>
        ))}
      </div>

      <Input
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFile}
        disabled={uploading || images.length >= 8}
      />
      <p className="text-xs text-gray-400">
        {uploading
          ? "Mengunggah..."
          : "JPG, PNG, WEBP, atau AVIF. Maksimal 8 gambar."}
      </p>
    </div>
  );
}
