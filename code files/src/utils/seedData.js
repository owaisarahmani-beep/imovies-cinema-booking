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
    title: "Deadpool & Wolverine",
    description: "A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.",
    poster: "https://m.media-amazon.com/images/M/MV5BZTk5ODY0MmQtMzA3Ni00NGY1LThiYzItZThiNjFiNDM4MTM3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    banner: "https://image.tmdb.org/t/p/original/cOoVcVQ3i1m5b2xtqKBtoTSbxC1.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=73_1biulkYk",
    genre: ["Action","Comedy","Sci-Fi"],
    language: ["English","Hindi","Tamil","Telugu"],
    duration: 128,
    releaseDate: new Date('2024-07-26'),
    rating: 7.5,
    director: "Shawn Levy",
    cast: ["Ryan Reynolds","Hugh Jackman","Emma Corrin","Matthew Macfadyen"],
    certificate: "A"
  },
  {
    title: "Gladiator II",
    description: "Years after witnessing the death of Maximus at the hands of his uncle, Lucius must enter the Colosseum after the powerful emperors of Rome conquer his home. With rage in his heart and the future of the empire at stake, Lucius looks to his past to find strength.",
    poster: "https://m.media-amazon.com/images/M/MV5BMWYzZTM5ZGQtOGE5My00NmM2LWFlMDEtMGNjYjdmOWM1MzA1XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    banner: "https://image.tmdb.org/t/p/original/tOqIwliWMovSIZ9DyvHcHI7p2im.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=4rgYUipGJNo",
    genre: ["Action","Adventure","Drama"],
    language: ["English","Hindi"],
    duration: 148,
    releaseDate: new Date('2024-11-15'),
    rating: 6.4,
    director: "Ridley Scott",
    cast: ["Paul Mescal","Pedro Pascal","Denzel Washington","Connie Nielsen"],
    certificate: "A"
  },
  {
    title: "Dune: Part Two",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
    poster: "https://m.media-amazon.com/images/M/MV5BNTc0YmQxMjEtODI5MC00NjFiLTlkMWUtOGQ5NjFmYWUyZGJhXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    banner: "https://image.tmdb.org/t/p/original/eZ239CUp1d6OryZEBPnO2n87gMG.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    genre: ["Sci-Fi","Adventure","Action"],
    language: ["English","Hindi"],
    duration: 166,
    releaseDate: new Date('2024-03-01'),
    rating: 8.4,
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet","Zendaya","Rebecca Ferguson","Javier Bardem"],
    certificate: "U/A"
  },
  {
    title: "Kalki 2898 AD",
    description: "Set in a post-apocalyptic world in the year 2898 AD, a modern-day avatar of Vishnu descends to Earth to protect the world from evil forces. An epic sci-fi mythological spectacle traversing centuries.",
    poster: "https://m.media-amazon.com/images/M/MV5BMTM3ZGUwYTEtZTI5NS00ZmMyLTk2YmQtMWU4YjlhZTI3NjRjXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    banner: "https://image.tmdb.org/t/p/original/o8XSR1SONnjcsv84NRu6Mwsl5io.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=kQDd1AhGIHk",
    genre: ["Sci-Fi","Action","Mythology"],
    language: ["Hindi","Telugu","Tamil","English"],
    duration: 181,
    releaseDate: new Date('2024-06-27'),
    rating: 7,
    director: "Nag Ashwin",
    cast: ["Prabhas","Amitabh Bachchan","Kamal Haasan","Deepika Padukone"],
    certificate: "U/A"
  },
  {
    title: "Inside Out 2",
    description: "Teenager Riley’s mind undergoes a sudden demolition to make room for unexpected new Emotions: Anxiety, Envy, Ennui, and Embarrassment! Joy, Sadness, Anger, Fear, and Disgust navigate new territory.",
    poster: "https://m.media-amazon.com/images/M/MV5BYWY3MDE2Y2UtOTE3Zi00MGUzLTg2MTItZjE1ZWVkMGVlODRmXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    banner: "https://image.tmdb.org/t/p/original/xg27NrXi7VXCGUr7MG75UqLl6Vg.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=LEjhY15eCx0",
    genre: ["Animation","Comedy","Family"],
    language: ["English","Hindi"],
    duration: 96,
    releaseDate: new Date('2024-06-14'),
    rating: 7.5,
    director: "Kelsey Mann",
    cast: ["Amy Poehler","Maya Hawke","Kensington Tallman","Liza Lapira"],
    certificate: "U"
  },
  {
    title: "Stree 2: Sarkate Ka Aatank",
    description: "After the events of Stree, the town of Chanderi is haunted by a new headless ghost named Sarkata, who abducts women. Vicky and his friends must summon the original Stree to rescue their loved ones.",
    poster: "https://m.media-amazon.com/images/M/MV5BMTA1NmUxYzItZmVmNy00YmQxLTk4Y2UtZjVkMWUwMWQ5N2IxXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    banner: "https://image.tmdb.org/t/p/original/wFqJMVP0nrsgKeA2kwshRkIz1fw.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=KVnheXywIbY",
    genre: ["Comedy","Horror"],
    language: ["Hindi"],
    duration: 147,
    releaseDate: new Date('2024-08-15'),
    rating: 6.9,
    director: "Amar Kaushik",
    cast: ["Rajkummar Rao","Shraddha Kapoor","Pankaj Tripathi","Aparshakti Khurana"],
    certificate: "U/A"
  },
  {
    title: "Oppenheimer",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the Manhattan Project during World War II, changing humanity forever.",
    poster: "https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjg3YS00NmFiLWIyZmQtZTJmNTM5MjVmYTQ4XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    banner: "https://image.tmdb.org/t/p/original/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg",
    genre: ["Biography","Drama","History"],
    language: ["English","Hindi"],
    duration: 180,
    releaseDate: new Date('2023-07-21'),
    rating: 8.2,
    director: "Christopher Nolan",
    cast: ["Cillian Murphy","Emily Blunt","Matt Damon","Robert Downey Jr."],
    certificate: "A"
  },
  {
    title: "Interstellar (IMAX Re-Release)",
    description: "Celebrating its 10th anniversary in IMAX theatres. An astronaut team travels through a newly discovered wormhole in space to secure humanity’s survival.",
    poster: "https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    banner: "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    genre: ["Sci-Fi","Drama","Adventure"],
    language: ["English","Hindi"],
    duration: 169,
    releaseDate: new Date('2024-09-27'),
    rating: 8.7,
    director: "Christopher Nolan",
    cast: ["Matthew McConaughey","Anne Hathaway","Jessica Chastain"],
    certificate: "U/A"
  },
  {
    title: "Pushpa 2: The Rule",
    description: "The epic clash between Pushpa Raj and SP Bhanwar Singh Shekhawat escalates. Pushpa consolidates his sandalwood smuggling syndicate across international borders while defying the law.",
    poster: "https://m.media-amazon.com/images/M/MV5BNDM3N2UzM2UtMjEwMC00NGUzLThmMmQtNGMyM2VmMDA0ZWEwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    banner: "https://image.tmdb.org/t/p/original/7jGItf7idJsBm9QTNoTNTU3KiGe.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=1kVK0MZlbI4",
    genre: ["Action","Crime","Thriller"],
    language: ["Telugu","Hindi","Tamil","Kannada"],
    duration: 200,
    releaseDate: new Date('2024-12-05'),
    rating: 6,
    director: "Sukumar",
    cast: ["Allu Arjun","Rashmika Mandanna","Fahadh Faasil","Jagapathi Babu"],
    certificate: "A"
  },
  {
    title: "Moana 2",
    description: "After an unexpected call from her ancestral wayfinders, Moana journeys across the far seas of Oceania into dangerous uncharted waters for an adventure reunited with the demigod Maui.",
    poster: "https://m.media-amazon.com/images/M/MV5BZDUxNThhYTUtYjgxNy00MGQ4LTgzOTEtZjg1YTU5NTcwNThlXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    banner: "https://image.tmdb.org/t/p/original/zo8CIjJ2nfNOevqNajwMRO6Hwka.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=hDZ7y8RP5HE",
    genre: ["Animation","Adventure","Family"],
    language: ["English","Hindi"],
    duration: 100,
    releaseDate: new Date('2024-11-27'),
    rating: 6.3,
    director: "David Derrick Jr.",
    cast: ["Auli'i Cravalho","Dwayne Johnson","Alan Tudyk","Rachel House"],
    certificate: "U"
  },
  {
    title: "Venom: The Last Dance",
    description: "Eddie Brock and Venom are hunted by both of their worlds. With the net closing in rapidly, the duo are forced into a devastating choice that will bring down the curtains on their final dance.",
    poster: "https://m.media-amazon.com/images/M/MV5BZDMyYWU4NzItZDY0MC00ODE2LTkyYTMtMzNkNDdmYmFhZDg0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    banner: "https://image.tmdb.org/t/p/original/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=__2bjWbetsA",
    genre: ["Action","Sci-Fi","Adventure"],
    language: ["English","Hindi","Tamil","Telugu"],
    duration: 110,
    releaseDate: new Date('2024-10-25'),
    rating: 6,
    director: "Kelly Marcel",
    cast: ["Tom Hardy","Chiwetel Ejiofor","Juno Temple","Stephen Graham"],
    certificate: "U/A"
  },
  {
    title: "Wicked",
    description: "The untold journey of the witches of Oz: Elphaba, misunderstood for her emerald-green skin, and Glinda, the popular golden girl, whose friendship redefines the fate of the magical realm.",
    poster: "https://m.media-amazon.com/images/M/MV5BOWMwYjYzYmMtMWQ2Ni00NWUwLTg2MzAtYzkzMDBiZDIwOTMwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    banner: "https://image.tmdb.org/t/p/original/uKb22E0nlzr914bA9KyA5CVCOlV.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=6COmYeLsz4c",
    genre: ["Fantasy","Musical","Romance"],
    language: ["English","Hindi"],
    duration: 160,
    releaseDate: new Date('2024-11-22'),
    rating: 7.3,
    director: "Jon M. Chu",
    cast: ["Cynthia Erivo","Ariana Grande","Jonathan Bailey","Jeff Goldblum"],
    certificate: "U/A"
  },
  {
    title: "Bhool Bhulaiyaa 3",
    description: "Rooh Baba returns to resolve a haunting in a royal mansion, only to be confronted by two terrifying spirits claiming to be the authentic Manjulika. A hilarious and chilling mystery.",
    poster: "https://m.media-amazon.com/images/M/MV5BMGFhMDQ4MzMtMTUxOC00NDE0LTkzZWMtMzhhMGNiMDlhNDNmXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    banner: "https://image.tmdb.org/t/p/original/8JyMB2DQ61ow7wgRg09h1znjcRY.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=6YMY62tMLUA",
    genre: ["Comedy","Horror"],
    language: ["Hindi"],
    duration: 158,
    releaseDate: new Date('2024-11-01'),
    rating: 4.6,
    director: "Anees Bazmee",
    cast: ["Kartik Aaryan","Vidya Balan","Madhuri Dixit","Triptii Dimri"],
    certificate: "U/A"
  },
  {
    title: "Singham Again",
    description: "DCP Bajirao Singham leads a fierce inter-agency anti-terror team across India and Sri Lanka to rescue his kidnapped wife Avni from the ruthless terrorist Danger Lanka.",
    poster: "https://m.media-amazon.com/images/M/MV5BMjQzZDExZDEtYjAxYy00ZGVhLWE4YWItNTVkZjA5ZjVjZWM3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    banner: "https://image.tmdb.org/t/p/original/lexEx0B4WDOXGfqPTj4R8FCrE7H.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=MD7v0-igVIM",
    genre: ["Action","Drama","Thriller"],
    language: ["Hindi"],
    duration: 144,
    releaseDate: new Date('2024-11-01'),
    rating: 4.3,
    director: "Rohit Shetty",
    cast: ["Ajay Devgn","Kareena Kapoor Khan","Ranveer Singh","Akshay Kumar","Deepika Padukone","Tiger Shroff","Arjun Kapoor"],
    certificate: "U/A"
  },
  {
    title: "Drishyam The Conclusion",
    description: "The closed case involving Vijay Salgaonkar and his family is reopened as fresh revelations surface. With new law enforcement closing in, Vijay must execute his ultimate mastermind strategy to protect what he loves most.",
    poster: "https://m.media-amazon.com/images/M/MV5BMDIwNjYyZDctMGZhZS00YzUzLWFiZWItNjc3YTg5MDY5M2M1XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    banner: "https://image.tmdb.org/t/p/original/wk8Vu0DI0MiNLaXXiVqAwjLRKL5.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=cxA2y9Tgl7o",
    genre: ["Drama","Mystery","Thriller"],
    language: ["Hindi"],
    duration: 142,
    releaseDate: new Date('2026-10-02'),
    rating: 8.2,
    director: "Abhishek Pathak",
    cast: ["Ajay Devgn","Tabu","Jaideep Ahlawat","Shriya Saran","Ishita Dutta"],
    certificate: "U/A"
  },
  {
    title: "Doraemon: Castle of the Undersea Devil",
    description: "Nobita and his friends set out on an extraordinary underwater camping expedition in the deep ocean, discovering the legendary lost world of Mu and Atlantis while facing off against a dangerous automated menace.",
    poster: "https://m.media-amazon.com/images/M/MV5BNTZlMzRjZTUtZDVjNi00ODFiLWFmMzEtMzQ1ODIwOWQ3YjIwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    banner: "https://image.tmdb.org/t/p/original/t5aoFDZj4fn5TiSkzj7u5vD5Gib.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=S58dq7g2B7w",
    genre: ["Animation","Adventure","Family","Fantasy"],
    language: ["Hindi","Japanese","English"],
    duration: 95,
    releaseDate: new Date('2026-09-18'),
    rating: 6.2,
    director: "Tsutomu Shibayama",
    cast: ["Nobuyo Oyama","Noriko Ohara","Michiko Nomura","Kazuya Tatekabe"],
    certificate: "U"
  },
  {
    title: "Other Mommy",
    description: "Seven-year-old Bela begins interacting with an eerie presence that mirrors her mother’s exact appearance, whispering malevolent secrets and asking to enter inside her heart.",
    poster: "https://m.media-amazon.com/images/M/MV5BNWU2MzZlNmItYzVmYi00Y2Y4LWI4NTktNTg3NDE0MGE5NGRkXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    banner: "https://image.tmdb.org/t/p/original/fGRNCssTRrhYZxNzykGGCoMsAVq.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=FjzxI6uf8H8",
    genre: ["Horror","Thriller","Mystery"],
    language: ["English","Hindi"],
    duration: 98,
    releaseDate: new Date('2026-10-09'),
    rating: 6.4,
    director: "Rob Savage",
    cast: ["Jessica Chastain","Jay Duplass","Arabella Olivia Clark","Karen Allen","Dichen Lachman"],
    certificate: "A"
  },
  {
    title: "The Vvaan - Force of the Forrest",
    description: "During a sacred festive homecoming, a rational urban man transgresses village traditions by entering a forbidden ancient forest after sunset, unearthing folkloric powers and an awakening supernatural guardian.",
    poster: "https://m.media-amazon.com/images/M/MV5BZGQ3YWZlMjUtNDI1Zi00YjRjLTg2YzctMGU1MTkxMWU5M2U5XkEyXkFqcGc@._V1_.jpg",
    banner: "https://www.bollywoodhungama.com/wp-content/uploads/2024/11/The-Vvaan-1.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=LzGclxJdKKo",
    genre: ["Action","Adventure","Fantasy","Thriller"],
    language: ["Hindi"],
    duration: 138,
    releaseDate: new Date('2026-09-25'),
    rating: 8.5,
    director: "Deepak Kumar Mishra",
    cast: ["Sidharth Malhotra","Tamannaah Bhatia","Sunil Grover","Maniesh Paul","Shweta Tiwari"],
    certificate: "U/A"
  },
  {
    title: "Hanuman Ansh",
    description: "An inspirational biographical drama chronicling the transformative spiritual journey of young Lakshminarayan in pre-independence India, tracing the awakening of the beloved saint Neem Karoli Baba.",
    poster: "https://m.media-amazon.com/images/M/MV5BMGVkOWNlMjYtZWEzZi00OTA2LTg0NjktNGE5NDI5OTI5MGE0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    banner: "https://www.bollywoodhungama.com/wp-content/uploads/2026/08/Hanuman-Ansh-cover.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=YpGhCA2X3gU",
    genre: ["Biography","Drama","Devotional"],
    language: ["Hindi","Telugu"],
    duration: 135,
    releaseDate: new Date('2026-08-07'),
    rating: 9.6,
    director: "Vishal Chaturvedi",
    cast: ["Shobhinaw Satyaa","Chandan K Anand","Purnima Tiwari","Vihaan Shedge","Anil Rastogi"],
    certificate: "U"
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
  },
  // Patna
  {
    name: 'Cinépolis: P&M Mall',
    city: 'Patna',
    location: 'P&M Mall, Patliputra Kurji Road, Patliputra Colony',
    totalScreens: 3,
    screens: [
      { screenName: 'Screen 1 - 3D Dolby', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 },
      { screenName: 'Screen 2 - VIP Recliner', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['Dolby 7.1', '3D Projection', 'Food Court', 'Recliner Seats']
  },
  {
    name: 'Regent Cinema: Heritage Hall',
    city: 'Patna',
    location: 'East Gandhi Maidan, Near Mona Cinema, Patna Central',
    totalScreens: 2,
    screens: [
      { screenName: 'Screen 1 - 4K Laser', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['Dolby Atmos', '4K Laser Projection', 'Heritage Lounge', 'Snack Bar']
  },
  {
    name: 'PVR: City Centre Mall',
    city: 'Patna',
    location: 'City Centre Mall, Christian Quarters, Lodipur, Patna',
    totalScreens: 4,
    screens: [
      { screenName: 'IMAX Laser 1', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['IMAX Laser', 'Dolby Atmos', 'Gourmet Popcorn', 'Valet Parking']
  },
  // Gaya
  {
    name: 'Carnival Cinemas: Gaya Central',
    city: 'Gaya',
    location: 'Gaya Central Mall, Rai Kashinath More, Station Road',
    totalScreens: 2,
    screens: [
      { screenName: 'Screen 1 - Dolby Digital', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 },
      { screenName: 'Screen 2 - Sound Master', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['Dolby 7.1', 'Air Conditioned', 'Cafeteria', 'Pushback Seats']
  },
  {
    name: 'City Pride Multiplex',
    city: 'Gaya',
    location: 'Swarajpuri Road, Near Tower Chowk, Gaya',
    totalScreens: 2,
    screens: [
      { screenName: 'Screen 1 - 2K Laser', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['Dolby Sound', 'Digital 2K', 'Snack Bar']
  },
  // Muzaffarpur
  {
    name: 'Cinekrishna Multiplex: DRB Mall',
    city: 'Muzaffarpur',
    location: 'DRB Mall, Akharaghat Road, Muzaffarpur',
    totalScreens: 2,
    screens: [
      { screenName: 'Screen 1 - Atmos', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['Dolby Atmos', '4K Projection', 'Food Court']
  },
  // Bhagalpur
  {
    name: 'Deepraj Cinema: City Center',
    city: 'Bhagalpur',
    location: 'Station Road, Near Sujaganj, Bhagalpur',
    totalScreens: 1,
    screens: [
      { screenName: 'Screen 1 - Digital 2D', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['Dolby 7.1', 'Comfortable Seating', 'Snack Counter']
  },
  // Ranchi
  {
    name: 'PVR: Nucleus Mall',
    city: 'Ranchi',
    location: 'Circular Road, Lalpur, Ranchi',
    totalScreens: 4,
    screens: [
      { screenName: 'Screen 1 - 4K Laser', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['Dolby Atmos', 'Laser 4K', 'Recliners']
  },
  // Lucknow
  {
    name: 'PVR Superplex: Phoenix Palassio',
    city: 'Lucknow',
    location: 'Sector 7, Amar Shaheed Path, Gomti Nagar Extension',
    totalScreens: 5,
    screens: [
      { screenName: 'IMAX Laser 1', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['IMAX Laser', 'Dolby Atmos', 'Luxe Dining']
  },
  // Varanasi
  {
    name: 'JHV Cinemas: Mall Road',
    city: 'Varanasi',
    location: 'Cantonment, Mall Road, Varanasi',
    totalScreens: 3,
    screens: [
      { screenName: 'Screen 1 - Dolby 7.1', totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }
    ],
    facilities: ['Dolby 7.1', 'Food Lounge', 'Central Parking']
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

        // Assign 4 show times per theatre, rotating across all movies so all 19 get scheduled
        const assignedMovies = [
          createdMovies[(tIndex * 2 + dayOffset * 5) % createdMovies.length],
          createdMovies[(tIndex * 2 + 1 + dayOffset * 5) % createdMovies.length],
          createdMovies[(tIndex * 2 + 7 + dayOffset * 3) % createdMovies.length],
          createdMovies[(tIndex * 2 + 13 + dayOffset * 7) % createdMovies.length]
        ];

        for (let mIdx = 0; mIdx < assignedMovies.length; mIdx++) {
          const movie = assignedMovies[mIdx];
          const time = showTimes[mIdx]; // 10:30 AM, 02:15 PM, 06:45 PM, 10:00 PM
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
