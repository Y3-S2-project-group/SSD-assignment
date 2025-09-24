const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { sanitizeUser } = require('../utils/SanitizeUser');

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/auth/google/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists with this Google ID
                let existingUser = await User.findOne({ googleId: profile.id });

                if (existingUser) {
                    return done(null, sanitizeUser(existingUser));
                }

                // Check if user exists with same email from regular signup
                existingUser = await User.findOne({ email: profile.emails[0].value });

                if (existingUser) {
                    // Link Google account to existing user
                    existingUser.googleId = profile.id;
                    existingUser.profilePicture = profile.photos[0].value;
                    existingUser.isVerified = true; // Google accounts are pre-verified
                    await existingUser.save();
                    
                    return done(null, sanitizeUser(existingUser));
                }

                // Create new user
                const newUser = new User({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    profilePicture: profile.photos[0].value,
                    authProvider: 'google',
                    isVerified: true // Google accounts are pre-verified
                });

                await newUser.save();
                return done(null, sanitizeUser(newUser));

            } catch (error) {
                console.error('Google OAuth Error:', error);
                return done(error, null);
            }
        }
    )
);

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, sanitizeUser(user));
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;