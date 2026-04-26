"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Star,
  Users,
  Grid,
  Heart,
  Fuel,
  Settings2,
  Gauge,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import carMain from "@/assets/image.jpg";
import car2 from "@/assets/car-1.jpg";
import car3 from "@/assets/car-2.jpg";
import car4 from "@/assets/car-3.jpg";
import car5 from "@/assets/car-4.jpg";

import ImageGallery from "@/components/ImageGallery";
import BookingCard from "@/components/BookingCard";
import HostSection from "@/components/HostSection";
import CarFeatures from "@/components/CarFeatures";
import MapSection from "@/components/MapSection";
import PhotoModal from "@/components/PhototModal";
import Navbar from "@/components/navbar";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  fetchPeerHostVehicleById,
  fetchVehicleAvailability,
} from "@/components/peer-host/vehicles/api";
import type {
  Vehicle,
  VehicleAvailabilityBlock,
} from "@/components/peer-host/vehicles/types";

const FALLBACK_IMAGES = [carMain.src, car2.src, car3.src, car4.src, car5.src];

const Index = () => {
  const [showPhotos, setShowPhotos] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [availabilityBlocks, setAvailabilityBlocks] = useState<
    VehicleAvailabilityBlock[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function loadVehicle() {
      const vehicleId = params?.id;
      if (!vehicleId || Array.isArray(vehicleId)) {
        setError("Invalid vehicle id");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await fetchPeerHostVehicleById(vehicleId);
        if (cancelled) return;

        if (!data) {
          setError("Vehicle not found");
          setVehicle(null);
          return;
        }

        setVehicle(data);

        try {
          const availability = await fetchVehicleAvailability(vehicleId);
          if (cancelled) return;
          setAvailabilityBlocks(availability);
        } catch {
          if (cancelled) return;
          setAvailabilityBlocks([]);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load vehicle");
        setVehicle(null);
        setAvailabilityBlocks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadVehicle();
    return () => {
      cancelled = true;
    };
  }, [params?.id]);

  const car = useMemo(() => {
    const name = vehicle ? `${vehicle.make} ${vehicle.model}` : "Vehicle";
    const photosFromApi = [
      ...(vehicle?.galleryImages ?? []),
      ...(vehicle?.imageUrl ? [vehicle.imageUrl] : []),
    ].filter(Boolean) as string[];
    const images = photosFromApi.length > 0 ? Array.from(new Set(photosFromApi)) : FALLBACK_IMAGES;
    const dailyRate = vehicle?.dailyRate ?? 0;
    const monthlyDiscount = Math.round(dailyRate * 30 * 0.12);
    const originalPrice = Math.round(dailyRate * 30 + monthlyDiscount);

    return {
      name,
      subtitle: vehicle ? `${vehicle.year} ${vehicle.model}` : "Vehicle details",
      rating: vehicle?.ratingAvg && vehicle.ratingAvg > 0 ? vehicle.ratingAvg : 4.9,
      trips: vehicle?.ratingCount ?? 0,
      seats: vehicle?.seats ?? 5,
      fuel: vehicle?.fuel ?? "Petrol",
      mpg: 32,
      transmission: vehicle?.transmission ?? "Automatic",
      location: vehicle?.location ?? "Addis Ababa",
      pricePerMonth: dailyRate * 30,
      originalPrice,
      monthlyDiscount,
      images,
      description:
        vehicle?.description ||
        "A clean, comfortable rental car suitable for city rides, airport pickups, and long drives.",
      host: {
        name: "Verified Host",
        rating: 4.9,
        trips: 120,
        joined: "Dec 2024",
        allStar: true,
        image: car2.src,
      },
    };
  }, [vehicle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-50">
        <Navbar />
        <main className="max-w-7xl mt-20 mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
          <p className="text-lg font-medium">Loading vehicle details...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-50">
        <Navbar />
        <main className="max-w-7xl mt-20 mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 space-y-4">
          <p className="text-lg font-medium text-red-600">{error}</p>
          <Button onClick={() => router.push("/#cars-section")}>Back to cars</Button>
        </main>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-50">

      <Navbar />

      <main className="max-w-7xl mt-20 mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 space-y-10">
        {/* Image Gallery */}
        <div className="relative animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-2xl overflow-hidden shadow-lg">
            <div
              onClick={() => setShowPhotos(true)}
              className="relative md:col-span-2 aspect-[16/10] overflow-hidden rounded-2xl cursor-pointer group"
            >
              <Image
                src={car.images[0]}
                alt={car.name}
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                loading="eager"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl"
                unoptimized
              />
            </div>

            <div className="hidden md:grid grid-rows-2 gap-2">
              {car.images.slice(1, 3).map((img, i) => (
                <div key={i} className="relative overflow-hidden rounded-2xl">
                  <Image
                    src={img}
                    alt={`${car.name} view ${i + 2}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 22vw"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 rounded-2xl"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Favorite Heart */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute top-4 right-4 p-3 rounded-full dark:bg-gray-800 dark:border-gray-700 bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-colors"
          >
            <Heart
              className={`w-6 h-6 transition-colors ${
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-gray-700 hover:text-red-500"
              }`}
            />
          </button>

          {/* View Photos Button */}
          <Button
            onClick={() => setShowPhotos(true)}
            variant="secondary"
            className="absolute bottom-4 right-4 gap-2 shadow-md dark:bg-gray-800 dark:border-gray-700 bg-white/90 backdrop-blur-sm hover:bg-white/95 transition-colors font-semibold"
          >
            <Grid className="w-4 h-4" />
            View {car.images.length} photos
          </Button>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title Section */}
            <div className="animate-fade-in space-y-2">
              <h1 className="text-4xl font-extrabold dark:text-gray-300 text-gray-900">
                {car.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm dark:text-gray-300 text-gray-600">
                <span className="font-semibold dark:text-gray-300 text-gray-800">
                  {car.subtitle}
                </span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold dark:text-gray-300 text-gray-800">
                    {car.rating}
                  </span>
                  <span className="text-gray-500 dark:text-gray-300">({car.trips} trips)</span>
                </div>
                <span>•</span>
                {car.host.allStar && (
                  <div className="flex items-center gap-1 text-yellow-500 font-semibold">
                    <Award className="w-4 h-4" /> All-Star Host
                  </div>
                )}
              </div>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap gap-3 mt-6 mb-6">
              <span className="flex items-center gap-1 px-3 py-1 rounded-full dark:bg-gray-800 dark:border-gray-700 bg-blue-50 text-blue-600 font-semibold shadow-sm">
                <Users className="w-4 h-4" /> {car.seats} seats
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full dark:bg-gray-800 dark:border-gray-700 bg-green-50 text-green-600 font-semibold shadow-sm">
                <Fuel className="w-4 h-4" /> {car.fuel}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full dark:bg-gray-800 dark:border-gray-700 bg-indigo-50 text-indigo-600 font-semibold shadow-sm">
                <Gauge className="w-4 h-4" /> {car.mpg} MPG
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full dark:bg-gray-800 dark:border-gray-700 bg-yellow-50 text-yellow-600 font-semibold shadow-sm">
                <Settings2 className="w-4 h-4" /> {car.transmission}
              </span>
            </div>

            <div className="border-t dark:bg-gray-800 dark:border-gray-700 border-gray-200 my-6" />
            <HostSection host={car.host} />
            <div className="border-t dark:bg-gray-800 dark:border-gray-700 border-gray-200 my-6" />
            <CarFeatures features={vehicle?.features} />
            <div className="border-t dark:bg-gray-800 dark:border-gray-700 border-gray-200 my-6" />

            {/* Description */}
            <div className="py-2">
              <h2 className="text-2xl font-bold dark:text-gray-300 text-gray-900 mb-3">
                Description
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {car.description}
              </p>
            </div>

            <div className="border-t dark:bg-gray-800 dark:border-gray-700 border-gray-200 my-6" />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <BookingCard
              vehicleId={vehicle?.id || ""}
              vehicleName={car.name}
              dailyRate={vehicle?.dailyRate ?? 0}
              location={car.location}
              vehicleStatus={vehicle?.status}
              availabilityBlocks={availabilityBlocks}
            />
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-10 border-t dark:bg-gray-800 dark:border-gray-700 border-gray-200 pt-10">
          <MapSection location={car.location} />
        </div>

        {/* Similar Cars */}
        <div className="mt-10">
          <div className="border-t dark:bg-gray-800 dark:border-gray-700 border-gray-200 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Similar Cars You Might Like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
  { id: "audi-a6", name: "Audi A6", price: 1650, image: car2 },
  { id: "mercedes-e-class", name: "Mercedes E-Class", price: 1750, image: car3 },
  { id: "tesla-model-s", name: "Tesla Model S", price: 2100, image: car4 },
  { id: "lexus-es", name: "Lexus ES", price: 1600, image: car5 },
].map((sc) => (
              <Link href={`/cars/${sc.id}`} key={sc.id}>
                <div className="group rounded-2xl overflow-hidden border dark:bg-gray-800 dark:border-gray-700 border-gray-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 active:scale-[0.98]">
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <Image
                      src={sc.image}
                      alt={sc.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <span className="absolute top-2 right-2 bg-blue-600 dark:bg-gray-800 dark:border-gray-700 text-white px-2 py-1 rounded text-sm font-semibold shadow">
                      ${sc.price}/mo
                    </span>
                  </div>

                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                      {sc.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Browse Cars CTA */}
        <div className="mt-10 flex items-center justify-between p-6 rounded-2xl border  dark:bg-gray-800 dark:border-gray-700 border-gray-200 bg-white shadow hover:shadow-lg transition-shadow">
          <div>
            <h3 className="text-lg font-bold dark:text-white text-gray-900">
              Looking for more cars?
            </h3>
            <p className="text-sm dark:text-white text-gray-600">
              Browse all available cars in your area.
            </p>
          </div>
          <Button
            onClick={() => router.push("/#cars-section")}
            variant="default"
            className="font-semibold hover:scale-105 active:scale-95 transition-transform"
          >
            Browse Cars
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-800 dark:border-gray-700 text-gray-300 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold mb-3 dark:bg-gray-800 dark:border-gray-700 text-white">CarRental</h3>
            <p>Premium cars at your fingertips. Drive with style.</p>
          </div>
          <div>
            <h3 className="font-bold mb-3  dark:border-gray-700  text-white">Company</h3>
            <ul className="space-y-1">
              <li className="hover:underline cursor-pointer">About Us</li>
              <li className="hover:underline cursor-pointer">Careers</li>
              <li className="hover:underline cursor-pointer">Contact</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-3  dark:border-gray-700 dark:bg-gray-800 text-white">Support</h3>
            <ul className="space-y-1">
              <li className="hover:underline cursor-pointer">Help Center</li>
              <li className="hover:underline cursor-pointer">FAQs</li>
              <li className="hover:underline cursor-pointer">
                Terms & Conditions
              </li>
              <li className="hover:underline cursor-pointer">
                Terms & Conditions
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-500">
          &copy; 2026 CarRental. All rights reserved.
        </div>
      </footer>

      {/* Photo Modal */}
      <PhotoModal
        images={car.images}
        carName={car.name}
        open={showPhotos}
        onClose={() => setShowPhotos(false)}
      />
    </div>
  );
};

export default Index;
