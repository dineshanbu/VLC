import { HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap } from 'rxjs';

const IMAGE_FILE_EXTENSION = /\.(avif|bmp|gif|jpe?g|png|svg|tiff?|webp)$/i;
const MAX_IMAGE_UPLOAD_BYTES = 600_000;
const MAX_WEBP_QUALITY = 0.95;
const MIN_WEBP_QUALITY = 0.85;

function isImageFile(value: FormDataEntryValue): value is File {
  return typeof File !== 'undefined'
    && value instanceof File
    && (value.type.startsWith('image/') || IMAGE_FILE_EXTENSION.test(value.name));
}

function canvasToWebp(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob?.type === 'image/webp') {
        resolve(blob);
      } else {
        reject(new Error('This browser could not convert the image to WebP.'));
      }
    }, 'image/webp', quality);
  });
}

async function encodeWithinLimit(canvas: HTMLCanvasElement): Promise<{ blob: Blob; quality: number } | null> {
  const lowestQualityBlob = await canvasToWebp(canvas, MIN_WEBP_QUALITY);
  if (lowestQualityBlob.size > MAX_IMAGE_UPLOAD_BYTES) {
    return null;
  }

  let low = MIN_WEBP_QUALITY;
  let high = MAX_WEBP_QUALITY;
  let bestBlob = lowestQualityBlob;
  let bestQuality = MIN_WEBP_QUALITY;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const quality = (low + high) / 2;
    const blob = await canvasToWebp(canvas, quality);

    if (blob.size <= MAX_IMAGE_UPLOAD_BYTES) {
      bestBlob = blob;
      bestQuality = quality;
      low = quality;
    } else {
      high = quality;
    }
  }

  return { blob: bestBlob, quality: bestQuality };
}

async function compressCanvasToWebp(image: HTMLImageElement, canvas: HTMLCanvasElement): Promise<Blob> {
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Could not prepare the image for WebP conversion.');
  }
  context.drawImage(image, 0, 0);

  let encoded = await encodeWithinLimit(canvas);
  if (encoded) {
    return encoded.blob;
  }

  // If quality alone cannot meet the cap, gradually reduce dimensions while
  // retaining the highest quality that fits at each size.
  let width = canvas.width;
  let height = canvas.height;
  for (let attempt = 0; attempt < 16 && Math.max(width, height) > 320; attempt += 1) {
    const sizeRatio = Math.sqrt(MAX_IMAGE_UPLOAD_BYTES / (await canvasToWebp(canvas, MIN_WEBP_QUALITY)).size);
    const scale = Math.max(320 / Math.max(width, height), Math.min(0.9, sizeRatio * 0.92));
    width = Math.max(1, Math.floor(width * scale));
    height = Math.max(1, Math.floor(height * scale));
    canvas.width = width;
    canvas.height = height;

    const resizedContext = canvas.getContext('2d');
    if (!resizedContext) {
      throw new Error('Could not resize the image for WebP conversion.');
    }
    resizedContext.drawImage(image, 0, 0, width, height);
    encoded = await encodeWithinLimit(canvas);
    if (encoded) {
      return encoded.blob;
    }
  }

  throw new Error('This image could not be reduced below 600 KB. Please choose a smaller image.');
}

function convertImageToWebp(file: File): Promise<File> {
  if (file.type === 'image/webp' && file.name.toLowerCase().endsWith('.webp') && file.size <= MAX_IMAGE_UPLOAD_BYTES) {
    return Promise.resolve(file);
  }

  return new Promise<File>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      URL.revokeObjectURL(objectUrl);

      compressCanvasToWebp(image, canvas).then((blob) => {
        const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
        resolve(new File([blob], `${baseName}.webp`, {
          type: 'image/webp',
          lastModified: file.lastModified
        }));
      }).catch(reject);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Could not read ${file.name} as an image.`));
    };

    image.src = objectUrl;
  });
}

async function convertFormDataImages(body: FormData): Promise<FormData> {
  const converted = new FormData();

  for (const [key, value] of body.entries()) {
    converted.append(key, isImageFile(value) ? await convertImageToWebp(value) : value);
  }

  return converted;
}

/** Convert uploaded images to WebP consistently for all multipart API uploads. */
export const webpUploadInterceptor: HttpInterceptorFn = (req, next) => {
  if (!(req.body instanceof FormData)) {
    return next(req);
  }

  return from(convertFormDataImages(req.body)).pipe(
    switchMap((body) => next(req.clone({ body }))));
};
