const jwt = require("jsonwebtoken");

const JWT_SECRET = "big-mash-barber-shop-secret";

// Check if the user has a valid login token
const authenticateToken = (req, res, next) => {
    try {
        // Get the Authorization header
        const authHeader = req.headers.authorization;

        // Check if the header exists
        if (!authHeader) {
            return res.status(401).json({
                message: "Access denied. Please login."
            });
        }

        // Expected format:
        // Bearer TOKEN
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Access denied. Token missing."
            });
        }

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Store the logged-in user's information
        // so other routes can use it
        req.user = decoded;

        // Continue to the requested route
        next();

    } catch (error) {
        console.error(error);

        return res.status(403).json({
            message: "Invalid or expired token."
        });
    }
};

module.exports = authenticateToken;