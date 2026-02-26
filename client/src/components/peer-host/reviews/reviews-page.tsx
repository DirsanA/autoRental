import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { sampleReviews } from "./data";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
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
  // Use a fixed locale + timezone so SSR and client hydration produce identical text.
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function PeerHostReviewsPage() {
  // Keep the "reviews screen" a single component.
  // Later you can replace `sampleReviews` with backend data, without touching the page route.
  const avg =
    sampleReviews.reduce((sum, r) => sum + r.rating, 0) /
    Math.max(sampleReviews.length, 1);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header />
      <Main>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Ratings & Reviews</h2>
            <p className="text-sm text-muted-foreground">
              See what guests are saying about your vehicles.
            </p>
          </div>

          <div className="rounded-lg border bg-muted/10 px-4 py-3">
            <div className="text-sm text-muted-foreground">Average rating</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl font-bold">{avg.toFixed(1)}</span>
              <Stars rating={Math.round(avg)} />
              <span className="text-sm text-muted-foreground">
                ({sampleReviews.length})
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {sampleReviews.map((r) => (
            <Card key={r.id} className="border-border/50">
              <CardHeader className="space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">{r.vehicleName}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(r.createdAt)}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Stars rating={r.rating} />
                  <span className="text-sm text-muted-foreground">
                    by {r.guestName}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-foreground/90">
                {r.comment}
              </CardContent>
            </Card>
          ))}
        </div>
      </Main>
    </div>
  );
}

