import { useState } from "react";
import {
  Shield,
  Smartphone,
  Navigation,
  Thermometer,
  Sun,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  AlertTriangle,
  Bluetooth,
  Usb,
  Locate,
  KeyRound,
} from "lucide-react";

const features = {
  Safety: [
    { icon: Eye, name: "Backup camera" },
    { icon: AlertTriangle, name: "Blind spot warning" },
    { icon: Shield, name: "Brake assist" },
    { icon: AlertTriangle, name: "Lane departure warning" },
    { icon: Shield, name: "Lane keeping assist" },
  ],
  "Device connectivity": [
    { icon: Smartphone, name: "Android Auto" },
    { icon: Smartphone, name: "Apple CarPlay" },
    { icon: Bluetooth, name: "Bluetooth" },
    { icon: Usb, name: "USB charger" },
    { icon: Usb, name: "USB input" },
  ],
  Convenience: [
    { icon: Locate, name: "GPS" },
    { icon: KeyRound, name: "Keyless entry" },
    { icon: Navigation, name: "Toll pass" },
  ],
  "Additional features": [
    { icon: Thermometer, name: "Heated seats" },
    { icon: Sun, name: "Sunroof" },
  ],
};

const CarFeatures = () => {
  const [expanded, setExpanded] = useState(false);
  const allCategories = Object.entries(features);
  const visibleCategories = expanded ? allCategories : allCategories.slice(0, 2);

  return (
    <div className="py-2">
      <h2 className="text-xl font-bold font-heading mb-5">Vehicle features</h2>
      <div className="space-y-6">
        {visibleCategories.map(([category, items]) => (
          <div key={category}>
            <h3 className="font-semibold text-foreground mb-3">{category}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <item.icon className="w-4 h-4 text-foreground flex-shrink-0" />
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-5 flex items-center gap-1 text-sm font-semibold text-foreground hover:underline"
      >
        {expanded ? "Show less" : `See all ${Object.values(features).flat().length} features`}
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default CarFeatures;
