import React from "react";
import { Search, ThumbsUp, MessageSquare } from "lucide-react";

const reviews = [
  {
    name: "Alice Johnson",
    vehicle: "Tesla Model 3",
    date: "2024-02-28",
    rating: 5,
    comment: "The Tesla was in perfect condition. Great experience!",
  },
  {
    name: "Bob Wilson",
    vehicle: "BMW X5",
    date: "2024-02-15",
    rating: 4,
    comment: "Good service, but the car was slightly late.",
  },
];

const ratingBreakdown = [
  { star: 5, percent: 80 },
  { star: 4, percent: 15 },
  { star: 3, percent: 5 },
  { star: 2, percent: 5 },
  { star: 1, percent: 5 },
];

const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-1 text-yellow-400">
      {[1,2,3,4,5].map((star) => (
        <span key={star}>
          {star <= rating ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
};

const RatingsPage = () => {
  return (
    <div className="bg-gray-50 p-6 min-h-screen">

      {/* Title */}
      <div className="mb-6">
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

            <h2 className="mt-2 font-bold text-gray-800 text-5xl">4.8</h2>

            <div className="flex justify-center mt-2">
              <StarRating rating={5} />
            </div>

            <p className="mt-2 text-gray-500 text-sm">
              Based on 142 reviews
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

          {/* Search + Sort */}
          <div className="flex gap-4">
            <div className="flex flex-1 items-center gap-2 bg-white px-3 py-2 border rounded-lg">
              <Search size={18} className="text-gray-400"/>
              <input
                placeholder="Search reviews..."
                className="outline-none w-full"
              />
            </div>

            <button className="bg-white px-4 py-2 border rounded-lg">
              Sort by: Newest
            </button>
          </div>

          {/* Reviews */}
          {reviews.map((review, index) => (
            <div
              key={index}
              className="space-y-3 bg-white shadow p-5 rounded-xl"
            >
              <div className="flex justify-between">

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

                <StarRating rating={review.rating}/>
              </div>

              <p className="text-gray-600 italic">
                "{review.comment}"
              </p>

              <div className="flex gap-6 text-gray-500 text-sm">
                <button className="flex items-center gap-1 hover:text-blue-500">
                  <ThumbsUp size={16}/> Helpful
                </button>

                <button className="flex items-center gap-1 hover:text-blue-500">
                  <MessageSquare size={16}/> Respond
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