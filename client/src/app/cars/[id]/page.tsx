"use client";
import { useState } from "react";
import {
  Star,
  Users,
  MapPin,
  Grid,
  Heart,
  X,
  Fuel,
  Settings2,
  Gauge,
  Shield,
  Smartphone,
  Navigation,
  Thermometer,
  Sun,
  Check,
  Award,
  ChevronDown,
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
import { useRouter } from "next/navigation";

const car = {
  name: "BMW 5 Series",
  subtitle: "2025 530i",
  rating: 5.0,
  trips: 33,
  seats: 5,
  fuel: "Hybrid",
  mpg: 32,
  transmission: "Automatic",
  location: "Miami, FL 33142",
  pricePerMonth: 1841,
  originalPrice: 2549,
  monthlyDiscount: 708,
  images: [carMain, car2, car3, car4, car5],
  host: {
    name: "Kyrylo",
    rating: 4.9,
    trips: 34889,
    joined: "Dec 2017",
    allStar: true,
    image: car2,
  },
};

const Index = () => {
  const [showPhotos, setShowPhotos] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const router = useRouter();

  return (
  <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-50">

      <Navbar />

      <main className="max-w-7xl mt-20 mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 space-y-10">
        {/* Image Gallery */}
        <div className="relative animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-2xl overflow-hidden shadow-lg">
            <div
              onClick={() => setShowPhotos(true)}
              className="md:col-span-2 aspect-[16/10] overflow-hidden rounded-2xl cursor-pointer group"
            >
              <Image
                src={car.images[0]}
                alt={car.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl"
              />
            </div>

            <div className="hidden md:grid grid-rows-2 gap-2">
              {car.images.slice(1, 3).map((img, i) => (
                <div key={i} className="overflow-hidden rounded-2xl">
                  <Image
                    src={img}
                    alt={`${car.name} view ${i + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 rounded-2xl"
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
            <CarFeatures />
            <div className="border-t dark:bg-gray-800 dark:border-gray-700 border-gray-200 my-6" />

            {/* Description */}
            <div className="py-2">
              <h2 className="text-2xl font-bold dark:text-gray-300 text-gray-900 mb-3">
                Description
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                Experience the pinnacle of luxury and performance with the 2025
                BMW 530i. This hybrid sedan combines cutting-edge technology
                with refined elegance. Features include premium leather
                interior, panoramic sunroof, advanced driver assistance systems,
                and the latest iDrive infotainment system with wireless Apple
                CarPlay and Android Auto. Perfect for business trips, weekend
                getaways, or exploring Miami in style.
              </p>
            </div>

            <div className="border-t dark:bg-gray-800 dark:border-gray-700 border-gray-200 my-6" />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <BookingCard
              pricePerMonth={car.pricePerMonth}
              originalPrice={car.originalPrice}
              monthlyDiscount={car.monthlyDiscount}
              location={car.location}
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
