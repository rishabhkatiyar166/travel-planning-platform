import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapCardProps {
  destination: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
}

function MapCard({ destination }: MapCardProps) {
  const [location, setLocation] =
    useState<LocationData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            destination
          )}&count=1&language=en&format=json`
        );

        if (!response.ok) {
          throw new Error("Unable to find this destination.");
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
          throw new Error(
            `Could not find "${destination}".`
          );
        }

        const result = data.results[0];

        setLocation({
          latitude: result.latitude,
          longitude: result.longitude,
          name: result.name,
          country: result.country ?? "",
        });
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (destination.trim()) {
      fetchLocation();
    }
  }, [destination]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Location
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          Map
        </h2>

        <div className="mt-6 h-[400px] animate-pulse rounded-xl bg-slate-200" />
      </section>
    );
  }

  if (error || !location) {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Location
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          Map
        </h2>

        <p className="mt-4 text-sm text-red-600">
          {error || "Location is unavailable."}
        </p>
      </section>
    );
  }

  const position: LatLngExpression = [
    location.latitude,
    location.longitude,
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Location
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          {location.name}
        </h2>

        <p className="mt-2 text-slate-600">
          {location.country}
        </p>
      </div>

      {/* Map */}
      <div className="h-[400px] overflow-hidden rounded-xl">
        <MapContainer
          center={position}
          zoom={11}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={position}>
            <Popup>
              <strong>{location.name}</strong>
              <br />
              {location.country}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </section>
  );
}

export default MapCard;