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

type VehicleReview = {
  name?: string;
  rating: number;
  createdAt: string;
  comment?: string;
};

type VehicleRatingStats = {
  avg: number;
  count: number;
  breakdown?: Record<string, number>;
};

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
        vehicle?.ratingAvg && vehicle.ratingAvg > 0 ? vehicle.ratingAvg :0.0,
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
      <div className="bg-white dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-50">
        <Navbar />
        <main className="flex justify-center items-center pt-20 min-h-[80vh]">
          <CarLoadingState message="Fetching vehicle details..." />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-50">
        <Navbar />
        <main className="space-y-4 mx-auto mt-20 px-4 sm:px-6 lg:px-8 pt-6 pb-20 max-w-7xl">
          <p className="font-medium text-red-600 text-lg">{error}</p>
          <Button onClick={() => router.push("/#cars-section")}>
            Back to cars
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-50">
      <Navbar />

      <main className="space-y-10 mx-auto mt-20 px-4 sm:px-6 lg:px-8 pt-6 pb-20 max-w-7xl">
        {/* Image Gallery */}
        <div className="relative animate-fade-in">
          <div className="gap-2 grid grid-cols-1 md:grid-cols-3 shadow-lg rounded-2xl overflow-hidden">
            <div
              onClick={() => setShowPhotos(true)}
              className="group relative md:col-span-2 rounded-2xl aspect-[16/10] overflow-hidden cursor-pointer"
            >
              <Image
                src={car.images[0]}
                alt={car.name}
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                loading="eager"
                className="rounded-2xl w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
            </div>

            <div className="hidden gap-2 md:grid grid-rows-2">
              {car.images.slice(1, 3).map((img, i) => (
                <div key={i} className="relative rounded-2xl overflow-hidden">
                  <Image
                    src={img}
                    alt={`${car.name} view ${i + 2}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 22vw"
                    className="rounded-2xl w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Favorite Heart */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="top-4 right-4 absolute bg-white/90 hover:bg-white dark:bg-gray-800 shadow-md backdrop-blur-sm p-3 dark:border-gray-700 rounded-full transition-colors"
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
            className="right-4 bottom-4 absolute gap-2 bg-white/90 hover:bg-white/95 dark:bg-gray-800 shadow-md backdrop-blur-sm dark:border-gray-700 font-semibold transition-colors"
          >
            <Grid className="w-4 h-4" />
            View {car.images.length} photos
          </Button>
        </div>

        {/* Content Section */}
        <div className="gap-10 grid grid-cols-1 lg:grid-cols-3">
          {/* Left Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Title Section */}
            <div className="space-y-2 animate-fade-in">
              <h1 className="font-extrabold text-gray-900 dark:text-gray-300 text-4xl">
                {car.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-gray-600 dark:text-gray-300 text-sm">
                <span className="font-semibold text-gray-800 dark:text-gray-300">
                  {car.subtitle}
                </span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="fill-yellow-400 w-5 h-5 text-yellow-400" />
                  <span className="font-semibold text-gray-800 dark:text-gray-300">
                    {car.rating}
                  </span>
                  <span className="text-gray-500 dark:text-gray-300">
                    ({car.trips} trips)
                  </span>
                </div>
                <span>•</span>
                {car.host.allStar && (
                  <div className="flex items-center gap-1 font-semibold text-yellow-500">
                    <Award className="w-4 h-4" /> All-Star Host
                  </div>
                )}
              </div>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap gap-3 mt-6 mb-6">
              <span className="flex items-center gap-1 bg-blue-50 dark:bg-gray-800 shadow-sm px-3 py-1 dark:border-gray-700 rounded-full font-semibold text-blue-600">
                <CarFront className="w-4 h-4" /> {car.model}
              </span>
              <span className="flex items-center gap-1 bg-green-50 dark:bg-gray-800 shadow-sm px-3 py-1 dark:border-gray-700 rounded-full font-semibold text-green-600">
                <Fuel className="w-4 h-4" /> {car.fuel}
              </span>
              <span className="flex items-center gap-1 bg-yellow-50 dark:bg-gray-800 shadow-sm px-3 py-1 dark:border-gray-700 rounded-full font-semibold text-yellow-600">
                <Settings2 className="w-4 h-4" /> {car.transmission}
              </span>
            </div>

            <div className="dark:bg-gray-800 my-6 border-gray-200 dark:border-gray-700 border-t" />
            <div className="py-2">
              <h2 className="mb-4 font-heading font-bold text-xl">Hosted by</h2>
              <div className="flex items-center gap-2.5 bg-slate-50/50 dark:bg-slate-800/30 p-3 border border-slate-50 dark:border-slate-800/50 rounded-xl">
                <Avatar className="shadow-sm border border-white dark:border-slate-700 w-12 h-12">
                  <AvatarImage src={car.host.image} alt={car.host.name} />
                  <AvatarFallback className="bg-blue-100 dark:bg-blue-900 font-bold text-blue-700 dark:text-blue-300 text-sm">
                    {car.host.name?.substring(0, 2).toUpperCase() || "PH"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate">
                    {car.host.name}
                  </p>
                  <p className="font-medium text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {car.host.typeLabel ||
                      (vehicle?.owner?.type === "company"
                        ? "Rental Company"
                        : "Peer Host")}
                  </p>
                </div>
              </div>
            </div>
            <div className="dark:bg-gray-800 my-6 border-gray-200 dark:border-gray-700 border-t" />
            <CarFeatures features={vehicle?.features} />
            <div className="dark:bg-gray-800 my-6 border-gray-200 dark:border-gray-700 border-t" />

            {/* Description */}
            <div className="py-2">
              <h2 className="mb-3 font-bold text-gray-900 dark:text-gray-300 text-2xl">
                Description
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {car.description}
              </p>
            </div>

            <div className="dark:bg-gray-800 my-6 border-gray-200 dark:border-gray-700 border-t" />
            <div className="py-2">
              <h2 className="mb-3 font-bold text-gray-900 dark:text-gray-300 text-2xl">
                Rating and Reviews
              </h2>

              <div className="flex items-center mb-2">
                <h2 className="font-bold text-gray-900 dark:text-gray-300 text-3xl">
                  {ratingStats?.avg?.toFixed(2) ?? car.rating}
                </h2>
                <Star className="fill-yellow-400 ml-2 w-6 h-6 text-yellow-400" />
              </div>

              <p className="mb-4 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                ({ratingStats?.count ?? car.trips} ratings)
              </p>

             
            </div>
            <div className="mt-6">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-300 text-xl">
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
                      <div className="flex justify-center items-center bg-gray-300 rounded-full w-10 h-10 font-bold">
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
                          <span className="text-gray-500 text-sm">
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
              allowSelfDrive={vehicle?.allowSelfDrive}
              securityDepositAmount={vehicle?.securityDepositAmount}
              ownerType={vehicle?.ownerType}
              vehicleStatus={vehicle?.status}
              availabilityBlocks={availabilityBlocks}
            />
          </div>
        </div>

        {/* Map Section */}
        <div className="dark:bg-gray-800 mt-10 pt-10 border-gray-200 dark:border-gray-700 border-t">
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
              if (typeof lat !== "number" || typeof lng !== "number")
                return undefined;

              // Approximate display for public listing: ~2 decimals ≈ 1km.
              const round = (v: number) => Math.round(v * 100) / 100;
              return { lat: round(lat), lng: round(lng) };
            })()}
          />
        </div>

        <div className="flex justify-between items-center bg-white dark:bg-gray-800 shadow hover:shadow-lg mt-10 p-6 border border-gray-200 dark:border-gray-700 rounded-2xl transition-shadow">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
              Looking for more cars?
            </h3>
            <p className="text-gray-600 dark:text-white text-sm">
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
      <footer className="bg-gray-900 dark:bg-gray-800 mt-20 py-12 dark:border-gray-700 text-gray-300">
        <div className="gap-8 grid grid-cols-1 md:grid-cols-3 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div>
            <h3 className="dark:bg-gray-800 mb-3 dark:border-gray-700 font-bold text-white">
              CarRental
            </h3>
            <p>Premium cars at your fingertips. Drive with style.</p>
          </div>
          <div>
            <h3 className="mb-3 dark:border-gray-700 font-bold text-white">
              Company
            </h3>
            <ul className="space-y-1">
              <li className="hover:underline cursor-pointer">About Us</li>
              <li className="hover:underline cursor-pointer">Careers</li>
              <li className="hover:underline cursor-pointer">Contact</li>
            </ul>
          </div>
          <div>
            <h3 className="dark:bg-gray-800 mb-3 dark:border-gray-700 font-bold text-white">
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
        <div className="mt-8 text-gray-500 text-center">
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
