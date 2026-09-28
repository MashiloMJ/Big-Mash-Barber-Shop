const express = require("express");
const router = express.Router();

const pool = require("../db");

// ============================================
// GET ALL BARBERS
// ============================================

router.get("/", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT *
            FROM barbers
            ORDER BY id
        `);

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to load barbers"
        });
    }
});


// ============================================
// GET AVAILABLE TIMES FOR A BARBER
// ============================================

router.get("/:id/availability", async (req, res) => {

    const barberId = req.params.id;
    const date = req.query.date;

    try {

        if (!date) {

            return res.status(400).json({
                message: "Date is required"
            });
        }

        const result = await pool.query(`
            SELECT
                a.id,
                a.date,
                a.time
            FROM availability a
            WHERE a.barber_id = $1
            AND a.date = $2

            AND NOT EXISTS (
                SELECT 1
                FROM appointments ap
                WHERE ap.barber_id = a.barber_id
                AND ap.appointment_date = a.date
                AND ap.appointment_time = a.time
            )

            ORDER BY a.time
        `, [barberId, date]);

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to load availability"
        });
    }
});


// ============================================
// CREATE A NEW APPOINTMENT
// ============================================

router.post("/", async (req, res) => {

    const {
        barber_id,
        appointment_date,
        appointment_time,
        customer_name,
        customer_phone,
        customer_email,
        hairstyle,
        price,
        payment_method,
        payment_status
    } = req.body;

    try {

        // --------------------------------------------
        // Check required information
        // --------------------------------------------

        if (
            !barber_id ||
            !appointment_date ||
            !appointment_time ||
            !customer_name ||
            !customer_phone ||
            !customer_email ||
            !hairstyle ||
            !price ||
            !payment_method
        ) {

            return res.status(400).json({
                message: "Please provide all required booking information."
            });
        }


        // --------------------------------------------
        // Check if this time has already been booked
        // --------------------------------------------

        const existingAppointment = await pool.query(`
            SELECT id
            FROM appointments
            WHERE barber_id = $1
            AND appointment_date = $2
            AND appointment_time = $3
        `, [
            barber_id,
            appointment_date,
            appointment_time
        ]);


        if (existingAppointment.rows.length > 0) {

            return res.status(409).json({
                message: "This appointment time has already been booked."
            });
        }


        // --------------------------------------------
        // Create the appointment
        // --------------------------------------------

        const result = await pool.query(`
            INSERT INTO appointments (
                barber_id,
                appointment_date,
                appointment_time,
                customer_name,
                customer_phone,
                customer_email,
                hairstyle,
                price,
                payment_method,
                payment_status,
                status
            )

            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10,
                $11
            )

            RETURNING *
        `, [
            barber_id,
            appointment_date,
            appointment_time,
            customer_name,
            customer_phone,
            customer_email,
            hairstyle,
            price,
            payment_method,
            payment_status || "Paid",
            "Confirmed"
        ]);


        // --------------------------------------------
        // Send the new appointment back to React
        // --------------------------------------------

        res.status(201).json({
            message: "Appointment booked successfully.",
            appointment: result.rows[0]
        });

    } catch (error) {

        console.error("APPOINTMENT ERROR:", error);

        res.status(500).json({
            message: "Unable to create appointment.",
            error: error.message
        });
    }
});


// ============================================
// GET ALL APPOINTMENTS
// ============================================

router.get("/appointments", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT *
            FROM appointments
            ORDER BY appointment_date, appointment_time
        `);

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to load appointments"
        });
    }
});


// ============================================
// EXPORT ROUTER
// ============================================

module.exports = router;
