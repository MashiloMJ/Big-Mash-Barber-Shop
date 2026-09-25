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

module.exports = router;