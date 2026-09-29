# TravelPlan ✈️

A modern travel planning platform built with React, TypeScript, and Supabase that allows users to create, manage, and organize their trips in one place.

## 🌐 Live Demo

https://travel-planning-platform-two.vercel.app

## 📌 About the Project

TravelPlan is a full-stack travel planning web application designed to simplify trip organization.

Users can create trips, manage itineraries, track expenses, view destinations on maps, and access their saved trips securely from their account.

The application uses Supabase for authentication and database storage, with Row Level Security (RLS) ensuring that users can only access their own trip data.

---

## ✨ Features

### 🔐 Authentication

- User registration
- Email verification
- Secure login
- Logout
- Forgot password
- Password reset
- Persistent authentication sessions
- Protected routes

### 🗺️ Trip Planning

- Create a new trip
- Select origin and destination
- Set travel duration
- Set travel budget
- Set travel date
- Specify number of travelers
- Store destination coordinates
- View trip details

### 📋 Trip Management

- View all saved trips
- Search trips
- Filter trips
- Sort trips
- Edit trips
- Delete trips
- View individual trip details
- User-specific trip data

### 📝 Itinerary Management

- Add itinerary items
- Edit itinerary items
- Delete itinerary items
- Organize activities by day
- Track itinerary completion
- View itinerary progress

### 💰 Expense Management

- Add expenses
- Edit expenses
- Delete expenses
- Categorize expenses
- Filter expenses by category
- Sort expenses
- Track total expenses
- Compare expenses with the trip budget
- Import expenses using CSV

### 🗺️ Maps & Destinations

- Interactive maps
- Origin and destination locations
- Route information
- Destination places
- Location-based trip information

### 📱 Responsive Design

- Desktop-friendly interface
- Mobile-friendly navigation
- Responsive trip cards
- Responsive dashboard
- Mobile hamburger menu

### 🛡️ Security

- Supabase Authentication
- Supabase Row Level Security (RLS)
- User-specific database queries
- Protected application routes
- Environment variables for Supabase credentials

---

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS

### Backend / Database

- Supabase
- PostgreSQL
- Supabase Authentication
- Row Level Security (RLS)

### Maps

- React Leaflet
- Leaflet

### Development Tools

- ESLint
- Git
- GitHub
- Vercel

---

## 🏗️ Project Architecture

```text
TravelPlan
│
├── public/
│
├── src/
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── Navbar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── PublicRoute.tsx
│   │
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── ResetPassword.tsx
│   │   ├── PlanTrip.tsx
│   │   ├── Dashboard.tsx
│   │   ├── SavedTrips.tsx
│   │   ├── TripDetails.tsx
│   │   ├── EditTrip.tsx
│   │   ├── DestinationPlaces.tsx
│   │   └── NotFound.tsx
│   │
│   ├── services/
│   │   ├── supabaseClient.ts
│   │   ├── tripService.ts
│   │   └── itineraryService.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json
└── README.md
