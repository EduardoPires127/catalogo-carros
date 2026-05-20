"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden bg-gray-900 mb-3">
        <Image
          src={images[active]}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                active === i ? "border-yellow-500" : "border-transparent hover:border-gray-300"
              }`}
            >
              <Image src={img} alt={`Foto ${i + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
