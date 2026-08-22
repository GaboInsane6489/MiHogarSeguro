/**
 * Utilidad de optimización y compresión de imágenes de alta fidelidad en el cliente (Browser Canvas).
 * Preserva nitidez cristalina en pantallas de alta resolución (2K/4K) ajustando dimensiones máximas
 * y ratio proporcional sin pérdidas agresivas de color ni compresión destructiva.
 */

export interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 a 1.0 (default 0.94)
  format?: "image/webp" | "image/jpeg" | "image/png";
}

export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {},
): Promise<File> {
  const {
    maxWidth = 2560,
    maxHeight = 1440,
    quality = 0.94,
    format = "image/webp",
  } = options;

  return new Promise((resolve, reject) => {
    // Si no estamos en entorno navegador, devolver el archivo original
    if (typeof window === "undefined") {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const originalWidth = img.naturalWidth || img.width;
        const originalHeight = img.naturalHeight || img.height;

        // Calcular ratio proporcional de contención
        const ratio = Math.min(
          maxWidth / originalWidth,
          maxHeight / originalHeight,
          1,
        );
        const targetWidth = Math.round(originalWidth * ratio);
        const targetHeight = Math.round(originalHeight * ratio);

        // Si la imagen ya tiene dimensiones adecuadas y pesa menos de 3.5MB, devolver archivo original
        if (
          ratio === 1 &&
          file.size <= 3.5 * 1024 * 1024 &&
          (file.type === "image/webp" ||
            file.type === "image/jpeg" ||
            file.type === "image/png")
        ) {
          resolve(file);
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        // Renderizado suavizado de máxima calidad
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const extension = format === "image/webp" ? "webp" : "jpg";
            const cleanName =
              file.name.substring(0, file.name.lastIndexOf(".")) || "wallpaper";
            const optimizedFile = new File(
              [blob],
              `${cleanName}-opt.${extension}`,
              { type: format, lastModified: Date.now() },
            );

            resolve(optimizedFile);
          },
          format,
          quality,
        );
      };

      img.onerror = () => {
        reject(new Error("Error al decodificar la imagen."));
      };
    };

    reader.onerror = () => {
      reject(new Error("Error al leer el archivo de imagen."));
    };
  });
}
