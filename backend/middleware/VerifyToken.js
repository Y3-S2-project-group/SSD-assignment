require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const { sanitizeUser } = require('../utils/SanitizeUser');

exports.verifyToken = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        console.log('verifyToken: token exists:', token ? 'Yes' : 'No');

        if (!token) {
            console.log('verifyToken: No token found in cookies');
            return res.status(401).json({ message: "Token missing, please login again" });
        }

        // verify token signature and expiration
        const decodedInfo = jwt.verify(token, process.env.SECRET_KEY);
        console.log('verifyToken: Token decoded successfully, user ID:', decodedInfo._id);

        // check JTI against DB to prevent token replay
        const existingUser = await User.findById(decodedInfo._id);
        console.log('verifyToken: User found in DB:', existingUser ? 'Yes' : 'No');
        
        if (!existingUser || decodedInfo.jti !== existingUser.currentJTI) {
            console.log('verifyToken: JTI mismatch or user not found');
            console.log('Token JTI:', decodedInfo.jti);
            console.log('User currentJTI:', existingUser?.currentJTI);
            return res.status(401).json({ message: "Token revoked or invalid, please login again" });
        }

        console.log('verifyToken: Token verification successful');
        // attach user info to request
        req.user = decodedInfo;
        next();
    } catch (error) {
        console.log('verifyToken error:', error.message);

        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: "Token expired, please login again" });
        } else if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: "Invalid Token, please login again" });
        } else {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
};


