"use client";
import { Search, ThumbsUp, MessageSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchMyCompanyReviews } from "@/lib/companyApi";

type Review = {
  id: string;
  name: string;
  vehicle: string;
  date: string;
  rating: number;
  comment: string;
};

type Breakdown = {
  star: number;
  percent: number;
};

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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [breakdown, setBreakdown] = useState<Breakdown[]>([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);

  // ✅ NEW STATES
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "highest">("newest");
  const [selectedStar, setSelectedStar] = useState<number | null>(null);

  useEffect(() => {
    fetchMyCompanyReviews()
      .then((data) => {
        const mappedReviews = data.reviews.map((r: any) => ({
          id: r._id,
          name: r.userId?.name || "Anonymous",
          vehicle: "Vehicle", // optional (you can improve later)
          date: new Date(r.createdAt).toLocaleDateString(),
          rating: r.rating,
          comment: r.comment,
        }));

        setReviews(mappedReviews);
        setAverage(data.averageRating);
        setTotal(data.totalReviews);

        const mappedBreakdown = data.ratingBreakdown.map((r: any) => ({
          star: r.star,
          percent:
            data.totalReviews > 0
              ? Math.round((r.count / data.totalReviews) * 100)
              : 0,
        }));

        setBreakdown(mappedBreakdown);
      })
      .catch(console.error);
  }, []);

  // ✅ FILTER + SEARCH + SORT (NO UI CHANGE)
  const filteredReviews = useMemo(() => {
    let data = [...reviews];

    // search
    if (search) {
      data = data.filter(
        (r) =>
          r.comment.toLowerCase().includes(search.toLowerCase()) ||
          r.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // filter by star
    if (selectedStar) {
      data = data.filter((r) => r.rating === selectedStar);
    }

    // sort
    if (sort === "newest") {
      data.reverse(); // assuming latest comes last
    }

    if (sort === "oldest") {
      // keep original
    }

    if (sort === "highest") {
      data.sort((a, b) => b.rating - a.rating);
    }

    return data;
  }, [reviews, search, sort, selectedStar]);

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
          {/* ✅ Average Rating (dynamic) */}
          <div className="bg-white shadow p-6 rounded-xl text-center">
            <p className="text-gray-500 text-sm">AVERAGE RATING</p>

            <h2 className="mt-2 font-bold text-gray-800 text-5xl">
              {average.toFixed(1)}
            </h2>

            <div className="flex justify-center mt-2">
              <StarRating rating={Math.round(average)} />
            </div>

            <p className="mt-2 text-gray-500 text-sm">
              Based on {total} reviews
            </p>
          </div>

          {/* ✅ Breakdown clickable */}
          <div className="bg-white shadow p-6 rounded-xl">
            <h3 className="mb-4 font-semibold">Rating Breakdown</h3>

            <div className="space-y-3">
              {breakdown.map((r) => (
                <div
                  key={r.star}
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() =>
                    setSelectedStar(selectedStar === r.star ? 0 : r.star)
                  }
                >
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
          {/* ✅ Search + Sort WORKING */}
          <div className="flex sm:flex-row flex-col gap-4">
            <div className="flex flex-1 items-center gap-2 bg-white px-3 py-2 border rounded-lg min-w-0">
              <Search size={18} className="text-gray-400" />
              <input
                placeholder="Search reviews..."
                className="outline-none w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="bg-white px-4 py-2 border rounded-lg"
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
            >
              <option value="newest">Sort by: Newest</option>
              <option value="oldest">Sort by: Oldest</option>
              <option value="highest">Sort by: Highest Rating</option>
            </select>
          </div>

          {/* Reviews */}
          {filteredReviews.map((review, index) => (
            <div
              key={index}
              className="space-y-3 bg-white shadow p-5 rounded-xl"
            >
              <div className="flex sm:flex-row flex-col justify-between gap-3">
                <div className="flex gap-3">
                  <div className="flex justify-center items-center bg-blue-100 rounded-full w-10 h-10 font-bold text-blue-600">
                    {review.name[0]}
                  </div>

                  <div>
                    <p className="font-semibold">{review.name}</p>
                    <p className="text-gray-500 text-sm">
                      {review.date} • Renting {review.vehicle}
                    </p>
                  </div>
                </div>

                <StarRating rating={review.rating} />
              </div>

              <p className="text-gray-600 italic">
                &quot;{review.comment}&quot;
              </p>

              <div className="flex gap-6 text-gray-500 text-sm">
                <button className="flex items-center gap-1 hover:text-blue-500">
                  <ThumbsUp size={16} /> Helpful
                </button>

                <button className="flex items-center gap-1 hover:text-blue-500">
                  <MessageSquare size={16} /> Respond
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RatingsPage;
