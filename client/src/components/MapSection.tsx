import { MapPin } from "lucide-react";

type MapCoords = { lat: number; lng: number };

function roundCoord(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function buildOsmEmbedUrl(coords: MapCoords) {
  const lat = roundCoord(coords.lat, 6);
  const lng = roundCoord(coords.lng, 6);

  // ~2km bbox around marker (good for “approximate” display)
  const delta = 0.02;
  const left = lng - delta;
  const right = lng + delta;
  const top = lat + delta;
  const bottom = lat - delta;

  const url = new URL("https://www.openstreetmap.org/export/embed.html");
  url.searchParams.set("bbox", `${left},${bottom},${right},${top}`);
  url.searchParams.set("marker", `${lat},${lng}`);
  return url.toString();
}

const MapSection = ({
  locationText,
  coords,
}: {
  locationText: string;
  coords?: MapCoords;
}) => {
  return (
    <div className="py-2">
      <h2 className="text-xl font-bold font-heading mb-4">Pickup & return location</h2>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <MapPin className="w-4 h-4" />
        {locationText}
      </div>
      <div className="rounded-2xl overflow-hidden border border-border">
        <iframe
          title="Pickup location map"
          src={
            coords
              ? buildOsmEmbedUrl(coords)
              : "https://www.openstreetmap.org/export/embed.html"
          }
          width="100%"
          height="300"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full"
        />
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Exact location provided after booking is confirmed.
      </p>
    </div>
  );
};

export default MapSection;
