"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Star, Loader2 } from "lucide-react";

import { Card } from "../ui/card";

type Vehicle = {
  _id: string;
  make: string;
  model: string;
  type?: string;
  year: number;
  price: number;
  transmission: string;
  fuel: string;
  seats: number;
  rating?: number;
  photos: {
    front?: string;
    gallery?: string[];
  };
};

type CategoryMap = Record<string, Vehicle[]>;

export function LandingSearch() {
  const [categories, setCategories] = useState<CategoryMap>({});
  const [loading, setLoading] = useState(true);
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    const fetchInspiredCars = async () => {
      try {
        setLoading(true);

        let query = "";

        if (typeof window !== "undefined") {
          query = localStorage.getItem("last_search_query") || "";
        }

        const params = new URLSearchParams();
        if (query.trim()) params.set("query", query.trim());

        const res = await fetch(
          `http://localhost:5000/api/vehicles/inspired?${params.toString()}`,
          { cache: "no-store" }
        );

        const data = await res.json();
        setCategories(data?.data?.categories ?? {});
      } catch (error) {
        console.error("Failed to fetch inspired cars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInspiredCars();
  }, []);

  const inspiredCars = useMemo(() => {
    return Object.values(categories).flat().slice(0, 6);
  }, [categories]);

  if (loading) {
    return (
      <section className="py-4 px-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-5">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Finding inspired vehicles...
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!inspiredCars.length) return null;

  return (
    <section className="py-4 px-3 mb-8 ">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold">Inspired by your search</h2>
            <p className="text-lg text-muted-foreground">
              Personalized recommendations
            </p>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {inspiredCars.map((car) => {
            const image =
              car.photos?.gallery?.[0] ||
              car.photos?.front ||
              "/placeholder.png";

            return (
              <Link key={car._id} href={`/cars/${car._id}`}>
                <Card className="group overflow-hidden rounded-xl border border-border/40 hover:shadow-md transition-all duration-300 bg-gray-200">
                  <div className="flex flex-row h-28">
                    {/* IMAGE */}
                    <div className="relative w-32 h-full overflow-hidden bg-muted">
                      <Image
                        src={image}
                        alt={`${car.make} ${car.model}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      <div className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                        Inspired
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 p-2.5 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold truncate">
                          {car.make} {car.model}
                        </h3>

                        {/* YEAR + RATING ROW */}
                        <div className="flex items-center mt-1">
                          <p className="text-lg text-muted-foreground">
                            {car.year}
                          </p>

                          <div className="flex ml-2 items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400  text-yellow-400" />
                            <span className="text-lg font-medium">
                              {car.rating || "5.0"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}