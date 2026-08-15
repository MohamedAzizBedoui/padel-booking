# Padel Booking System

A modern web application for booking padel tennis courts. This full-stack application allows users to register, search for available courts at different clubs, make bookings, and manage their reservations.

## Features

- **User Authentication**: Secure registration and login system with NextAuth.js
- **Club Management**: Browse padel clubs organized by city with court details
- **Court Availability**: Real-time availability checking for courts with date selection
- **Booking System**: Book courts for specific dates and times
- **User Profiles**: Manage user account information and view booking history
- **Booking Management**: View, modify, and cancel bookings with status tracking
- **Error Handling**: 404 and error boundary pages with proper error management
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15+ (React), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: ESLint

## Project Structure

```
padel-booking/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── availability/         # Court availability endpoints
│   │   ├── bookings/            # Booking management endpoints
│   │   ├── clubs/               # Club data endpoints
│   │   └── test-db/             # Database testing endpoints
│   ├── bookings/                # Booking list & detail pages
│   │   ├── page.tsx             # List all user bookings
│   │   └── [id]/                # Booking detail pages
│   ├── clubs/                   # Club browsing page
│   │   └── page.tsx             # Browse all clubs
│   ├── courts/                  # Court listing and availability
│   │   ├── page.tsx             # Search and book courts
│   │   ├── CourtAvailability.tsx
│   │   └── DateSelector.tsx
│   ├── home/                    # Home/landing page
│   │   └── page.tsx
│   ├── login/                   # Login page
│   │   └── page.tsx
│   ├── profile/                 # User profile page
│   │   └── page.tsx
│   ├── register/                # Registration page
│   │   └── page.tsx
│   ├── error.tsx                # Error boundary component
│   ├── not-found.tsx            # 404 page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Auth page (login/signup)
│   └── generated/               # Generated Prisma client types
├── lib/                         # Utility functions
│   └── prisma.ts                # Prisma client
├── prisma/                      # Database schema and migrations
│   ├── schema.prisma            # Database schema
│   ├── seed.ts                  # Database seeding script
│   └── migrations/              # Database migration files
├── types/                       # TypeScript type definitions
│   └── next-auth.d.ts
└── public/                      # Static assets
```

## Pages & Routes

### Authentication Pages
| Page | Route | Description |
|------|-------|-------------|
| Login/Signup | `/` | User authentication (login or create account) |

### User Pages
| Page | Route | Description |
|------|-------|-------------|
| Home | `/home` | Main landing page with quick booking search |
| Dashboard | `/dashboard` | User dashboard with stats and upcoming bookings |
| Profile | `/profile` | User profile and booking history |

### Booking Pages
| Page | Route | Description |
|------|-------|-------------|
| Browse Courts | `/courts` | Search and view available courts |
| My Bookings | `/bookings` | List all user bookings with filtering |
| Booking Details | `/bookings/[id]` | View specific booking details |
| Cancel Booking | `/bookings/[id]/cancel` | Cancel a booking |

### Club Pages
| Page | Route | Description |
|------|-------|-------------|
| Browse Clubs | `/clubs` | Browse all padel clubs by city |

### Error Pages
| Page | Route | Description |
|------|-------|-------------|
| Not Found | `/not-found` | 404 error page |
| Error | `*` | Error boundary for app errors |

### Navigation Flow
```
localhost:3000 (Login/Signup)
    ↓
/home (Home Page)
    ├→ /courts (Browse Courts)
    ├→ /bookings (My Bookings)
    ├→ /bookings/[id] (Booking Details)
    ├→ /clubs (Browse Clubs)
    ├→ /profile (User Profile)
    └→ /register or /login (Auth Pages)
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables by creating a `.env.local` file:

```env
DATABASE_URL=postgresql://[user]:[password]@localhost:5432/padel_booking
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

3. Run database migrations:

```bash
npx prisma migrate dev
```

4. Seed the database (optional):

```bash
npx prisma db seed
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Database Management

- **View database**: `npx prisma studio`
- **Create migration**: `npx prisma migrate dev --name migration_name`
- **Reset database**: `npx prisma migrate reset`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### Clubs
- `GET /api/clubs` - Get all clubs with availability

### Courts & Availability
- `GET /api/availability` - Get court availability

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create a new booking
- `DELETE /api/bookings/[id]/cancel` - Cancel a booking

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm start         # Start production server
npm run lint      # Run ESLint
```

## Database Schema

The application uses the following main entities:
- **User**: User account information and authentication
- **Club**: Padel clubs with city information
- **Court**: Courts within clubs
- **Booking**: User bookings for specific courts and times

See [prisma/schema.prisma](prisma/schema.prisma) for the complete schema.

## Page Features

### Dashboard Page (`/dashboard`)
- Welcome message with user's name and email
- Statistics cards: Upcoming bookings, total bookings, total spent
- List of upcoming confirmed bookings (up to 3)
- Quick action buttons to book courts or explore clubs
- Loading states and error handling

### Bookings Page (`/bookings`)
- List all user bookings with status filtering (All, Confirmed, Completed, Cancelled)
- Searchable and sortable booking list
- Each booking shows: court name, club, date, time, and price
- Click to view booking details
- Status badges with color coding

### Clubs Page (`/clubs`)
- Browse all padel clubs
- Filter clubs by city
- Display club information: name, address, description
- Show available courts in each club with prices
- Direct links to book courts

### Error Handling
- **404 Page**: User-friendly not found page with navigation options
- **Error Boundary**: Catches and displays errors with recovery options
- **Loading States**: Skeleton screens while data loads

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting: `npm run lint`
4. Submit a pull request

## License

This project is licensed under the MIT License.
