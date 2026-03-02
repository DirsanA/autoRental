import Link from "next/link";

export function LandingCta() {
  return (
    <div className="max-w-6xl mx-auto text-center">
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
        Start earning by sharing your car today
      </h2>

      <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
        List your car, set your price, and connect with trusted renters across Ethiopia.
      </p>

      <div className="mt-10 flex justify-center gap-4 flex-wrap">
        <Link
          href="/host"
          className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:opacity-90 transition"
        >
          List your car
        </Link>

        <Link
          href="/how-it-works"
          className="border border-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-black transition"
        >
          Learn more
        </Link>
      </div>
    </div>
  );
}
