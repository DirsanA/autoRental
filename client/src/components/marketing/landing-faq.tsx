import { SectionContainer } from "@/components/marketing/section-container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How quickly can I integrate AutoRental into my existing app?",
    answer:
      "Most teams get a basic booking flow live in under 48 hours. Our typed APIs and pre-built components are designed to drop into Next.js and React environments with minimal configuration.",
  },
  {
    question: "Does AutoRental support multi-currency and multi-region fleets?",
    answer:
      "Yes. You can manage multiple locations globally, each with its own pricing rules, taxes, and local currencies, all from a single unified control center.",
  },
  {
    question: "Can I use my own authentication and database?",
    answer:
      "Absolutely. AutoRental is built to be 'stack-agnostic' for your frontend. You can wire our components to your existing users, vehicles, and payment providers via webhooks and our API.",
  },
  {
    question: "What kind of support do you provide for large fleets?",
    answer:
      "Enterprise customers get access to dedicated account managers, 24/7 technical support, and custom implementation engineering to help handle high-volume operations.",
  },
  {
    question: "Is the platform PCI-DSS compliant for payments?",
    answer:
      "Yes. Our checkout workflows are built using industry-standard security practices, ensuring that your payment processing is secure and compliant out of the box.",
  },
] as const;

export function LandingFaq() {
  return (
    <SectionContainer className="py-16 sm:py-20 lg:py-24" id="faq">
      <div className="mx-auto max-w-3xl space-y-12">
        <div className="space-y-3 text-center">
          <h2 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">
            Frequently asked questions
          </h2>
          <p className="text-pretty text-muted-foreground">
            Everything you need to know about building with AutoRental.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-b px-2"
            >
              <AccordionTrigger className="text-left text-sm font-medium hover:no-underline md:text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground md:text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </SectionContainer>
  );
}
