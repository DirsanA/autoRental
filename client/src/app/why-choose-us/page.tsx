"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import whyChooseImg from "next/image"; // replace with your image

export default function WhyChooseUs() {
  const sections = [
    {
      title: "Wide Selection of Vehicles",
      description:
        "Choose from our large fleet of cars, SUVs, and luxury vehicles to match your needs and style.",
      icon: "/assets/car-icon.svg", // optional icon
    },
    {
      title: "Trusted and Verified",
      description:
        "Every car and owner in our platform is verified to ensure safety and quality.",
      icon: "/assets/verified-icon.svg",
    },
    {
      title: "Easy Booking",
      description:
        "Book your car quickly through our intuitive platform and enjoy seamless service.",
      icon: "/assets/booking-icon.svg",
    },
    {
      title: "Affordable Prices",
      description:
        "Competitive rates with clear pricing, discounts, and no hidden fees.",
      icon: "/assets/price-icon.svg",
    },
  ];

  return (
    <main className="space-y-16 mx-auto px-4 md:px-8 pt-24 pb-12 max-w-7xl">
      {/* Hero */}
      <section className="space-y-4 text-center">
        <h1 className="font-bold text-4xl md:text-5xl">Why Choose Auto-Rent?</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground text-lg md:text-xl">
          Discover why thousands of users choose Auto-Rent for their car rental needs in Ethiopia.
        </p>
        <div className="mt-6">
          <Image
            src={whyChooseImg}
            alt="Why Choose Us"
            className="shadow-lg mx-auto rounded-xl"
          />
        </div>
      </section>

      {/* Features */}
      <section className="gap-10 grid grid-cols-1 md:grid-cols-2">
        {sections.map((section, idx) => (
          <div key={idx} className="flex items-start gap-4">
            {section.icon && (
              <div className="flex justify-center items-center bg-primary/10 rounded-full w-12 h-12 text-primary">
                <Image src={section.icon} alt="" width={24} height={24} />
              </div>
            )}
            <div>
              <h3 className="font-bold text-xl">{section.title}</h3>
              <p className="mt-1 text-muted-foreground">{section.description}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Call to Action */}
      <section className="mt-12 text-center">
        <Button className="bg-primary hover:bg-primary/90 px-6 py-3 rounded-xl text-white">
          Start Renting Today
        </Button>
      </section>
    </main>
  );
}
