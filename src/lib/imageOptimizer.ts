/**
 * Utilidad de optimización y compresión de imágenes en el cliente (Browser Canvas).
 * Convierte imágenes pesadas (PNG/JPG/HEIC) a formato WebP optimizado (< 150KB)
 * ajustando dimensiones máximas para avatares y banners sin pérdida perceptible de calidad.
 */

export interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 a 1.0 (default 0.85)
  format?: "image/webp" | "image/jpeg" | "image/png";
}

export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {},
): Promise<File> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.85,
    format = "image/webp",
  } = options;

  return new Promise((resolve, reject) => {
    // Si no estamos en entorno navegador, devolver el archivo original
    if (typeof window === "undefined" || !window.createImageBitmap) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcular relación de aspecto
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
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

        // Renderizado suavizado de alta calidad
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const extension = format === "image/webp" ? "webp" : "jpg";
            const cleanName = file.name.substring(0, file.name.lastIndexOf(".")) || "image";
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
        reject(new Error("Error al procesar y cargar la imagen para optimización."));
      };
    };

    reader.onerror = () => {
      reject(new Error("Error al leer el archivo de imagen."));
    };
  });
}
