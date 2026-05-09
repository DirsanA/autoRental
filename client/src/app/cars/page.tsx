"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Car,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";

import carFallback from "@/assets/image.jpg";
import Navbar from "@/components/navbar";
import { LandingFooter } from "@/components/marketing/landing-footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { CarLoadingState } from "@/components/shared/car-loading-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Fuse from "fuse.js";

const API_BASE_URL = resolveApiBaseUrl();

const SEARCH_SUGGESTIONS = ["Toyota", "Addis", "under 3000"];

type ApiVehicle = {
  id?: string;
  _id?: string;
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  delivery?: string;
  availability?: string;
  ownerType?: string;
  owner?: {
    name?: string;
    image?: string;
    type: "peerhost" | "company";
  };
  photos?: {
    front?: string;
    gallery?: string[];
  };
};

type VehicleListingCard = {
  id: string;
  name: string;
  location: string;
  price: number;
  priceLabel: string;
  year: number | null;
  image: string | StaticImageData;
  isCompany: boolean;
  owner?: {
    name: string;
    image?: string;
    type: "peerhost" | "company";
  };
  aliases: string[];
  searchText: string;
};

type PriceIntent =
  | { type: "max"; amount: number }
  | { type: "number"; amount: number }
  | null;

type RankedVehicle = {
  item: VehicleListingCard;
  score: number;
};

type SearchField = {
  value: string;
  weight: number;
};

function parseVehiclesPayload(payload: unknown): ApiVehicle[] {
  if (!payload || typeof payload !== "object") return [];

  const dataPayload = payload as {
    data?: { vehicles?: ApiVehicle[] };
  };

  if (Array.isArray(dataPayload.data?.vehicles)) {
    return dataPayload.data.vehicles;
  }

  const directPayload = payload as {
    vehicles?: ApiVehicle[];
  };

  if (Array.isArray(directPayload.vehicles)) {
    return directPayload.vehicles;
  }

  return [];
}

function normalizeSearchValue(value: unknown) {
  if (typeof value !== "string") return "";

  return value
    .toLowerCase()
    .replace(/[,_]+/g, " ")
    .replace(/\b(etb|birr|per day|day|daily)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePriceIntent(query: string): PriceIntent {
  const normalized = normalizeSearchValue(query);

  const amountMatch = normalized.match(/\d+(?:\.\d+)?/);

  if (!amountMatch) return null;

  const amount = Number(amountMatch[0]);

  if (!Number.isFinite(amount)) return null;

  if (/\b(under|below|less than|max|maximum|up to)\b/.test(normalized)) {
    return {
      type: "max",
      amount,
    };
  }

  return {
    type: "number",
    amount,
  };
}

function buildFuseQuery(query: string) {
  const normalized = normalizeSearchValue(query);

  const withoutPriceWords = normalized
    .replace(/\b(under|below|less than|max|maximum|up to)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return withoutPriceWords || normalized;
}

function getCharacterDistance(left: string, right: string) {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;

  const previous = Array.from(
    { length: right.length + 1 },
    (_, index) => index,
  );

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let diagonal = previous[0];
    previous[0] = leftIndex;

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const nextDiagonal = previous[rightIndex];
      const cost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;

      previous[rightIndex] = Math.min(
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + 1,
        diagonal + cost,
      );

      diagonal = nextDiagonal;
    }
  }

  return previous[right.length];
}

function isSubsequenceMatch(query: string, value: string) {
  if (!query || query.length > value.length) return false;

  let queryIndex = 0;

  for (const character of value) {
    if (character === query[queryIndex]) {
      queryIndex += 1;

      if (queryIndex === query.length) {
        return true;
      }
    }
  }

  return false;
}

function getTokenMatchStrength(candidate: string, token: string) {
  if (!candidate || !token) return 0;
  if (candidate === token) return 1;
  if (candidate.startsWith(token)) return 0.92;
  if (candidate.includes(token)) return 0.82;

  const maxLength = Math.max(candidate.length, token.length);
  if (maxLength <= 2) return 0;

  const distance = getCharacterDistance(candidate, token);
  const similarity = 1 - distance / maxLength;
  if (similarity >= 0.72) {
    return similarity * 0.78;
  }

  if (token.length >= 3 && isSubsequenceMatch(token, candidate)) {
    return 0.58;
  }

  return 0;
}

function getFieldMatchScore(fieldValue: string, queryTokens: string[]) {
  if (!fieldValue || queryTokens.length === 0) return 0;

  const normalizedField = normalizeSearchValue(fieldValue);
  if (!normalizedField) return 0;

  const candidates = [normalizedField, ...normalizedField.split(" ")].filter(
    Boolean,
  );
  let total = 0;

  for (const token of queryTokens) {
    let bestMatch = 0;

    for (const candidate of candidates) {
      const nextMatch = getTokenMatchStrength(candidate, token);
      if (nextMatch > bestMatch) {
        bestMatch = nextMatch;
      }
    }

    total += bestMatch;
  }

  return total / queryTokens.length;
}

function getFuzzyMatchScore(vehicle: VehicleListingCard, query: string) {
  const fuzzyQuery = buildFuseQuery(query);
  const tokens = fuzzyQuery.split(" ").filter(Boolean);
  if (tokens.length === 0) return 0;

  const fields: SearchField[] = [
    { value: vehicle.name, weight: 0.5 },
    { value: vehicle.location, weight: 0.26 },
    { value: vehicle.aliases.join(" "), weight: 0.16 },
    { value: vehicle.searchText, weight: 0.05 },
    { value: vehicle.priceLabel, weight: 0.03 },
  ];

  let total = 0;

  for (const field of fields) {
    total += getFieldMatchScore(field.value, tokens) * field.weight;
  }

  return total >= 0.22 ? total * 60 : 0;
}

function formatDailyPrice(price: number) {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(price);
}

function buildVehicleName(vehicle: ApiVehicle) {
  const name = [vehicle.make, vehicle.model]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  return name || "Rental vehicle";
}

function buildVehicleLocation(vehicle: ApiVehicle) {
  return vehicle.delivery || vehicle.availability || "Ethiopia";
}

function buildVehicleImage(vehicle: ApiVehicle) {
  const galleryImage = Array.isArray(vehicle.photos?.gallery)
    ? vehicle.photos?.gallery.find(Boolean)
    : undefined;

  return vehicle.photos?.front || galleryImage || carFallback;
}

function buildSearchProfile(input: {
  name: string;
  location: string;
  price: number;
  priceLabel: string;
  isCompany: boolean;
}) {
  const aliases = [
    input.isCompany ? "official company verified" : "community host local",
    input.price <= 3000 ? "cheap affordable budget low price" : "",
    input.price >= 5000 ? "premium luxury expensive high end" : "",
  ].filter(Boolean);

  const searchText = normalizeSearchValue(
    [input.name, input.location, input.priceLabel, ...aliases].join(" "),
  );

  return {
    aliases,
    searchText,
  };
}

function toListingCard(vehicle: ApiVehicle, index: number): VehicleListingCard {
  const price = typeof vehicle.price === "number" ? vehicle.price : 0;

  const priceLabel = `${price} ${formatDailyPrice(price)}`;

  const name = buildVehicleName(vehicle);

  const location = buildVehicleLocation(vehicle);

  const isCompany = vehicle.ownerType === "Company";

  const profile = buildSearchProfile({
    name,
    location,
    price,
    priceLabel,
    isCompany,
  });

  return {
    id: vehicle.id || vehicle._id || `vehicle-${index + 1}`,
    name,
    location,
    price,
    priceLabel,
    year: typeof vehicle.year === "number" ? vehicle.year : null,
    image: buildVehicleImage(vehicle),
    isCompany,
    owner: vehicle.owner
      ? {
          ...vehicle.owner,
          name: vehicle.owner.name?.trim() || "Peer host",
        }
      : undefined,
    ...profile,
  };
}

function getExactMatchScore(vehicle: VehicleListingCard, query: string) {
  if (!query) return 0;

  const name = normalizeSearchValue(vehicle.name);

  const location = normalizeSearchValue(vehicle.location);

  const priceLabel = normalizeSearchValue(vehicle.priceLabel);

  let score = 0;

  if (name.includes(query)) score += 90;

  if (location.includes(query)) score += 70;

  if (priceLabel.includes(query)) score += 45;

  if (vehicle.searchText.includes(query)) score += 25;

  return score;
}

function getPriceIntentScore(vehicle: VehicleListingCard, intent: PriceIntent) {
  if (!intent) return 0;

  if (intent.type === "max") {
    if (vehicle.price <= intent.amount) {
      const distance = intent.amount - vehicle.price;

      return 85 + Math.max(0, 20 - distance / Math.max(intent.amount, 1));
    }

    return -40;
  }

  const distance = Math.abs(vehicle.price - intent.amount);

  const tolerance = Math.max(intent.amount * 0.25, 500);

  if (distance <= tolerance) {
    return 55 - (distance / tolerance) * 20;
  }

  return 0;
}

function getVehicleResults(vehicles: VehicleListingCard[], query: string) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) return vehicles;

  const priceIntent = parsePriceIntent(normalizedQuery);

  const fuseQuery = buildFuseQuery(normalizedQuery);

  const ranked = new Map<string, RankedVehicle>();

  for (const vehicle of vehicles) {
    const exactScore = getExactMatchScore(vehicle, normalizedQuery);

    const priceScore = getPriceIntentScore(vehicle, priceIntent);
    const fuzzyScore = getFuzzyMatchScore(vehicle, normalizedQuery);
    const totalScore = exactScore + priceScore + fuzzyScore;

    if (totalScore > 0) {
      ranked.set(vehicle.id, {
        item: vehicle,
        score: totalScore,
      });
    }
  }

  for (const result of fuse.search(fuseQuery)) {
    const fuseScore = Math.max(0, 60 - (result.score ?? 1) * 60);

    const current = ranked.get(result.item.id);

    ranked.set(result.item.id, {
      item: result.item,
      score: (current?.score ?? 0) + fuseScore,
    });
  }

  return Array.from(ranked.values())
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (priceIntent?.type === "max") {
        return left.item.price - right.item.price;
      }

      return left.item.name.localeCompare(right.item.name);
    })
    .map((entry) => entry.item);
}

function VehicleCard({ vehicle }: { vehicle: VehicleListingCard }) {
  return (
    <Link href={`/cars/${vehicle.id}`} className="group block">
      <Card className="overflow-hidden border border-gray-100 bg-white p-2 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-lg dark:border-gray-800 dark:bg-gray-800 dark:hover:border-blue-900">
        {/* RESPONSIVE LAYOUT */}
        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[220px_1fr]">
          {/* IMAGE */}
          <div className="relative h-[220px] w-full overflow-hidden rounded-2xl bg-gray-100 sm:h-[260px] lg:h-full lg:min-h-[200px]">
            <Image
              src={vehicle.image}
              alt={vehicle.name}
              fill
              sizes="(max-width:1024px)100vw,220px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized={typeof vehicle.image === "string"}
            />

            {vehicle.isCompany ? (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow">
                <BadgeCheck className="h-3.5 w-3.5" />
                Official
              </span>
            ) : null}
          </div>

          {/* CONTENT */}
          <div className="flex min-w-0 flex-col justify-between gap-5 px-2 py-2 sm:px-3 lg:px-5 lg:py-4">
            <div className="space-y-3">
              {/* TOP */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="line-clamp-2 break-words text-lg font-bold sm:text-xl">
                    {vehicle.name}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {vehicle.year ? (
                      <span className="inline-flex items-center gap-1">
                        <Car className="h-4 w-4 shrink-0" />
                        {vehicle.year}
                      </span>
                    ) : null}

                    <span className="inline-flex items-center gap-1 break-words">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {vehicle.location}
                    </span>
                  </div>
                </div>

                {/* RATING */}
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  4.9
                </div>
              </div>

              {/* OWNER */}
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-50 bg-slate-50/50 p-2 dark:border-slate-800/50 dark:bg-slate-800/30">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage
                    src={vehicle.owner?.image}
                    alt={vehicle.owner?.name}
                  />

                  <AvatarFallback>
                    {vehicle.owner?.name?.substring(0, 2).toUpperCase() || "PH"}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">
                    {vehicle.owner?.name}
                  </p>

                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    {vehicle.owner?.type === "company"
                      ? "Rental Company"
                      : "Peer Host"}
                  </p>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 dark:border-gray-800 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-2xl font-black text-primary">
                  {formatDailyPrice(vehicle.price)}
                </div>

                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  per day
                </div>
              </div>

              <span className="inline-flex items-center justify-center gap-1 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                View details
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function CarsListingContent() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const queryFromUrl = searchParams.get("q")?.trim() || "";

  const [searchInput, setSearchInput] = useState(queryFromUrl);

  const [minPrice, setMinPrice] = useState("");

  const [maxPrice, setMaxPrice] = useState("");

  const [minRating, setMinRating] = useState("");

  const [vehicles, setVehicles] = useState<VehicleListingCard[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSearchInput(queryFromUrl);
  }, [queryFromUrl]);

  useEffect(() => {
    let cancelled = false;

    async function loadVehicles() {
      setLoading(true);

      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/vehicles/marketplace`, {
          cache: "no-store",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to load vehicles (HTTP ${response.status})`);
        }

        const payload = (await response.json().catch(() => null)) as unknown;

        const nextVehicles = parseVehiclesPayload(payload).map(toListingCard);

        if (!cancelled) {
          setVehicles(nextVehicles);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load vehicles",
          );

          setVehicles([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadVehicles();

    return () => {
      cancelled = true;
    };
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(vehicles, {
        ignoreLocation: true,
        includeScore: true,
        minMatchCharLength: 2,
        threshold: 0.42,
        keys: [
          { name: "name", weight: 0.5 },
          { name: "location", weight: 0.26 },
          { name: "aliases", weight: 0.16 },
          { name: "searchText", weight: 0.05 },
          { name: "priceLabel", weight: 0.03 },
        ],
      }),
    [vehicles],
  );

  const results = useMemo(() => {
    let filtered = getVehicleResults(vehicles, fuse, queryFromUrl);

    filtered = filtered.filter((vehicle) => {
      const rating = 4.9;

      const matchesMinPrice = !minPrice || vehicle.price >= Number(minPrice);

      const matchesMaxPrice = !maxPrice || vehicle.price <= Number(maxPrice);

      const matchesRating = !minRating || rating >= Number(minRating);

      return matchesMinPrice && matchesMaxPrice && matchesRating;
    });

    return filtered;
  }, [vehicles, fuse, queryFromUrl, minPrice, maxPrice, minRating]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = searchInput.trim();

    router.push(
      trimmedQuery ? `/cars?q=${encodeURIComponent(trimmedQuery)}` : "/cars",
    );
  }

  function searchFor(query: string) {
    setSearchInput(query);

    router.push(`/cars?q=${encodeURIComponent(query)}`);
  }

  function clearSearch() {
    setSearchInput("");

    router.push("/cars");
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <Navbar />

      <div className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-20">
          <form
            onSubmit={handleSearch}
            className="grid gap-3 md:grid-cols-[1fr_auto]"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-600" />

              <Input
                type="search"
                value={searchInput}
                placeholder="Search Toyota, Addis, or under 3000"
                onChange={(event) => setSearchInput(event.target.value)}
                className="h-12 rounded-full border-gray-200 bg-gray-50 pl-11"
              />
            </div>

            <Button className="h-12 rounded-full bg-blue-600 px-8 font-bold text-white hover:bg-blue-700">
              Search
            </Button>
          </form>

          {/* FILTERS */}
          {/* Filters */}
          <div className="mt-4 rounded-3xl border border-gray-200 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/90">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
                  <SlidersHorizontal className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                </div>

                <div>
                  <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-100">
                    Filters
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Narrow down your vehicle search
                  </p>
                </div>
              </div>

              {(minPrice || maxPrice || minRating) && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                    setMinRating("");
                  }}
                  className="rounded-full text-xs font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                >
                  Clear filters
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Min Price */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Minimum Price
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                    ETB
                  </span>

                  <Input
                    type="number"
                    placeholder="1000"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="h-12 rounded-2xl border-gray-200 bg-gray-50 pl-14 text-sm font-medium shadow-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
              </div>

              {/* Max Price */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Maximum Price
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                    ETB
                  </span>

                  <Input
                    type="number"
                    placeholder="5000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="h-12 rounded-2xl border-gray-200 bg-gray-50 pl-14 text-sm font-medium shadow-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
              </div>

              {/* Rating Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Minimum Rating
                </label>

                <div className="relative">
                  <Star className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 fill-yellow-500 text-yellow-500" />

                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm font-medium text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    <option value="">Choose rating</option>
                    <option value="5">⭐ 5.0 Excellent</option>
                    <option value="4.5">⭐ 4.5 & above</option>
                    <option value="4">⭐ 4.0 & above</option>
                    <option value="3.5">⭐ 3.5 & above</option>
                    <option value="3">⭐ 3.0 & above</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filter Tags */}
            {(minPrice || maxPrice || minRating) && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Active filters:
                </span>

                {minPrice && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    Min ETB {minPrice}
                  </span>
                )}

                {maxPrice && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
                    Max ETB {maxPrice}
                  </span>
                )}

                {minRating && (
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
                    ⭐ {minRating}+ Rating
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8 lg:px-20">
        {!loading && !error && results.length > 0 ? (
          <div className="grid gap-5">
            {results.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : null}

        {loading ? (
          <CarLoadingState message="Fetching the best rides for you..." />
        ) : null}
      </main>

      <LandingFooter />
    </div>
  );
}

export default function CarsListingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <CarLoadingState message="Preparing marketplace..." />
        </div>
      }
    >
      <CarsListingContent />
    </Suspense>
  );
}
