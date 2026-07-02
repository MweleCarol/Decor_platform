import { v2 as cloudinary } from "cloudinary";
import { env } from "../../config/env.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

interface UploadResult {
  url: string;
  publicId: string;
}

export function uploadBuffer(
  buffer: Buffer,
  folder: string
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          return reject(error ?? new Error("Cloudinary upload failed"));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

// Upload a base64 string returned by OpenAI image models
export async function uploadBase64(
  b64: string,
  folder: string
): Promise<UploadResult> {
  const dataUri = `data:image/png;base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}