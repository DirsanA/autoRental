import { GeocodeCache } from "../models/GeocodeCache.js";

type GeocodeResult = { lat: number; lng: number } | null;

function normalizeAddressKey(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s,.-]/gu, "");
}

let lastRequestAt = 0;
let throttleChain: Promise<void> = Promise.resolve();

async function throttleNominatim() {
  throttleChain = throttleChain.then(async () => {
    const now = Date.now();
    const waitMs = Math.max(0, 1100 - (now - lastRequestAt));
    if (waitMs > 0) {
      await new Promise((r) => setTimeout(r, waitMs));
    }
    lastRequestAt = Date.now();
  });

  await throttleChain;
}

export class GeocodingService {
  async geocode(address: string): Promise<GeocodeResult> {
    const normalizedKey = normalizeAddressKey(address);
    if (!normalizedKey) return null;

    const cached = await GeocodeCache.findOne({ key: normalizedKey }).lean();
    if (cached) {
      return { lat: cached.lat, lng: cached.lng };
    }

    await throttleNominatim();

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", address);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(url.toString(), {
        headers: {
          // Nominatim requires a valid User-Agent identifying the application.
          "User-Agent": "autoRental/1.0 (server geocoding)",
        },
        signal: controller.signal,
      });

      if (!res.ok) return null;

      const json = (await res.json()) as Array<{ lat?: string; lon?: string }>;
      const first = json?.[0];
      const lat = first?.lat ? Number(first.lat) : NaN;
      const lng = first?.lon ? Number(first.lon) : NaN;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

      await GeocodeCache.updateOne(
        { key: normalizedKey },
        {
          $set: {
            key: normalizedKey,
            address: address.trim(),
            provider: "nominatim",
            lat,
            lng,
          },
        },
        { upsert: true },
      );

      return { lat, lng };
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const geocodingService = new GeocodingService();

