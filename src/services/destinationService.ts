/*
 * ========================================
 * DESTINATION SERVICE
 * ========================================
 *
 * Contains destination-specific places
 * that can be displayed on the dashboard.
 */

/*
 * ========================================
 * TYPES
 * ========================================
 */

export interface Place {
  id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  image: string;
}

/*
 * ========================================
 * DESTINATION DATA
 * ========================================
 */

const destinationPlaces: Record<string, Place[]> = {
  /*
   * ========================================
   * GOA
   * ========================================
   */

  goa: [
    {
      id: 1,
      name: "Baga Beach",
      description:
        "A popular beach known for its lively atmosphere, water activities, and beautiful coastline.",
      category: "Beach",
      location: "North Goa",
      image:
        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80",
    },

    {
      id: 2,
      name: "Fort Aguada",
      description:
        "A historic Portuguese fort offering impressive views of the Arabian Sea and surrounding coastline.",
      category: "Historical",
      location: "North Goa",
      image:
        "https://images.unsplash.com/photo-1605538883669-825200433431?auto=format&fit=crop&w=900&q=80",
    },

    {
      id: 3,
      name: "Dudhsagar Falls",
      description:
        "A spectacular waterfall surrounded by lush greenery and one of Goa's most famous natural attractions.",
      category: "Nature",
      location: "South Goa",
      image:
        "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=900&q=80",
    },

    {
      id: 4,
      name: "Basilica of Bom Jesus",
      description:
        "A historic church and UNESCO World Heritage site known for its architecture and cultural significance.",
      category: "Culture",
      location: "Old Goa",
      image:
        "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=80",
    },
  ],

  /*
   * ========================================
   * JAIPUR
   * ========================================
   */

  jaipur: [
    {
      id: 101,
      name: "Amber Fort",
      description:
        "A magnificent hilltop fort featuring grand architecture, courtyards, and panoramic views.",
      category: "Historical",
      location: "Amer, Jaipur",
      image:
        "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80",
    },

    {
      id: 102,
      name: "Hawa Mahal",
      description:
        "Jaipur's iconic Palace of Winds, famous for its distinctive honeycomb-style windows and architecture.",
      category: "Architecture",
      location: "Jaipur",
      image:
        "https://images.unsplash.com/photo-1599661046827-dacff0c9a3a5?auto=format&fit=crop&w=900&q=80",
    },

    {
      id: 103,
      name: "City Palace",
      description:
        "A historic palace complex showcasing royal courtyards, museums, and traditional Rajasthani architecture.",
      category: "Culture",
      location: "Jaipur",
      image:
        "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=900&q=80",
    },

    {
      id: 104,
      name: "Jantar Mantar",
      description:
        "An impressive astronomical observatory featuring large historic instruments used to study the skies.",
      category: "Science",
      location: "Jaipur",
      image:
        "https://images.unsplash.com/photo-1598434192043-71111c1b3f0a?auto=format&fit=crop&w=900&q=80",
    },
  ],

  /*
   * ========================================
   * DELHI
   * ========================================
   */

  delhi: [
    {
      id: 201,
      name: "India Gate",
      description:
        "One of Delhi's most recognizable landmarks and a popular destination for visitors.",
      category: "Landmark",
      location: "New Delhi",
      image:
        "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=900&q=80",
    },

    {
      id: 202,
      name: "Red Fort",
      description:
        "A historic Mughal fort and UNESCO World Heritage site located in the heart of Old Delhi.",
      category: "Historical",
      location: "Old Delhi",
      image:
        "https://images.unsplash.com/photo-1585506942812-e72b29a0a4d6?auto=format&fit=crop&w=900&q=80",
    },

    {
      id: 203,
      name: "Qutub Minar",
      description:
        "A remarkable medieval monument and one of Delhi's most famous architectural landmarks.",
      category: "Architecture",
      location: "South Delhi",
      image:
        "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80",
    },

    {
      id: 204,
      name: "Lotus Temple",
      description:
        "A striking lotus-shaped building known for its peaceful atmosphere and distinctive architecture.",
      category: "Architecture",
      location: "South Delhi",
      image:
        "https://images.unsplash.com/photo-1609948543911-7e24b2c6d8a1?auto=format&fit=crop&w=900&q=80",
    },
  ],

  /*
   * ========================================
   * MUMBAI
   * ========================================
   */

  mumbai: [
    {
      id: 301,
      name: "Gateway of India",
      description:
        "An iconic waterfront monument overlooking the Arabian Sea and Mumbai Harbour.",
      category: "Landmark",
      location: "Colaba, Mumbai",
      image:
        "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=900&q=80",
    },

    {
      id: 302,
      name: "Marine Drive",
      description:
        "A famous seaside boulevard offering beautiful views of Mumbai's coastline and skyline.",
      category: "Scenic",
      location: "South Mumbai",
      image:
        "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=900&q=80",
    },

    {
      id: 303,
      name: "Elephanta Caves",
      description:
        "Historic rock-cut caves featuring remarkable sculptures and ancient religious artwork.",
      category: "Historical",
      location: "Elephanta Island",
      image:
        "https://images.unsplash.com/photo-1625736303830-7e1d5f6f9c8d?auto=format&fit=crop&w=900&q=80",
    },

    {
      id: 304,
      name: "Chhatrapati Shivaji Maharaj Terminus",
      description:
        "A magnificent UNESCO World Heritage railway station combining Victorian Gothic and Indian architectural styles.",
      category: "Architecture",
      location: "Mumbai",
      image:
        "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=900&q=80",
    },
  ],

  /*
   * ========================================
   * AGRA
   * ========================================
   */

  agra: [
    {
      id: 401,
      name: "Taj Mahal",
      description:
        "One of India's most famous monuments and a UNESCO World Heritage site known for its extraordinary architecture.",
      category: "Landmark",
      location: "Agra",
      image:
        "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=80",
    },

    {
      id: 402,
      name: "Agra Fort",
      description:
        "A historic Mughal fort featuring impressive walls, palaces, halls, and courtyards.",
      category: "Historical",
      location: "Agra",
      image:
        "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=80",
    },

    {
      id: 403,
      name: "Mehtab Bagh",
      description:
        "A riverside garden offering a beautiful view of the Taj Mahal, particularly around sunset.",
      category: "Garden",
      location: "Agra",
      image:
        "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=80",
    },
  ],

  /*
   * ========================================
   * UDAIPUR
   * ========================================
   */

  udaipur: [
    {
      id: 501,
      name: "City Palace",
      description:
        "A spectacular palace complex overlooking Lake Pichola and showcasing the grandeur of Mewar architecture.",
      category: "Historical",
      location: "Udaipur",
      image:
        "https://images.unsplash.com/photo-1602643163986-6d7e4e8d6c2e?auto=format&fit=crop&w=900&q=80",
    },

    {
      id: 502,
      name: "Lake Pichola",
      description:
        "A beautiful artificial lake surrounded by palaces, hills, temples, and historic buildings.",
      category: "Scenic",
      location: "Udaipur",
      image:
        "https://images.unsplash.com/photo-1609766418204-94aae0ecf23c?auto=format&fit=crop&w=900&q=80",
    },

    {
      id: 503,
      name: "Sajjangarh Palace",
      description:
        "A hilltop palace offering panoramic views of Udaipur and the surrounding Aravalli landscape.",
      category: "Viewpoint",
      location: "Udaipur",
      image:
        "https://images.unsplash.com/photo-1599661046827-dacff0c9a3a5?auto=format&fit=crop&w=900&q=80",
    },
  ],

  /*
   * ========================================
   * VARANASI
   * ========================================
   */

  varanasi: [
    {
      id: 601,
      name: "Dashashwamedh Ghat",
      description:
        "One of Varanasi's most famous riverfront ghats and a major location for the evening Ganga Aarti.",
      category: "Culture",
      location: "Varanasi",
      image:
        "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=900&q=80",
    },

    {
      id: 602,
      name: "Kashi Vishwanath Temple",
      description:
        "One of the most important temples in Varanasi, located near the banks of the Ganges.",
      category: "Culture",
      location: "Varanasi",
      image:
        "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=900&q=80",
    },

    {
      id: 603,
      name: "Assi Ghat",
      description:
        "A popular riverside ghat known for its relaxed atmosphere, sunrise views, and cultural experiences.",
      category: "Scenic",
      location: "Varanasi",
      image:
        "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=900&q=80",
    },
  ],
};

/*
 * ========================================
 * NORMALIZE DESTINATION
 * ========================================
 */

const normalizeDestination = (destination: string): string => {
  return destination
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
};

/*
 * ========================================
 * GET PLACES BY DESTINATION
 * ========================================
 */

export const getPlacesByDestination = (
  destination: string
): Place[] => {
  const normalized = normalizeDestination(destination);

  return destinationPlaces[normalized] || [];
};

/*
 * ========================================
 * GET FEATURED PLACES
 * ========================================
 */

export const getFeaturedPlaces = (
  destination: string,
  limit: number = 3
): Place[] => {
  const places = getPlacesByDestination(destination);

  return places.slice(0, limit);
};

/*
 * ========================================
 * CHECK DESTINATION SUPPORT
 * ========================================
 */

export const hasDestinationData = (
  destination: string
): boolean => {
  return getPlacesByDestination(destination).length > 0;
};