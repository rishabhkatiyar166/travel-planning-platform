# ✈️ Travel Planner

A modern, responsive **Travel Planning Platform** built with React, TypeScript, Tailwind CSS, and Supabase.

Travel Planner helps users create and manage trips, organize itineraries, view routes on an interactive map, track expenses, and securely save travel plans in the cloud.

## 🌐 Live Demo

- **Live App:** https://travel-planning-platform-two.vercel.app
- **GitHub:** https://github.com/rishabhkatiyar166/travel-planning-platform

## ✨ Features

### 🔐 Authentication
- User registration with email and password
- Email confirmation through Supabase Auth
- Secure login and logout
- Forgot password and password reset
- Persistent authentication sessions
- Protected application routes
- Public and protected route handling

### 🗺️ Trip Planning
- Create new trips
- Add origin and destination
- Set travel date, duration, travelers, and budget
- Save trip information in Supabase
- View, edit, and delete saved trips
- User-specific trip isolation

### 📍 Interactive Route Map
- Interactive trip map
- Origin and destination markers
- Route visualization
- Driving distance
- Estimated driving time
- Leaflet/OpenStreetMap integration

### 📝 Itinerary Management
- Organize activities by day
- Add, edit, and delete activities
- Track itinerary progress
- Persist itinerary data in Supabase

### 💰 Expense Tracker
- Add, edit, and delete expenses
- Categories: Food, Travel, Hotel, Activities, Other
- Filter and sort expenses
- Total spending and remaining budget
- Budget usage percentage
- Spending by category
- Average expense
- Largest expense
- Spending days
- Average daily spending
- Daily spending summary
- Expense history

### 📊 CSV Tools
- Import expenses from CSV
- Export expenses to CSV
- Validate imported expense data

### 📱 Responsive UI
- Responsive desktop layout
- Mobile-friendly navigation
- Mobile hamburger menu
- Responsive dashboard, itinerary, and expense sections

### 🛡️ Security
- Supabase Authentication
- Row Level Security (RLS)
- User-specific database access
- Protected routes
- Trips linked to authenticated users
- Users can only access their own trip records

## 🖼️ Screenshots

### Home Page

![Home Page](./screenshots/home.png)

### Login

![Login](./screenshots/login.png)

### Signup

![Signup](./screenshots/signup.png)

### Dashboard

![Dashboard](./screenshots/dashboard.png)

### Trip Details

![Trip Details](./screenshots/trip-details.png)

### Expense Tracker

![Expense Tracker](./screenshots/expenses.png)

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React Hooks

### Backend / Database
- Supabase
- PostgreSQL
- Supabase Authentication
- Row Level Security (RLS)

### Maps
- Leaflet
- OpenStreetMap

### Development & Deployment
- ESLint
- Git
- GitHub
- Vercel

## 🏗️ Project Structure

```text
travel-planning-platform/
├── public/
├── screenshots/
│   ├── home.png
│   ├── login.png
│   ├── signup.png
│   ├── dashboard.png
│   ├── trip-details.png
│   └── expenses.png
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── Navbar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── PublicRoute.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── PlanTrip.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── ResetPassword.tsx
│   │   ├── Dashboard.tsx
│   │   ├── SavedTrips.tsx
│   │   ├── TripDetails.tsx
│   │   ├── EditTrip.tsx
│   │   ├── DestinationPlaces.tsx
│   │   └── NotFound.tsx
│   ├── services/
│   │   ├── supabaseClient.ts
│   │   ├── tripService.ts
│   │   └── itineraryService.ts
│   ├── App.tsx
│   └── main.tsx
├── .env
├── .gitignore
├── eslint.config.js
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/rishabhkatiyar166/travel-planning-platform.git
cd travel-planning-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Do not commit `.env` to GitHub.

### 4. Start the development server

```bash
npm run dev
```

### 5. Verify the project

```bash
npm run lint
npm run build
```

## 🗄️ Supabase Setup

The application uses Supabase for authentication and persistent trip data.

### Authentication

Supabase Email Authentication is used for:

- Signup
- Email confirmation
- Login
- Logout
- Password reset

### Database

Trip data is stored in the `public.trips` table and associated with the authenticated user through:

```text
user_id → auth.users.id
```

### Row Level Security

RLS policies protect trip data using the authenticated user's ID. The core access rule is:

```sql
auth.uid() = user_id
```

This prevents one authenticated user from reading or modifying another user's trips.

## 🔑 Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable client key |

Example:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-key
```

Never put private server-side secrets in frontend environment variables.

## 🧭 Application Routes

### Public Routes

```text
/
/login
/signup
/reset-password
```

### Protected Routes

```text
/plan-trip
/dashboard
/saved-trips
/saved-trips/:id
/saved-trips/:id/edit
/destination-places
```

Protected routes require an authenticated Supabase session.

## 🔄 Application Flow

```text
                    ┌──────────────┐
                    │   Home Page  │
                    └──────┬───────┘
                           │
                 ┌─────────┴─────────┐
                 │                   │
              Login               Signup
                 │                   │
                 └─────────┬─────────┘
                           │
                    Authenticated
                           │
                    ┌──────▼───────┐
                    │   Dashboard  │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
     Plan Trip        Saved Trips       Destination
          │                │
          │          ┌─────▼─────┐
          │          │ Trip View │
          │          └─────┬─────┘
          │                │
          └──────────┬─────┘
                     │
              ┌──────▼──────┐
              │ Trip Details│
              └──────┬──────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
      Route       Itinerary    Expenses
        │            │            │
       Map       Daily Plans   Analytics
```

## 🧩 Main Services & Components

### `AuthContext`

Handles the current authenticated user, signup, login, logout, session restoration, and authentication state.

### `ProtectedRoute`

Prevents unauthenticated users from accessing protected pages.

### `PublicRoute`

Controls public authentication pages and allows the password-reset flow to work correctly.

### `tripService`

Handles trip CRUD operations:

- Create trip
- Read trip
- Read user trips
- Update trip
- Delete trip

### `itineraryService`

Handles itinerary operations:

- Get itinerary
- Add activity
- Update activity
- Delete activity
- Filter activities by day

## 📈 Dashboard

The dashboard provides an overview of the user's travel plans:

- Total trips
- Latest destination
- Latest travelers
- Latest trip duration
- Recent trips
- Quick actions
- View trip
- Edit trip
- Plan a new trip

## 🧳 Trip Details

The trip details page combines the major trip-management features:

```text
Trip Information
      │
      ├── Route
      │
      ├── Interactive Map
      │
      ├── Itinerary
      │
      ├── Expense Tracker
      │
      ├── Expense Analytics
      │
      └── Trip Status
```

## 💸 Expense Analytics

The expense tracker calculates:

- Total spent
- Trip budget
- Remaining budget
- Budget usage percentage
- Spending by category
- Average expense
- Largest expense
- Spending days
- Average daily spending
- Daily spending summary

## 📥 CSV Import / Export

Expenses can be transferred using CSV files. Users can import expense records into the current trip and export recorded expenses for backup, analysis, or external use.

## 🧪 Quality Checks

Run linting:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

The production build runs TypeScript compilation followed by Vite's production build.

## 🌍 Deployment

The project is deployed using Vercel.

React Router routes are supported through the following `vercel.json` rewrite:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Configure the required Supabase environment variables in the Vercel project settings before deployment.

## 🔒 Security Notes

- `.env` is excluded from Git.
- Supabase Authentication handles user sessions.
- Database access is protected using RLS.
- Trip records are associated with authenticated users.
- Frontend routes are protected using React Router.
- The Supabase publishable key is intended for client-side use; database authorization is enforced through RLS.

## 📱 Responsive Design

The application is designed for desktop, laptop, tablet, and mobile screens. Navigation changes to a mobile-friendly menu on smaller screens, while the dashboard, trip details, itinerary, and expense interfaces adapt to the available screen width.

## 🔮 Future Improvements

- AI-powered itinerary generation
- Weather information for destinations
- Hotel and flight integration
- Real-time destination recommendations
- Currency conversion
- Trip sharing
- Collaborative trip planning
- Notifications and reminders
- Advanced travel analytics
- Offline support
- Progressive Web App support

## 🎯 Project Goals

This project demonstrates practical modern web-development concepts including:

- React application architecture
- TypeScript
- Responsive UI development
- Authentication
- Protected routing
- Database integration
- CRUD operations
- Row Level Security
- Cloud data persistence
- Interactive maps
- Form handling
- Expense analytics
- CSV processing
- Production deployment

## 👨‍💻 Author

**Rishabh Katiyar**

B.Tech Computer Science Engineering

Built as a full-stack travel planning project using modern web technologies.

## 📄 License

This project is available for educational and portfolio purposes.
