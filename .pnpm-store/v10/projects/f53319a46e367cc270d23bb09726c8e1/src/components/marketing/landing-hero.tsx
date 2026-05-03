"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Car, Search } from "lucide-react";

import { SectionContainer } from "@/components/marketing/section-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import carImage from "@/assets/image.jpg";

export function LandingHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();
    const target = trimmedQuery
      ? `/cars?q=${encodeURIComponent(trimmedQuery)}`
      : "/cars";

    router.push(target);
  }

  return (
    <SectionContainer className="pt-16 md:pt-20">
      <div className="relative z-40 flex min-h-[380px] w-full flex-col items-center justify-center overflow-visible rounded-[2rem] px-4 shadow-2xl md:h-[300px] md:rounded-[1.5rem] md:px-2">
        <Image
          src={carImage}
          alt="Auto Rent Ethiopia"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60" />

        <div className="relative z-50 mb-6 flex w-full max-w-6xl flex-col items-center text-center md:mb-6">
          <div className="mb-4 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur">
            <Car className="h-4 w-4" />
            Premium car rental
          </div>
          <h1 className="mb-4 text-4xl font-black tracking-tight text-white drop-shadow-md md:text-6xl">
            Auto Rent Ethiopia
          </h1>
          <p className="mb-4 max-w-3xl px-4 text-sm text-gray-100 opacity-90 md:mb-16 md:text-lg">
            Premium car rentals across Ethiopia. Experience comfort and
            reliability in every mile.
          </p>

          <Card className="z-50 h-auto w-full max-w-4xl rounded-2xl border-none bg-[var(--card)] text-[var(--card-foreground)] shadow-2xl md:absolute md:-bottom-12">
            <CardContent className="p-4 md:p-3">
              <form
                onSubmit={handleSearch}
                className="grid grid-cols-1 gap-3 text-left md:grid-cols-[1fr_auto] md:items-end"
              >
                <div className="flex flex-col">
                  <label className="mb-1 ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Search cars
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-blue-600" />
                    <Input
                      type="search"
                      value={query}
                      placeholder="Search by car name, location, or price"
                      onChange={(event) => setQuery(event.target.value)}
                      className="h-12 rounded-xl border-none bg-[var(--input)] pl-10 text-sm font-medium text-[var(--foreground)]"
                    />
                  </div>
                </div>

                <Button className="h-12 rounded-xl bg-blue-600 px-8 font-bold text-white transition-transform hover:bg-blue-700 active:scale-95 md:hover:scale-105">
                  <Search className="mr-2 h-5 w-5" />
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </SectionContainer>
  );
}
