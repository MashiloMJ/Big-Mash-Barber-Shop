import { useEffect, useState } from "react";

import "./App.css";

import Login from "./Login";
import BarberDashboard from "./BarberDashboard";
import AdminDashboard from "./AdminDashboard";
import {
    downloadCalendarEvent
} from "./calendarUtils";



// ============================================
// API URL
// ============================================

const API_URL = "http://localhost:5000/api";


// ============================================
// HAIRSTYLES
// ============================================

const hairstyles = [

    {
        id: 1,
        name: "Low Fade",
        price: 180,
        image:
            "https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?auto=format&fit=crop&w=700&q=80"
    },

    {
        id: 2,
        name: "High Fade",
        price: 200,
        image:
            "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=700&q=80"
    },

    {
        id: 3,
        name: "Classic Cut",
        price: 150,
        image:
            "https://images.unsplash.com/photo-1703792686383-4f307cbfa544?auto=format&fit=crop&w=700&q=80"
    },

    {
        id: 4,
        name: "Fade + Beard",
        price: 250,
        image:
            "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=700&q=80"
    }

];


// ============================================
// BARBER FACE IMAGES
// ============================================
// These are frontend fallbacks so the staff faces still appear
// even when the database image_url field is empty or broken.

const barberImages = {

    John:
        "/images/barbers/john.png",

    Mike:
        "/images/barbers/mike.png",

    David:
        "/images/barbers/david.png"

};

const getBarberImage = (barber) => {

    return barberImages[barber?.name] ||
        "https://randomuser.me/api/portraits/men/75.jpg";

};


// ============================================
// CALENDAR EVENT HELPER
// ============================================

// const downloadCalendarEvent = ({
//     appointmentDate,
//     appointmentTime,
//     barberName,
//     hairstyle,
//     price,
//     customerName,
//     customerEmail
// }) => {

//     if (!appointmentDate || !appointmentTime) {
//         alert("The appointment date or time is missing.");
//         return;
//     }

//     const timeParts = String(appointmentTime)
//         .substring(0, 5)
//         .split(":");

//     const hours = Number(timeParts[0]);
//     const minutes = Number(timeParts[1]);

//     const startDate = new Date(
//         `${appointmentDate}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`
//     );

//     if (Number.isNaN(startDate.getTime())) {
//         alert("The appointment date or time is invalid.");
//         return;
//     }

//     // Big Mash uses 30-minute appointment slots.
//     const endDate = new Date(
//         startDate.getTime() + 30 * 60 * 1000
//     );

//     const formatCalendarDate = (date) => {

//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, "0");
//         const day = String(date.getDate()).padStart(2, "0");
//         const hour = String(date.getHours()).padStart(2, "0");
//         const minute = String(date.getMinutes()).padStart(2, "0");
//         const second = String(date.getSeconds()).padStart(2, "0");

//         return `${year}${month}${day}T${hour}${minute}${second}`;
//     };

//     const escapeICS = (value) =>
//         String(value || "")
//             .replace(/\\/g, "\\\\")
//             .replace(/;/g, "\\;")
//             .replace(/,/g, "\\,")
//             .replace(/\r?\n/g, "\\n");

//     const location =
//         "Shop 30B, Nelson Mandela Square, 5th Street, Sandton, Gauteng, 2031, South Africa";

//     const description =
//         `Service: ${hairstyle || "Haircut"}\n` +
//         `Barber: ${barberName || "Big Mash Barber"}\n` +
//         `Price: R${price || 0}\n` +
//         `Customer: ${customerName || "Customer"}\n` +
//         `Email: ${customerEmail || "Not provided"}`;

//     const calendarContent = [
//         "BEGIN:VCALENDAR",
//         "VERSION:2.0",
//         "PRODID:-//Big Mash Barber Shop//Booking//EN",
//         "CALSCALE:GREGORIAN",
//         "METHOD:PUBLISH",
//         "BEGIN:VEVENT",
//         `UID:big-mash-${Date.now()}@bigmash.co.za`,
//         `DTSTART:${formatCalendarDate(startDate)}`,
//         `DTEND:${formatCalendarDate(endDate)}`,
//         `SUMMARY:${escapeICS(`Big Mash Barber Shop - ${hairstyle || "Haircut"}`)}`,
//         `DESCRIPTION:${escapeICS(description)}`,
//         `LOCATION:${escapeICS(location)}`,
//         "STATUS:CONFIRMED",
//         "END:VEVENT",
//         "END:VCALENDAR"
//     ].join("\r\n");

//     const blob = new Blob(
//         [calendarContent],
//         { type: "text/calendar;charset=utf-8" }
//     );

//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");

//     link.href = url;
//     link.download = "big-mash-barber-appointment.ics";

//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);

//     URL.revokeObjectURL(url);
// };


// ============================================
// MAIN APP
// ============================================

function App() {

    // --------------------------------------------
    // DATA
    // --------------------------------------------

    const [barbers, setBarbers] = useState([]);

    const [selectedBarber, setSelectedBarber] = useState(null);

    const [selectedDate, setSelectedDate] = useState("");

    const [slots, setSlots] = useState([]);

    const [selectedTime, setSelectedTime] = useState("");

    const [selectedStyle, setSelectedStyle] = useState(null);


    // --------------------------------------------
    // CUSTOMER
    // --------------------------------------------

    const [customer, setCustomer] = useState({

        name: "",
        phone: "",
        email: ""

    });


    // --------------------------------------------
    // PAYMENT
    // --------------------------------------------

    const [paymentMethod, setPaymentMethod] = useState("Card");

    const [cardNumber, setCardNumber] = useState("");

    const [expiry, setExpiry] = useState("");

    const [cvv, setCvv] = useState("");


    // --------------------------------------------
    // BOOKING
    // --------------------------------------------

    const [booking, setBooking] = useState(null);

    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState("");

    const [mobileMenu, setMobileMenu] = useState(false);

    // Footer/legal/newsletter modal state.
    const [showNewsletter, setShowNewsletter] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [newsletterMessage, setNewsletterMessage] = useState("");


    // ============================================
    // LOAD BARBERS
    // ============================================

    useEffect(() => {

        fetch(`${API_URL}/barbers`)

            .then(response => response.json())

            .then(data => {

                setBarbers(data);

            })

            .catch(error => {

                console.error(error);

                setMessage("Unable to connect to the server.");

            });

    }, []);


    // ============================================
    // NEWSLETTER POPUP
    // ============================================

    useEffect(() => {

        const popupClosed =
            localStorage.getItem("bigMashNewsletterClosed");

        if (popupClosed === "true") {
            return;
        }

        const timer = setTimeout(() => {
            setShowNewsletter(true);
        }, 1200);

        return () => clearTimeout(timer);

    }, []);


    const closeNewsletter = () => {

        setShowNewsletter(false);

        localStorage.setItem(
            "bigMashNewsletterClosed",
            "true"
        );

    };


    const subscribeToNewsletter = (event) => {

        event.preventDefault();

        if (!newsletterEmail) {
            setNewsletterMessage(
                "Please enter your email address."
            );
            return;
        }

        setNewsletterMessage(
            "Thanks! You are on the Big Mash list."
        );

        localStorage.setItem(
            "bigMashNewsletterClosed",
            "true"
        );

        setTimeout(() => {
            setShowNewsletter(false);
        }, 900);

    };


    // ============================================
    // SELECT BARBER
    // ============================================

    const chooseBarber = (barber) => {

        setSelectedBarber(barber);

        setSelectedDate("");

        setSlots([]);

        setSelectedTime("");

        setBooking(null);

        document
            .getElementById("booking")
            ?.scrollIntoView({ behavior: "smooth" });

    };


    // ============================================
    // SELECT DATE
    // ============================================

const chooseDate = async (date) => {

    setSelectedDate(date);
    setSelectedTime("");
    setSlots([]);

    if (!selectedBarber) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/barbers/${selectedBarber.id}/availability?date=${date}`
        );


        const data = await response.json();


        // Check if the backend returned an error
        if (!response.ok) {

            console.error("Availability error:", data);

            setSlots([]);

            setMessage(
                data.details || "Unable to load available times."
            );

            return;
        }


        // Make sure the response is an array
        if (!Array.isArray(data)) {

            console.error(
                "Invalid availability response:",
                data
            );

            setSlots([]);

            setMessage(
                "Invalid availability response from the server."
            );

            return;
        }


        // Everything is okay
        setSlots(data);

        setMessage("");


    } catch (error) {

        console.error(
            "Failed to load availability:",
            error
        );

        setSlots([]);

        setMessage(
            "Could not connect to the booking server."
        );
    }
};


    // ============================================
    // CUSTOMER FORM
    // ============================================

    const updateCustomer = (event) => {

        setCustomer({

            ...customer,

            [event.target.name]: event.target.value

        });

    };


    // ============================================
    // PAYMENT VALIDATION
    // ============================================

    const paymentIsValid = () => {

        if (paymentMethod === "Cash") {

            return true;

        }

        if (
            cardNumber.replace(/\s/g, "").length < 12 ||
            expiry.length < 5 ||
            cvv.length < 3
        ) {

            return false;

        }

        return true;

    };


    // ============================================
    // CREATE BOOKING
    // ============================================

    const completeBooking = async (event) => {

        event.preventDefault();

        setMessage("");


        if (!selectedBarber) {

            setMessage("Please select a barber.");

            return;

        }


        if (!selectedDate || !selectedTime) {

            setMessage("Please select a date and time.");

            return;

        }


        if (!selectedStyle) {

            setMessage("Please select a hairstyle.");

            return;

        }


        if (
            !customer.name ||
            !customer.phone
        ) {

            setMessage("Please enter your name and phone number.");

            return;

        }


        if (!paymentIsValid()) {

            setMessage("Please enter valid payment details.");

            return;

        }


        setLoading(true);


        try {

            const response = await fetch(
                `${API_URL}/appointments`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        barber_id: selectedBarber.id,

                        appointment_date: selectedDate,

                        appointment_time: selectedTime,

                        customer_name: customer.name,

                        customer_phone: customer.phone,

                        customer_email: customer.email,

                        hairstyle: selectedStyle.name,

                        price: selectedStyle.price,

                        payment_method: paymentMethod

                    })

                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message || "Booking failed."
                );

            }


            // ----------------------------------------
            // Save booking
            // ----------------------------------------
            // The backend returns the actual appointment
            // inside data.appointment.

            setBooking({

                ...data.appointment,

                barber_name: selectedBarber.name

            });


            // ----------------------------------------
            // Clear payment fields
            // ----------------------------------------

            setCardNumber("");

            setExpiry("");

            setCvv("");


            // ----------------------------------------
            // Refresh available slots
            // ----------------------------------------

            chooseDate(selectedDate);


            // ----------------------------------------
            // Scroll to confirmation
            // ----------------------------------------

            setTimeout(() => {

                document
                    .getElementById("confirmation")
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });

            }, 200);


        } catch (error) {

            console.error(error);

            setMessage(error.message);

        } finally {

            setLoading(false);

        }

    };


    // ============================================
    // PRINT RECEIPT AS PNG IMAGE
    // ============================================

    const printReceipt = () => {

        if (!booking) {

            return;

        }


        // ----------------------------------------
        // Create receipt canvas
        // ----------------------------------------

        const canvas = document.createElement("canvas");

        canvas.width = 900;

        canvas.height = 1200;


        const ctx = canvas.getContext("2d");


        // Background

        ctx.fillStyle = "#ffffff";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        // ----------------------------------------
        // Helper functions
        // ----------------------------------------

        const centerText = (
            text,
            y,
            size = 30,
            bold = false
        ) => {

            ctx.font =
                `${bold ? "bold " : ""}${size}px Arial`;

            ctx.textAlign = "center";

            ctx.fillStyle = "#111111";

            ctx.fillText(
                text,
                canvas.width / 2,
                y
            );

        };


        const leftText = (
            text,
            x,
            y,
            size = 24,
            bold = false
        ) => {

            ctx.font =
                `${bold ? "bold " : ""}${size}px Arial`;

            ctx.textAlign = "left";

            ctx.fillStyle = "#111111";

            ctx.fillText(
                text,
                x,
                y
            );

        };


        // ----------------------------------------
        // Receipt header
        // ----------------------------------------

        centerText(
            "BIG MASH BARBER SHOP",
            90,
            42,
            true
        );

        centerText(
            "BOOKING RECEIPT",
            135,
            26,
            true
        );


        // ----------------------------------------
        // Divider
        // ----------------------------------------

        ctx.beginPath();

        ctx.moveTo(70, 170);

        ctx.lineTo(830, 170);

        ctx.stroke();


        // ----------------------------------------
        // Receipt details
        // ----------------------------------------

        let y = 225;

        leftText(
            `Receipt No: BM-${booking.id}`,
            70,
            y
        );

        y += 55;

        leftText(
            `Customer: ${booking.customer_name}`,
            70,
            y
        );

        y += 55;

        leftText(
            `Phone: ${booking.customer_phone}`,
            70,
            y
        );

        y += 55;

        leftText(
            `Barber: ${booking.barber_name}`,
            70,
            y
        );

        y += 55;

        leftText(
            `Date: ${booking.appointment_date}`,
            70,
            y
        );

        y += 55;

        leftText(
            `Time: ${booking.appointment_time}`,
            70,
            y
        );

        y += 55;

        leftText(
            `Hairstyle: ${booking.hairstyle}`,
            70,
            y
        );


        // ----------------------------------------
        // Price
        // ----------------------------------------

        y += 80;

        ctx.beginPath();

        ctx.moveTo(70, y - 35);

        ctx.lineTo(830, y - 35);

        ctx.stroke();


        leftText(
            "TOTAL",
            70,
            y,
            30,
            true
        );


        ctx.textAlign = "right";

        ctx.font = "bold 32px Arial";

        ctx.fillText(
            `R${Number(booking.price).toFixed(2)}`,
            830,
            y
        );


        // ----------------------------------------
        // Payment
        // ----------------------------------------

        y += 80;

        leftText(
            `Payment: ${booking.payment_method}`,
            70,
            y
        );

        y += 50;

        leftText(
            "Payment Status: PAID",
            70,
            y,
            25,
            true
        );


        // ----------------------------------------
        // Address
        // ----------------------------------------

        y += 90;

        centerText(
            "Shop 30B, Nelson Mandela Square",
            y,
            24
        );

        y += 38;

        centerText(
            "5th Street, Sandton, Gauteng, 2031",
            y,
            24
        );

        y += 38;

        centerText(
            "South Africa",
            y,
            24
        );


        // ----------------------------------------
        // Thank you
        // ----------------------------------------

        y += 80;

        centerText(
            "Thank you for choosing Big Mash!",
            y,
            26,
            true
        );


        // ----------------------------------------
        // Convert canvas to PNG
        // ----------------------------------------

        const image = canvas.toDataURL(
            "image/png"
        );


        // ----------------------------------------
        // Open receipt image
        // ----------------------------------------

        const printWindow =
            window.open("", "_blank");


        if (!printWindow) {

            alert(
                "Please allow pop-ups to print your receipt."
            );

            return;

        }


        printWindow.document.write(`

            <html>

                <head>

                    <title>
                        Big Mash Receipt
                    </title>

                    <style>

                        body {
                            margin: 0;
                            display: flex;
                            justify-content: center;
                            align-items: flex-start;
                            background: white;
                        }

                        img {
                            width: 100%;
                            max-width: 700px;
                        }

                        @media print {

                            body {
                                margin: 0;
                            }

                        }

                    </style>

                </head>

                <body>

                    <img
                        src="${image}"
                        alt="Big Mash Barber Shop Receipt"
                    />

                    <script>

                        window.onload = function() {

                            window.print();

                        };

                    <\/script>

                </body>

            </html>

        `);

        printWindow.document.close();

    };


    // ============================================
    // RESET BOOKING
    // ============================================

    const startNewBooking = () => {

        setBooking(null);

        setSelectedBarber(null);

        setSelectedDate("");

        setSlots([]);

        setSelectedTime("");

        setSelectedStyle(null);

        setCustomer({
            name: "",
            phone: "",
            email: ""
        });

        setPaymentMethod("Card");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };


    // ============================================
    // TODAY'S DATE
    // ============================================

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    // ============================================
    // RENDER
    // ============================================

    return (

        <div className="app">


            {/* =====================================
                NAVIGATION
            ====================================== */}

            <nav className="navbar">

                <div className="nav-container">

                    <a
                        href="#home"
                        className="logo"
                    >
                        BIG <span>MASH</span>
                    </a>


                    <button
                        className="menu-button"
                        onClick={() =>
                            setMobileMenu(!mobileMenu)
                        }
                    >
                        ☰
                    </button>


                    <div
                        className={
                            mobileMenu
                                ? "nav-links active"
                                : "nav-links"
                        }
                    >

                        <a href="#home">
                            Home
                        </a>

                        <a href="#barbers">
                            Barbers
                        </a>

                        <a href="#styles">
                            Hairstyles
                        </a>

                        <a href="#booking">
                            Book Now
                        </a>

                    </div>

                </div>

            </nav>


            {/* =====================================
                HERO
            ====================================== */}

            <section
                id="home"
                className="hero"
            >

                <div className="hero-content">

                    <p className="hero-small">
                        PREMIUM GROOMING
                    </p>

                    <h1>
                        YOUR STYLE.
                        <br />
                        <span>YOUR CONFIDENCE.</span>
                    </h1>

                    <p className="hero-text">
                        Professional barbering,
                        modern styles and a premium
                        experience at Big Mash Barber Shop.
                    </p>

                    <a
                        href="#barbers"
                        className="primary-button"
                    >
                        Book Your Cut
                    </a>

                </div>

            </section>


            {/* =====================================
                BARBERS
            ====================================== */}

            <section
                id="barbers"
                className="section"
            >

                <div className="section-heading">

                    <p>MEET THE TEAM</p>

                    <h2>
                        Choose Your Barber
                    </h2>

                </div>


                <div className="barber-grid">

                    {barbers.map(barber => (

                        <div
                            key={barber.id}
                            className={
                                selectedBarber?.id === barber.id
                                    ? "barber-card selected"
                                    : "barber-card"
                            }
                            onClick={() =>
                                chooseBarber(barber)
                            }
                        >

                            <div className="image-wrapper">

                                <img
                                    src={getBarberImage(barber)}
                                    alt={`${barber.name} barber face`}
                                    onError={(event) => {
                                        event.currentTarget.src =
                                            "https://randomuser.me/api/portraits/men/75.jpg";
                                    }}
                                />

                            </div>


                            <div className="card-content">

                                <h3>
                                    {barber.name}
                                </h3>

                                <p className="specialty">
                                    {barber.specialty}
                                </p>

                                <p>
                                    {barber.description}
                                </p>


                                <button>

                                    {selectedBarber?.id === barber.id
                                        ? "Selected ✓"
                                        : "Choose Barber"}

                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            </section>


            {/* =====================================
                HAIRSTYLES
            ====================================== */}

            <section
                id="styles"
                className="section dark-section"
            >

                <div className="section-heading">

                    <p>OUR SERVICES</p>

                    <h2>
                        Choose Your Style
                    </h2>

                </div>


                <div className="style-grid">

                    {hairstyles.map(style => (

                        <div
                            key={style.id}
                            className={
                                selectedStyle?.id === style.id
                                    ? "style-card selected"
                                    : "style-card"
                            }
                            onClick={() =>
                                setSelectedStyle(style)
                            }
                        >

                            <img
                                src={style.image}
                                alt={style.name}
                            />


                            <div className="style-overlay">

                                <h3>
                                    {style.name}
                                </h3>

                                <p>
                                    R{style.price}
                                </p>

                            </div>


                            {selectedStyle?.id === style.id && (

                                <div className="selected-badge">
                                    ✓ Selected
                                </div>

                            )}

                        </div>

                    ))}

                </div>

            </section>


            {/* =====================================
                BOOKING
            ====================================== */}

            <section
                id="booking"
                className="section booking-section"
            >

                <div className="section-heading">

                    <p>BOOKING</p>

                    <h2>
                        Make Your Appointment
                    </h2>

                </div>


                {/* ---------------------------------
                    STEP 1
                ---------------------------------- */}

                <div className="booking-step">

                    <div className="step-number">
                        01
                    </div>

                    <div>

                        <h3>
                            Select a Barber
                        </h3>

                        <p>
                            {selectedBarber
                                ? `Selected: ${selectedBarber.name}`
                                : "Choose your preferred barber above."}
                        </p>

                    </div>

                </div>


                {/* ---------------------------------
                    STEP 2
                ---------------------------------- */}

                <div className="booking-step">

                    <div className="step-number">
                        02
                    </div>

                    <div className="booking-field">

                        <h3>
                            Select Date
                        </h3>

                        <input
                            type="date"
                            min={today}
                            value={selectedDate}
                            disabled={!selectedBarber}
                            onChange={(event) =>
                                chooseDate(event.target.value)
                            }
                        />

                    </div>

                </div>


                {/* ---------------------------------
                    TIME SLOTS
                ---------------------------------- */}

                {selectedDate && (

                    <div className="slots-container">

                        <h3>
                            Available Times
                        </h3>


                        {slots.length === 0 ? (

                            <p className="empty-message">
                                No available slots for this date.
                            </p>

                        ) : (

                            <div className="slot-grid">

                                {slots.map(slot => (

                                    <button
                                        key={slot.id}
                                        className={
                                            selectedTime === slot.time
                                                ? "slot selected"
                                                : "slot"
                                        }
                                        onClick={() =>
                                            setSelectedTime(slot.time)
                                        }
                                    >

                                        {slot.time.substring(0, 5)}

                                    </button>

                                ))}

                            </div>

                        )}

                    </div>

                )}


                {/* ---------------------------------
                    STEP 3
                ---------------------------------- */}

                <div className="booking-step">

                    <div className="step-number">
                        03
                    </div>

                    <div>

                        <h3>
                            Hairstyle
                        </h3>

                        <p>

                            {selectedStyle
                                ? `${selectedStyle.name} — R${selectedStyle.price}`
                                : "Select a hairstyle above."}

                        </p>

                    </div>

                </div>


                {/* ---------------------------------
                    CUSTOMER DETAILS
                ---------------------------------- */}

                <div className="details-box">

                    <h3>
                        Customer Details
                    </h3>

                    <p>
                        Enter your details to continue
                        to payment.
                    </p>


                    <div className="form-grid">

                        <div className="form-group">

                            <label>
                                Full Name *
                            </label>

                            <input
                                type="text"
                                name="name"
                                placeholder="e.g. Mashilo Makgotho"
                                value={customer.name}
                                onChange={updateCustomer}
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Phone Number *
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                placeholder="e.g. 071 234 5678"
                                value={customer.phone}
                                onChange={updateCustomer}
                            />

                        </div>


                        <div className="form-group full">

                            <label>
                                Email Address
                            </label>

                            <input
                                type="email"
                                name="email"
                                placeholder="e.g. customer@email.com"
                                value={customer.email}
                                onChange={updateCustomer}
                            />

                        </div>

                    </div>

                </div>


                {/* ---------------------------------
                    PAYMENT
                ---------------------------------- */}

                <div className="payment-box">

                    <h3>
                        Simulated Payment
                    </h3>

                    <p>
                        This is a demonstration payment
                        system. No real money will be charged.
                    </p>


                    <div className="payment-methods">

                        <button
                            type="button"
                            className={
                                paymentMethod === "Card"
                                    ? "payment-method selected"
                                    : "payment-method"
                            }
                            onClick={() =>
                                setPaymentMethod("Card")
                            }
                        >
                            💳 Card
                        </button>


                        <button
                            type="button"
                            className={
                                paymentMethod === "Cash"
                                    ? "payment-method selected"
                                    : "payment-method"
                            }
                            onClick={() =>
                                setPaymentMethod("Cash")
                            }
                        >
                            💵 Cash
                        </button>

                    </div>


                    {paymentMethod === "Card" && (

                        <div className="form-grid">

                            <div className="form-group full">

                                <label>
                                    Card Number
                                </label>

                                <input
                                    type="text"
                                    placeholder="4242 4242 4242 4242"
                                    value={cardNumber}
                                    maxLength="19"
                                    onChange={(event) =>
                                        setCardNumber(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Expiry
                                </label>

                                <input
                                    type="text"
                                    placeholder="MM/YY"
                                    value={expiry}
                                    maxLength="5"
                                    onChange={(event) =>
                                        setExpiry(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    CVV
                                </label>

                                <input
                                    type="password"
                                    placeholder="123"
                                    value={cvv}
                                    maxLength="4"
                                    onChange={(event) =>
                                        setCvv(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>

                    )}


                    {selectedStyle && (

                        <div className="payment-summary">

                            <div>

                                <span>
                                    Hairstyle
                                </span>

                                <strong>
                                    {selectedStyle.name}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Barber
                                </span>

                                <strong>
                                    {selectedBarber?.name || "-"}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Date
                                </span>

                                <strong>
                                    {selectedDate || "-"}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Time
                                </span>

                                <strong>
                                    {selectedTime || "-"}
                                </strong>

                            </div>


                            <div className="total">

                                <span>
                                    Total
                                </span>

                                <strong>
                                    R{selectedStyle.price}
                                </strong>

                            </div>

                        </div>

                    )}


                    {message && (

                        <div className="error-message">
                            {message}
                        </div>

                    )}


                    <button
                        className="confirm-button"
                        onClick={completeBooking}
                        disabled={loading}
                    >

                        {loading
                            ? "Processing..."
                            : `Pay R${selectedStyle?.price || 0} & Confirm Booking`}

                    </button>

                </div>

            </section>


            {/* =====================================
                CONFIRMATION
            ====================================== */}

            {booking && (

                <section
                    id="confirmation"
                    className="confirmation-section"
                >

                    <div className="confirmation-card">

                        <div className="success-icon">
                            ✓
                        </div>


                        <p className="success-label">
                            BOOKING CONFIRMED
                        </p>


                        <h2>
                            You're All Set!
                        </h2>


                        <p>
                            Your appointment has been
                            successfully booked.
                        </p>


                        <div className="booking-receipt">

                            <div>

                                <span>
                                    Booking Number
                                </span>

                                <strong>
                                    BM-{booking.id}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Barber
                                </span>

                                <strong>
                                    {booking.barber_name}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Hairstyle
                                </span>

                                <strong>
                                    {booking.hairstyle}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Date
                                </span>

                                <strong>
                                    {booking.appointment_date}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Time
                                </span>

                                <strong>
                                    {booking.appointment_time}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Amount Paid
                                </span>

                                <strong>
                                    R{Number(booking.price).toFixed(2)}
                                </strong>

                            </div>

                        </div>


                        <div className="confirmation-buttons">

                            <button
                                className="print-button"
                                onClick={printReceipt}
                            >
                                🖨 Print Receipt
                            </button>


                            <button
                                className="calendar-button"
                                onClick={() =>
                                    downloadCalendarEvent({
                                        appointmentDate: booking.appointment_date,
                                        appointmentTime: booking.appointment_time,
                                        barberName: booking.barber_name,
                                        hairstyle: booking.hairstyle,
                                        price: booking.price,
                                        customerName: booking.customer_name,
                                        customerEmail: booking.customer_email
                                    })
                                }
                            >
                                📅 Add to Calendar
                            </button>


                            <button
                                className="new-booking-button"
                                onClick={startNewBooking}
                            >
                                New Booking
                            </button>

                        </div>

                    </div>

                </section>

            )}


            {/* =====================================
                PROFESSIONAL FOOTER
            ====================================== */}

            <footer>

                <div className="footer-content">

                    <div className="footer-brand">

                        <h2>
                            BIG <span>MASH</span>
                        </h2>

                        <p>
                            Premium cuts.<br />
                            Sharp confidence.
                        </p>

                        <p className="footer-tagline">
                            Modern barbering and a premium grooming experience.
                        </p>

                    </div>


                    <div className="footer-column">

                        <h4>LOCATION</h4>

                        <p>Shop 30B</p>
                        <p>Nelson Mandela Square</p>
                        <p>5th Street, Sandton</p>
                        <p>Gauteng, 2031</p>
                        <p>South Africa</p>

                    </div>


                    <div className="footer-column">

                        <h4>OPENING HOURS</h4>

                        <p>Monday - Friday: 09:00 - 18:00</p>
                        <p>Saturday: 09:00 - 16:00</p>
                        <p>Sunday: 10:00 - 15:00</p>

                        <a href="#booking" className="footer-book-link">
                            Book an Appointment →
                        </a>

                    </div>


                    <div className="footer-column">

                        <h4>QUICK LINKS</h4>

                        <a href="#home">Home</a>
                        <a href="#barbers">Barbers</a>
                        <a href="#styles">Hairstyles</a>
                        <a href="#booking">Book Now</a>

                    </div>


                    <div className="footer-column">

                        <h4>CONNECT</h4>

                        <a
                            href="https://www.facebook.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Facebook ↗
                        </a>

                        <a
                            href="https://www.tiktok.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            TikTok ↗
                        </a>

                        <h4 className="legal-heading">LEGAL</h4>

                        <a
                            href="#terms"
                            onClick={(event) => {
                                event.preventDefault();
                                setShowTerms(true);
                            }}
                        >
                            Terms & Conditions
                        </a>

                        <a
                            href="#privacy"
                            onClick={(event) => {
                                event.preventDefault();
                                setShowPrivacy(true);
                            }}
                        >
                            Privacy Notice
                        </a>

                    </div>

                </div>


                <div className="footer-bottom">

                    <p>
                        © 2026 Big Mash Barber Shop.
                        All rights reserved.
                    </p>

                </div>

            </footer>


            {/* ====================================================
                NEWSLETTER POPUP
            ==================================================== */}

            {showNewsletter && (

                <div
                    className="modal-overlay newsletter-overlay"
                    onClick={closeNewsletter}
                >

                    <div
                        className="newsletter-modal"
                        onClick={(event) => event.stopPropagation()}
                    >

                        <button
                            className="modal-close"
                            onClick={closeNewsletter}
                            aria-label="Close newsletter popup"
                        >
                            ×
                        </button>

                        <p className="popup-label">BIG MASH NEWS</p>

                        <h2>Stay Fresh With Us</h2>

                        <p>
                            Join the Big Mash newsletter for new hairstyle
                            inspiration, booking announcements and special
                            grooming offers.
                        </p>

                        <form onSubmit={subscribeToNewsletter}>

                            <input
                                type="email"
                                placeholder="Your email address"
                                value={newsletterEmail}
                                onChange={(event) =>
                                    setNewsletterEmail(event.target.value)
                                }
                                aria-label="Email address"
                            />

                            <button type="submit" className="popup-book-button">
                                Subscribe
                            </button>

                        </form>

                        {newsletterMessage && (
                            <p className="newsletter-message">
                                {newsletterMessage}
                            </p>
                        )}

                        <button
                            className="popup-dismiss"
                            onClick={closeNewsletter}
                        >
                            No thanks
                        </button>

                    </div>

                </div>

            )}


            {/* ====================================================
                TERMS & CONDITIONS
            ==================================================== */}

            {showTerms && (

                <div
                    className="modal-overlay"
                    onClick={() => setShowTerms(false)}
                >

                    <div
                        className="legal-modal"
                        onClick={(event) => event.stopPropagation()}
                    >

                        <button
                            className="modal-close legal-close"
                            onClick={() => setShowTerms(false)}
                            aria-label="Close Terms and Conditions"
                        >
                            ×
                        </button>

                        <p className="legal-label">LEGAL</p>
                        <h2>Terms & Conditions</h2>

                        <p className="legal-intro">
                            These terms explain how the Big Mash Barber Shop
                            online booking service is intended to be used.
                        </p>

                        <div className="legal-section">
                            <h3>1. Appointments</h3>
                            <p>
                                Customers may select an available barber,
                                service, date and time through the booking
                                system. A booking is confirmed only after
                                the system successfully accepts the
                                appointment.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h3>2. Customer Details</h3>
                            <p>
                                Customers must provide accurate information
                                when making a booking. This includes the
                                customer's name and phone number and, where
                                provided, an email address.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h3>3. Services and Prices</h3>
                            <p>
                                The services and prices displayed on the
                                website are the services and prices made
                                available through the booking system at the
                                time of booking. Big Mash may update its
                                service list and pricing when required.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h3>4. Appointment Times</h3>
                            <p>
                                Customers should arrive on time for their
                                selected appointment. Available times are
                                based on the slots shown by the booking
                                system.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h3>5. Payment</h3>
                            <p>
                                The payment feature in this assessment
                                application is simulated. No real card or
                                cash transaction is processed by the demo
                                payment form.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h3>6. Cancellations and Changes</h3>
                            <p>
                                If an appointment needs to be changed or
                                cancelled, the customer should contact the
                                barber shop using the contact details made
                                available by the business.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h3>7. Consumer Protection</h3>
                            <p>
                                Services are intended to be provided in
                                accordance with applicable South African
                                consumer-protection requirements. Nothing
                                in these terms is intended to remove a
                                consumer right that cannot lawfully be
                                excluded.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h3>8. Personal Information</h3>
                            <p>
                                Personal information supplied through the
                                booking system is intended for appointment
                                administration and related customer
                                communication. The handling of personal
                                information should comply with applicable
                                South African privacy requirements.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h3>9. Website Use</h3>
                            <p>
                                Users must not intentionally interfere with
                                the security, availability or normal
                                operation of the booking website.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h3>10. Contact</h3>
                            <p>
                                Big Mash Barber Shop<br />
                                Shop 30B, Nelson Mandela Square<br />
                                5th Street, Sandton, Gauteng, 2031<br />
                                South Africa
                            </p>
                        </div>

                    </div>

                </div>

            )}


            {/* ====================================================
                PRIVACY NOTICE
            ==================================================== */}

            {showPrivacy && (

                <div
                    className="modal-overlay"
                    onClick={() => setShowPrivacy(false)}
                >

                    <div
                        className="legal-modal"
                        onClick={(event) => event.stopPropagation()}
                    >

                        <button
                            className="modal-close legal-close"
                            onClick={() => setShowPrivacy(false)}
                            aria-label="Close Privacy Notice"
                        >
                            ×
                        </button>

                        <p className="legal-label">LEGAL</p>
                        <h2>Privacy Notice</h2>

                        <p className="legal-intro">
                            This notice explains the information used by the
                            Big Mash online booking experience.
                        </p>

                        <div className="legal-section">
                            <h3>Information Collected</h3>
                            <p>
                                The booking form may collect your name, phone
                                number, email address, selected barber,
                                hairstyle, appointment date and appointment
                                time.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h3>Purpose</h3>
                            <p>
                                The information is used to create and manage
                                appointments, identify the customer linked to
                                a booking and communicate about the booking
                                where necessary.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h3>Marketing</h3>
                            <p>
                                The newsletter popup is optional. Customers
                                can close it or choose not to subscribe. A
                                newsletter subscription should only be used
                                for the communication described when the
                                customer subscribes.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h3>Protection</h3>
                            <p>
                                Appropriate technical and organisational
                                measures should be used to protect personal
                                information against unauthorised access,
                                loss, misuse or disclosure.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h3>South African Privacy Law</h3>
                            <p>
                                Personal information should be handled in
                                accordance with applicable South African
                                privacy requirements, including the
                                Protection of Personal Information Act
                                (POPIA).
                            </p>
                        </div>

                        <div className="legal-section">
                            <h3>Contact</h3>
                            <p>
                                For questions about information submitted
                                through the booking system, contact Big Mash
                                Barber Shop at the shop address shown in the
                                footer.
                            </p>
                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

// ============================================================
// STAFF APP ROUTER
// ============================================================
// Public customers stay on the original Big Mash homepage.
// Staff members use /login and /dashboard.
// Barber Dashboard remains view-only.
// Super Admin keeps full admin access.
// ============================================================

export function StaffApp() {

    const [user, setUser] = useState(() => {

        const savedUser = localStorage.getItem("user");

        return savedUser
            ? JSON.parse(savedUser)
            : null;

    });

    const [currentPath, setCurrentPath] =
        useState(window.location.pathname);


    useEffect(() => {

        const handlePopState = () => {
            setCurrentPath(window.location.pathname);
        };

        window.addEventListener(
            "popstate",
            handlePopState
        );

        return () => {
            window.removeEventListener(
                "popstate",
                handlePopState
            );
        };

    }, []);


    const goTo = (path) => {

        window.history.pushState({}, "", path);

        setCurrentPath(path);

    };


    const handleLogin = (loggedInUser) => {

        setUser(loggedInUser);
        goTo("/dashboard");

    };


    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);

        goTo("/");

    };


    if (currentPath === "/" || currentPath === "/book") {
        return <App />;
    }


    if (currentPath === "/login") {
        return <Login onLogin={handleLogin} />;
    }


    if (currentPath === "/dashboard") {

        if (user?.role === "BARBER") {

            return (
                <BarberDashboard
                    user={user}
                    onLogout={handleLogout}
                />
            );

        }

        if (user?.role === "SUPER_ADMIN") {

            return (
                <AdminDashboard
                    user={user}
                    onLogout={handleLogout}
                />
            );

        }

        return <Login onLogin={handleLogin} />;

    }


    return <App />;

}


export default App;