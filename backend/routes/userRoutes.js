const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");

const router = express.Router();

// Create a new user
router.post("/create", async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            barber_id
        } = req.body;

        // Check required information
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "Name, email, password and role are required."
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the user
        const result = await pool.query(
            `INSERT INTO users
            (name, email, password, role, barber_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, email, role, barber_id`,
            [
                name,
                email,
                hashedPassword,
                role,
                barber_id || null
            ]
        );

        res.status(201).json({
            message: "User created successfully.",
            user: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to create user."
        });
    }
});

module.exports = router;