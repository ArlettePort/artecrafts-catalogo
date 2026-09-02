/**
 * Image optimization utilities for ArteCrafts
 * Compresses images client-side before saving to avoid large memory footprints
 * while maintaining crisp visual quality.
 */

export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  format?: 'image/jpeg' | 'image/webp';
}

const DEFAULT_OPTIONS: OptimizeImageOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.85,
  format: 'image/webp',
};

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_INPUT_FILE_SIZE = 10 * 1024 * 1024; // 10MB max upload

/**
 * Validates an uploaded file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Formato no soportado (${file.type}). Sube imágenes en formato JPG, PNG o WebP.`,
    };
  }

  if (file.size > MAX_INPUT_FILE_SIZE) {
    return {
      valid: false,
      error: 'La imagen excede el límite máximo permitido de 10MB.',
    };
  }

  return { valid: true };
}

/**
 * Compresses an image file using an offscreen canvas and returns a base64 Data URL.
 */
export async function optimizeImage(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Archivo inválido');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const maxW = opts.maxWidth || 1200;
        const maxH = opts.maxHeight || 1200;

        // Calculate aspect ratio preserving dimensions
        if (width > height) {
          if (width > maxW) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          }
        } else {
          if (height > maxH) {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar el contexto de imagen'));
          return;
        }

        // Use high quality image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP (or fallback to JPEG if browser does not support webp export)
        try {
          const dataUrl = canvas.toDataURL(opts.format || 'image/webp', opts.quality);
          resolve(dataUrl);
        } catch {
          const fallbackDataUrl = canvas.toDataURL('image/jpeg', opts.quality);
          resolve(fallbackDataUrl);
        }
      };

      img.onerror = () => {
        reject(new Error('No se pudo cargar la imagen seleccionada'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo de imagen'));
    };

    reader.readAsDataURL(file);
  });
}
