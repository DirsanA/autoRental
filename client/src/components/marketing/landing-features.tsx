"use client";
import { SectionContainer } from "@/components/marketing/section-container";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  BadgeCheck,
} from "lucide-react";
import { Card } from "../ui/card";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import carImage from "@/assets/image.jpg";
import car2 from "@/assets/car-1.jpg";
import car3 from "@/assets/car-2.jpg";
import car4 from "@/assets/car-3.jpg";
import car5 from "@/assets/car-4.jpg";
import type { StaticImageData } from "next/image";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

type CarCardData = {
  id: string;
  image: string | StaticImageData;
  vechile_name: string;
  year: number;
  rating: number;
  price: number;
  discount: number;
  isOfficial: boolean;
  location: string;
};

type ApiVehicle = {
  id?: string;
  _id?: string;
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  delivery?: string;
  availability?: string;
  ownerType?: "User" | "Company";
  weeklyDiscount?: number;
  monthlyDiscount?: number;
  photos?: {
    front?: string;
    gallery?: string[];
  };
};

type CompanySection = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  cars: CarCardData[];
};

function createPlaceholders(
  prefix: string,
  count: number,
  base: Omit<CarCardData, "id">,
): CarCardData[] {
  return Array.from({ length: count }, (_, idx) => ({
    ...base,
    id: `${prefix}-${idx + 1}`,
  }));
}

function normalizeVehiclesEndpoint(baseUrl: string) {
  const trimmedBase = baseUrl.replace(/\/+$/, "");
  if (trimmedBase.endsWith("/api")) {
    return `${trimmedBase}/vehicles`;
  }
  if (trimmedBase.endsWith("/api/vehicles")) {
    return trimmedBase;
  }
  return `${trimmedBase}/api/vehicles`;
}

function parseVehiclesPayload(payload: unknown): ApiVehicle[] {
  if (!payload || typeof payload !== "object") return [];

  const maybeWithData = payload as { data?: { vehicles?: ApiVehicle[] } };
  if (Array.isArray(maybeWithData.data?.vehicles)) {
    return maybeWithData.data.vehicles;
  }

  const maybeWithVehicles = payload as { vehicles?: ApiVehicle[] };
  if (Array.isArray(maybeWithVehicles.vehicles)) {
    return maybeWithVehicles.vehicles;
  }

  return [];
}

function toCarName(vehicle: ApiVehicle) {
  const make = vehicle.make?.trim();
  const model = vehicle.model?.trim();
  return [make, model].filter(Boolean).join(" ") || "Toyota Camry";
}

function toCarCard(vehicle: ApiVehicle, fallbackImage: StaticImageData, idx: number): CarCardData {
  const fromGallery = Array.isArray(vehicle.photos?.gallery)
    ? vehicle.photos?.gallery.find(Boolean)
    : undefined;
  const basePrice = typeof vehicle.price === "number" ? vehicle.price : 3400;
  const discount =
    typeof vehicle.weeklyDiscount === "number" && vehicle.weeklyDiscount > 0
      ? vehicle.weeklyDiscount
      : typeof vehicle.monthlyDiscount === "number" && vehicle.monthlyDiscount > 0
        ? vehicle.monthlyDiscount
        : Math.round(basePrice * 0.09);

  return {
    id: vehicle.id || vehicle._id || `landing-car-${idx + 1}`,
    image: vehicle.photos?.front || fromGallery || fallbackImage,
    vechile_name: toCarName(vehicle),
    year: vehicle.year || 2024,
    rating: 4.9,
    price: basePrice,
    discount,
    isOfficial: vehicle.ownerType === "Company",
    location: vehicle.delivery || vehicle.availability || "Addis Ababa",
  };
}

function isAirportCar(car: ApiVehicle) {
  const text = `${car.delivery || ""} ${car.availability || ""}`.toLowerCase();
  return text.includes("airport");
}

function isLuxuryCar(car: ApiVehicle) {
  return typeof car.price === "number" && car.price >= 4000;
}

function isSuvCar(car: ApiVehicle) {
  const text = `${car.make || ""} ${car.model || ""}`.toLowerCase();
  return text.includes("suv") || text.includes("explorer") || text.includes("land cruiser");
}

const COMPANY_SECTIONS: CompanySection[] = [
  {
    id: "newly-added",
    title: "Monthly Newly Added Cars",
    subtitle: "Fresh arrivals from Auto Rent Ethiopia's official fleet.",
    badge: "Official",
    cars: createPlaceholders("placeholder-new", 6, {
      image: car2,
      vechile_name: "Toyota Camry",
      year: 2024,
      rating: 4.9,
      price: 3400,
      discount: 340,
      isOfficial: true,
      location: "Addis Ababa",
    }),
  },
  {
    id: "user-hosted",
    title: "Community Hosted Vehicles",
    subtitle: "Rent directly from trusted local owners in Addis.",
    badge: "User Post",
    cars: createPlaceholders("placeholder-user", 6, {
      image: car3,
      vechile_name: "Hyundai Tucson",
      year: 2021,
      rating: 4.5,
      price: 2800,
      discount: 150,
      isOfficial: false,
      location: "Addis Ababa",
    }),
  },
  {
    id: "airport",
    title: "Airport Transfers",
    subtitle: "Convenient car rentals for arrivals and departures.",
    badge: "Airport",
    cars: createPlaceholders("placeholder-airport", 6, {
      image: car4,
      vechile_name: "Mercedes-Benz E-Class",
      year: 2023,
      rating: 4.8,
      price: 4200,
      discount: 200,
      isOfficial: true,
      location: "Addis Ababa",
    }),
  },
  {
    id: "luxury",
    title: "Luxury Fleet",
    subtitle: "Experience the finest in Ethiopian car rentals.",
    badge: "Luxury",
    cars: createPlaceholders("placeholder-luxury", 6, {
      image: car5,
      vechile_name: "BMW 5 Series",
      year: 2023,
      rating: 4.9,
      price: 5500,
      discount: 300,
      isOfficial: true,
      location: "Addis Ababa",
    }),
  },
  {
    id: "suv",
    title: "SUVs & Vans",
    subtitle: "Perfect for families and group travel.",
    badge: "SUV",
    cars: createPlaceholders("placeholder-suv", 6, {
      image: carImage,
      vechile_name: "Ford Explorer",
      year: 2022,
      rating: 4.7,
      price: 3800,
      discount: 250,
      isOfficial: true,
      location: "Addis Ababa",
    }),
  },
];

export function LandingFeatures() {
  const [sections, setSections] = useState<CompanySection[]>([]);

  useEffect(() => {
    let isCancelled = false;

    const loadCars = async () => {
      try {
        const preferredEndpoint = normalizeVehiclesEndpoint(API_BASE_URL);
        const fallbackEndpoint = "http://localhost:5000/api/vehicles";
        const endpoints = Array.from(new Set([preferredEndpoint, fallbackEndpoint]));

        let allCars: ApiVehicle[] = [];
        for (const endpoint of endpoints) {
          const response = await fetch(endpoint, {
            cache: "no-store",
            credentials: "include",
          }).catch(() => null);

          if (!response?.ok) continue;

          const payload = (await response.json().catch(() => null)) as unknown;
          allCars = parseVehiclesPayload(payload);
          if (allCars.length) break;
        }

        if (!allCars.length || isCancelled) return;

        const sectionCars: Record<string, ApiVehicle[]> = {
          "newly-added": allCars.slice(0, 6),
          "user-hosted": allCars.filter((car) => car.ownerType === "User").slice(0, 6),
          airport: allCars.filter(isAirportCar).slice(0, 6),
          luxury: allCars.filter(isLuxuryCar).slice(0, 6),
          suv: allCars.filter(isSuvCar).slice(0, 6),
        };

        const mapped = COMPANY_SECTIONS.map((section) => {
          const fallback = section.cars[0];
          const imageFallback = typeof fallback.image === "string" ? car2 : fallback.image;
          const fromApi = (sectionCars[section.id] || []).map((car, idx) =>
            toCarCard(car, imageFallback, idx),
          );

          return {
            ...section,
            cars: fromApi,
          };
        }).filter((section) => section.cars.length > 0);

        if (!isCancelled) {
          setSections(mapped);
        }
      } catch {
        if (!isCancelled) {
          setSections([]);
        }
      }
    };

    void loadCars();
    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <SectionContainer className="py-0 space-y-0 bg-white dark:bg-gray-900 transition-colors duration-300">
      {sections.map((section) => (
        <CarRow key={section.id} section={section} />
      ))}
    </SectionContainer>
  );
}

function CarRow({ section }: { section: CompanySection }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoverDirection, setHoverDirection] = useState<"left" | "right" | null>(
    null,
  );

  useEffect(() => {
    if (!hoverDirection) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft += hoverDirection === "left" ? -8 : 8;
      }
    }, 10);
    return () => clearInterval(interval);
  }, [hoverDirection]);

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="mb-1 flex items-end justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary/80 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
              {section.badge}
            </span>
            <span className="text-muted-foreground dark:text-gray-400 text-xs">
              • Updated today
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-gray-100">
            {section.title}
          </h2>
          <p className="text-muted-foreground dark:text-gray-300 text-sm">
            {section.subtitle}
          </p>
        </div>

        <div className="hidden md:flex gap-2">
          <button
            onClick={() =>
              scrollRef.current?.scrollBy({ left: -380, behavior: "smooth" })
            }
            className="p-2 border rounded-full hover:bg-accent dark:hover:bg-accent/20 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() =>
              scrollRef.current?.scrollBy({ left: 380, behavior: "smooth" })
            }
            className="p-2 border rounded-full hover:bg-accent dark:hover:bg-accent/20 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="relative group">
        <div
          onMouseEnter={() => setHoverDirection("left")}
          onMouseLeave={() => setHoverDirection(null)}
          className="absolute left-0 top-0 w-16 h-full z-20 cursor-w-resize"
        />
        <div
          onMouseEnter={() => setHoverDirection("right")}
          onMouseLeave={() => setHoverDirection(null)}
          className="absolute right-0 top-0 w-16 h-full z-20 cursor-e-resize"
        />

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 snap-x"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {section.cars.map((car, idx) => (
            <Link
              href={`/cars/${car.id || idx + 1}`}
              key={car.id || idx + 1}
              className="block w-[250px] md:w-[calc((100%_-_2.5rem)/3)] md:min-w-[calc((100%_-_2.5rem)/3)] md:max-w-[calc((100%_-_2.5rem)/3)] shrink-0 snap-start"
            >
              <Card
                className="w-full overflow-hidden border-none shadow-none bg-transparent dark:bg-gray-800 hover:bg-accent/5 dark:hover:bg-accent/20 transition-colors p-2"
              >
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-3 shadow-sm">
                  <Image
                    src={car.image}
                    alt="car"
                    fill
                    className="object-cover"
                    unoptimized={typeof car.image === "string"}
                  />
                </div>

                <div className="px-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-lg flex items-center gap-1 text-foreground dark:text-gray-100">
                      {car.vechile_name}
                      {car.isOfficial && (
                        <BadgeCheck
                          size={16}
                          className="text-blue-500 dark:text-blue-400"
                        />
                      )}
                    </h3>
                    <div className="flex items-center gap-1 text-sm font-semibold">
                      <Star
                        size={14}
                        className="fill-yellow-500 dark:fill-yellow-400 text-yellow-500 dark:text-yellow-400"
                      />{" "}
                      {car.rating}
                    </div>
                  </div>

                  <div className="flex gap-3 text-muted-foreground dark:text-gray-400 text-xs mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {car.year}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {car.location}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-black text-primary dark:text-primary/80">
                        ${car.price}
                      </span>
                      <span className="text-[10px] text-muted-foreground dark:text-gray-400 ml-1 uppercase">
                        / Day
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground dark:text-gray-400 line-through block">
                        ${car.price + car.discount}
                      </span>
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900 px-1 rounded">
                        -
                        {Math.round(
                          (car.discount / (car.price + car.discount)) * 100,
                        )}
                        % Off
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
