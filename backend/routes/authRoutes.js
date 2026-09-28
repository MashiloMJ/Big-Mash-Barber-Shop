const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

const JWT_SECRET = "big-mash-barber-shop-secret";

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check that email and password were provided
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        // Find the user by email
        const result = await pool.query(
            `SELECT
                id,
                name,
                email,
                password,
                role,
                barber_id
             FROM users
             WHERE email = $1`,
            [email]
        );

        // User does not exist
        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const user = result.rows[0];

        // Compare entered password with hashed password
        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        // Password is incorrect
        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }


// Create a JWT token
const token = jwt.sign(
    {
        id: user.id,
        role: user.role,
        barber_id: user.barber_id
    },
    JWT_SECRET,
    {
        expiresIn: "2h"
    }
);

// Login successful
res.json({
    message: "Login successful.",
    token: token,
    user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        barber_id: user.barber_id
    }
});

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to login."
        });
    }
});

//=====================================

const authenticateToken = require("../middleware/authMiddleware");
const requireSuperAdmin = require("../middleware/roleMiddleware");

// Protected profile route
router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                id,
                name,
                email,
                role,
                barber_id
             FROM users
             WHERE id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        res.json({
            message: "Protected profile accessed successfully.",
            user: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to load profile."
        });
    }
});

// Temporary Super Admin test route
router.get(
    "/admin-test",
    authenticateToken,
    requireSuperAdmin,
    (req, res) => {
        res.json({
            message: "Super Admin access confirmed."
        });
    }
);

//=======================================
module.exports = router;