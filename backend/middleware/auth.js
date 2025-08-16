const jwt = require('jsonwebtoken');
require('dotenv').config(); // Make sure environment variables are loaded

const auth = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            return res.status(401).json({ message: 'No authorization header, authorization denied' });
        }

        const token = authHeader.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // **FIX 1: Use the JWT_SECRET from environment variables to match the controller**
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // **FIX 2: Assign the nested 'user' object from the payload to req.user**
        // This ensures req.user.email and req.user.id are available in other controllers.
        req.user = decoded.user; 
        
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = auth;
