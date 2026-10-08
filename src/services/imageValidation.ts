export const imageValidationLimits = {
  maxBytes: 20 * 1024 * 1024,
  minDimension: 512,
  maxDimension: 12_000,
} as const;

const mimeToExtension: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

const extensionToMime: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
};

export type PickedImageMetadata = {
  mimeType?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  width: number;
  height: number;
};

export type ValidatedImage = {
  mimeType: string;
  extension: string;
  sizeBytes: number;
  width: number;
  height: number;
};

export type ImageValidationResult =
  | { ok: true; image: ValidatedImage }
  | { ok: false; message: string };

export function validatePickedImage(
  image: PickedImageMetadata,
  measuredSize?: number,
): ImageValidationResult {
  const normalizedMime = image.mimeType?.toLowerCase() ?? null;
  const extension = image.fileName?.split('.').pop()?.toLowerCase();
  const mimeType = normalizedMime ?? (extension ? extensionToMime[extension] : undefined);
  const supportedExtension = mimeType ? mimeToExtension[mimeType] : undefined;

  if (!mimeType || !supportedExtension) {
    return {
      ok: false,
      message: 'Choose a JPEG, PNG, WebP, HEIC, or HEIF photo. Other file formats are not supported.',
    };
  }

  const sizeBytes = image.fileSize ?? measuredSize;
  if (!sizeBytes || !Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return {
      ok: false,
      message: 'We could not read this photo’s file size. Try choosing or capturing it again.',
    };
  }
  if (sizeBytes > imageValidationLimits.maxBytes) {
    return { ok: false, message: 'This photo is over 20 MB. Choose a smaller image.' };
  }

  if (!Number.isInteger(image.width) || !Number.isInteger(image.height) || image.width <= 0 || image.height <= 0) {
    return { ok: false, message: 'We could not read this photo’s dimensions. Try another image.' };
  }
  if (image.width < imageValidationLimits.minDimension || image.height < imageValidationLimits.minDimension) {
    return { ok: false, message: 'Choose an image that is at least 512 × 512 pixels.' };
  }
  if (image.width > imageValidationLimits.maxDimension || image.height > imageValidationLimits.maxDimension) {
    return { ok: false, message: 'This image is larger than 12,000 pixels on a side. Choose a smaller photo.' };
  }

  return {
    ok: true,
    image: {
      mimeType,
      extension: supportedExtension,
      sizeBytes,
      width: image.width,
      height: image.height,
    },
  };
}
