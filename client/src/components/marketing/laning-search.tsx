"use client";

import Image from "next/image";
import { Card } from "../ui/card";
import { Star, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import carPlaceholder from "@/assets/car-1.jpg";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

interface MostBookedVehicle {
  _id: string;
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  status?: string;
  ownerType?: string;
  bookingCount?: number;
  photos?: {
    front?: string;
    gallery?: string[];
  };
}

function normalizeEndpoint(baseUrl: string) {
  const trimmedBase = baseUrl.replace(/\/+$/, "");
  if (trimmedBase.endsWith("/api")) {
    return `${trimmedBase}/vehicles/most-booked`;
  }
  return `${trimmedBase}/api/vehicles/most-booked`;
}

export function LandingSearch() {
  const [vehicles, setVehicles] = useState<MostBookedVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchMostBooked = async () => {
      try {
        const endpoint = normalizeEndpoint(API_BASE_URL);
        const fallback = "http://localhost:5000/api/vehicles/most-booked";
        const endpoints = Array.from(new Set([endpoint, fallback]));

        let fetched: MostBookedVehicle[] = [];

        for (const url of endpoints) {
          const res = await fetch(`${url}?limit=6`, {
            cache: "no-store",
            credentials: "include",
          }).catch(() => null);

          if (!res?.ok) continue;

          const json = (await res.json().catch(() => null)) as any;
          if (json?.data?.vehicles && Array.isArray(json.data.vehicles)) {
            fetched = json.data.vehicles;
            break;
          }
        }

        if (!cancelled) {
          setVehicles(fetched);
        }
      } catch {
        // silent fail – section will simply not show
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void fetchMostBooked();
    return () => {
      cancelled = true;
    };
  }, []);

  const getCarName = (v: MostBookedVehicle) =>
    [v.make, v.model].filter(Boolean).join(" ") || "Vehicle";

  const getCarImage = (v: MostBookedVehicle) =>
    v.photos?.front ||
    (Array.isArray(v.photos?.gallery) ? v.photos.gallery.find(Boolean) : undefined);

  // Don't render the section if there's no data
  if (!isLoading && vehicles.length === 0) return null;

  return (
    <section className="py-8 px-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary/80 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
              Trending
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground dark:text-gray-100">
            Most Booked Vehicles
          </h2>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Explore the vehicles that other renters are choosing most often.
          </p>
        </div>
        <Link
          href="/cars"
          className="text-sm font-bold text-primary hover:underline transition-all"
        >
          View all cars →
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="ml-3 text-sm text-muted-foreground font-medium">
            Loading popular vehicles...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {vehicles.map((car, idx) => {
            const name = getCarName(car);
            const imageUrl = getCarImage(car);

            return (
              <Link key={car._id || idx} href={`/cars/${car._id}`}>
                <Card className="group flex flex-row overflow-hidden p-4 gap-4 items-center border-none shadow-sm bg-gray-100 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-750 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                  <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <Image
                        src={carPlaceholder}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}

                  </div>

                  <div className="flex flex-col flex-grow justify-between py-1">
                    <div>
                      <h3 className="font-bold text-base leading-tight capitalize text-foreground dark:text-gray-100">
                        {name}
                      </h3>

                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground dark:text-gray-400">
                        <span>{car.year || "N/A"}</span>
                        <span className="text-xs">•</span>
                        <span className="flex items-center gap-0.5">
                          <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                          4.9
                        </span>
                      </div>

                      {typeof car.price === "number" && (
                        <p className="mt-1.5 text-sm font-bold text-primary">
                          ETB {car.price.toLocaleString()}
                          <span className="text-[10px] text-muted-foreground ml-1 font-medium uppercase">
                            / day
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
