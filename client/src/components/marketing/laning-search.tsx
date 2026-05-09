"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Star, Users, Loader2 } from "lucide-react";
import { Card } from "../ui/card";

type Vehicle = {
  _id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  transmission: string;
  fuel: string;
  seats: number;
  photos: {
    front?: string;
    back?: string;
    side?: string;
    interior?: string;
    gallery?: string[];
  };
};

export function LandingSearch() {
  const [cars, setCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const didFetch = useRef(false);

  useEffect(() => {
    // Prevent double fetch in React Strict Mode (Next.js dev)
    if (didFetch.current) return;
    didFetch.current = true;

    const fetchCars = async () => {
      try {
        setLoading(true);

        // ✅ Safe client-only access
        let query: string | null = null;

        if (typeof window !== "undefined") {
          query = window.localStorage.getItem("last_search_query");
        }

        const params = new URLSearchParams();
        if (query) params.set("query", query.trim());

        const res = await fetch(
          `http://localhost:5000/api/vehicles/inspired?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

        const data = await res.json();

        setCars(data?.data?.vehicles ?? []);
      } catch (err) {
        console.error("Failed to fetch inspired cars:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  // ================= LOADING =================
  if (loading) {
    return (
      <section className="py-2 px-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <p className="text-muted-foreground">
            Finding vehicles inspired by your interests...
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-2xl bg-muted animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  // ================= EMPTY =================
  if (!cars.length) {
    return (
      <section className="py-6 px-4 max-w-6xl mx-auto">
        <p className="text-muted-foreground">
          No inspired vehicles found. Try searching more cars first.
        </p>
      </section>
    );
  }

  // ================= MAIN UI =================
  return (
    <section className="py-2 px-4 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground">
          Inspired by your search
        </h2>
        <p className="text-muted-foreground mt-1">
          Vehicles similar to what you recently explored
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {cars.map((car) => {
          const image =
            car.photos?.gallery?.[0] ||
            car.photos?.front ||
            "/placeholder.png";

          return (
            <Link key={car._id} href={`/cars/${car._id}`}>
              <Card className="group overflow-hidden rounded-2xl border border-border/50 bg-background hover:shadow-xl transition-all duration-300">
                {/* IMAGE */}
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={image}
                    alt={`${car.make} ${car.model}`}
                    fill
                    priority={false}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  <div className="absolute top-3 left-3 bg-primary text-white text-xs px-3 py-1 rounded-full">
                    Inspired Pick
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-bold">
                        {car.make} {car.model}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {car.fuel} • {car.year}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-muted-foreground text-xs">
                        New
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {car.seats} seats
                    </div>

                    <span>{car.transmission}</span>
                  </div>

                  <div className="flex items-end justify-between mt-5">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Per day
                      </p>
                      <h4 className="text-2xl font-bold">
                        ${car.price}
                      </h4>
                    </div>

                    <button className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition">
                      View Car
                    </button>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}