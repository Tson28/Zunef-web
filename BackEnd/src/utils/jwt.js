const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const generateJWTToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '7d' // Token expires in 7 days
    });
};

const verifyJWTToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateJWTToken,
    verifyJWTToken
};