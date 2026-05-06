"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Star,
  Grid,
  Heart,
  Fuel,
  Settings2,
  CarFront,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CarLoadingState } from "@/components/shared/car-loading-state";

import carMain from "@/assets/image.jpg";
import car2 from "@/assets/car-1.jpg";
import car3 from "@/assets/car-2.jpg";
import car4 from "@/assets/car-3.jpg";
import car5 from "@/assets/car-4.jpg";

import BookingCard from "@/components/BookingCard";
import CarFeatures from "@/components/CarFeatures";
import MapSection from "@/components/MapSection";
import PhotoModal from "@/components/PhototModal";
import Navbar from "@/components/navbar";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  fetchMarketplaceVehicleByIdWithOwner,
  fetchVehicleAvailability,
  fetchVehicleReviews,
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
  const [reviews, setReviews] = useState<
    Array<{
      id?: string;
      name?: string;
      image?: string | null;
      rating: number;
      comment?: string;
      createdAt: string;
    }>
  >([]);
  const [ratingStats, setRatingStats] = useState<{
    avg: number;
    count: number;
    breakdown: Record<string, number>;
  } | null>(null);
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
        const data = await fetchMarketplaceVehicleByIdWithOwner(vehicleId);
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
        try {
          const reviewData = await fetchVehicleReviews(vehicleId);
          if (cancelled) return;

          setReviews(reviewData.reviews);
          setRatingStats(reviewData.ratingStats);
        } catch {
          if (cancelled) return;
          setReviews([]);
          setRatingStats(null);
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
    const images =
      photosFromApi.length > 0
        ? Array.from(new Set(photosFromApi))
        : FALLBACK_IMAGES;
    const dailyRate = vehicle?.dailyRate ?? 0;
    const monthlyDiscount = Math.round(dailyRate * 30 * 0.12);
    const originalPrice = Math.round(dailyRate * 30 + monthlyDiscount);

    return {
      name,
      subtitle: vehicle
        ? `${vehicle.year} ${vehicle.model}`
        : "Vehicle details",
      rating:
        vehicle?.ratingAvg && vehicle.ratingAvg > 0 ? vehicle.ratingAvg : 4.9,
      trips: vehicle?.ratingCount ?? 0,
      model: vehicle?.model ?? "N/A",
      fuel: vehicle?.fuel ?? "Petrol",
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
        name: vehicle?.owner?.name || "Vehicle Owner",
        image: vehicle?.owner?.image,
        allStar: false,
        typeLabel:
          vehicle?.owner?.type === "company"
            ? "Rental Company"
            : vehicle?.owner?.type === "peerhost"
              ? "Peer Host"
              : vehicle?.ownerType === "Company"
                ? "Rental Company"
                : vehicle?.ownerType === "User"
                  ? "Peer Host"
                  : undefined,
      },
    };
  }, [vehicle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-50">
        <Navbar />
        <main className="flex min-h-[80vh] items-center justify-center pt-20">
          <CarLoadingState message="Fetching vehicle details..." />
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
          <Button onClick={() => router.push("/#cars-section")}>
            Back to cars
          </Button>
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
                  <span className="text-gray-500 dark:text-gray-300">
                    ({car.trips} trips)
                  </span>
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
                <CarFront className="w-4 h-4" /> {car.model}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full dark:bg-gray-800 dark:border-gray-700 bg-green-50 text-green-600 font-semibold shadow-sm">
                <Fuel className="w-4 h-4" /> {car.fuel}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full dark:bg-gray-800 dark:border-gray-700 bg-yellow-50 text-yellow-600 font-semibold shadow-sm">
                <Settings2 className="w-4 h-4" /> {car.transmission}
              </span>
            </div>

            <div className="border-t dark:bg-gray-800 dark:border-gray-700 border-gray-200 my-6" />
            <div className="py-2">
              <h2 className="text-xl font-bold font-heading mb-4">Hosted by</h2>
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-50 bg-slate-50/50 p-3 dark:border-slate-800/50 dark:bg-slate-800/30">
                <Avatar className="h-12 w-12 border border-white shadow-sm dark:border-slate-700">
                  <AvatarImage src={car.host.image} alt={car.host.name} />
                  <AvatarFallback className="bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {car.host.name?.substring(0, 2).toUpperCase() || "PH"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-700 dark:text-slate-200">
                    {car.host.name}
                  </p>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {car.host.typeLabel ||
                      (vehicle?.owner?.type === "company"
                        ? "Rental Company"
                        : "Peer Host")}
                  </p>
                </div>
              </div>
            </div>
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
            <div className="py-2">
              <h2 className="text-2xl font-bold dark:text-gray-300 text-gray-900 mb-3">
                Rating and Reviews
              </h2>

              <div className="flex items-center mb-2">
                <h2 className="text-3xl font-bold dark:text-gray-300 text-gray-900">
                  {ratingStats?.avg?.toFixed(2) ?? car.rating}
                </h2>
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400 ml-2" />
              </div>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-4">
                ({ratingStats?.count ?? car.trips} ratings)
              </p>

              <div className="space-y-2">
                {[
                  { label: "Cleanliness", value: 5 },
                  { label: "Maintenance", value: 4.8 },
                  { label: "Communication", value: 4.9 },
                  { label: "Convenience", value: 4.7 },
                  { label: "Accuracy", value: 5 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-5">
                    {/* Label */}
                    <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.label}
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-700 rounded-full"
                        style={{ width: `${(item.value / 5) * 100}%` }}
                      ></div>
                    </div>

                    {/* Value */}
                    <div className=" mr-48 text-lg text-gray-700 dark:text-gray-300 text-right">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4 dark:text-gray-300 text-gray-900">
                Reviews
              </h3>

              <div className="space-y-2">
                {reviews.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">
                    No reviews yet for this vehicle.
                  </p>
                ) : (
                  reviews.map((review, i) => (
                    <div key={i} className="flex gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold">
                        {review?.name?.charAt(0) ?? "U"}
                      </div>

                      <div className="flex-1">
                        {/* Stars */}
                        <div className="flex mt-1">
                          {[...Array(5)].map((_, index) => (
                            <Star
                              key={index}
                              className={`w-4 h-4 ${
                                index < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Name + Date */}
                        <div className="flex items-center gap-2">
                          <h4 className="text-gray-900 dark:text-gray-300">
                            {review?.name}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {new Date(review?.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Comment */}
                        <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm">
                          {review?.comment}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <BookingCard
              vehicleId={vehicle?.id || ""}
              vehicleName={car.name}
              dailyRate={vehicle?.dailyRate ?? 0}
              location={car.location}
              ownerType={vehicle?.ownerType}
              vehicleStatus={vehicle?.status}
              availabilityBlocks={availabilityBlocks}
            />
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-10 border-t dark:bg-gray-800 dark:border-gray-700 border-gray-200 pt-10">
          <MapSection
            locationText={
              vehicle?.ownerType === "Company"
                ? vehicle.companyLocation?.address ||
                  vehicle.location ||
                  "Pickup & return at company location"
                : vehicle?.pickupAddress ||
                  vehicle?.returnAddress ||
                  vehicle?.location ||
                  "Pickup & return location"
            }
            coords={(() => {
              const raw =
                vehicle?.ownerType === "Company"
                  ? vehicle.companyLocation
                  : vehicle?.pickupGeo || vehicle?.returnGeo;

              if (!raw) return undefined;
              const lat = typeof raw.lat === "number" ? raw.lat : undefined;
              const lng = typeof raw.lng === "number" ? raw.lng : undefined;
              if (typeof lat !== "number" || typeof lng !== "number") return undefined;

              // Approximate display for public listing: ~2 decimals ≈ 1km.
              const round = (v: number) => Math.round(v * 100) / 100;
              return { lat: round(lat), lng: round(lng) };
            })()}
          />
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
              {
                id: "mercedes-e-class",
                name: "Mercedes E-Class",
                price: 1750,
                image: car3,
              },
              {
                id: "tesla-model-s",
                name: "Tesla Model S",
                price: 2100,
                image: car4,
              },
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
            <h3 className="font-bold mb-3 dark:bg-gray-800 dark:border-gray-700 text-white">
              CarRental
            </h3>
            <p>Premium cars at your fingertips. Drive with style.</p>
          </div>
          <div>
            <h3 className="font-bold mb-3  dark:border-gray-700  text-white">
              Company
            </h3>
            <ul className="space-y-1">
              <li className="hover:underline cursor-pointer">About Us</li>
              <li className="hover:underline cursor-pointer">Careers</li>
              <li className="hover:underline cursor-pointer">Contact</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-3  dark:border-gray-700 dark:bg-gray-800 text-white">
              Support
            </h3>
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
