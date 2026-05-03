import { Star, Award } from "lucide-react";
import Image from "next/image";

interface Host {
  name: string;
  rating?: number;
  trips?: number;
  joined?: string;
  allStar?: boolean;
  image?: string;
  typeLabel?: string;
}

const HostSection = ({ host }: { host: Host }) => {
  const details = [
    typeof host.trips === "number" ? `${host.trips.toLocaleString()} trips` : null,
    host.joined ? `Joined ${host.joined}` : null,
    host.typeLabel ? host.typeLabel : null,
  ].filter(Boolean);

  return (
    <div className="py-2">
      <h2 className="text-xl font-bold font-heading mb-4">Hosted by</h2>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Image
            src={host.image || "/window.svg"}
            alt={host.name}
            width={64}
            height={64}
            className="w-16 h-16 rounded-full object-cover"
            unoptimized
          />
          {typeof host.rating === "number" && (
            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
              <div className="flex items-center gap-0.5 bg-foreground text-primary-foreground rounded-full px-1.5 py-0.5 text-xs font-bold">
                {host.rating}
                <Star className="w-3 h-3 fill-star text-star" />
              </div>
            </div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-lg text-foreground">{host.name}</h3>
          {details.length > 0 && (
            <p className="text-sm text-muted-foreground">{details.join(" • ")}</p>
          )}
        </div>
      </div>

      {host.allStar && (
        <div className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-secondary">
          <Award className="w-8 h-8 text-badge-allstar flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">All-Star Host</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              All-Star Hosts like {host.name} are the top-rated and most experienced hosts on CarRental.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostSection;
