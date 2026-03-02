import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-6xl mx-auto px-6 lg:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold">AutoRent Ethiopia</h3>
            <p className="mt-4 text-gray-600 text-sm">
              Rent cars easily from trusted local hosts across Ethiopia.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li><Link href="/browse" className="hover:text-black">Browse cars</Link></li>
              <li><Link href="/how-it-works" className="hover:text-black">How it works</Link></li>
              <li><Link href="/host" className="hover:text-black">Become a host</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li><Link href="/about" className="hover:text-black">About</Link></li>
              <li><Link href="/careers" className="hover:text-black">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-black">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li><Link href="/help" className="hover:text-black">Help Center</Link></li>
              <li><Link href="/terms" className="hover:text-black">Terms</Link></li>
              <li><Link href="/privacy" className="hover:text-black">Privacy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-16 border-t pt-6 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} AutoRent Ethiopia. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
