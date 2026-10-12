# 🎬 IMovies - Movie Ticket Booking Made Simple

A full-stack, production-grade **MERN (MongoDB, Express.js, React.js, Node.js)** cinema and ticket reservation platform featuring **real-time seat locking via Socket.io**, role-based security, simulated payment processing, dynamic digital tickets, and an administrative cinema management panel.

Built for the **SmartBridge / Naan Mudhalvan Full Stack MERN Internship & Certification**.

---

## 🌟 Key Highlights & Features

- **🛡️ Role-Based Security (JWT & Bcrypt)**: Secure authentication with encrypted passwords, session validation, and dedicated `User` and `Admin` permissions.
- **⚡ Real-Time Seat Availability (Socket.IO)**: Real-time interactive seat matrix with a 5-minute checkout hold timer so multiple users cannot book the same seat simultaneously.
- **🔍 Advanced Movie Discovery**: Full-text search and multi-criteria filtering by genre, language, location, theatre, and date.
- **🏛️ Multi-Screen Theatre Architecture**: Full relational modeling linking Users, Movies, Theatres, Shows, Seats, Bookings, Payments, and Notifications.
- **🎟️ Digital Ticketing & History**: Instant booking confirmation with unique Booking IDs, fee breakdowns, and real-time cancellation with refund tracking.
- **📊 Admin Cinema Suite**: Complete CRUD control over movies, theatres, screen configurations, pricing tiers, and platform revenue metrics.
- **🚦 Security & Optimization**: API rate limiting, compound database indexing, centralized error handling, and structured REST responses.

---

## 🗄️ Database Architecture (8 Core Collections)

1. **`Users`**: User and administrator identities, hashed passwords (`bcryptjs`), contact details, and role access.
2. **`Movies`**: Comprehensive cinematic metadata, genres, languages, runtimes, ratings, trailers, posters, and wide banners.
3. **`Theatres`**: Physical venues, screen counts, locations, and city indexation.
4. **`Shows`**: Movie scheduling linked to theatres, screen halls, calendar dates, showtimes, and multi-tier pricing.
5. **`Seats`**: Granular seat matrices (VIP, Premium, Standard) with real-time status (`available`, `locked`, `booked`) and expiration timers.
6. **`Bookings`**: Complete reservation records linking users, shows, seats, pricing breakdown, and cancellation status.
7. **`Payments`**: Financial transactions, payment methods (Card, UPI, NetBanking), mock card data, and refund tracking.
8. **`Notifications`**: Real-time in-app booking confirmation, reminders, and cancellation alerts.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React.js, React Router v6, Axios, React Toastify, Lucide Icons, Custom Cinematic CSS |
| **Backend** | Node.js, Express.js, Socket.IO, JWT, BcryptJS, Morgan, Express Rate Limit |
| **Database** | MongoDB (Mongoose ODM with compound indexes) |
| **Testing** | Postman Collection (`postman_collection.json`) |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI

### 2. Environment Configuration
Create a `.env` file in the root directory (or use `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/imovies_db
JWT_SECRET=imovies_super_secure_jwt_secret_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install client dependencies
npm run client:install
```

### 4. Seed Database with Realistic Data
Populates movies (*Dune: Part Two*, *Oppenheimer*, *Spider-Man*, *Interstellar*), theatres, and automatically generates 80-seat layouts:
```bash
npm run seed
```

**Default Test Credentials:**
- **Admin**: `admin@imovies.com` / `admin123`
- **User**: `user@imovies.com` / `user123`

### 5. Running the Application
```bash
# Run backend server
npm run dev

# Run frontend React app
npm run client

# Or run both concurrently
npm run dev:full
```

---

## 📬 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - Authenticate and obtain JWT
- `GET /api/auth/me` - Get profile (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)

### Movies (`/api/movies`)
- `GET /api/movies` - List movies with search & filters
- `GET /api/movies/:id` - Detailed movie info
- `GET /api/movies/filters/metadata` - List genres and languages
- `POST /api/movies` - Add movie (Admin)
- `PUT /api/movies/:id` - Edit movie (Admin)
- `DELETE /api/movies/:id` - Remove movie (Admin)

### Shows & Seats (`/api/shows`)
- `GET /api/shows/movie/:movieId` - Shows grouped by theatre
- `GET /api/shows/:id` - Show info + live 80-seat grid
- `POST /api/shows` - Create show + auto generate seats (Admin)
- `DELETE /api/shows/:id` - Remove show (Admin)

### Bookings & Payments (`/api/bookings`)
- `POST /api/bookings/lock-seats` - 5-minute hold on selected seats
- `POST /api/bookings/release-seats` - Release held seats
- `POST /api/bookings` - Confirm booking & simulated payment
- `GET /api/bookings/my-bookings` - User's booking history
- `POST /api/bookings/:id/cancel` - Cancel booking and trigger refund
- `GET /api/bookings/admin/all` - All platform bookings & revenue (Admin)

---

## 🧪 Postman Testing
Import the provided file `postman_collection.json` directly into Postman to test all endpoints. It includes environment variables and automatic authentication token handling.
