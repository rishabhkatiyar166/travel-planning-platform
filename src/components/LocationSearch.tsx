import { useEffect, useState } from "react";

export interface LocationResult {
  id: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

interface LocationSearchProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onSelect: (location: LocationResult) => void;
}

function LocationSearch({
  id,
  label,
  value,
  placeholder,
  onChange,
  onSelect,
}: LocationSearchProps) {
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const searchText = value.trim();

    if (searchText.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            searchText
          )}&count=5&language=en&format=json`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Unable to search locations.");
        }

        const data = await response.json();

        setResults(data.results ?? []);
        setShowResults(true);
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error("Location search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  const formatLocation = (location: LocationResult) => {
    return [
      location.name,
      location.admin1,
      location.country,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const handleSelect = (location: LocationResult) => {
    onSelect(location);
    setShowResults(false);
    setResults([]);
  };

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-800"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type="text"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setShowResults(true);
          }}
          onFocus={() => {
            if (results.length > 0) {
              setShowResults(true);
            }
          }}
          onBlur={() => {
            window.setTimeout(() => {
              setShowResults(false);
            }, 150);
          }}
          placeholder={placeholder}
          autoComplete="off"
          required
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-11 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
        />

        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {results.map((location) => (
            <button
              key={location.id}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                handleSelect(location);
              }}
              className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
            >
              <span className="mt-0.5 text-lg">
                📍
              </span>

              <span className="min-w-0">
                <span className="block font-semibold text-slate-900">
                  {location.name}
                </span>

                <span className="mt-0.5 block truncate text-sm text-slate-500">
                  {formatLocation(location)}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {showResults &&
        !loading &&
        value.trim().length >= 2 &&
        results.length === 0 && (
          <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
            <p className="text-sm text-slate-500">
              No locations found.
            </p>
          </div>
        )}
    </div>
  );
}

export default LocationSearch;