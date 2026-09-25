// ============================================
// BIG MASH BARBER SHOP SERVER
// ============================================

const express = require("express");
const cors = require("cors");

const barberRoutes = require("./routes/barberRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const app = express();


// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());

app.use(express.json());


// ============================================
// TEST ROUTE
// ============================================

app.get("/", (req, res) => {

    res.json({
        message: "Big Mash Barber Shop API is running."
    });

});


// ============================================
// API ROUTES
// ============================================

app.use("/api/barbers", barberRoutes);

app.use("/api/appointments", appointmentRoutes);


// ============================================
// START SERVER
// ============================================

const PORT = 5000;

app.listen(PORT, () => {

    console.log(`
=========================================
 BIG MASH BARBER SHOP API
=========================================

 Server running on:
 http://localhost:${PORT}

=========================================
    `);

});