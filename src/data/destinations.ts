export interface DestinationData {
  name: string;
  description: string;
  activities: string[];
}

export const destinations: Record<string, DestinationData> = {
  goa: {
    name: "Goa",
    description:
      "A coastal destination known for beaches, Portuguese heritage, nightlife, and local cuisine.",
    activities: [
      "Visit Baga Beach",
      "Explore Fort Aguada",
      "Relax at Calangute Beach",
      "Visit Anjuna Beach",
      "Explore Panjim",
      "Watch the sunset at Vagator Beach",
      "Try local Goan cuisine",
      "Explore Old Goa churches",
    ],
  },

  jaipur: {
    name: "Jaipur",
    description:
      "The Pink City, known for historic forts, palaces, markets, and Rajasthani culture.",
    activities: [
      "Visit Amber Fort",
      "Explore City Palace",
      "Visit Hawa Mahal",
      "Explore Jantar Mantar",
      "Walk through local markets",
      "Visit Jal Mahal",
      "Try traditional Rajasthani food",
      "Explore the old city",
    ],
  },

  delhi: {
    name: "Delhi",
    description:
      "India's capital, offering historic landmarks, markets, museums, and diverse food.",
    activities: [
      "Visit India Gate",
      "Explore Red Fort",
      "Visit Humayun's Tomb",
      "Explore Qutub Minar",
      "Walk through Chandni Chowk",
      "Visit Lotus Temple",
      "Explore Connaught Place",
      "Try local street food",
    ],
  },

  mumbai: {
    name: "Mumbai",
    description:
      "A vibrant coastal city known for landmarks, Bollywood, food, and nightlife.",
    activities: [
      "Visit Gateway of India",
      "Explore Marine Drive",
      "Visit Chhatrapati Shivaji Maharaj Terminus",
      "Explore Colaba",
      "Visit Elephanta Caves",
      "Walk around Bandra",
      "Try Mumbai street food",
      "Watch the sunset at Marine Drive",
    ],
  },

  manali: {
    name: "Manali",
    description:
      "A Himalayan destination popular for mountain scenery, adventure, and peaceful escapes.",
    activities: [
      "Explore Old Manali",
      "Visit Hadimba Temple",
      "Walk along the Beas River",
      "Visit Solang Valley",
      "Explore Mall Road",
      "Visit Vashisht Hot Springs",
      "Enjoy mountain views",
      "Try local Himachali food",
    ],
  },

  rishikesh: {
    name: "Rishikesh",
    description:
      "A riverside destination known for yoga, spirituality, adventure, and the Himalayas.",
    activities: [
      "Visit Laxman Jhula area",
      "Attend Ganga Aarti",
      "Explore Beatles Ashram",
      "Try river rafting",
      "Visit Triveni Ghat",
      "Practice yoga",
      "Walk along the Ganges",
      "Explore local cafes",
    ],
  },
};