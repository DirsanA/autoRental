import { SectionContainer } from "@/components/marketing/section-container";
import { Logo } from "@/components/logo";

const footerLinks = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#" },
      { name: "Documentation", href: "#" },
      { name: "Guides", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy", href: "#" },
      { name: "Terms", href: "#" },
      { name: "Cookie Policy", href: "#" },
    ],
  },
];

export function LandingFooter() {
  return (
    <SectionContainer className="pb-12 pt-16 sm:pb-20 sm:pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex flex-col gap-4">
              <Logo />
              <p className="max-w-xs text-pretty text-sm text-muted-foreground">
                The developer-friendly platform for building and scaling modern
                auto rental experiences globally.
              </p>
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title} className="space-y-4">
              <h4 className="text-sm font-semibold">{group.title}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between border-t pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AutoRental by DirsanA. All rights
            reserved.
          </p>
          <p className="mt-4 text-xs text-muted-foreground sm:mt-0">
            Inspired by Cursor and Stripe.
          </p>
        </div>
      </div>
    </SectionContainer>
  );
}
