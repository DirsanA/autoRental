import { Schema, model, type HydratedDocument } from "mongoose";

export interface IGeocodeCache {
  key: string; // normalized address key
  address: string; // raw address used for lookup
  provider: "nominatim";
  lat: number;
  lng: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type GeocodeCacheDocument = HydratedDocument<IGeocodeCache>;

const geocodeCacheSchema = new Schema<IGeocodeCache>(
  {
    key: { type: String, required: true, unique: true, index: true },
    address: { type: String, required: true, trim: true },
    provider: { type: String, enum: ["nominatim"], required: true },
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
  },
  { timestamps: true },
);

geocodeCacheSchema.index({ updatedAt: 1 });

export const GeocodeCache = model<IGeocodeCache>(
  "GeocodeCache",
  geocodeCacheSchema,
);

