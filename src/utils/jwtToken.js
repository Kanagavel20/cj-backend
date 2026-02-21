const jwt = require("jsonwebtoken");

const JWT_SECRET = "cracker_junction_2026"; // move this to .env in real apps

// Generate token
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
};

// Verify token middleware
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Token missing"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = { generateToken, verifyToken };
