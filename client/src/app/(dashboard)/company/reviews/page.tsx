"use client";

import { useEffect, useState } from "react";
import { Search, AlertCircle } from "lucide-react";
import { CompanyReviewsSkeleton } from "./company-reviews-skeleton";
import { fetchCompanyReviews, type CompanyReview } from "@/lib/companyApi";

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1 text-yellow-400">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>{star <= rating ? "★" : "☆"}</span>
      ))}
    </div>
  );
};

const RatingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [stats, setStats] = useState({
    avg: 0,
    count: 0,
    breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchCompanyReviews();
        setReviews(data.reviews);
        setStats(data.stats);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching company reviews:", err);
        setError(err.message || "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredReviews = reviews
    .filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.vehicle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRating =
        ratingFilter === "all" || Math.round(r.rating) === ratingFilter;

      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "oldest")
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      return 0;
    });

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = stats.breakdown[star] || 0;
    const percent =
      stats.count > 0 ? Math.round((count / stats.count) * 100) : 0;
    return { star, percent, count };
  });

  if (loading) {
    return <CompanyReviewsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 bg-white rounded-xl shadow p-8">
        <AlertCircle size={48} className="text-red-500" />
        <h2 className="text-xl font-bold">Failed to load reviews</h2>
        <p className="text-gray-500 text-center max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl">Ratings & Reviews</h1>
        <p className="text-gray-500 text-sm">
          See what your customers are saying about your fleet.
        </p>
      </div>

      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        {/* LEFT SIDE */}
        <div className="space-y-6">
          {/* Average Rating */}
          <div className="bg-white shadow p-6 rounded-xl text-center">
            <p className="text-gray-500 text-sm">AVERAGE RATING</p>

            <h2 className="mt-2 font-bold text-gray-800 text-5xl">
              {stats.avg}
            </h2>

            <div className="flex justify-center mt-2">
              <StarRating rating={Math.round(stats.avg)} />
            </div>

            <p className="mt-2 text-gray-500 text-sm">
              Based on {stats.count} reviews
            </p>
          </div>

          {/* Rating Breakdown */}
          <div className="bg-white shadow p-6 rounded-xl">
            <h3 className="mb-4 font-semibold">Rating Breakdown</h3>

            <div className="space-y-3">
              {ratingBreakdown.map((r) => (
                <div key={r.star} className="flex items-center gap-3">
                  <span className="w-3 text-sm">{r.star}</span>

                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 rounded-full h-2"
                      style={{ width: `${r.percent}%` }}
                    />
                  </div>

                  <span className="w-8 text-gray-500 text-xs">
                    {r.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6 lg:col-span-2">
          {/* Search + Sort + Filter */}
          <div className="flex lg:flex-row flex-col gap-4">
            <div className="flex flex-1 items-center gap-2 bg-white px-3 py-2 border rounded-lg min-w-0">
              <Search size={18} className="text-gray-400" />
              <input
                placeholder="Search reviews..."
                className="outline-none w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex sm:flex-row flex-col gap-2">
              <select
                className="bg-white px-3 py-2 border rounded-lg outline-none text-sm cursor-pointer"
                value={ratingFilter}
                onChange={(e) =>
                  setRatingFilter(
                    e.target.value === "all" ? "all" : Number(e.target.value),
                  )
                }
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>

              <select
                className="bg-white px-3 py-2 border rounded-lg outline-none text-sm cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          </div>

          {/* Reviews */}
          {filteredReviews.length === 0 ? (
            <div className="bg-white shadow p-12 rounded-xl text-center text-gray-500">
              {searchQuery || ratingFilter !== "all"
                ? "No reviews match your criteria."
                : "No reviews yet."}
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div
                key={review.id}
                className="space-y-3 bg-white shadow p-5 rounded-xl"
              >
                <div className="flex sm:flex-row flex-col justify-between gap-3">
                  <div className="flex gap-3">
                    {review.image ? (
                      <img
                        src={review.image}
                        alt={review.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex justify-center items-center bg-blue-100 rounded-full w-10 h-10 font-bold text-blue-600">
                        {review.name[0]}
                      </div>
                    )}

                    <div>
                      <p className="font-semibold">{review.name}</p>
                      <p className="text-gray-500 text-sm">
                        {new Date(review.date).toLocaleDateString("en-US", {
                          hour: "numeric",
                          minute: "numeric",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        •{" "}
                        {review.targetType === "Vehicle"
                          ? `Renting ${review.vehicle}`
                          : "Company Review"}
                      </p>
                    </div>
                  </div>

                  <StarRating rating={review.rating} />
                </div>

                <p className="text-gray-600 italic">
                  &quot;{review.comment}&quot;
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingsPage;
