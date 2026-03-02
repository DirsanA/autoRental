"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import whyChooseImg from "@/assets/why-choose-us.jpg"; // replace with your image

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
    <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto space-y-16">
      {/* Hero */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold">Why Choose Auto-Rent?</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl">
          Discover why thousands of users choose Auto-Rent for their car rental needs in Ethiopia.
        </p>
        <div className="mt-6">
          <Image
            src={whyChooseImg}
            alt="Why Choose Us"
            className="mx-auto rounded-xl shadow-lg"
          />
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {sections.map((section, idx) => (
          <div key={idx} className="flex gap-4 items-start">
            {section.icon && (
              <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full">
                <Image src={section.icon} alt="" width={24} height={24} />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold">{section.title}</h3>
              <p className="text-muted-foreground mt-1">{section.description}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Call to Action */}
      <section className="text-center mt-12">
        <Button className="bg-primary text-white rounded-xl px-6 py-3 hover:bg-primary/90">
          Start Renting Today
        </Button>
      </section>
    </main>
  );
}
