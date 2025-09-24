require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const { sanitizeUser } = require('../utils/SanitizeUser');

exports.verifyToken = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ message: "Token missing, please login again" });
        }

        // verify token signature and expiration
        const decodedInfo = jwt.verify(token, process.env.SECRET_KEY);

        // check JTI against DB to prevent token replay
        const existingUser = await User.findById(decodedInfo._id);
        if (!existingUser || decodedInfo.jti !== existingUser.currentJTI) {
            return res.status(401).json({ message: "Token revoked or invalid, please login again" });
        }

        // attach user info to request
        req.user = decodedInfo;
        next();
    } catch (error) {
        console.log(error);

        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: "Token expired, please login again" });
        } else if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: "Invalid Token, please login again" });
        } else {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
};


