import crypto from "crypto";
import { ENV } from "../config/env.js";
import { ApiError } from "./ApiError.js";

function assertCloudinaryConfig() {
  if (!ENV.CLOUDINARY_CLOUD_NAME) {
    throw ApiError.internal("Cloudinary is not configured: missing CLOUDINARY_CLOUD_NAME");
  }
  if (!ENV.CLOUDINARY_API_KEY) {
    throw ApiError.internal("Cloudinary is not configured: missing CLOUDINARY_API_KEY");
  }
  if (!ENV.CLOUDINARY_API_SECRET) {
    throw ApiError.internal("Cloudinary is not configured: missing CLOUDINARY_API_SECRET");
  }
}

function signUploadParams(params: Record<string, string>, apiSecret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(`${toSign}${apiSecret}`)
    .digest("hex");
}

export async function uploadToCloudinary(
  fileData: string,
  folder: string,
): Promise<string> {
  assertCloudinaryConfig();

  const cloudName = ENV.CLOUDINARY_CLOUD_NAME;
  const apiKey = ENV.CLOUDINARY_API_KEY;
  const apiSecret = ENV.CLOUDINARY_API_SECRET;
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = signUploadParams({ folder, timestamp }, apiSecret);
      const body = new URLSearchParams({
        file: fileData,
        folder,
        timestamp,
        api_key: apiKey,
        signature,
      });

      const response = await fetch(uploadUrl, {
        method: "POST",
        body,
        signal: AbortSignal.timeout(30_000),
      });

      const payload = (await response.json()) as {
        secure_url?: string;
        error?: { message?: string };
      };

      if (!response.ok || !payload.secure_url) {
        const message = payload.error?.message || "Cloudinary upload failed";
        throw ApiError.internal(message);
      }

      return payload.secure_url;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 750 * attempt));
        continue;
      }
    }
  }

  throw ApiError.internal(
    `Unable to reach Cloudinary. Check server internet/firewall and CLOUDINARY_CLOUD_NAME. (${(lastError as Error)?.message || "upload failed"})`,
  );
}
