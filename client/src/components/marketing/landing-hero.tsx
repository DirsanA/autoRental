"use client";

import Image from "next/image";
import { useState } from "react";
import { addDays, format } from "date-fns";
import {
  CalendarIcon,
  MapPin,
  Car,
  Search,
  Plane,
  Locate,
  Building2,
} from "lucide-react";
import { type DateRange } from "react-day-picker";

import { SectionContainer } from "@/components/marketing/section-container";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calender";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import carImage from "@/assets/image.jpg";

export function LandingHero() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const [activeTab, setActiveTab] = useState("all");

  const filters = [
    { name: "All Cars", value: "all", icon: Car },
    { name: "Airports", value: "airport", icon: Plane },
    { name: "Nearby", value: "nearby", icon: Locate },
    { name: "Cities", value: "cities", icon: Building2 },
  ];

  return (
    <SectionContainer className="pt-16 md:pt-20">
      <div className="relative w-full min-h-[380px] md:h-[300px] flex flex-col items-center justify-center rounded-[2rem] md:rounded-[1.5rem] overflow-hidden shadow-2xl px-4 md:px-2">
        <Image
          src={carImage}
          alt="Auto Rent Ethiopia"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60" />

        <div className="relative z-10 w-full max-w-6xl flex flex-col items-center text-center mb-6 md:mb-6">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-md mb-4">
            Auto Rent Ethiopia
          </h1>
          <p className="text-sm md:text-lg max-w-3xl text-gray-100 mb-4 md:mb-16 opacity-90 px-4">
            Premium car rentals across Ethiopia. Experience comfort and
            reliability in every mile.
          </p>

          {/* Search Card */}
          <Card className="w-full max-w-5xl h-auto bg-white border-none shadow-2xl rounded-2xl md:absolute md:-bottom-12 z-20">
            <CardContent className="p-4 md:p-3">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-2 items-end text-left">
                {/* Location */}
                <div className="md:col-span-4 flex flex-col">
                  <label className="text-gray-400 font-bold text-[10px] uppercase ml-1 mb-1 tracking-widest">
                    Pick-up Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 z-10 w-4 h-4" />
                    <Input
                      type="text"
                      value={query}
                      placeholder="City or Airport"
                      onFocus={() => setOpen(true)}
                      onChange={(e) => setQuery(e.target.value)}
                      className="bg-gray-50 h-12 pl-10 rounded-xl border-none font-medium text-sm"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="md:col-span-3 flex flex-col">
                  <label className="text-gray-400 font-bold text-[10px] uppercase ml-1 mb-1 tracking-widest">
                    Rental Dates
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full h-12 px-3 flex items-center gap-2 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-900">
                        <CalendarIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="truncate">
                          {date?.from
                            ? format(date.from, "MMM dd")
                            : "Pick dates"}{" "}
                          - {date?.to ? format(date.to, "MMM dd") : ""}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-white"
                      align="center"
                    >
                      <Calendar
                        mode="range"
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={1} // Better for mobile
                        className="md:hidden"
                      />
                      <Calendar
                        mode="range"
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        className="hidden md:block"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Type */}
                <div className="md:col-span-3 flex flex-col">
                  <label className="text-gray-400 font-bold text-[10px] uppercase ml-1 mb-1 tracking-widest">
                    Car Type
                  </label>
                  <Select>
                    <SelectTrigger className="bg-gray-50 h-12 rounded-xl border-none font-semibold text-sm">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="sedan">Sedan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit */}
                <div className="md:col-span-2">
                  <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-transform active:scale-95 md:hover:scale-105">
                    <Search className="w-5 h-5 mr-2 md:mr-0" />
                    <span className="md:hidden">Search Cars</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mt-16 md:mt-20 flex flex-col items-center px-4">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-6">
          Quick Filters
        </p>
        <div className="grid grid-cols-2 md:flex md:flex-row items-center justify-center gap-3 md:gap-8 w-full max-w-4xl">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeTab === filter.value;
            return (
              <button
                key={filter.value}
                onClick={() => setActiveTab(filter.value)}
                className={cn(
                  "flex items-center justify-center md:justify-start gap-2 px-4 md:px-6 py-3 rounded-full border transition-all duration-300",
                  isActive
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 md:scale-110 z-10"
                    : "bg-white border-gray-100 text-gray-500 hover:border-blue-200 hover:text-blue-600",
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs md:text-sm font-bold">
                  {filter.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </SectionContainer>
  );
}
