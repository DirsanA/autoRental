import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "AutoRent - Automated Fleet Management Platform",
  description:
    "Transform your car rental operations with our comprehensive SaaS platform. Perfect for renters, companies, and admins.",
};
// apply the shadcn block background pattern
import { BackgroundPattern1 } from "@/components/background-pattern1";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //APPLY THE PATTERN
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <BackgroundPattern1 />
        {children}
      </body>
    </html>
  );
}
