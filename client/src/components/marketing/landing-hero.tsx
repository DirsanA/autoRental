"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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
  const [date, setDate] = useState<DateRange | undefined>();
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    setDate({
      from: new Date(),
      to: addDays(new Date(), 7),
    });
  }, []);

  const filters = [
    { name: "All Cars", value: "all", icon: Car },
    { name: "Airports", value: "airport", icon: Plane },
    { name: "Nearby", value: "nearby", icon: Locate },
    { name: "Cities", value: "cities", icon: Building2 },
  ];

  return (
    <SectionContainer className="pt-20 ">
      <div className="relative w-full h-[450px] md:h-[400px] flex flex-col items-center justify-center rounded-[2.5rem] overflow-hidden shadow-2xl px-6">
        <Image
          src={carImage}
          alt="Auto Rent Ethiopia"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60" />

        <div className="relative z-10 w-full max-w-6xl flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight  bg-clip-text drop-shadow-md">
            Auto Rent Ethiopia
          </h1>
          <p className="text-base md:text-lg max-w-2xl text-gray-100  mb-20  opacity-90">
            Premium car rentals across Ethiopia. Experience comfort and
            reliability in every mile.
          </p>

          <Card className="w-full max-w-5xl  bg-white border-none shadow-2xl rounded-2xl md:absolute md:-bottom-12 z-20">
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end text-left">
                {/* Location */}
                <Field className="md:col-span-4">
                  <FieldLabel className="text-gray-400 font-bold text-[10px] uppercase ml-1 mb-1 tracking-widest">
                    Pick-up Location
                  </FieldLabel>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 z-10 w-5 h-5" />
                    <Input
                      type="text"
                      value={query}
                      placeholder="City or Airport"
                      onFocus={() => setOpen(true)}
                      onChange={(e) => setQuery(e.target.value)}
                      className="bg-gray-50 h-14 pl-12 rounded-xl border-none font-medium"
                    />
                  </div>
                </Field>

                {/* Dates */}
                <Field className="md:col-span-4">
                  <FieldLabel className="text-gray-400 font-bold text-[10px] uppercase ml-1 mb-1 tracking-widest">
                    Rental Dates
                  </FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full h-14 px-4 flex items-center gap-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-900">
                        <CalendarIcon className="w-5 h-5 text-blue-600" />
                        {date?.from
                          ? format(date.from, "MMM dd")
                          : "Pick dates"}{" "}
                        - {date?.to ? format(date.to, "MMM dd") : ""}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </Field>

                {/* Type */}
                <Field className="md:col-span-2">
                  <FieldLabel className="text-gray-400 font-bold text-[10px] uppercase ml-1 mb-1 tracking-widest">
                    Car Type
                  </FieldLabel>
                  <Select>
                    <SelectTrigger className="bg-gray-50 h-14 rounded-xl border-none font-semibold">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="sedan">Sedan</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                {/* Submit */}
                <div className="md:col-span-2">
                  <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-transform hover:scale-105">
                    <Search className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-10 md:mt-14 flex flex-col items-center">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
          Quick Filters
        </p>
        <div className="flex items-center justify-center gap-12 flex-wrap">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeTab === filter.value;
            return (
              <button
                key={filter.value}
                onClick={() => setActiveTab(filter.value)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-full border transition-all duration-300",
                  isActive
                    ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100 scale-110 z-10"
                    : "bg-white border-gray-100 text-gray-500 hover:border-blue-200 hover:text-blue-600",
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-bold">{filter.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </SectionContainer>
  );
}
