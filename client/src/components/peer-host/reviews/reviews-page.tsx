import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { sampleReviews } from "./data";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < rating;
        return (
          <Star
            key={i}
            className={
              filled
                ? "h-4 w-4 fill-yellow-500 text-yellow-500"
                : "h-4 w-4 text-muted-foreground"
            }
          />
        );
      })}
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function PeerHostReviewsPage() {
  const total = sampleReviews.length;

  const avg =
    sampleReviews.reduce((sum, r) => sum + r.rating, 0) /
    Math.max(total, 1);

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = sampleReviews.filter((r) => r.rating === star).length;
    return {
      star,
      count,
      percent: total ? (count / total) * 100 : 0,
    };
  });

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header />

      <Main>
        {/* ===== PAGE HEADER ===== */}
        <div className="mb-10">
          <h2 className="font-bold text-3xl tracking-tight">
            Ratings & Reviews
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            See what guests are saying about your vehicles.
          </p>
        </div>

        {/* ===== SUMMARY SECTION ===== */}
        <div className="gap-8 grid md:grid-cols-3">
          {/* Average Card */}
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-400/5 shadow-lg p-8 border-0">
            <div className="text-muted-foreground text-sm">
              Overall Rating
            </div>

            <div className="flex items-center gap-4 mt-3">
              <span className="font-bold text-5xl">
                {avg.toFixed(1)}
              </span>
              <div>
                <Stars rating={Math.round(avg)} />
                <div className="mt-1 text-muted-foreground text-sm">
                  Based on {total} reviews
                </div>
              </div>
            </div>
          </Card>

          {/* Rating Distribution */}
          <div className="space-y-3 md:col-span-2">
            {distribution.map((d) => (
              <div key={d.star} className="flex items-center gap-3">
                <span className="w-6 font-medium text-sm">
                  {d.star}★
                </span>

                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-500 h-full transition-all"
                    style={{ width: `${d.percent}%` }}
                  />
                </div>

                <span className="w-10 text-muted-foreground text-sm text-right">
                  {d.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== REVIEWS LIST ===== */}
        <div className="space-y-6 mt-12">
          {sampleReviews.map((r) => (
            <Card
              key={r.id}
              className="hover:shadow-xl border-border/50 transition-all duration-300"
            >
              <CardContent className="space-y-4 p-6">
                {/* Top Section */}
                <div className="flex flex-wrap justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="flex justify-center items-center bg-muted rounded-full w-10 h-10 font-semibold text-sm">
                      {r.guestName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="font-semibold">
                        {r.guestName}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {formatDate(r.createdAt)}
                      </div>
                    </div>
                  </div>

                  <Stars rating={r.rating} />
                </div>

                {/* Vehicle Name */}
                <div className="font-medium text-muted-foreground text-sm">
                  {r.vehicleName}
                </div>

                {/* Comment */}
                <p className="text-foreground/90 text-sm leading-relaxed">
                  {r.comment}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Main>
    </div>
  );
}