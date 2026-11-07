"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImageDto } from "@rebuy/contracts";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: ProductImageDto[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  if (!active) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-gray-800 bg-gray-900 text-gray-500">
        Tanpa gambar
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
        <Image
          src={active.url}
          alt={active.alt ?? name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.key}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-gray-900",
                index === activeIndex
                  ? "border-green-500"
                  : "border-gray-800",
              )}
            >
              <Image
                src={image.url}
                alt={image.alt ?? `${name} ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
