"use client";

import Image from "next/image";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Star, Users, Calendar, } from "lucide-react";
import Link from "next/link";
import carImage from "@/assets/image.jpg";
import car2 from "@/assets/car-1.jpg";
import car3 from "@/assets/car-2.jpg";
import car4 from "@/assets/car-3.jpg";
import car5 from "@/assets/car-4.jpg";

export function LandingSearch() {
  const cars = [
    {
      id: "1",
      car_name: "Hyundai Staria",
      year: 2022,
      rating: 4.8,
      number_of_people: 12,
      price: 85,
      transmission: "Automatic",
      type: "Luxury Van",
      image: car2,
    },
    {
      id: "2",
      car_name: "Tesla Model Y",
      year: 2023,
      rating: 4.9,
      number_of_people: 5,
      price: 120,
      transmission: "Electric",
      type: "SUV",
      image: car3,
    },
    {
      id: "3",
      car_name: "Toyota Corolla",
      year: 2021,
      rating: 4.5,
      number_of_people: 5,
      price: 55,
      transmission: "Automatic",
      type: "Sedan",
      image: car4,
    },
    {
      id: "4",
      car_name: "Jeep Wrangler",
      year: 2022,
      rating: 4.7,
      number_of_people: 4,
      price: 95,
      transmission: "Manual",
      type: "Off-Road",
      image: car5,
    },
    {
      id: "5",
      car_name: "Mercedes-Benz V-Class",
      year: 2023,
      rating: 4.9,
      number_of_people: 8,
      price: 150,
      transmission: "Automatic",
      type: "Premium MPV",
      image: carImage,
    },
    {
      id: "6",
      car_name: "Ford Mustang",
      year: 2020,
      rating: 4.6,
      number_of_people: 4,
      price: 110,
      transmission: "Automatic",
      type: "Sport",
      image: car2,
    },
  ];

  return (
    <section className="py-0 px-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        Inspired by your recent search
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {cars.map(
          (car, idx) =>
            car.car_name && (
              <Card
                key={idx}
                className="flex flex-row overflow-hidden p-4 gap-4 items-center border-none shadow-sm bg-gray-100 hover:bg-accent/10 transition-colors"
              >
                <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={car.image}
                    alt={car.car_name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col flex-grow justify-between py-1">
                  <div>
                    <h3 className="font-bold text-lg leading-tight capitalize">
                      {car.car_name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {car.year}
                      </span>
                      <span className="flex items-center gap-1">
                        {car.rating}
                        <Star className="w-3.5 h-4.5 fill-blue-500 text-primary" />
                      </span>
                      <span className="flex items-center">
                        ({car.number_of_people})
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                   
                      <Link href={`/cars/${car.id}`}  className="p-0 h-auto underline-offset-4 hover:underline">View details</Link>
                 
                  </div>
                </div>
              </Card>
            ),
        )}
      </div>
    </section>
  );
}
