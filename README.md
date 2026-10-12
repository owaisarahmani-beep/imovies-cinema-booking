# 🎬 IMovies - Cinema Booking & Ticket Reservation System

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://reactjs.org/)
[![Socket.IO](https://img.shields.io/badge/Real--Time-Socket.IO-black.svg)](https://socket.io/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-green.svg)](https://www.mongodb.com/atlas)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, production-grade **MERN (MongoDB, Express.js, React.js, Node.js)** cinema ticket reservation platform inspired by BookMyShow and AMC Theatres. Featuring **real-time WebSocket seat locking via Socket.IO**, multi-city cinema discovery, authentic theatrical blockbusters, transparent pricing breakdowns, and an administrative cinema management panel.

🌐 **Live Deployed Application:** [https://imovies-cinema-booking.onrender.com](https://imovies-cinema-booking.onrender.com)

> **Project Submission for:** SmartBridge / Naan Mudhalvan — Full Stack Developer (MERN)

---

## 📁 Repository Structure

This repository strictly adheres to the submission guidelines with two primary top-level folders:

```text
├── code files/                             # Complete Application Source Code
│   ├── src/                               # Node.js & Express REST Backend + Socket.IO
│   │   ├── config/                        # Database connection (MongoDB Atlas)
│   │   ├── controllers/                   # Auth, Movie, Theatre, Show, Booking controllers
│   │   ├── middleware/                    # JWT Auth, RBAC, Rate Limiting, Error Handler
│   │   ├── models/                        # 8 Mongoose Schema models
│   │   ├── routes/                        # Express API route declarations
│   │   ├── socket/                        # Socket.IO real-time seat lock handler
│   │   ├── utils/                         # Database Seeder (seedData.js)
│   │   └── server.js                      # Express HTTP + WebSocket Server Entry
│   ├── client/                            # React 18 Single Page Application (SPA)
│   │   ├── public/                        # HTML template and favicon
│   │   ├── src/
│   │   │   ├── components/                # Navbar, Footer, MovieCard, SeatMap, BookingModal, DigitalTicket
│   │   │   ├── context/                   # AuthContext (JWT state & persistence)
│   │   │   ├── pages/                     # HomePage, MovieDetails, SeatBooking, Confirm, MyBookings, Admin
│   │   │   └── services/                  # Axios HTTP client with auth interceptors
│   │   └── package.json                   # Frontend dependencies
│   ├── package.json                       # Backend scripts & root dependencies
│   ├── README.md                          # Detailed developer & API documentation
│   └── postman_collection.json            # Complete Postman API testing collection
│
└── phase wise documents/                  # Internship Course Phase Deliverables (.docx)
    ├── Ideation Phase-(1)/                # Empathy Map Canvas & Problem Statements
    ├── Project Planning Phase(2)/         # Project Schedule & Milestone Planning
    ├── Requirement Analysis(3)/           # Tech Stack, SRS (Functional & Non-Functional), DataFlow Diagram
    ├── Project Design Phase(4)/           # Solution Architecture, Proposed Solution, Fit Template
    └── Performance Testing/               # User Acceptance Testing (UAT) Test Cases & Bug Log
```

---

## 🌟 Key Application Features

- **⚡ Real-Time Seat Locking (Socket.IO)**: 80-seat interactive curved grid with synchronized live locking across concurrent browsers and an automated 5-minute checkout countdown hold timer.
- **🛡️ Role-Based Authentication**: Secure JWT authentication with `bcryptjs` password hashing, protected routes, and dedicated `User` and `Admin` permissions.
- **🏙️ Multi-City Cinema Network**: Dynamic location filtering across 9 Indian cities (*Mumbai, Delhi, Bengaluru, Kolkata, Chennai, Hyderabad, Pune, Ahmedabad, Jaipur*) and 15 premier theatres.
- **🍿 Food & Beverage Cinema Combos**: Interactive cinema snack add-ons (Caramel Tub Popcorn, Cold Fountain Pepsi, Crispy Cheese Nachos) with itemized fee transparency.
- **🎫 Digital Barcode E-Tickets**: Printable dynamic e-ticket generation with simulated barcode, Booking ID, and instant self-service booking cancellation with refund tracking.
- **📊 Executive Admin Dashboard**: Live revenue metrics, booking counts, catalog CRUD management, and theatre screen configuration.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, React Router v6, Axios, Lucide Icons, React-Toastify, CSS Modules |
| **Backend** | Node.js, Express.js, Socket.IO (WebSockets), JWT, BcryptJS, Morgan, Express-Rate-Limit |
| **Database** | MongoDB Atlas (Cloud Cluster with compound indexing) |
| **Testing** | Postman API Collection (`postman_collection.json`) |

---

## 🚀 Quick Start & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/imovies-cinema-booking.git
cd imovies-cinema-booking/"code files"
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm run client:install
```

### 3. Environment Variables
Create a `.env` file in `code files/`:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_jwt_key
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Seed the Database
```bash
npm run seed
```

**Default Test Credentials:**
* **Demo Regular User**: `user@imovies.com` / `user123`
* **Demo Cinema Admin**: `admin@imovies.com` / `admin123`

### 5. Launch Application
```bash
npm run dev:full
```
* **Frontend**: `http://localhost:3000`
* **Backend API**: `http://localhost:5000/api`

---

## 📬 Postman API Collection
The included `code files/postman_collection.json` contains full test suites for:
* **Auth**: Registration, Login, Token verification
* **Movies**: Query catalog, filter by city/genre, create/update/delete movie
* **Theatres & Shows**: Screen layouts, show schedules, seat availability
* **Bookings**: Lock seats, confirm payment, user booking history, cancellation
