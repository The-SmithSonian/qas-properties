/* =====================================================
QAS PROPERTIES - SITE CONTENT
Edit this file to change contact details, projects,
videos and the smart-living section. No other file
needs to change.
===================================================== */

const SITE = {

    name: "QAS Properties Nigeria Limited",

    shortName: "QAS Properties",

    tagline: "We build it, you love it.",

    address: "No 5 Kwaji Close, Maitama, Abuja FCT",

    phoneDisplay: "+234 913 888 8887",

    // Digits only, with the country code (used for call links)
    phoneLink: "+2349138888887",

    // Digits only, no + sign (used for WhatsApp links)
    whatsapp: "2349138888887",

    email: "qashodeinde@yahoo.com",


    /* -------------------------------------------------
    PROJECTS (construction showcase)
    While this list is empty, the Projects section is
    hidden. Add one block per project, like this:

    {
        title: "Project name",
        status: "Completed",        // Completed, Ongoing or Upcoming
        location: "Maitama, Abuja",
        description: "One or two sentences about the project.",
        image: "images/project-one.jpg"   // optional
    },
    ------------------------------------------------- */

    projects: [],


    /* -------------------------------------------------
    VIDEOS
    Paste YouTube links here (unlisted works fine).
    Videos you add to a property in the dashboard show up
    in this section automatically.

    { title: "Site walkthrough", url: "https://www.youtube.com/watch?v=XXXXXXXXXXX" },
    ------------------------------------------------- */

    videos: [],


    /* -------------------------------------------------
    SMART-HOME AND SECURITY
    Edit these so they match what your developments
    really include. Icons: lock, camera, bulb, bolt,
    shield, wifi
    ------------------------------------------------- */

    smartFeatures: [
        {
            icon: "lock",
            title: "Smart access",
            text: "Keyless entry and controlled access points."
        },
        {
            icon: "camera",
            title: "CCTV monitoring",
            text: "Camera coverage for entrances and perimeters."
        },
        {
            icon: "bulb",
            title: "Automated lighting",
            text: "Lighting that responds to time and movement."
        },
        {
            icon: "bolt",
            title: "Reliable power",
            text: "Backup power options for uninterrupted living."
        },
        {
            icon: "shield",
            title: "Secure perimeter",
            text: "Gated estates with controlled, guarded entrances."
        },
        {
            icon: "wifi",
            title: "Connected home",
            text: "Wiring and networking ready for home automation."
        }
    ],


    /* -------------------------------------------------
    HIGHLIGHTS (the numbers under the hero section)
    While this list is empty, the section is hidden.

    { value: "10+", label: "Years in business" },
    ------------------------------------------------- */

    stats: [],


    /* -------------------------------------------------
    TESTIMONIALS
    While this list is empty, the section is hidden.

    {
        quote: "What the client said about working with you.",
        name: "Client name",
        detail: "Buyer, Maitama"     // optional: role, area, etc.
    },
    ------------------------------------------------- */

    testimonials: [],


    /* -------------------------------------------------
    FREQUENTLY ASKED QUESTIONS
    While this list is empty, the section is hidden.

    {
        question: "Do you offer payment plans?",
        answer: "Yes, ask us about instalment options."
    },
    ------------------------------------------------- */

    faq: [

        {
            question: "How do I book an inspection?",
            answer: "Use the form on the Contact section, or reach us directly on WhatsApp, by phone or by email. We will arrange a time that works for you."
        },
        {
            question: "Do you offer payment plans?",
            answer: "This varies by property. Contact us with the listing you are interested in and we will go through what is available."
        },
        {
            question: "Are your properties fully documented?",
            answer: "Ask us for the documentation status of any specific property before you commit, and we will walk you through it."
        },
        {
            question: "Can I customize a build?",
            answer: "On select developments, yes. Tell us what you have in mind and we will let you know what is possible for that project."
        }

    ]

};
