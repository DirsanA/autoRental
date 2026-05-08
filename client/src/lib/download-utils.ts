import { resolveApiBaseUrl } from "./api-base-url";
import { buildAuthHeader } from "./auth-token";

const API_BASE_URL = resolveApiBaseUrl();

/**
 * Fetches a file from the proxy with authentication and returns a local object URL.
 */
export async function fetchAuthenticatedBlob(url: string): Promise<string> {
  const proxyUrl = `${API_BASE_URL}/admin/p2p/proxy-file?url=${encodeURIComponent(url)}`;
  
  const response = await fetch(proxyUrl, {
    headers: {
      ...buildAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }

  const blob = await response.blob();
  return window.URL.createObjectURL(blob);
}

/**
 * Triggers a file download for a given URL via the backend proxy with authentication.
 */
export async function downloadFile(url: string, filename: string) {
  if (!url) return;

  try {
    const blobUrl = await fetchAuthenticatedBlob(url);
    
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename.includes(".") ? filename : `${filename}${isPdfUrl(url) ? ".pdf" : ""}`;
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Authenticated download failed:", error);
    // Final fallback
    window.open(url, "_blank");
  }
}

/**
 * Checks if a URL points to a PDF file.
 */
export function isPdfUrl(url: string): boolean {
  if (!url) return false;
  const lowercaseUrl = url.toLowerCase();
  return (
    lowercaseUrl.endsWith(".pdf") || 
    lowercaseUrl.includes(".pdf?") || 
    lowercaseUrl.includes("/pdf/") ||
    lowercaseUrl.includes("ownership") ||
    lowercaseUrl.includes("insurance") ||
    lowercaseUrl.includes("license")
  );
}

/**
 * Checks if a URL points to an image file.
 */
export function isImageUrl(url: string): boolean {
  if (!url) return false;
  return /\.(jpg|jpeg|png|gif|webp|svg)($|\?)/i.test(url) || url.includes("/image/upload/");
}

/**
 * Returns the direct proxy URL (for components that handle auth themselves, like <img> with crossOrigin)
 * For iframes, we should use the blob approach in the component.
 */
export function getProxyUrl(url: string): string {
  if (!url) return "";
  return `${API_BASE_URL}/admin/p2p/proxy-file?url=${encodeURIComponent(url)}`;
}



