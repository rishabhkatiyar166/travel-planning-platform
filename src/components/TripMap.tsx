import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import { useEffect, useState } from "react";

import "leaflet/dist/leaflet.css";

/*
 * ========================================
 * TYPES
 * ========================================
 */

interface TripMapProps {
  originLatitude: number;
  originLongitude: number;

  destinationLatitude: number;
  destinationLongitude: number;

  originName: string;
  destinationName: string;
}

interface RouteData {
  coordinates: [number, number][];
  distance: number;
  duration: number;
}

/*
 * ========================================
 * MARKER ICON
 * ========================================
 *
 * Custom Leaflet marker using DivIcon.
 *
 * Using DivIcon avoids problems with
 * Leaflet's default marker image paths.
 */

const createMarkerIcon = (color: string) => {
  return L.divIcon({
    className: "",
    html: `
      <div
        style="
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          background: ${color};
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
        "
      >
        <div
          style="
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: white;
          "
        ></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

/*
 * Origin marker
 */

const originIcon = createMarkerIcon("#0f172a");

/*
 * Destination marker
 */

const destinationIcon = createMarkerIcon("#dc2626");

/*
 * ========================================
 * MAP VIEW CONTROLLER
 * ========================================
 *
 * Automatically adjusts the map so that
 * both the origin and destination are visible.
 */

function MapViewController({
  origin,
  destination,
  route,
}: {
  origin: [number, number];
  destination: [number, number];
  route: [number, number][];
}) {
  const map = useMap();

  useEffect(() => {
    /*
     * If the road route exists, fit the map
     * around the entire route.
     *
     * Otherwise, fit around just the two
     * locations.
     */

    const points: [number, number][] =
      route.length > 0
        ? route
        : [origin, destination];

    if (points.length === 0) {
      return;
    }

    const bounds = L.latLngBounds(points);

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 12,
    });
  }, [map, origin, destination, route]);

  return null;
}

/*
 * ========================================
 * TRIP MAP
 * ========================================
 */

function TripMap({
  originLatitude,
  originLongitude,
  destinationLatitude,
  destinationLongitude,
  originName,
  destinationName,
}: TripMapProps) {
  /*
   * ========================================
   * COORDINATES
   * ========================================
   */

  const origin: [number, number] = [
    originLatitude,
    originLongitude,
  ];

  const destination: [number, number] = [
    destinationLatitude,
    destinationLongitude,
  ];

  /*
   * ========================================
   * ROUTE STATE
   * ========================================
   */

  const [route, setRoute] =
    useState<RouteData | null>(null);

  const [routeLoading, setRouteLoading] =
    useState(true);

  const [routeError, setRouteError] =
    useState("");

  /*
   * ========================================
   * FETCH ROAD ROUTE
   * ========================================
   *
   * OSRM calculates the actual driving route.
   */

  useEffect(() => {
    /*
     * AbortController prevents an old request
     * from updating the component if the
     * coordinates change or component unmounts.
     */

    const controller =
      new AbortController();

    const fetchRoute = async () => {
      setRouteLoading(true);
      setRouteError("");
      setRoute(null);

      try {
        /*
         * IMPORTANT:
         *
         * OSRM expects:
         *
         * longitude,latitude
         *
         * NOT:
         *
         * latitude,longitude
         */

        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${originLongitude},${originLatitude};` +
          `${destinationLongitude},${destinationLatitude}` +
          `?overview=full&geometries=geojson`;

        const response = await fetch(url, {
          signal: controller.signal,
        });

        /*
         * Check HTTP response.
         */

        if (!response.ok) {
          throw new Error(
            "Unable to calculate route."
          );
        }

        /*
         * Convert response to JSON.
         */

        const data = await response.json();

        /*
         * Make sure OSRM actually returned
         * at least one route.
         */

        if (
          !data.routes ||
          data.routes.length === 0
        ) {
          throw new Error(
            "No route found between these locations."
          );
        }

        /*
         * Use the first/best route returned
         * by OSRM.
         */

        const selectedRoute =
          data.routes[0];

        /*
         * ========================================
         * CONVERT COORDINATES
         * ========================================
         *
         * OSRM:
         *
         * [longitude, latitude]
         *
         * Leaflet:
         *
         * [latitude, longitude]
         */

        const coordinates: [
          number,
          number
        ][] =
          selectedRoute.geometry.coordinates.map(
            (coordinate: [number, number]) => [
              coordinate[1],
              coordinate[0],
            ]
          );

        /*
         * Save route information.
         */

        setRoute({
          coordinates,
          distance:
            selectedRoute.distance,
          duration:
            selectedRoute.duration,
        });
      } catch (error) {
        /*
         * Ignore errors caused by aborting
         * the request.
         */

        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Route API error:",
          error
        );

        setRoute(null);

        setRouteError(
          error instanceof Error
            ? error.message
            : "Unable to calculate the driving route right now."
        );
      } finally {
        /*
         * Only update loading state when the
         * request was not aborted.
         */

        if (!controller.signal.aborted) {
          setRouteLoading(false);
        }
      }
    };

    fetchRoute();

    /*
     * Cancel request when component
     * unmounts or coordinates change.
     */

    return () => {
      controller.abort();
    };
  }, [
    originLatitude,
    originLongitude,
    destinationLatitude,
    destinationLongitude,
  ]);

  /*
   * ========================================
   * FORMAT DISTANCE
   * ========================================
   */

  const formatDistance = (
    meters: number
  ): string => {
    const kilometers =
      meters / 1000;

    /*
     * For distances >= 100 km,
     * show a rounded number.
     */

    if (kilometers >= 100) {
      return `${Math.round(
        kilometers
      ).toLocaleString("en-IN")} km`;
    }

    /*
     * For shorter distances,
     * show one decimal place.
     */

    return `${kilometers.toFixed(1)} km`;
  };

  /*
   * ========================================
   * FORMAT DURATION
   * ========================================
   */

  const formatDuration = (
    seconds: number
  ): string => {
    const totalMinutes =
      Math.round(seconds / 60);

    const hours =
      Math.floor(
        totalMinutes / 60
      );

    const minutes =
      totalMinutes % 60;

    /*
     * Less than one hour.
     */

    if (hours === 0) {
      return `${minutes} min`;
    }

    /*
     * Exact number of hours.
     */

    if (minutes === 0) {
      return `${hours} hr`;
    }

    /*
     * Hours + minutes.
     */

    return `${hours} hr ${minutes} min`;
  };

  /*
   * ========================================
   * MAP CENTER
   * ========================================
   *
   * Initial center before fitBounds runs.
   */

  const center: [
    number,
    number
  ] = [
    (
      originLatitude +
      destinationLatitude
    ) / 2,

    (
      originLongitude +
      destinationLongitude
    ) / 2,
  ];

  /*
   * ========================================
   * RENDER
   * ========================================
   */

  return (
    <div className="mt-8">

      {/* ========================================
          MAP
      ======================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200">

        <MapContainer
          center={center}
          zoom={5}
          scrollWheelZoom={true}
          className="h-[450px] w-full"
        >

          {/* ========================================
              OPEN STREET MAP
          ======================================== */}

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* ========================================
              MAP VIEW CONTROLLER
          ======================================== */}

          <MapViewController
            origin={origin}
            destination={destination}
            route={route?.coordinates ?? []}
          />

          {/* ========================================
              ORIGIN MARKER
          ======================================== */}

          <Marker
            position={origin}
            icon={originIcon}
          >

            <Popup>

              <div className="text-sm">

                <p className="font-semibold">
                  Starting Location
                </p>

                <p className="mt-1">
                  {originName}
                </p>

              </div>

            </Popup>

          </Marker>

          {/* ========================================
              DESTINATION MARKER
          ======================================== */}

          <Marker
            position={destination}
            icon={destinationIcon}
          >

            <Popup>

              <div className="text-sm">

                <p className="font-semibold">
                  Destination
                </p>

                <p className="mt-1">
                  {destinationName}
                </p>

              </div>

            </Popup>

          </Marker>

          {/* ========================================
              ROAD ROUTE
          ======================================== */}

          {route &&
            route.coordinates.length > 0 && (

              <Polyline
                positions={
                  route.coordinates
                }
                pathOptions={{
                  color: "#0f172a",
                  weight: 5,
                  opacity: 0.8,
                }}
              />

            )}

        </MapContainer>

      </div>

      {/* ========================================
          ROUTE LOADING
      ======================================== */}

      {routeLoading && (

        <div className="mt-4 rounded-xl bg-slate-50 p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
              🗺️
            </div>

            <div>

              <p className="font-semibold text-slate-900">
                Calculating route...
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Finding the best driving route.
              </p>

            </div>

          </div>

        </div>

      )}

      {/* ========================================
          ROUTE ERROR
      ======================================== */}

      {!routeLoading &&
        routeError && (

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-5">

            <p className="font-semibold text-amber-900">
              Route unavailable
            </p>

            <p className="mt-1 text-sm text-amber-700">
              {routeError}
            </p>

          </div>

        )}

      {/* ========================================
          ROUTE INFORMATION
      ======================================== */}

      {!routeLoading &&
        route && (

          <div className="mt-4 grid gap-4 sm:grid-cols-2">

            {/* ========================================
                DISTANCE
            ======================================== */}

            <div className="rounded-xl border border-slate-200 bg-white p-5">

              <p className="text-sm text-slate-500">
                Driving Distance
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatDistance(
                  route.distance
                )}
              </p>

            </div>

            {/* ========================================
                TRAVEL TIME
            ======================================== */}

            <div className="rounded-xl border border-slate-200 bg-white p-5">

              <p className="text-sm text-slate-500">
                Estimated Driving Time
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatDuration(
                  route.duration
                )}
              </p>

            </div>

          </div>

        )}

    </div>
  );
}

export default TripMap;