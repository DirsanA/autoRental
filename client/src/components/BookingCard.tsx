import { MapPin, Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingCardProps {
  pricePerMonth: number;
  originalPrice: number;
  monthlyDiscount: number;
  location: string;
}

const BookingCard = ({ pricePerMonth, originalPrice, monthlyDiscount, location }: BookingCardProps) => {
  return (
    <div className="sticky top-24 border border-border rounded-2xl p-6 shadow-lg bg-card animate-fade-in">
      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-muted-foreground line-through text-lg">
            ${originalPrice.toLocaleString()}
          </span>
          <span className="text-3xl font-bold font-heading text-foreground">
            ${pricePerMonth.toLocaleString()}
          </span>
          <span className="text-muted-foreground">/mo</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Before taxes</p>
      </div>

      {/* Trip Dates */}
      <div className="space-y-3 mb-6">
        <h3 className="font-semibold text-foreground">Your trip</h3>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Trip start</label>
            <button className="w-full flex items-center justify-between border border-border rounded-lg px-3 py-2.5 mt-1 text-sm text-foreground hover:bg-secondary transition-colors">
              3/11/2026
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Time</label>
            <button className="w-full flex items-center justify-between border border-border rounded-lg px-3 py-2.5 mt-1 text-sm text-foreground hover:bg-secondary transition-colors">
              10:00 AM
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Trip end</label>
            <button className="w-full flex items-center justify-between border border-border rounded-lg px-3 py-2.5 mt-1 text-sm text-foreground hover:bg-secondary transition-colors">
              6/11/2026
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Time</label>
            <button className="w-full flex items-center justify-between border border-border rounded-lg px-3 py-2.5 mt-1 text-sm text-foreground hover:bg-secondary transition-colors">
              10:00 AM
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Pickup Location */}
      <div className="mb-6 p-3 rounded-lg bg-secondary">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Pickup & return location</p>
            <p className="text-sm text-muted-foreground">{location}</p>
          </div>
        </div>
      </div>

      {/* Trip Savings */}
      <div className="mb-6 p-3 rounded-lg border border-border">
        <h4 className="font-semibold text-foreground mb-2">Trip Savings</h4>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Monthly discount</span>
          <span className="font-semibold text-success">${monthlyDiscount}/mo</span>
        </div>
      </div>

      {/* CTA */}
      <Button className="w-full h-12 text-base font-semibold rounded-xl">
        Reserve Now
      </Button>

      <p className="text-xs text-muted-foreground text-center mt-3">
        Free cancellation for the first 24 hours
      </p>
    </div>
  );
};

export default BookingCard;
