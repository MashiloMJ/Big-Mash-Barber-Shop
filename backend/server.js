// ============================================
// BIG MASH BARBER SHOP SERVER
// ============================================

const express = require("express");
const cors = require("cors");

const barberRoutes = require("./routes/barberRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const staffRoutes = require("./routes/staffRoutes");

const adminRoutes = require("./routes/adminRoutes");

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

app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/staff", staffRoutes);

app.use("/api/admin", adminRoutes);

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