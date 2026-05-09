"use client";
import { SectionContainer } from "@/components/marketing/section-container";
import { CarLoadingState } from "@/components/shared/car-loading-state";
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
  transmission?: string;
  fuel?: string;
  seats?: number;
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
  status?: string;
  ownerType?: "User" | "Company";
  weeklyDiscount?: number;
  monthlyDiscount?: number;
  transmission?: string;
  fuel?: string;
  seats?: number;
  photos?: {
    front?: string;
    gallery?: string[];
  };
  createdAt?: string;
  updatedAt?: string;
};

type CompanySection = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon?: string;
  cars: CarCardData[];
};

const FALLBACK_IMAGES = [carImage, car2, car3, car4, car5];

function getRandomFallbackImage(index: number): StaticImageData {
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

function normalizeVehiclesEndpoint(baseUrl: string) {
  const trimmedBase = baseUrl.replace(/\/+$/, "");
  if (trimmedBase.endsWith("/api")) {
    return `${trimmedBase}/vehicles/marketplace`;
  }
  if (trimmedBase.endsWith("/api/vehicles")) {
    return `${trimmedBase}/marketplace`;
  }
  return `${trimmedBase}/api/vehicles/marketplace`;
}

function parseVehiclesPayload(payload: unknown): ApiVehicle[] {
  if (!payload || typeof payload !== "object") return [];

  const maybeWithData = payload as { data?: { vehicles?: ApiVehicle[] } };
  if (Array.isArray(maybeWithData.data?.vehicles)) {
    return maybeWithData.data?.vehicles || [];
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

function toCarCard(
  vehicle: ApiVehicle,
  fallbackImage: StaticImageData,
  idx: number,
): CarCardData {
  const fromGallery = Array.isArray(vehicle.photos?.gallery)
    ? vehicle.photos?.gallery.find(Boolean)
    : undefined;
  const basePrice = typeof vehicle.price === "number" ? vehicle.price : 3400;
  const discount =
    typeof vehicle.weeklyDiscount === "number" && vehicle.weeklyDiscount > 0
      ? vehicle.weeklyDiscount
      : typeof vehicle.monthlyDiscount === "number" &&
          vehicle.monthlyDiscount > 0
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
    transmission: vehicle.transmission,
    fuel: vehicle.fuel,
    seats: vehicle.seats,
  };
}

function isNewVehicle(vehicle: ApiVehicle): boolean {
  if (!vehicle.createdAt) return false;
  const createdDate = new Date(vehicle.createdAt);
  const now = new Date();
  const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
  return daysDiff <= 30; // New in last 30 days
}

function isRecentlyUpdated(vehicle: ApiVehicle): boolean {
  if (!vehicle.updatedAt) return false;
  const updatedDate = new Date(vehicle.updatedAt);
  const now = new Date();
  const daysDiff = (now.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24);
  return daysDiff <= 7; // Updated in last 7 days
}

// Helper to determine vehicle category based on features, transmission, fuel, etc.
function getVehicleCategory(vehicle: ApiVehicle): string {
  const make = vehicle.make?.toLowerCase() || "";
  const model = vehicle.model?.toLowerCase() || "";
  const transmission = vehicle.transmission?.toLowerCase() || "";
  const fuel = vehicle.fuel?.toLowerCase() || "";
  const price = vehicle.price || 0;
  
  // Luxury vehicles (premium brands or high price)
  const luxuryBrands = ["bmw", "mercedes", "audi", "lexus", "porsche", "jaguar", "land rover", "volvo"];
  if (luxuryBrands.some(brand => make.includes(brand)) || price >= 4000) {
    return "Luxury";
  }
  
  // SUVs & Crossovers
  const suvKeywords = ["suv", "crossover", "explorer", "escape", "cr-v", "rav4", "tucson", "santa fe"];
  if (suvKeywords.some(keyword => model.includes(keyword) || make.includes(keyword))) {
    return "SUV";
  }
  
  // Electric & Hybrid
  if (fuel === "electric" || fuel === "hybrid") {
    return "Electric";
  }
  
  // Vans & Minivans
  const vanKeywords = ["van", "minivan", "odyssey", "sienna", "pacifica"];
  if (vanKeywords.some(keyword => model.includes(keyword))) {
    return "Van";
  }
  
  // Trucks
  const truckKeywords = ["truck", "pickup", "f-150", "silverado", "ram", "tacoma"];
  if (truckKeywords.some(keyword => model.includes(keyword))) {
    return "Truck";
  }
  
  // Sports Cars
  const sportsKeywords = ["sports", "convertible", "coupe", "mustang", "camaro", "corvette"];
  if (sportsKeywords.some(keyword => model.includes(keyword))) {
    return "Sports";
  }
  
  // Default to Sedan/Economy
  return "Sedan";
}

export function LandingFeatures() {
  const [sections, setSections] = useState<CompanySection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const loadCars = async () => {
      try {
        const preferredEndpoint = normalizeVehiclesEndpoint(API_BASE_URL);
        const fallbackEndpoint =
          "http://localhost:5000/api/vehicles/marketplace";
        const endpoints = Array.from(
          new Set([preferredEndpoint, fallbackEndpoint]),
        );

        let allCars: ApiVehicle[] = [];
        for (const endpoint of endpoints) {
          const response = await fetch(endpoint, {
            cache: "no-store",
            credentials: "include",
          }).catch(() => null);

          if (!response?.ok) continue;

          const payload = (await response.json().catch(() => null)) as unknown;
          allCars = parseVehiclesPayload(payload).filter(
            (car) => car.status?.toUpperCase() !== "SUSPENDED",
          );
          if (allCars.length) break;
        }

        if (isCancelled) return;

        if (!allCars.length) {
          setSections([]);
          setIsLoading(false);
          return;
        }

        const dynamicSections: CompanySection[] = [];

        // Section 1: Official Company Fleet
        const companyCars = allCars.filter(
          (car) => car.ownerType === "Company" && car.status === "AVAILABLE"
        );
        if (companyCars.length > 0) {
          dynamicSections.push({
            id: "official-fleet",
            title: "Official Rental Fleet",
            subtitle: "Professional car rentals from verified companies",
            badge: "Official",
            cars: companyCars.slice(0, 6).map((car, idx) =>
              toCarCard(car, getRandomFallbackImage(idx), idx)
            ),
          });
        }

        // Section 2: New Arrivals (last 30 days)
        const newArrivals = allCars.filter(isNewVehicle);
        if (newArrivals.length > 0) {
          dynamicSections.push({
            id: "new-arrivals",
            title: "New Arrivals This Month",
            subtitle: "Fresh vehicles just added to our collection",
            badge: "Just Added",
            cars: newArrivals.slice(0, 6).map((car, idx) =>
              toCarCard(car, getRandomFallbackImage(idx), idx)
            ),
          });
        }

        // Section 3: Peer Host Community
        const peerHostCars = allCars.filter(
          (car) => car.ownerType === "User" && car.status === "AVAILABLE"
        );
        if (peerHostCars.length > 0) {
          dynamicSections.push({
            id: "peer-host",
            title: "Peer Host Vehicles",
            subtitle: "Rent directly from trusted local owners",
            badge: "Peer Host",
            cars: peerHostCars.slice(0, 6).map((car, idx) =>
              toCarCard(car, getRandomFallbackImage(idx), idx)
            ),
          });
        }

        // Section 4: Recently Updated Listings
        const recentlyUpdated = allCars.filter(isRecentlyUpdated);
        if (recentlyUpdated.length > 0 && recentlyUpdated.length !== allCars.length) {
          dynamicSections.push({
            id: "recently-updated",
            title: "Recently Updated",
            subtitle: "Freshly updated listings with new details",
            badge: "Updated",
            cars: recentlyUpdated.slice(0, 6).map((car, idx) =>
              toCarCard(car, getRandomFallbackImage(idx), idx)
            ),
          });
        }

        // Section 5: Category-based sections (SUV, Luxury, Electric, etc.)
        const vehiclesByCategory = new Map<string, ApiVehicle[]>();
        
        allCars.forEach((car) => {
          const category = getVehicleCategory(car);
          if (!vehiclesByCategory.has(category)) {
            vehiclesByCategory.set(category, []);
          }
          vehiclesByCategory.get(category)!.push(car);
        });

        const categoryConfigs: Record<string, { title: string; badge: string; icon?: string }> = {
          "SUV": { title: "SUVs & Crossovers", badge: "SUV", icon: "🚙" },
          "Luxury": { title: "Luxury & Premium", badge: "Luxury", icon: "✨" },
          "Sedan": { title: "Sedans & Economy", badge: "Sedan", icon: "🚗" },
          "Electric": { title: "Electric & Hybrid", badge: "Eco-Friendly", icon: "⚡" },
          "Van": { title: "Vans & Minivans", badge: "Family", icon: "🚐" },
          "Truck": { title: "Trucks & Pickups", badge: "Heavy Duty", icon: "🛻" },
          "Sports": { title: "Sports & Performance", badge: "Performance", icon: "🏎️" },
        };

        for (const [category, cars] of vehiclesByCategory.entries()) {
          const config = categoryConfigs[category];
          if (config && cars.length >= 3) {
            dynamicSections.push({
              id: `category-${category.toLowerCase()}`,
              title: config.title,
              subtitle: `Browse our ${category.toLowerCase()} collection`,
              badge: config.badge,
              icon: config.icon,
              cars: cars.slice(0, 6).map((car, idx) =>
                toCarCard(car, getRandomFallbackImage(idx), idx)
              ),
            });
          }
        }

        if (!isCancelled) {
          setSections(dynamicSections);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to load cars:", error);
        if (!isCancelled) {
          setSections([]);
          setIsLoading(false);
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
      {isLoading ? (
        <CarLoadingState
          message="Discovering top rentals..."
          className="py-24"
        />
      ) : sections.length > 0 ? (
        sections.map((section) => <CarRow key={section.id} section={section} />)
      ) : (
        <div className="text-center py-24">
          <p className="text-muted-foreground">No vehicles available at the moment.</p>
        </div>
      )}
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
    <div className="mx-auto max-w-7xl px-4 mb-12">
      <div className="mb-6 flex items-end justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary/80 text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1">
              {section.icon && <span>{section.icon}</span>}
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
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() =>
              scrollRef.current?.scrollBy({ left: 380, behavior: "smooth" })
            }
            className="p-2 border rounded-full hover:bg-accent dark:hover:bg-accent/20 transition-colors"
            aria-label="Scroll right"
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
              href={`/cars/${car.id}`}
              key={car.id}
              className="block w-[250px] md:w-[calc((100%_-_2.5rem)/3)] md:min-w-[calc((100%_-_2.5rem)/3)] md:max-w-[calc((100%_-_2.5rem)/3)] shrink-0 snap-start"
            >
              <Card className="w-full overflow-hidden border-none shadow-none bg-transparent dark:bg-gray-800 hover:bg-accent/5 dark:hover:bg-accent/20 transition-colors p-2">
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-3 shadow-sm">
                  <Image
                    src={car.image}
                    alt={car.vechile_name}
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
                    {car.transmission && (
                      <span className="flex items-center gap-1 capitalize">
                        {car.transmission === "automatic" ? "Auto" : 
                         car.transmission === "manual" ? "Manual" : "CVT"}
                      </span>
                    )}
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
                        -{Math.round(
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