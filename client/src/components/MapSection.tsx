import { MapPin } from "lucide-react";

const MapSection = ({ location }: { location: string }) => {
  return (
    <div className="py-2">
      <h2 className="text-xl font-bold font-heading mb-4">Pickup & return location</h2>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <MapPin className="w-4 h-4" />
        {location}
      </div>
      <div className="rounded-2xl overflow-hidden border border-border">
        <iframe
          title="Pickup location map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114964.53925754834!2d-80.29949920266601!3d25.782390733498!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d9b0a20ec8c111%3A0xff96f271ddad4f65!2sMiami%2C%20FL!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen
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
