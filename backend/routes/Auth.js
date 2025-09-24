const express=require('express')
const router=express.Router()
const authController=require("../controllers/Auth")
const { verifyToken } = require('../middleware/VerifyToken')
const passport = require('../config/passport')

router
    .post("/signup",authController.signup)
    .post('/login',authController.login)
    .post("/verify-otp",authController.verifyOtp)
    .post("/resend-otp",authController.resendOtp)
    .post("/forgot-password",authController.forgotPassword)
    .post("/reset-password",authController.resetPassword)
    .get("/check-auth",verifyToken,authController.checkAuth)
    .get('/logout',authController.logout)
    // Google OAuth routes
    .get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
    .get('/google/callback', 
        passport.authenticate('google', { failureRedirect: '/api/auth/oauth/failure' }),
        authController.oauthSuccess
    )
    .get('/oauth/failure', authController.oauthFailure)


module.exports=router