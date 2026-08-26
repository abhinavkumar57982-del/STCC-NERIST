// ===== EVENTS DATA =====
// All events are stored here. Edit this file to add/change/remove events.
// Status (past/ongoing/upcoming) is calculated automatically based on dates.

const eventsData = [
    // ===== PAST EVENTS =====
    {
        id: "hackathon-2025",
        title: "Orientation cum Quiz Programme",
        startDate: "2025-11-08",
        startTime: "16:00",
        endDate: "2025-11-08",
        endTime: "19:00",
        venue: "CSE seminar hall, NERIST ",
        description: "Orientation cum Quiz Programme 25",
        image: "images/Orientation.png",
        registrationOpen: false,
        registrationUrl: "#",
        participants: 85,
        // highlights: [
        //     "24-hour coding marathon",
        //     "12 teams participated",
        //     "AI & Web Development focused",
        //     "Industry mentors from Google, Microsoft"
        // ],
        // winners: [
        //     { position: "🥇 1st", name: "Team Tech Titans - Parth Agarwal, Pratishtha Singh" },
        //     { position: "🥈 2nd", name: "Team Code Wizards - Aayan Tejani, Krish Goyal" },
        //     { position: "🥉 3rd", name: "Team Innovators - Lakshya Kushwaha, Kingshuk Haldar" }
        // ],
        gallery: [
            "images/events/gallery/hackathon1.jpg",
            "images/events/gallery/hackathon2.jpg",
            "images/events/gallery/hackathon3.jpg"
        ],
        certificatesAvailable: false
    },

    {
        id: "techsprint-2026",
        title: "TechSprint",
        startDate: "2025-12-21",
        startTime: "16:00",
        endDate: "2026-01-07",
        endTime: "19:00",
        venue: "CSE seminar hall, NERIST ",
        description: "GDG on Campus NERIST and the Student Tech & Coding Club (STCC) present Google TechSprint, an open innovation hackathon. Whether you're a solo coder or part of a team of 1–4, this is your stage to innovate!",
        image: "images/TechSprint.png",
        registrationOpen: false,
        registrationUrl: "#",
        participants: 120,
        highlights: [
            "Hackathon",
            "30 teams participated",
            "AI & Web Development focused",
            
        ],
        // winners: [
        //     { position: "🥇 1st", name: "Team Tech Titans - Parth Agarwal, Pratishtha Singh" },
        //     { position: "🥈 2nd", name: "Team Code Wizards - Aayan Tejani, Krish Goyal" },
        //     { position: "🥉 3rd", name: "Team Innovators - Lakshya Kushwaha, Kingshuk Haldar" }
        // ],
        gallery: [
            "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_center,h_540,q_auto:good,w_720/v1/gcs/platform-data-goog/event_wrapup/WhatsApp%2520Image%25202026-02-01%2520at%252023.06.25_p85u0sp.jpeg",
            "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_center,h_200,q_auto:good,w_200/v1/gcs/platform-data-goog/event_wrapup/WhatsApp%2520Image%25202026-02-01%2520at%252023.06.23_WbXOWiD.jpeg",
            "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_center,h_200,q_auto:good,w_200/v1/gcs/platform-data-goog/event_wrapup/WhatsApp%2520Image%25202026-02-01%2520at%252023.05.30_pwHwIMn.jpeg"
        ],
        certificatesAvailable: false
    },
    {
        id: "GDG FELICITATION CEREMONY",
        title: "GDG FELICITATION CEREMONY",
        startDate: "2026-05-09",
        startTime: "17:15",
        endDate: "2026-05-09",
        endTime: "20:00",
        venue: "Cse Seminar Hall, NERIST",
        description: "GDG FELICITATION CEREMONY",
        image: "images/felicitation.png",
        registrationOpen: false,
        registrationUrl: "#",
        participants: 60,
        highlights: [],
        winners: [],
        gallery: [
            "images/events/gallery/bootcamp1.jpg",
            "images/events/gallery/bootcamp2.jpg"
        ],
        certificatesAvailable: false
    },
    // {
    //     id: "ai-workshop",
    //     title: "AI & Machine Learning Workshop",
    //     startDate: "2025-06-20",
    //     startTime: "09:30",
    //     endDate: "2025-06-20",
    //     endTime: "17:00",
    //     venue: "NERIST Campus, Seminar Hall",
    //     description: "Hands-on workshop on Machine Learning fundamentals, neural networks, and real-world AI applications. Students trained models and deployed them.",
    //     image: "images/events/ai-workshop.jpg",
    //     registrationOpen: false,
    //     registrationUrl: "#",
    //     participants: 45,
    //     highlights: [
    //         "Introduction to Machine Learning",
    //         "Neural Networks explained",
    //         "Hands-on model training",
    //         "Real-world AI applications"
    //     ],
    //     winners: [],
    //     gallery: [
    //         "images/events/gallery/ai1.jpg",
    //         "images/events/gallery/ai2.jpg"
    //     ],
    //     certificatesAvailable: true
    // },

    // ===== ONGOING EVENT =====
    // {
    //     id: "coding-contest-2026",
    //     title: "STCC Coding Contest 2026",
    //     startDate: "2026-08-24", // Today's date
    //     startTime: "10:00",
    //     endDate: "2026-08-24",
    //     endTime: "19:00",
    //     venue: "NERIST Campus, Computer Lab",
    //     description: "Competitive programming contest with algorithmic challenges. Solve problems, earn points, and compete for the top spot on the leaderboard.",
    //     image: "images/events/coding-contest.jpg",
    //     registrationOpen: true,
    //     registrationUrl: "#",
    //     participants: 78,
    //     highlights: [
    //         "Algorithmic problem solving",
    //         "Time-based challenges",
    //         "Real-time leaderboard",
    //         "Prizes for top performers"
    //     ],
    //     winners: [],
    //     gallery: [],
    //     certificatesAvailable: false
    // },

    // ===== UPCOMING EVENTS =====
    // {
    //     id: "hackathon-2026",
    //     title: "STCC Hackathon 2026",
    //     startDate: "2026-09-15",
    //     startTime: "09:00",
    //     endDate: "2026-09-16",
    //     endTime: "18:00",
    //     venue: "NERIST Campus, Main Auditorium",
    //     description: "The biggest hackathon of the year! 36 hours of innovation, coding, and collaboration. Build something amazing and win exciting prizes.",
    //     image: "images/events/hackathon-2026.jpg",
    //     registrationOpen: true,
    //     registrationUrl: "#",
    //     participants: 0,
    //     highlights: [
    //         "36-hour coding marathon",
    //         "Theme: Sustainable Technology",
    //         "₹50,000+ in prizes",
    //         "Mentors from top companies"
    //     ],
    //     winners: [],
    //     gallery: [],
    //     certificatesAvailable: false
    // },
    // {
    //     id: "cyber-security-summit",
    //     title: "Cyber Security Summit 2026",
    //     startDate: "2026-10-10",
    //     startTime: "09:30",
    //     endDate: "2026-10-10",
    //     endTime: "17:00",
    //     venue: "NERIST Campus, Conference Hall",
    //     description: "A comprehensive summit covering modern cybersecurity threats, ethical hacking, network security, and career opportunities in the field.",
    //     image: "images/events/cyber-summit.jpg",
    //     registrationOpen: true,
    //     registrationUrl: "#",
    //     participants: 0,
    //     highlights: [
    //         "Ethical hacking workshop",
    //         "Network security essentials",
    //         "Live demos",
    //         "Career guidance"
    //     ],
    //     winners: [],
    //     gallery: [],
    //     certificatesAvailable: false
    // },
    // {
    //     id: "ai-conference-2026",
    //     title: "AI Conference 2026",
    //     startDate: "2026-11-20",
    //     startTime: "10:00",
    //     endDate: "2026-11-21",
    //     endTime: "17:00",
    //     venue: "NERIST Campus, Main Auditorium",
    //     description: "A 2-day conference on Artificial Intelligence, Machine Learning, and their applications. Featuring talks from industry experts and academic researchers.",
    //     image: "images/events/ai-conference.jpg",
    //     registrationOpen: true,
    //     registrationUrl: "#",
    //     participants: 0,
    //     highlights: [
    //         "Keynote speeches",
    //         "Paper presentations",
    //         "Panel discussions",
    //         "Networking opportunities"
    //     ],
    //     winners: [],
    //     gallery: [],
    //     certificatesAvailable: false
    // }
];

// ===== EXPORT =====
// For use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { eventsData };
}