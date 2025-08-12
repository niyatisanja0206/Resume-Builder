const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        console.log('Auth header:', authHeader);
        
        const token = authHeader?.replace('Bearer ', '');
        console.log('Extracted token:', token ? token.substring(0, 20) + '...' : 'No token');
        
        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, 'your_jwt_secret');
        console.log('Token decoded successfully:', decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.log('Token verification error:', err.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = auth;
