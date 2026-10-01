/**
 * Compresión de imágenes en el cliente usando Canvas API.
 * Reduce fotos pesadas (e.g. 5-10 MB de celulares) a tamaños óptimos (~200-500 KB)
 * antes de enviarlas al servidor o a Firebase Storage.
 */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.85,
): Promise<File> {
  // Si no es imagen o ya es un archivo muy pequeño (< 400 KB), devolverlo directamente
  if (!file.type.startsWith("image/") || file.size < 400 * 1024) {
    return file;
  }

  // Si es un GIF animado o SVG, no comprimir con canvas para no romper la animación o vector
  if (file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }

  return new Promise<File>((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            // Devolver como nuevo archivo con el nombre original
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality,
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
}
