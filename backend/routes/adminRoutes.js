const express = require("express");

const pool = require("../db");

const authenticateToken = require("../middleware/authMiddleware");
const requireSuperAdmin = require("../middleware/roleMiddleware");

const router = express.Router();




// ==========================================
// GET ALL BARBERS
// ==========================================
router.get(
    "/barbers",
    authenticateToken,
    requireSuperAdmin,
    async (req, res) => {
        try {
            // Get all barbers from the database
            const result = await pool.query(`
                SELECT
                    id,
                    name,
                    specialty
                FROM barbers
                ORDER BY id
            `);

            // Send the barbers back to the frontend
            res.json(result.rows);

        } catch (error) {
            // Show the real database error in the backend terminal
            console.error(error);

            res.status(500).json({
                message: "Unable to load barbers."
            });
        }
    }
);


// ==========================================
// ADD NEW BARBER
// ==========================================
// Only SUPER_ADMIN users can add barbers.

router.post(
    "/barbers",
    authenticateToken,
    requireSuperAdmin,
    async (req, res) => {

        try {

            // Get the barber details from the request
            const { name, specialty } = req.body;


            // Check that the barber name was provided
            if (!name) {

                return res.status(400).json({
                    message: "Barber name is required."
                });

            }


            // Add the barber to the database
            const result = await pool.query(
                `
                INSERT INTO barbers (name, specialty)
                VALUES ($1, $2)
                RETURNING id, name, specialty
                `,
                [
                    name,
                    specialty || null
                ]
            );


            // Send the newly created barber back
            res.status(201).json({

                message: "Barber added successfully.",

                barber: result.rows[0]

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message: "Unable to add barber."
            });

        }

    }
);

// ==========================================
// UPDATE BARBER
// ==========================================
// Only SUPER_ADMIN users can update barbers.

router.put(
    "/barbers/:id",
    authenticateToken,
    requireSuperAdmin,
    async (req, res) => {

        try {

            // Get the barber ID from the URL
            const { id } = req.params;

            // Get updated information
            const { name, specialty } = req.body;


            // Check that the barber name was provided
            if (!name) {

                return res.status(400).json({
                    message: "Barber name is required."
                });

            }


            // Update the barber
            const result = await pool.query(
                `
                UPDATE barbers
                SET
                    name = $1,
                    specialty = $2
                WHERE id = $3
                RETURNING id, name, specialty
                `,
                [
                    name,
                    specialty || null,
                    id
                ]
            );


            // Barber does not exist
            if (result.rows.length === 0) {

                return res.status(404).json({
                    message: "Barber not found."
                });

            }


            // Send updated barber back
            res.json({

                message: "Barber updated successfully.",

                barber: result.rows[0]

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message: "Unable to update barber."
            });

        }

    }
);

// ==========================================
// DELETE BARBER
// ==========================================
// Only SUPER_ADMIN users can delete barbers.

router.delete(
    "/barbers/:id",
    authenticateToken,
    requireSuperAdmin,
    async (req, res) => {

        try {

            // Get the barber ID from the URL
            const { id } = req.params;


            // Delete the barber
            const result = await pool.query(
                `
                DELETE FROM barbers
                WHERE id = $1
                RETURNING id, name, specialty
                `,
                [id]
            );


            // Barber does not exist
            if (result.rows.length === 0) {

                return res.status(404).json({
                    message: "Barber not found."
                });

            }


            // Confirm deletion
            res.json({

                message: "Barber deleted successfully.",

                barber: result.rows[0]

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message: "Unable to delete barber."
            });

        }

    }
);

// ==========================================
// GET ALL APPOINTMENTS
// ==========================================
// Super Admin can see appointments for
// all barbers.

router.get(
    "/appointments",
    authenticateToken,
    requireSuperAdmin,
    async (req, res) => {

        try {

            const result = await pool.query(`
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
                    a.status,
                    b.name AS barber_name
                FROM appointments a

                LEFT JOIN barbers b
                    ON a.barber_id = b.id

                ORDER BY
                    a.appointment_date ASC,
                    a.appointment_time ASC
            `);

            res.json(result.rows);

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message: "Unable to load appointments."
            });

        }

    }
);


// ==========================================
// GET ALL AVAILABILITY
// ==========================================
// Super Admin can see all barber
// availability slots.

router.get(
    "/availability",
    authenticateToken,
    requireSuperAdmin,
    async (req, res) => {

        try {

            const result = await pool.query(`
                SELECT
                    a.id,
                    a.date,
                    a.time,
                    a.barber_id,
                    b.name AS barber_name
                FROM availability a

                LEFT JOIN barbers b
                    ON a.barber_id = b.id

                ORDER BY
                    a.date ASC,
                    a.time ASC
            `);

            res.json(result.rows);

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message: "Unable to load availability."
            });

        }

    }
);


// ==========================================
// ADMIN DASHBOARD SUMMARY
// ==========================================
// Only SUPER_ADMIN users can access this route.
//
// This gives the Admin Dashboard some basic
// information about the barber shop.

router.get(
    "/dashboard",
    authenticateToken,
    requireSuperAdmin,
    async (req, res) => {

        try {

            // ------------------------------------------
            // Count barbers
            // ------------------------------------------

            const barberResult = await pool.query(`
                SELECT COUNT(*) AS total
                FROM barbers
            `);


            // ------------------------------------------
            // Count appointments
            // ------------------------------------------

            const appointmentResult = await pool.query(`
                SELECT COUNT(*) AS total
                FROM appointments
            `);


            // ------------------------------------------
            // Count available slots
            // ------------------------------------------

            const availabilityResult = await pool.query(`
                SELECT COUNT(*) AS total
                FROM availability
            `);


            // ------------------------------------------
            // Send dashboard information
            // ------------------------------------------

            res.json({

                message: "Super Admin dashboard data loaded.",

                statistics: {

                    totalBarbers:
                        Number(barberResult.rows[0].total),

                    totalAppointments:
                        Number(appointmentResult.rows[0].total),

                    totalAvailability:
                        Number(availabilityResult.rows[0].total)

                }

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message: "Unable to load admin dashboard data."
            });

        }

    }
);


module.exports = router;