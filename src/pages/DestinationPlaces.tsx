import EmptyState from "../components/ui/EmptyState";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  getPlacesByDestination,
  hasDestinationData,
  type Place,
} from "../services/destinationService";


function DestinationPlaces() {
  const [searchParams] = useSearchParams();

  const destination =
    searchParams.get("destination")?.trim() || "";


  /*
   * ========================================
   * FILTER STATE
   * ========================================
   */

  const [selectedCategory, setSelectedCategory] =
    useState("All");


  /*
   * ========================================
   * GET PLACES
   * ========================================
   */

  const places = useMemo(() => {

    if (!destination) {
      return [];
    }

    return getPlacesByDestination(
      destination
    );

  }, [destination]);


  /*
   * ========================================
   * GET CATEGORIES
   * ========================================
   *
   * Categories are created dynamically from
   * the places available for this destination.
   */

  const categories = useMemo(() => {

    const uniqueCategories = Array.from(
      new Set(
        places.map(
          (place) => place.category
        )
      )
    );

    return [
      "All",
      ...uniqueCategories,
    ];

  }, [places]);


  /*
   * ========================================
   * FILTER PLACES
   * ========================================
   */

  const filteredPlaces = useMemo(() => {

    if (selectedCategory === "All") {
      return places;
    }

    return places.filter(
      (place) =>
        place.category === selectedCategory
    );

  }, [
    places,
    selectedCategory,
  ]);


  /*
   * ========================================
   * DESTINATION CHECK
   * ========================================
   */

  const destinationExists =
    destination &&
    hasDestinationData(destination);


  /*
   * ========================================
   * NO DESTINATION
   * ========================================
   */

  if (!destination) {

    return (

      <main className="min-h-screen bg-slate-50 px-6 py-16">

        <div className="mx-auto max-w-4xl">

          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
              🗺️
            </div>

            <h1 className="mt-6 text-3xl font-bold text-slate-900">
              Destination Not Selected
            </h1>

            <p className="mt-3 text-slate-600">
              Please select a destination to explore places to visit.
            </p>

            <Link
              to="/plan-trip"
              className="mt-6 inline-block rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Plan a Trip
            </Link>

          </div>

        </div>

      </main>

    );

  }


  /*
   * ========================================
   * DESTINATION NOT AVAILABLE
   * ========================================
   */

  if (!destinationExists) {

    return (

      <main className="min-h-screen bg-slate-50 px-6 py-16">

        <div className="mx-auto max-w-4xl">

          <Link
            to="/dashboard"
            className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
              🌍
            </div>

            <h1 className="mt-6 text-3xl font-bold text-slate-900">
              More Places Coming Soon
            </h1>

            <p className="mt-3 text-slate-600">
              We don't have destination information for{" "}
              <span className="font-semibold text-slate-900">
                {destination}
              </span>{" "}
              yet.
            </p>

            <Link
              to="/dashboard"
              className="mt-6 inline-block rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Back to Dashboard
            </Link>

          </div>

        </div>

      </main>

    );

  }


  /*
   * ========================================
   * MAIN PAGE
   * ========================================
   */

  return (

    <main className="min-h-screen bg-slate-50 px-6 py-12">

      <div className="mx-auto max-w-6xl">


        {/* ========================================
            HEADER
        ======================================== */}

        <div className="mb-8">

          <Link
            to="/dashboard"
            className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            ← Back to Dashboard
          </Link>


          <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Destination Guide
          </p>


          <h1 className="mt-2 text-4xl font-bold capitalize text-slate-900">
            Explore {destination}
          </h1>


          <p className="mt-3 max-w-2xl text-slate-600">
            Discover popular places and experiences you can add to your
            travel plans.
          </p>

        </div>


        {/* ========================================
            CATEGORY FILTER
        ======================================== */}

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Filter Places
              </p>

              <p className="mt-1 text-sm text-slate-600">
                Browse places by category.
              </p>

            </div>


            {/* ========================================
                CATEGORY BUTTONS
            ======================================== */}

            <div className="flex flex-wrap gap-2">

              {categories.map((category) => (

                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedCategory === category
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {category}
                </button>

              ))}

            </div>

          </div>

        </div>


        {/* ========================================
            RESULTS COUNT
        ======================================== */}

        <div className="mb-5 flex items-center justify-between">

          <p className="text-sm text-slate-500">

            Showing{" "}

            <span className="font-semibold text-slate-900">
              {filteredPlaces.length}
            </span>

            {" "}

            {filteredPlaces.length === 1
              ? "place"
              : "places"}

            {selectedCategory !== "All" && (
              <>
                {" "}in{" "}

                <span className="font-semibold text-slate-900">
                  {selectedCategory}
                </span>
              </>
            )}

          </p>

        </div>


        {/* ========================================
            PLACES GRID
        ======================================== */}

        {filteredPlaces.length === 0 ? (

          <EmptyState
            icon="🔍"
            title="No places found"
            description="There are no places available in this category. Try another category or show all places."
            action={
              selectedCategory !== "All" ? (
                <button
                  type="button"
                  onClick={() => setSelectedCategory("All")}
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Show All Places
                </button>
              ) : undefined
            }
          />

        ) : (

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {filteredPlaces.map((place: Place) => (

              <article
                key={place.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >

                {/* ========================================
                    IMAGE
                ======================================== */}

                <div className="h-52 overflow-hidden bg-slate-100">

                  <img
                    src={place.image}
                    alt={place.name}
                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                  />

                </div>


                {/* ========================================
                    CONTENT
                ======================================== */}

                <div className="p-5">

                  <div className="flex items-start justify-between gap-3">

                    <h2 className="text-xl font-bold text-slate-900">
                      {place.name}
                    </h2>


                    <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {place.category}
                    </span>

                  </div>


                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {place.description}
                  </p>


                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">

                    <span>
                      📍
                    </span>

                    <span>
                      {place.location}
                    </span>

                  </div>

                </div>

              </article>

            ))}

          </div>

        )}

      </div>

    </main>

  );

}


export default DestinationPlaces;