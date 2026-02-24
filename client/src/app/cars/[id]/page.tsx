"use client";

import Image from "next/image";
import {
  Star,
  Users,
  Calendar,
  MapPin,
  ShieldCheck,
  Grid,
  Heart,
  X,
} from "lucide-react";

import carImage from "@/assets/image.jpg";
import car2 from "@/assets/car-1.jpg";
import car3 from "@/assets/car-2.jpg";
import car4 from "@/assets/car-3.jpg";
import car5 from "@/assets/car-4.jpg";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import { Logo } from "@/components/logo";
interface Props {
  params: {
    id: string;
  };
}

export default function DetailPage({ params }: Props) {
  const { id } = params;
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const car = {
    id,
    name: "Mercedes-Benz V-Class",
    rating: 4.9,
    reviews: 124,
    year: 2023,
    seats: 8,
    location: "Addis Ababa",
    price: 150,
    description:
      "Experience premium comfort and elegance with the Mercedes-Benz V-Class. Perfect for family trips, business travel, and luxury airport transfers.",
    host: {
      name: "Auto Rent Ethiopia",
      joined: "January 2020",
      verified: true,
    },
    images: [carImage, car2, car3, car4, car5],
  };
  useEffect(() => {
    if (showAllPhotos) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showAllPhotos]);

  return (
    <div>
      <Navbar />

      <div className="max-w-5xl mx-auto my-16 px-6 py-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{car.name}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            {car.rating} ({car.reviews} reviews)
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {car.location}
          </div>
        </div>

        <div className="relative group mb-6">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3 h-[350px] md:h-[400px]">
            <div className="relative rounded-l-2xl overflow-hidden">
              <Image
                src={car.images[0]}
                alt="Main car image"
                fill
                className="object-cover hover:brightness-90 transition"
              />
            </div>

            <div className="hidden md:grid grid-rows-2 gap-3">
              <div className="relative overflow-hidden">
                <Image
                  src={car.images[1]}
                  alt="Car gallery 1"
                  fill
                  className="object-cover hover:brightness-90 transition"
                />
                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      setShowLogin(true);
                    } else {
                      setIsFavorite(!isFavorite);
                    }
                  }}
                  className="absolute top-3 right-3 bg-white/80 backdrop-blur p-2 rounded-full shadow-md hover:scale-110 transition"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite ? "fill-red-500 text-red-500" : "text-gray-700"
                    }`}
                  />
                </button>
              </div>

              <div className="relative rounded-r-2xl overflow-hidden">
                <Image
                  src={car.images[2]}
                  alt="Car gallery 2"
                  fill
                  className="object-cover hover:brightness-90 transition"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={() => setShowAllPhotos(true)}
            variant="secondary"
            className="absolute bottom-4 right-4 gap-2 bg-white/90 backdrop-blur shadow-sm border-slate-200 hover:bg-white"
          >
            <Grid className="w-4 h-4" />
            Show all photos
          </Button>
        </div>
        {showAllPhotos && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">All Photos</h2>
              <button
                onClick={() => setShowAllPhotos(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Photos Grid */}
            <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {car.images.map((img, index) => (
                <div
                  key={index}
                  className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden"
                >
                  <Image
                    src={img}
                    alt={`Gallery ${index}`}
                    fill
                    className="object-cover hover:scale-105 transition duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {car.year}
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {car.seats} Seats
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {car.description}
              </p>
            </div>

            <div className="border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-2">Hosted By</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{car.host.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Joined {car.host.joined}
                  </p>
                </div>
                {car.host.verified && (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    Verified
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border rounded-2xl p-6 shadow-md h-fit">
            <div className="text-2xl font-bold mb-4">
              ${car.price}
              <span className="text-sm text-muted-foreground font-normal">
                / day
              </span>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl">
              Reserve Now
            </button>
          </div>
        </div>
        {showLogin && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 w-[90%] max-w-md shadow-xl relative">
              <button
                onClick={() => setShowLogin(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-black"
              >
                ✕
              </button>

              <h2 className="text-2xl font-bold mb-4 text-center">
                Login Required
              </h2>

              <p className="text-muted-foreground text-center mb-6">
                Please login to add this car to your favorites.
              </p>

              <button
                onClick={() => {
                  setIsLoggedIn(true);
                  setShowLogin(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
