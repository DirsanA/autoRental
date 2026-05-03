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
  type LucideIcon,
} from "lucide-react";

type FeatureItem = {
  icon: LucideIcon;
  name: string;
};

type CarFeaturesProps = {
  features?: string[];
};

const DEFAULT_FEATURES = {
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

const FEATURE_ICON_MAP: Record<string, LucideIcon> = {
  "backup camera": Eye,
  "blind spot warning": AlertTriangle,
  "brake assist": Shield,
  "lane departure warning": AlertTriangle,
  "lane keeping assist": Shield,
  "android auto": Smartphone,
  "apple carplay": Smartphone,
  bluetooth: Bluetooth,
  "usb charger": Usb,
  "usb input": Usb,
  gps: Locate,
  navigation: Navigation,
  "keyless entry": KeyRound,
  "heated seats": Thermometer,
  sunroof: Sun,
  "toll pass": Navigation,
};

const CATEGORY_RULES: Array<{
  category: string;
  keywords: string[];
}> = [
  {
    category: "Safety",
    keywords: ["safety", "camera", "blind", "lane", "brake", "airbag", "assist"],
  },
  {
    category: "Device connectivity",
    keywords: ["carplay", "android", "bluetooth", "usb", "wifi", "audio", "screen"],
  },
  {
    category: "Convenience",
    keywords: ["gps", "navigation", "keyless", "remote", "cruise", "parking"],
  },
];

function normalizeFeatureName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function getFeatureCategory(featureName: string) {
  const normalized = featureName.toLowerCase();
  const match = CATEGORY_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword)),
  );
  return match?.category || "Additional features";
}

function getFeatureIcon(featureName: string) {
  const normalized = featureName.toLowerCase();
  return FEATURE_ICON_MAP[normalized] || Check;
}

function buildFeatureGroups(featureNames?: string[]): Record<string, FeatureItem[]> {
  const cleaned = Array.isArray(featureNames)
    ? featureNames.map(normalizeFeatureName).filter(Boolean)
    : [];

  if (!cleaned.length) {
    return DEFAULT_FEATURES;
  }

  const grouped: Record<string, FeatureItem[]> = {};

  for (const featureName of cleaned) {
    const category = getFeatureCategory(featureName);
    const item: FeatureItem = {
      icon: getFeatureIcon(featureName),
      name: featureName,
    };
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(item);
  }

  return grouped;
}

const CarFeatures = ({ features }: CarFeaturesProps) => {
  const [expanded, setExpanded] = useState(false);
  const groupedFeatures = buildFeatureGroups(features);
  const allCategories = Object.entries(groupedFeatures);
  const visibleCategories = expanded ? allCategories : allCategories.slice(0, 2);
  const totalFeatureCount = Object.values(groupedFeatures).flat().length;

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
        {expanded ? "Show less" : `See all ${totalFeatureCount} features`}
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default CarFeatures;
