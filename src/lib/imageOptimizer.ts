/**
 * Utilidad de subida de imágenes de máxima fidelidad.
 * Si la imagen pesa menos de 5MB, preserva el archivo original al 100% de calidad sin re-compresión.
 * Si supera los 5MB, realiza optimización a 2K QHD (2560x1440) al 95% de calidad.
 */

export interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "image/webp" | "image/jpeg" | "image/png";
}

export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {},
): Promise<File> {
  const {
    maxWidth = 2560,
    maxHeight = 1440,
    quality = 0.95,
    format = "image/webp",
  } = options;

  return new Promise((resolve, reject) => {
    // Si la imagen ya pesa menos de 5MB y es un formato web común, preservarla 100% original
    if (file.size <= 5 * 1024 * 1024) {
      resolve(file);
      return;
    }

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

        const ratio = Math.min(
          maxWidth / originalWidth,
          maxHeight / originalHeight,
          1,
        );
        const targetWidth = Math.round(originalWidth * ratio);
        const targetHeight = Math.round(originalHeight * ratio);

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

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
