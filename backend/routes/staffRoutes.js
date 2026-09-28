const express = require("express");
const pool = require("../db");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// GET BARBER APPOINTMENTS
// ==========================================
// A barber can only see their own appointments.

router.get("/appointments", authenticateToken, async (req, res) => {

    try {

        // Make sure the logged-in user is a barber
        if (req.user.role !== "BARBER") {
            return res.status(403).json({
                message: "Barber access only."
            });
        }


        // Get appointments belonging to this barber
        const result = await pool.query(
            `
            SELECT
                a.id,
                a.appointment_date,
                a.appointment_time,
                a.customer_name,
                a.customer_phone,
                a.customer_email,
                a.hairstyle,
                a.price,
                a.payment_method,
                a.payment_status,
                a.status
            FROM appointments a
            WHERE a.barber_id = $1
            ORDER BY
                a.appointment_date ASC,
                a.appointment_time ASC
            `,
            [req.user.barber_id]
        );


        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to load appointments."
        });

    }

});


// ==========================================
// GET BARBER AVAILABILITY
// ==========================================
// A barber can only view their own availability.

router.get("/availability", authenticateToken, async (req, res) => {

    try {

        // Only barbers can use this route
        if (req.user.role !== "BARBER") {
            return res.status(403).json({
                message: "Barber access only."
            });
        }

        const result = await pool.query(
            `
                SELECT
                    av.id,
                    TO_CHAR(av.date, 'YYYY-MM-DD') AS date,
                    TO_CHAR(av.time, 'HH24:MI:SS') AS time,

                    CASE
                        WHEN a.id IS NOT NULL THEN 'BOOKED'
                        ELSE 'AVAILABLE'
                    END AS status

                FROM availability av

                LEFT JOIN appointments a
                    ON a.barber_id = av.barber_id
                    AND a.appointment_date = av.date
                    AND a.appointment_time = av.time

                WHERE av.barber_id = $1

                ORDER BY
                    av.date ASC,
                    av.time ASC
            `,
            [req.user.barber_id]
        );

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to load availability."
        });

    }

});

module.exports = router;