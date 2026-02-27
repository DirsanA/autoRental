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
import { useEffect, useRef, useState } from "react";
import carImage from "@/assets/image.jpg";
import car2 from "@/assets/car-1.jpg";
import car3 from "@/assets/car-2.jpg";
import car4 from "@/assets/car-3.jpg";
import car5 from "@/assets/car-4.jpg";

const COMPANY_SECTIONS = [
  {
    id: "newly-added",
    title: "Monthly Newly Added Cars",
    subtitle: "Fresh arrivals from Auto Rent Ethiopia's official fleet.",
    badge: "Official",
    cars: Array(6).fill({
      image:car2,
      vechile_name: "Toyota Camry",
      year: 2024,
      rating: 4.9,
      price: 3400,
      discount: 340,
      isOfficial: true,
    }),
  },
  {
    id: "user-hosted",
    title: "Community Hosted Vehicles",
    subtitle: "Rent directly from trusted local owners in Addis.",
    badge: "User Post",
    cars: Array(6).fill({
      image:car3,
      vechile_name: "Hyundai Tucson",
      year: 2021,
      rating: 4.5,
      price: 2800,
      discount: 150,
      isOfficial: false,
    }),
  },
  {
    id: "airport",
    title: "Airport Transfers",
    subtitle: "Convenient car rentals for arrivals and departures.",
    badge: "Airport",
    cars: Array(6).fill({
      image:car4,
      vechile_name: "Mercedes-Benz E-Class",
      year: 2023,
      rating: 4.8,
      price: 4200,
      discount: 200,
      isOfficial: true,
    }),
  },
  {
    id: "luxury",
    title: "Luxury Fleet",
    subtitle: "Experience the finest in Ethiopian car rentals.",
    badge: "Luxury",
    cars: Array(6).fill({
      image:car5,
      vechile_name: "BMW 5 Series",
      year: 2023,
      rating: 4.9,
      price: 5500,
      discount: 300,
      isOfficial: true,
    }),
  },
  {
    id: "suv",
    title: "SUVs & Vans",
    subtitle: "Perfect for families and group travel.",
    badge: "SUV",
    cars: Array(6).fill({
      image: carImage,
      vechile_name: "Ford Explorer",
      year: 2022,
      rating: 4.7,
      price: 3800,
      discount: 250,
      isOfficial: true,
    }),
  },
];

export function LandingFeatures() {
  return (
 <SectionContainer id="features" className="py-0 space-y-0">
      {COMPANY_SECTIONS.map((section) => (
        <CarRow key={section.id} section={section} />
      ))}
    </SectionContainer>
  );
}

function CarRow({ section }: { section: (typeof COMPANY_SECTIONS)[0] }) {
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
            <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded">
              {section.badge}
            </span>
            <span className="text-muted-foreground text-xs">
              • Updated today
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {section.title}
          </h2>
          <p className="text-muted-foreground text-sm">{section.subtitle}</p>
        </div>

        <div className="hidden md:flex gap-2">
          <button
            onClick={() =>
              scrollRef.current?.scrollBy({ left: -380, behavior: "smooth" })
            }
            className="p-2 border rounded-full hover:bg-accent"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() =>
              scrollRef.current?.scrollBy({ left: 380, behavior: "smooth" })
            }
            className="p-2 border rounded-full hover:bg-accent"
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
            <Card
              key={idx}
              className="min-w-[300px] md:min-w-[340px] snap-start overflow-hidden border-none shadow-none bg-transparent hover:bg-accent/5 transition-colors p-2"
            >
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-3 shadow-sm">
                <Image src={car.image} alt="car" fill className="object-cover" />
              </div>

              <div className="px-1">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-lg flex items-center gap-1">
                    {car.vechile_name}
                    {car.isOfficial && (
                      <BadgeCheck size={16} className="text-blue-500" />
                    )}
                  </h3>
                  <div className="flex items-center gap-1 text-sm font-semibold">
                    <Star
                      size={14}
                      className="fill-yellow-500 text-yellow-500"
                    />{" "}
                    {car.rating}
                  </div>
                </div>

                <div className="flex gap-3 text-muted-foreground text-xs mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {car.year}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> Addis Ababa
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-black text-primary">
                      ${car.price}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-1 uppercase">
                      / Day
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground line-through block">
                      ${car.price + car.discount}
                    </span>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1 rounded">
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
          ))}
        </div>
      </div>
    </div>
  );
}
