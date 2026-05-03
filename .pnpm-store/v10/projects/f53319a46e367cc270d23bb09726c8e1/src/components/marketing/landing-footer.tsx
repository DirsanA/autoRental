import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Globe } from "lucide-react"; 

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#f4f4f4] dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 pt-16 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Newsletter / Call to Action Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 pb-12 border-b border-gray-300 dark:border-gray-700 gap-8">
          <div>
            <h3 className="text-2xl font-bold italic tracking-tight text-black dark:text-gray-100">Drive the extraordinary.</h3>
            <p className="mt-1 text-gray-600 dark:text-gray-300">Get the latest deals and new arrivals in your inbox.</p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <input 
              type="email" 
              placeholder="Email address" 
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full md:w-64 transition-all bg-white dark:bg-gray-800 text-black dark:text-gray-100"
            />
            <button className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
              Join
            </button>
          </div>
        </div>

        {/* Top Section: Multi-Column Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-16">
          {/* Column 1: Vehicle Types */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-black dark:text-gray-100 mb-6">Vehicle Types</h4>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
              <li><Link href="/cars/suv" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">SUVs & 4x4s</Link></li>
              <li><Link href="/cars/luxury" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">Luxury & Executive</Link></li>
              <li><Link href="/cars/economy" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">Economy & Compact</Link></li>
              <li><Link href="/cars/minivan" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">Minivans & Buses</Link></li>
              <li><Link href="/cars/trucks" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">Pickup Trucks</Link></li>
              <li><Link href="/cars/electric" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">Electric & Hybrid</Link></li>
            </ul>
          </div>

          {/* Column 2: Top Destinations */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-black dark:text-gray-100 mb-6">Top Cities</h4>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
              <li><Link href="/city/addis-ababa" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">Addis Ababa</Link></li>
              <li><Link href="/city/bahir-dar" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">Bahir Dar</Link></li>
              <li><Link href="/city/adama" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">Adama (Nazret)</Link></li>
              <li><Link href="/city/hawassa" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">Hawassa</Link></li>
              <li><Link href="/city/bishoftu" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">Bishoftu</Link></li>
            </ul>
          </div>

          {/* Column 3: Hosting */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-black dark:text-gray-100 mb-6">Hosting</h4>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
              <li><Link href="/host" className="text-black dark:text-gray-100 font-semibold hover:underline underline-offset-4">List your car</Link></li>
              <li><Link href="/host/insurance" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">Insurance & Protection</Link></li>
              <li><Link href="/host/calculator" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">Earnings Calculator</Link></li>
              <li><Link href="/host/requirements" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">Host requirements</Link></li>
              <li><Link href="/host/stories" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">Host success stories</Link></li>
            </ul>
          </div>

          {/* Column 4: Explore */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-black dark:text-gray-100 mb-6">Explore</h4>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
              <li><Link href="/how-it-works" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">How AutoRent works</Link></li>
              <li><Link href="/safety" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">Trust & Safety</Link></li>
              <li><Link href="/weddings" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">Wedding services</Link></li>
              <li><Link href="/sustainability" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">Sustainability</Link></li>
              <li><Link href="/gift-cards" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">Gift cards</Link></li>
            </ul>
          </div>

          {/* Column 5: Company */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-black dark:text-gray-100 mb-6">Company</h4>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
              <li><Link href="/about" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">Careers</Link></li>
              <li><Link href="/press" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">Press</Link></li>
              <li><Link href="/contact" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">Contact Support</Link></li>
              <li><Link href="/blog" className="hover:text-black dark:hover:text-white hover:underline underline-offset-4">Travel Blog</Link></li>
            </ul>
          </div>
        </div>

        {/* Social and Bottom Info */}
        <div className="pt-8 border-t border-gray-300 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            
            {/* Logo & Legal */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              <h2 className="text-xl font-black uppercase tracking-tighter text-black dark:text-gray-100">AutoRent Ethiopia</h2>
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                <span>© {currentYear} AutoRent Inc.</span>
                <Link href="/terms" className="hover:text-black dark:hover:text-white underline underline-offset-2">Terms</Link>
                <Link href="/privacy" className="hover:text-black dark:hover:text-white underline underline-offset-2">Privacy</Link>
                <Link href="/sitemap" className="hover:text-black dark:hover:text-white underline underline-offset-2">Sitemap</Link>
                <Link href="/cookies" className="hover:text-black dark:hover:text-white underline underline-offset-2">Cookie Preferences</Link>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex space-x-6 text-gray-800 dark:text-gray-200">
              <Link href="#" className="hover:opacity-70 transition-opacity"><Facebook size={22} /></Link>
              <Link href="#" className="hover:opacity-70 transition-opacity"><Twitter size={22} /></Link>
              <Link href="#" className="hover:opacity-70 transition-opacity"><Instagram size={22} /></Link>
              <Link href="#" className="hover:opacity-70 transition-opacity"><Youtube size={22} /></Link>
            </div>

            {/* Regional / Language Toggle */}
            <div className="flex items-center space-x-4">
               <button className="flex items-center text-sm font-bold border border-gray-400 dark:border-gray-600 rounded-lg px-4 py-2 hover:bg-white dark:hover:bg-gray-800 transition-all text-black dark:text-gray-100">
                  <Globe size={16} className="mr-2" />
                  English (ET)
               </button>
               <button className="text-sm font-bold border border-gray-400 dark:border-gray-600 rounded-lg px-4 py-2 hover:bg-white dark:hover:bg-gray-800 transition-all text-black dark:text-gray-100">
                  ETB (Br)
               </button>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}
