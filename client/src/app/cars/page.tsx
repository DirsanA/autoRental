"use client";

import Fuse from "fuse.js";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Car,
  Loader2,
  MapPin,
  Search,
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
  owner?: {
    name: string;
    image?: string;
    type: "peerhost" | "company";
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

function parseVehiclesPayload(payload: unknown): ApiVehicle[] {
  if (!payload || typeof payload !== "object") return [];

  const dataPayload = payload as { data?: { vehicles?: ApiVehicle[] } };
  if (Array.isArray(dataPayload.data?.vehicles)) {
    return dataPayload.data.vehicles;
  }

  const directPayload = payload as { vehicles?: ApiVehicle[] };
  if (Array.isArray(directPayload.vehicles)) {
    return directPayload.vehicles;
  }

  return [];
}

function normalizeSearchValue(value: string) {
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
    return { type: "max", amount };
  }

  return { type: "number", amount };
}

function buildFuseQuery(query: string) {
  const normalized = normalizeSearchValue(query);
  const withoutPriceWords = normalized
    .replace(/\b(under|below|less than|max|maximum|up to)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return withoutPriceWords || normalized;
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
    ? vehicle.photos.gallery.find(Boolean)
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

  return { aliases, searchText };
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
    owner: vehicle.owner,
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

function getVehicleResults(
  vehicles: VehicleListingCard[],
  fuse: Fuse<VehicleListingCard>,
  query: string,
) {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) return vehicles;

  const priceIntent = parsePriceIntent(normalizedQuery);
  const fuseQuery = buildFuseQuery(normalizedQuery);
  const ranked = new Map<string, RankedVehicle>();

  for (const vehicle of vehicles) {
    const exactScore = getExactMatchScore(vehicle, normalizedQuery);
    const priceScore = getPriceIntentScore(vehicle, priceIntent);

    if (exactScore > 0 || priceScore > 0) {
      ranked.set(vehicle.id, {
        item: vehicle,
        score: exactScore + priceScore,
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
      if (right.score !== left.score) return right.score - left.score;

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
      <Card className="grid h-full overflow-hidden border border-gray-100 bg-white p-2 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-lg dark:border-gray-800 dark:bg-gray-800 dark:hover:border-blue-900 lg:grid-cols-[220px_1fr]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-gray-100 lg:aspect-auto lg:min-h-[180px]">
          <Image
            src={vehicle.image}
            alt={vehicle.name}
            fill
            sizes="(max-width: 1024px) 100vw, 220px"
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

        <div className="flex min-w-0 flex-col justify-between gap-5 px-2 py-4 lg:px-5">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xl font-bold leading-tight text-foreground dark:text-gray-100">
                  {vehicle.name}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground dark:text-gray-400">
                  {vehicle.year ? (
                    <span className="inline-flex items-center gap-1">
                      <Car className="h-4 w-4" />
                      {vehicle.year}
                    </span>
                  ) : null}
                  <span className="inline-flex min-w-0 items-center gap-1">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{vehicle.location}</span>
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-gray-800 dark:text-gray-100">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                4.9
              </div>
            </div>

            {/* Owner Summary Section */}
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-50 bg-slate-50/50 p-2 dark:border-slate-800/50 dark:bg-slate-800/30">
              <Avatar className="h-8 w-8 border border-white shadow-sm dark:border-slate-700">
                <AvatarImage src={vehicle.owner?.image} alt={vehicle.owner?.name} />
                <AvatarFallback className="bg-blue-100 text-[10px] font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {vehicle.owner?.name?.substring(0, 2).toUpperCase() || "PH"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">
                  {vehicle.owner?.name}
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {vehicle.owner?.type === "company" ? "Rental Company" : "Peer Host"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
            <div>
              <div className="text-2xl font-black text-primary">
                {formatDailyPrice(vehicle.price)}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                per day
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950 dark:text-blue-300 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
              View details
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
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

  const results = useMemo(
    () => getVehicleResults(vehicles, fuse, queryFromUrl),
    [fuse, queryFromUrl, vehicles],
  );

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
                className="h-12 rounded-full border-gray-200 bg-gray-50 pl-11 pr-4 text-gray-900 shadow-none dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
            <Button className="h-12 rounded-full bg-blue-600 px-8 font-bold text-white hover:bg-blue-700">
              Search
            </Button>
          </form>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8 lg:px-20">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Vehicle marketplace
            </p>
            <h1 className="text-3xl font-black tracking-tight text-foreground dark:text-gray-100">
              {queryFromUrl ? `Results for "${queryFromUrl}"` : "Cars available"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground dark:text-gray-400">
              Search by name, location, or price. Try phrases like under 3000.
            </p>
          </div>
          <div className="rounded-full border bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-800 dark:text-gray-200">
            {loading
              ? "Loading..."
              : `${results.length} ${results.length === 1 ? "car" : "cars"} found`}
          </div>
        </section>

        {queryFromUrl ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground dark:text-gray-400">
              Refine or clear the current search
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={clearSearch}
              className="h-9 rounded-full"
            >
              Clear search
            </Button>
          </div>
        ) : null}

        {loading ? (
          <CarLoadingState message="Fetching the best rides for you..." className="py-20" />
        ) : null}

        {!loading && error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            <p className="font-semibold">{error}</p>
            <Button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full"
            >
              Try again
            </Button>
          </div>
        ) : null}

        {!loading && !error && results.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-800">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
              <Search className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold">No vehicles matched</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground dark:text-gray-400">
              Try a car name, a city, or a simple price phrase.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {SEARCH_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => searchFor(suggestion)}
                  className="rounded-full border bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-200 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {!loading && !error && results.length > 0 ? (
          <div className="grid gap-5">
            {results.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
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
        <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
          <CarLoadingState message="Preparing marketplace..." />
        </div>
      }
    >
      <CarsListingContent />
    </Suspense>
  );
}
