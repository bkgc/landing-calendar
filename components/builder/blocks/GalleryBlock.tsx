"use client";

import Image from "next/image";
import { useState } from "react";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@/components/ui";
import type { GalleryBlockProps } from "@/types/blocks";

export function GalleryBlock({
  title = "Conoce nuestro espacio",
  images = [],
  columns = 3,
}: GalleryBlockProps) {
  const [selected, setSelected] = useState<
    GalleryBlockProps["images"][number] | null
  >(null);
  if (!images.length) return null;
  const grid =
    columns === 2
      ? "md:grid-cols-2"
      : columns === 4
        ? "md:grid-cols-4"
        : "md:grid-cols-3";

  return (
    <section className="border-b border-black/10 px-5 py-16 md:py-20 lg:px-8">
      <div className="mx-auto max-w-[1280px] space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--landing-primary)]">
            Galería
          </p>
          <h2 className="mt-2 text-3xl font-semibold">{title}</h2>
        </div>
        <div className={`grid gap-3 ${grid}`}>
          {images.map((image) => (
            <Button
              key={`${image.url}-${image.alt}`}
              aria-label={`Ver ${image.alt || "imagen"}`}
              className="relative aspect-square min-w-0 overflow-hidden rounded-[var(--landing-radius)] p-0"
              variant="light"
              onPress={() => setSelected(image)}
            >
              <Image
                fill
                unoptimized
                alt={image.alt}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
                src={image.url}
              />
            </Button>
          ))}
        </div>
      </div>
      <Modal
        isOpen={Boolean(selected)}
        size="3xl"
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{selected?.alt || "Imagen"}</ModalHeader>
              <ModalBody>
                <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
                  <Image
                    fill
                    unoptimized
                    alt={selected?.alt || "Imagen ampliada"}
                    className="object-contain"
                    sizes="90vw"
                    src={selected?.url || "/favicon.ico"}
                  />
                </div>
              </ModalBody>
              <Button
                className="mx-6 mb-5"
                variant="bordered"
                onPress={onClose}
              >
                Cerrar
              </Button>
            </>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
}
