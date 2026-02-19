import { SectionContainer } from "@/components/marketing/section-container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    quote:
      "AutoRental has transformed the way I develop rental applications. Their extensive collection of UI components, blocks, and templates has significantly accelerated my workflow.",
    author: "Sarah Chen",
    role: "Operations Director",
    company: "UrbanDrive",
    image: "https://tailus.io/images/reviews/shekinah.webp",
    logo: "https://html.tailus.io/blocks/customers/nike.svg", // Placeholder logo
  },
  {
    quote:
      "AutoRental is really extraordinary and very practical, no need to break your head. A real gold mine for fleet management.",
    author: "Marcus Rodriguez",
    role: "Lead Developer",
    company: "Fleetbase",
    image: "https://tailus.io/images/reviews/jonathan.webp",
  },
  {
    quote:
      "The developer experience is unmatched. The APIs are intuitive, and the documentation made integration a breeze.",
    author: "Elena Petrova",
    role: "Product Manager",
    company: "Northwind Rentals",
    image: "https://tailus.io/images/reviews/yucel.webp",
  },
  {
    quote:
      "Great work on the fleet management templates. This is one of the best rental platforms I have seen so far!",
    author: "Rodrigo Aguilar",
    role: "Creator, TailwindAwesome",
    image: "https://tailus.io/images/reviews/rodrigo.webp",
    company: "TLMS Rentals",
  },
] as const;

export function LandingTestimonials() {
  return (
    <SectionContainer className="py-16 md:py-32">
      <div className="mx-auto max-w-6xl space-y-8 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
          <h2 className="text-pretty text-4xl font-semibold tracking-tight lg:text-5xl">
            Built by makers, loved by thousand developers
          </h2>
          <p className="text-pretty text-muted-foreground">
            AutoRental is evolving to be more than just a platform. It supports
            an entire ecosystem of APIs and tools helping rental teams innovate.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-rows-2">
          {/* Featured Testimonial */}
          <Card className="grid grid-rows-[auto_1fr] gap-8 bg-card/70 backdrop-blur sm:col-span-2 sm:p-6 lg:row-span-2 border shadow-sm">
            <CardHeader className="p-0">
              <div className="h-6 w-fit text-xl font-bold italic tracking-tighter text-muted-foreground/50">
                {testimonials[0].company}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                <p className="text-xl font-medium text-pretty">
                  &quot;{testimonials[0].quote}&quot;
                </p>

                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                  <Avatar className="size-12 border">
                    <AvatarImage
                      src={testimonials[0].image}
                      alt={testimonials[0].author}
                    />
                    <AvatarFallback>
                      {testimonials[0].author.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <cite className="not-italic text-sm font-medium">
                      {testimonials[0].author}
                    </cite>
                    <span className="text-muted-foreground block text-xs">
                      {testimonials[0].role}, {testimonials[0].company}
                    </span>
                  </div>
                </div>
              </blockquote>
            </CardContent>
          </Card>

          {/* Secondary Testimonials */}
          <Card className="md:col-span-2 bg-card/70 backdrop-blur border shadow-sm">
            <CardContent className="h-full p-6">
              <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                <p className="text-lg font-medium text-pretty">
                  &quot;{testimonials[1].quote}&quot;
                </p>

                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                  <Avatar className="size-12 border">
                    <AvatarImage
                      src={testimonials[1].image}
                      alt={testimonials[1].author}
                    />
                    <AvatarFallback>
                      {testimonials[1].author.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <cite className="not-italic text-sm font-medium">
                      {testimonials[1].author}
                    </cite>
                    <span className="text-muted-foreground block text-xs">
                      {testimonials[1].role}, {testimonials[1].company}
                    </span>
                  </div>
                </div>
              </blockquote>
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur border shadow-sm">
            <CardContent className="h-full p-6">
              <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                <p className="text-sm text-balance">
                  &quot;{testimonials[2].quote}&quot;
                </p>

                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                  <Avatar className="size-10 border">
                    <AvatarImage
                      src={testimonials[2].image}
                      alt={testimonials[2].author}
                    />
                    <AvatarFallback>
                      {testimonials[2].author.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <cite className="not-italic text-sm font-medium">
                      {testimonials[2].author}
                    </cite>
                    <span className="text-muted-foreground block text-xs truncate max-w-[100px]">
                      {testimonials[2].company}
                    </span>
                  </div>
                </div>
              </blockquote>
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur border shadow-sm">
            <CardContent className="h-full p-6">
              <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                <p className="text-sm text-balance">
                  &quot;{testimonials[3].quote}&quot;
                </p>

                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                  <Avatar className="size-10 border">
                    <AvatarImage
                      src={testimonials[3].image}
                      alt={testimonials[3].author}
                    />
                    <AvatarFallback>
                      {testimonials[3].author.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <cite className="not-italic text-sm font-medium">
                      {testimonials[3].author}
                    </cite>
                    <span className="text-muted-foreground block text-xs truncate max-w-[100px]">
                      {testimonials[3].company}
                    </span>
                  </div>
                </div>
              </blockquote>
            </CardContent>
          </Card>
        </div>
      </div>
    </SectionContainer>
  );
}
