const express = require("express");
const router = express.Router();

const pool = require("../db");


// =====================================================
// GET ALL BARBERS
// =====================================================

router.get("/", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT *
            FROM barbers
            ORDER BY id
        `);

        res.json(result.rows);

    } catch (error) {

        console.error("GET BARBERS ERROR:", error);

        res.status(500).json({
            error: "Failed to load barbers",
            details: error.message
        });
    }
});


// =====================================================
// GET AVAILABLE TIME SLOTS
// =====================================================

router.get("/:id/availability", async (req, res) => {

    try {

        const barberId = req.params.id;
        const selectedDate = req.query.date;

        console.log(
            `Checking availability for barber ${barberId} on ${selectedDate}`
        );


        // Check that a date was supplied
        if (!selectedDate) {

            return res.status(400).json({
                error: "Date is required"
            });

        }


        // Get available slots
        const result = await pool.query(
            `
            SELECT 
                id,
                barber_id,
                date,
                time
            FROM availability
            WHERE barber_id = $1
            AND date = $2
            AND NOT EXISTS (
                SELECT 1
                FROM appointments
                WHERE appointments.barber_id = availability.barber_id
                AND appointments.appointment_date = availability.date
                AND appointments.appointment_time = availability.time
            )
            ORDER BY time
            `,
            [barberId, selectedDate]
        );


        console.log("Available slots:", result.rows);


        // Send the array to React
        res.json(result.rows);


    } catch (error) {

        console.error("AVAILABILITY ERROR:", error);

        res.status(500).json({
            error: "Failed to load availability",
            details: error.message
        });
    }
});


module.exports = router;