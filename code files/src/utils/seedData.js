const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

const moviesData = [
  {
    title: 'Deadpool & Wolverine',
    description: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.',
    poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    banner: 'https://image.tmdb.org/t/p/original/cOoVcVQ3i1m5b2xtqKBtoTSbxC1.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
    genre: ['Action', 'Comedy', 'Sci-Fi'],
    language: ['English', 'Hindi', 'Tamil', 'Telugu'],
    duration: 128,
    releaseDate: new Date('2024-07-26'),
    rating: 8.8,
    director: 'Shawn Levy',
    cast: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin', 'Matthew Macfadyen'],
    certificate: 'A'
  },
  {
    title: 'Gladiator II',
    description: 'Years after witnessing the death of Maximus at the hands of his uncle, Lucius must enter the Colosseum after the powerful emperors of Rome conquer his home. With rage in his heart and the future of the empire at stake, Lucius looks to his past to find strength.',
    poster: 'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
    banner: 'https://image.tmdb.org/t/p/original/tOqIwliWMovSIZ9DyvHcHI7p2im.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
    genre: ['Action', 'Adventure', 'Drama'],
    language: ['English', 'Hindi'],
    duration: 148,
    releaseDate: new Date('2024-11-15'),
    rating: 8.6,
    director: 'Ridley Scott',
    cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
    certificate: 'A'
  },
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    banner: 'https://image.tmdb.org/t/p/original/eZ239CUp1d6OryZEBPnO2n87gMG.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    genre: ['Sci-Fi', 'Adventure', 'Action'],
    language: ['English', 'Hindi'],
    duration: 166,
    releaseDate: new Date('2024-03-01'),
    rating: 8.9,
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
    certificate: 'U/A'
  },
  {
    title: 'Kalki 2898 AD',
    description: 'Set in a post-apocalyptic world in the year 2898 AD, a modern-day avatar of Vishnu descends to Earth to protect the world from evil forces. An epic sci-fi mythological spectacle traversing centuries.',
    poster: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Kalki_2898_AD.jpg',
    banner: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Kalki_2898_AD.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=kQDd1AhGIHk',
    genre: ['Sci-Fi', 'Action', 'Mythology'],
    language: ['Hindi', 'Telugu', 'Tamil', 'English'],
    duration: 181,
    releaseDate: new Date('2024-06-27'),
    rating: 8.4,
    director: 'Nag Ashwin',
    cast: ['Prabhas', 'Amitabh Bachchan', 'Kamal Haasan', 'Deepika Padukone'],
    certificate: 'U/A'
  },
  {
    title: 'Inside Out 2',
    description: 'Teenager Riley’s mind undergoes a sudden demolition to make room for unexpected new Emotions: Anxiety, Envy, Ennui, and Embarrassment! Joy, Sadness, Anger, Fear, and Disgust navigate new territory.',
    poster: 'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    banner: 'https://image.tmdb.org/t/p/original/xg27NrXi7VXCGUr7MG75UqLl6Vg.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=LEjhY15eCx0',
    genre: ['Animation', 'Comedy', 'Family'],
    language: ['English', 'Hindi'],
    duration: 96,
    releaseDate: new Date('2024-06-14'),
    rating: 8.7,
    director: 'Kelsey Mann',
    cast: ['Amy Poehler', 'Maya Hawke', 'Kensington Tallman', 'Liza Lapira'],
    certificate: 'U'
  },
  {
    title: 'Stree 2: Sarkate Ka Aatank',
    description: 'After the events of Stree, the town of Chanderi is haunted by a new headless ghost named Sarkata, who abducts women. Vicky and his friends must summon the original Stree to rescue their loved ones.',
    poster: 'https://upload.wikimedia.org/wikipedia/en/a/a1/Stree_2.jpg',
    banner: 'https://upload.wikimedia.org/wikipedia/en/a/a1/Stree_2.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=KVnhe_x031k',
    genre: ['Comedy', 'Horror'],
    language: ['Hindi'],
    duration: 147,
    releaseDate: new Date('2024-08-15'),
    rating: 8.5,
    director: 'Amar Kaushik',
    cast: ['Rajkummar Rao', 'Shraddha Kapoor', 'Pankaj Tripathi', 'Aparshakti Khurana'],
    certificate: 'U/A'
  },
  {
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the Manhattan Project during World War II, changing humanity forever.',
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    banner: 'https://image.tmdb.org/t/p/original/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    genre: ['Biography', 'Drama', 'History'],
    language: ['English', 'Hindi'],
    duration: 180,
    releaseDate: new Date('2023-07-21'),
    rating: 8.9,
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    certificate: 'A'
  },
  {
    title: 'Interstellar (IMAX Re-Release)',
    description: 'Celebrating its 10th anniversary in IMAX theatres. An astronaut team travels through a newly discovered wormhole in space to secure humanity’s survival.',
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    banner: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    genre: ['Sci-Fi', 'Drama', 'Adventure'],
    language: ['English', 'Hindi'],
    duration: 169,
    releaseDate: new Date('2024-09-27'),
    rating: 8.8,
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    certificate: 'U/A'
  }
];

const theatresData = [
  // Mumbai
  {
    name: 'PVR ICON: Phoenix Palladium',
    city: 'Mumbai',
    location: '462, Senapati Bapat Marg, Lower Parel',
    totalScreens: 3,
    screens: [
      { screenName: 'IMAX Laser 1', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 },
      { screenName: 'Gold Class 2', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['IMAX Laser', 'Dolby Atmos', 'Recliner Seats', 'Gourmet Food']
  },
  {
    name: 'INOX Megaplex: Inorbit Mall',
    city: 'Mumbai',
    location: 'Link Road, Malad West',
    totalScreens: 4,
    screens: [
      { screenName: 'Screen 1 - Insignia', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['Dolby Atmos', '4K Projection', 'Food Court', 'Free Parking']
  },
  // Delhi
  {
    name: 'PVR Directors Cut: Vasant Kunj',
    city: 'Delhi',
    location: 'Ambience Mall, Nelson Mandela Marg',
    totalScreens: 3,
    screens: [
      { screenName: 'Director Suite 1', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['Luxury Dining', 'Dolby Atmos', 'Valet Parking']
  },
  {
    name: 'INOX: Epicuria Nehru Place',
    city: 'Delhi',
    location: 'Astha Kunj Road, Nehru Place Metro',
    totalScreens: 3,
    screens: [
      { screenName: 'Screen 1 - Dolby', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['Dolby Atmos', 'Metro Connected', 'Cafeteria']
  },
  // Bengaluru
  {
    name: 'PVR IMAX: Forum Koramangala',
    city: 'Bengaluru',
    location: 'Hosur Road, Koramangala',
    totalScreens: 4,
    screens: [
      { screenName: 'IMAX Screen 1', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['IMAX 3D', 'Dolby 7.1', 'Snack Bar']
  },
  {
    name: 'INOX: Garuda Mall',
    city: 'Bengaluru',
    location: 'Magrath Road, Ashok Nagar',
    totalScreens: 4,
    screens: [
      { screenName: 'Screen 2 - Insignia', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['4K Laser', 'Dolby Atmos', 'Recliners']
  },
  // Kolkata
  {
    name: 'INOX: South City Mall',
    city: 'Kolkata',
    location: '375, Prince Anwar Shah Road',
    totalScreens: 6,
    screens: [
      { screenName: 'IMAX Laser 1', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 },
      { screenName: 'Insignia 2', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['IMAX Laser', 'Dolby Atmos', 'Insignia Lounge']
  },
  {
    name: 'PVR: Mani Square Mall',
    city: 'Kolkata',
    location: '164/1, Maniktala Main Road, EM Bypass',
    totalScreens: 4,
    screens: [
      { screenName: 'Screen 1 - Premiere', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['Dolby 7.1', '4K Projection', 'Food Court']
  },
  // Hyderabad
  {
    name: 'Prasads Multiplex: Necklace Road',
    city: 'Hyderabad',
    location: 'NTR Gardens, Khairatabad',
    totalScreens: 5,
    screens: [
      { screenName: 'Large Screen 1', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['Giant Screen', 'Dolby Atmos', 'Gaming Zone']
  },
  {
    name: 'PVR: Forum Sujana Mall',
    city: 'Hyderabad',
    location: 'KPHB Phase 9, Kukatpally',
    totalScreens: 5,
    screens: [
      { screenName: '4DX Screen 1', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['4DX Motion', 'Dolby Atmos', 'Food Court']
  },
  // Chennai
  {
    name: 'Sathyam Cinemas (SPI/PVR)',
    city: 'Chennai',
    location: '8, Thiru-Vi-Ka Road, Royapettah',
    totalScreens: 6,
    screens: [
      { screenName: 'Sathyam Main Screen', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['Dolby Atmos', 'Legendary Popcorn', 'Ruggiero Sound']
  },
  {
    name: 'PVR: Phoenix Marketcity',
    city: 'Chennai',
    location: 'Velachery Main Road, Velachery',
    totalScreens: 6,
    screens: [
      { screenName: 'IMAX Screen 1', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['IMAX Laser', 'Dolby Atmos', 'Luxe Recliners']
  },
  // Pune
  {
    name: 'PVR ICON: The Pavilion',
    city: 'Pune',
    location: 'Senapati Bapat Road, Shivajinagar',
    totalScreens: 5,
    screens: [
      { screenName: 'ICON Screen 1', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['4K Laser', 'Dolby Atmos', 'Recliner Seats']
  },
  // Ahmedabad
  {
    name: 'PVR: Acropolis Mall',
    city: 'Ahmedabad',
    location: 'Thaltej Cross Road, SG Highway',
    totalScreens: 4,
    screens: [
      { screenName: 'Screen 1 - 4DX', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['4DX Experience', 'Dolby Atmos', 'Snack Bar']
  },
  // Jaipur
  {
    name: 'Raj Mandir Cinema',
    city: 'Jaipur',
    location: 'Bhagwan Das Road, C-Scheme',
    totalScreens: 1,
    screens: [
      { screenName: 'Main Heritage Hall', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['Heritage Architecture', 'Dolby 7.1', 'Royal Seating']
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies_db');
    console.log('[Seed] Connected to MongoDB');

    // Drop existing collections to purge old indexes
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.drop().catch(() => {});
    }
    console.log('[Seed] Dropped existing collections and indexes');

    // Seed Users (plain text so userSchema.pre('save') hashes properly once)
    const admin = await User.create({
      name: 'Admin Cinema Manager',
      email: 'admin@imovies.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 9876543210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    });

    const regularUser = await User.create({
      name: 'Rahul Sharma',
      email: 'user@imovies.com',
      password: 'user123',
      role: 'user',
      phone: '+91 9123456780',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    });

    console.log('[Seed] Seeded default users: admin@imovies.com and user@imovies.com');

    // Seed Movies
    const createdMovies = await Movie.insertMany(moviesData);
    console.log(`[Seed] Seeded ${createdMovies.length} movies`);

    // Seed Theatres
    const createdTheatres = await Theatre.insertMany(theatresData);
    console.log(`[Seed] Seeded ${createdTheatres.length} theatres`);

    // Seed Shows and 80-seat matrices
    const showTimes = ['10:30 AM', '02:15 PM', '06:45 PM', '10:00 PM'];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerRow = 10;

    let totalShowsCount = 0;
    let totalSeatsCount = 0;

    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
      const showDate = new Date();
      showDate.setDate(showDate.getDate() + dayOffset);
      showDate.setHours(0, 0, 0, 0);

      // Schedule for every theatre across every city
      for (let tIndex = 0; tIndex < createdTheatres.length; tIndex++) {
        const theatre = createdTheatres[tIndex];

        // Pick 2 alternating movies for this theatre
        const movie1 = createdMovies[tIndex % createdMovies.length];
        const movie2 = createdMovies[(tIndex + 1) % createdMovies.length];
        const assignedMovies = [movie1, movie2];

        for (let mIdx = 0; mIdx < assignedMovies.length; mIdx++) {
          const movie = assignedMovies[mIdx];
          const time = showTimes[mIdx * 2]; // e.g. 10:30 AM or 06:45 PM
          const pricing = { vip: 350, premium: 250, standard: 180 };

          const show = await Show.create({
            movie: movie._id,
            theatre: theatre._id,
            screenName: theatre.screens[0]?.screenName || 'Screen 1',
            showDate,
            showTime: time,
            format: theatre.screens[0]?.screenName.includes('IMAX') ? 'IMAX 3D' : (theatre.screens[0]?.screenName.includes('4DX') ? '4DX' : '2D'),
            pricing,
            totalSeats: 80,
            availableSeatsCount: 80
          });
          totalShowsCount++;

            // Create 80 seats
            const seats = [];
            for (const r of rows) {
              let tier = 'Standard';
              let price = pricing.standard;
              if (r === 'A' || r === 'B') {
                tier = 'VIP';
                price = pricing.vip;
              } else if (r === 'C' || r === 'D' || r === 'E') {
                tier = 'Premium';
                price = pricing.premium;
              }

              for (let n = 1; n <= seatsPerRow; n++) {
                seats.push({
                  show: show._id,
                  seatNumber: `${r}${n}`,
                  row: r,
                  number: n,
                  tier,
                  price,
                  status: 'available'
                });
              }
            }

            await Seat.insertMany(seats);
            totalSeatsCount += seats.length;
          }
        }
      }

    console.log(`[Seed] Successfully generated ${totalShowsCount} shows with ${totalSeatsCount} individual seats!`);

    // Create a demo booking for user
    const sampleShow = await Show.findOne({}).populate('movie').populate('theatre');
    if (sampleShow) {
      const bookedSeats = ['D4', 'D5'];
      await Seat.updateMany(
        { show: sampleShow._id, seatNumber: { $in: bookedSeats } },
        { $set: { status: 'booked' } }
      );
      sampleShow.availableSeatsCount -= 2;
      await sampleShow.save();

      const booking = await Booking.create({
        bookingId: 'IMOV-482910',
        user: regularUser._id,
        show: sampleShow._id,
        movie: sampleShow.movie._id,
        theatre: sampleShow.theatre._id,
        seats: bookedSeats,
        seatCount: 2,
        baseAmount: 500,
        convenienceFee: 30,
        taxes: 20,
        grandTotal: 550,
        bookingStatus: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'UPI',
        transactionId: 'TXN_DEMO_SEED_991'
      });

      await Payment.create({
        booking: booking._id,
        user: regularUser._id,
        amount: 550,
        currency: 'INR',
        paymentMethod: 'UPI',
        transactionId: 'TXN_DEMO_SEED_991',
        status: 'success',
        details: { upiId: 'rahul@okhdfcbank' }
      });

      await Notification.create({
        user: regularUser._id,
        title: '🎟️ Booking Confirmed!',
        message: `Your tickets for "${sampleShow.movie.title}" (D4, D5) at ${sampleShow.theatre.name} are confirmed! Booking ID: IMOV-482910`,
        type: 'booking_confirmed',
        metadata: { bookingId: booking._id }
      });
      console.log('[Seed] Created sample booking and notification for regular user');
    }

    console.log('✅ [Seed Completed Successfully!]');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
