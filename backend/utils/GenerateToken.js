require('dotenv').config();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User'); 

// payload: sanitized user info
// passwordReset: flag to create a separate token for password reset
exports.generateToken = async (payload, passwordReset = false) => {
    const jti = uuidv4(); // unique token id

    // Add jti only for login tokens (not password reset)
    if (!passwordReset) {
        payload.jti = jti;

        // Save the JTI to DB for token revocation
        await User.findByIdAndUpdate(payload._id, { currentJTI: jti });
    }

    const token = jwt.sign(
        payload,
        process.env.SECRET_KEY,
        {
            expiresIn: passwordReset
                ? process.env.PASSWORD_RESET_TOKEN_EXPIRATION
                : process.env.LOGIN_TOKEN_EXPIRATION || '24h', // short-lived token
        }
    );
    
    return token;
};
