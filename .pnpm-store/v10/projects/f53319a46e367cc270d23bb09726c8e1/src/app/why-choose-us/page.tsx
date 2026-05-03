import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plane, UserCheck, ShieldCheck, Search, MapPin, CarFront, Check, X, KeyRound, Smartphone, Users } from "lucide-react";
import heroImg from "@/assets/image.jpg";
import Image from "next/image";
import Link from "next/link";
import car1 from "@/assets/car-1.jpg";
import car2 from "@/assets/car-2.jpg";
import car3 from "@/assets/car-3.jpg";
import car4 from "@/assets/car-4.jpg";
import { LandingFooter } from "@/components/marketing/landing-footer";
const whyChooseFeatures = [
  {
    icon: Plane,
    title: "Enjoy a streamlined airport experience",
    description:
      "Pick up your car at airport parking lots and garages at airports across major cities. Some airports even allow curbside pickup at the terminal.",
  },
  {
    icon: UserCheck,
    title: "Get personalized service from a local host",
    description:
      "Auto-rent hosts are everyday entrepreneurs who rent out cars in their communities.",
  },
  {
    icon: ShieldCheck,
    title: "Relax with support & damage protection",
    description:
      "24/7 support and roadside assistance mean help is just a call away, plus you can choose from a range of protection plans.",
  },
];
const howToBookSteps = [
  {
    icon: Search,
    step: 1,
    title: "Find the perfect car",
    description:
      "Enter where and when you need a car, filter to find the best one for you, and read reviews from previous renters.",
  },
  {
    icon: MapPin,
    step: 2,
    title: "Select a pickup location",
    description:
      "Grab a car nearby or get one delivered to airports, train stations, hotels, or even your home.",
  },
  {
    icon: CarFront,
    step: 3,
    title: "Rent & hit the road",
    description:
      "Your host sends you pickup details, and you're all set! Chat with your host or contact Support anytime.",
  },
];
const autoRentPros = [
  "App-based experience",
  "No waiting in line",
  "1,000+ unique makes & models",
  "Get the exact car you choose",
  "Delivery options & many pickup locations",
  "Cars rented out by local hosts",
  "Vehicles and hosts rated by guests",
];
const rentalCons = [
  "Standard rental counter experience",
  "Waiting in line",
  "Limited car selection",
  'Get one type of car "or similar"',
  "Pickup only at retail locations",
  "Cars owned by large corporations",
  "No vehicle ratings",
];
const pickupMethods = [
  {
    icon: Users,
    title: "In person",
    description: "Your host meets you at your chosen pickup location and hands you the keys.",
  },
  {
    icon: KeyRound,
    title: "With a lockbox",
    description: "Your host sends you a lockbox code, then you unlock the box to get the key.",
  },
  {
    icon: Smartphone,
    title: "With an app",
    description: "Your host unlocks the car remotely with their car manufacturer's app.",
  },
];

const categories = [
  { name: "Cars", image: car1 },
  { name: "SUVs", image: car2 },
  { name: "Luxury", image: car3 },
  { name: "Convertibles", image: car1 },
  { name: "Minivans", image: car2 },
  { name: "Electric", image: car4 },
  { name: "Sports Cars", image: car3 },
  { name: "Trucks", image: car4 },
];

const faqs = [
  {
    q: "Where is Auto-rent available?",
    a: "Auto-rent is available in major cities across Ethiopia. You can book a car from hosts in Addis Ababa, Hawassa, Bahir Dar, and more.",
  },
  {
    q: "What do I need to book a car on Auto-rent?",
    a: "You need a valid driver's license, be at least 21 years old, and create an Auto-rent account. You'll go through a quick approval process on your first booking.",
  },
  {
    q: "Do I need my own insurance?",
    a: "No. When booking, you'll choose between protection plans — Premier, Standard, or Basic — to get the level of coverage right for you.",
  },
  {
    q: "Can other people drive a car that I booked?",
    a: "Yes, additional drivers can be added at no extra charge as long as they are approved to drive on Auto-rent.",
  },
  {
    q: "What is the cancellation policy?",
    a: "Free cancellation up to 24 hours before your trip starts. If you cancel after that window, a small cancellation fee applies.",
  },
  {
    q: "Can I get my car delivered to me?",
    a: "Yes, many hosts offer delivery to airports, hotels, or custom locations. Some offer free delivery while others set their own fee.",
  },
];
const WhychooseUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="md:w-1/2">
            <Image
              src={heroImg}
              alt="Person using the Auto-rent app on their phone inside a car"
              className="w-full max-w-lg mx-auto rounded-2xl object-cover"
            />
          </div>
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
              How Auto-rent works
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto md:mx-0">
              Skip the rental car counter and rent just about any car, just about anywhere.
            </p>
            <Link href="/">
              <Button size="lg" className="mt-6">
                Find the perfect car
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Why Choose */}
      <section className="bg-secondary py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-14">
            Why choose Auto-rent?
          </h2>
          <div className="max-w-3xl mx-auto space-y-10">
            {whyChooseFeatures.map((f) => (
              <div key={f.title} className="flex gap-5 items-start">
                <div className="shrink-0 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <f.icon className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-1 text-muted-foreground">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/">
              <Button size="lg">Find the perfect car</Button>
            </Link>
          </div>
        </div>
      </section>
      {/* How to book */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-14">
          How to book a car
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {howToBookSteps.map((s) => (
            <div
              key={s.step}
              className="bg-card border border-border rounded-2xl p-8 text-center flex flex-col items-center"
            >
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                <s.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-semibold text-primary mb-2">Step {s.step}</span>
              <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-muted-foreground text-sm">{s.description}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/">
            <Button size="lg" variant="outline">
              Browse cars
            </Button>
          </Link>
        </div>
      </section>
      {/* Comparison */}
      <section className="bg-secondary py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-14">
            Auto-rent vs. car rental
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Auto-rent side */}
            <div className="bg-card border border-primary/30 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-primary mb-6">Auto-rent</h3>
              <ul className="space-y-3">
                {autoRentPros.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-foreground">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Traditional side */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="text-xl font-bold text-muted-foreground mb-6">Car rental</h3>
              <ul className="space-y-3">
                {rentalCons.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-muted-foreground">
                    <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* Pickup & Drop-off */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
          How pickup & drop-off work
        </h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-14">
          Every time you rent a car on Auto-rent, youll receive instructions from your host, check in through the app, and upload your drivers license.
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pickupMethods.map((m) => (
            <div key={m.title} className="text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <m.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{m.title}</h3>
              <p className="mt-2 text-muted-foreground text-sm">{m.description}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Protection */}
      <section className="bg-secondary py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="shrink-0">
              <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-16 w-16 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Youre protected</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground">Physical damage protection</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Choose from three protection plans — Premier, Standard, or Basic — for the level of protection thats right for you.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Liability insurance included</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    All trips include third-party liability insurance to ensure every approved driver is covered.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">24/7 support & roadside assistance</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Customer support is always available, and 24/7 roadside assistance is just a call away.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Browse by Category */}
<section className="container mx-auto px-4 md:px-6 py-16 md:py-24">
  <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-14">
    Browse by category
  </h2>
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-5xl mx-auto">
    {categories.map((c) => (
      <Link
        key={c.name}
        href="/"
        className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-md transition-all"
      >
        <div className="relative w-full h-32">
          <Image
            src={c.image}
            alt={c.name}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="p-4 text-center">
          <span className="font-semibold text-foreground text-sm">{c.name}</span>
        </div>
      </Link>
    ))}
  </div>
</section>

      <section className="bg-secondary py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-14">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card border border-border rounded-xl px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
      {/* Final CTA */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Ready to hit the road?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Join thousands of happy renters on Auto-rent today.
        </p>
        <Link href="/">
          <Button size="lg">Start renting today</Button>
        </Link>
      </section>
   
      <div className="h-8" />
      <LandingFooter/>
    </div>
  );
};
export default WhychooseUs;