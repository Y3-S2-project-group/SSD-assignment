require('dotenv').config();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User'); 

// payload: sanitized user info
// passwordReset: flag to create a separate token for password reset
exports.generateToken = async (payload, passwordReset = false) => {
    const jti = uuidv4(); // unique token id
    console.log('generateToken: Creating token for user:', payload._id, 'JTI:', jti);

    // Add jti only for login tokens (not password reset)
    if (!passwordReset) {
        payload.jti = jti;

        // Save the JTI to DB for token revocation
        const updateResult = await User.findByIdAndUpdate(payload._id, { currentJTI: jti });
        console.log('generateToken: Updated user JTI in DB, user found:', updateResult ? 'Yes' : 'No');
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
    
    console.log('generateToken: Token generated successfully, length:', token.length);
    return token;
};
