import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Access Denied. No token found." });
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();

    } catch (error) {
        console.error("JWT Verification Failed:", error.message);
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

export default protect;