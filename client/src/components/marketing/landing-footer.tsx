import { Facebook, Instagram, Twitter, Youtube, Globe } from "lucide-react";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#f4f4f4] dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 pt-16 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Top Section: Multi-Column Links (now plain text) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-16">

          {/* Vehicle Types */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-black dark:text-gray-100 mb-6">Vehicle Types</h4>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
              <li>SUVs & 4x4s</li>
              <li>Luxury & Executive</li>
              <li>Economy & Compact</li>
              <li>Minivans & Buses</li>
              <li>Pickup Trucks</li>
              <li>Electric & Hybrid</li>
            </ul>
          </div>

          {/* Top Cities */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-black dark:text-gray-100 mb-6">Top Cities</h4>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
              <li>Addis Ababa</li>
              <li>Bahir Dar</li>
              <li>Adama (Nazret)</li>
              <li>Hawassa</li>
              <li>Bishoftu</li>
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-black dark:text-gray-100 mb-6">Hosting</h4>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
              <li className="font-semibold text-black dark:text-gray-100">List your car</li>
              <li>Insurance & Protection</li>
              <li>Earnings Calculator</li>
              <li>Host requirements</li>
              <li>Host success stories</li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-black dark:text-gray-100 mb-6">Explore</h4>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
              <li>How AutoRent works</li>
              <li>Trust & Safety</li>
              <li>Wedding services</li>
              <li>Sustainability</li>
              <li>Gift cards</li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-black dark:text-gray-100 mb-6">Company</h4>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
              <li>About Us</li>
              <li>Careers</li>
              <li>Press</li>
              <li>Contact Support</li>
              <li>Travel Blog</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-300 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">

            {/* Logo & Legal */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              <h2 className="text-xl font-black uppercase tracking-tighter text-black dark:text-gray-100">
                AutoRent Ethiopia
              </h2>

              <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                <span>© {currentYear} AutoRent Inc.</span>
                <span>Terms</span>
                <span>Privacy</span>
                <span>Sitemap</span>
                <span>Cookie Preferences</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex space-x-6 text-gray-800 dark:text-gray-200">
              <Facebook size={22} />
              <Twitter size={22} />
              <Instagram size={22} />
              <Youtube size={22} />
            </div>

            {/* Region / Currency */}
            <div className="flex items-center space-x-4">
              <button className="flex items-center text-sm font-bold border border-gray-400 dark:border-gray-600 rounded-lg px-4 py-2 text-black dark:text-gray-100">
                <Globe size={16} className="mr-2" />
                English (ET)
              </button>

              <button className="text-sm font-bold border border-gray-400 dark:border-gray-600 rounded-lg px-4 py-2 text-black dark:text-gray-100">
                ETB (Br)
              </button>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}