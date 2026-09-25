import { useEffect, useState } from "react";

import "./App.css";


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
            "https://images.unsplash.com/photo-1599351431202-1e0f0f0c4d3e?auto=format&fit=crop&w=700&q=80"
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

        setMessage("");

        if (!selectedBarber) {

            return;

        }


        try {

            const response = await fetch(
                `${API_URL}/barbers/${selectedBarber.id}/availability?date=${date}`
            );

            const data = await response.json();

            setSlots(data);

        } catch (error) {

            console.error(error);

            setMessage("Unable to load available times.");

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

            setBooking({

                ...data,

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
                                    src={barber.image_url}
                                    alt={barber.name}
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
                FOOTER
            ====================================== */}

            <footer>

                <div className="footer-content">

                    <div className="footer-brand">

                        <h2>
                            BIG <span>MASH</span>
                        </h2>

                        <p>
                            Premium cuts.
                            <br />
                            Sharp confidence.
                        </p>

                    </div>


                    <div className="footer-column">

                        <h4>
                            LOCATION
                        </h4>

                        <p>
                            Shop 30B
                        </p>

                        <p>
                            Nelson Mandela Square
                        </p>

                        <p>
                            5th Street, Sandton
                        </p>

                        <p>
                            Gauteng, 2031
                        </p>

                        <p>
                            South Africa
                        </p>

                    </div>


                    <div className="footer-column">

                        <h4>
                            QUICK LINKS
                        </h4>

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


                <div className="footer-bottom">

                    <p>
                        © 2026 Big Mash Barber Shop.
                        All rights reserved.
                    </p>

                </div>

            </footer>

        </div>

    );

}

export default App;