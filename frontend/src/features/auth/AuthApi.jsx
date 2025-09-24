import {axiosi} from '../../config/axios'

export const signup=async(cred)=>{
    try {
        const res=await axiosi.post("api/auth/signup",cred)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}
export const login=async(cred)=>{
    try {
        const res=await axiosi.post("api/auth/login",cred)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}

// Google OAuth login - redirect to backend
export const loginWithGoogle = () => {
    window.location.href = `${process.env.REACT_APP_BASE_URL}/api/auth/google`;
}

export const verifyOtp=async(cred)=>{
    try {
        const res=await axiosi.post("api/auth/verify-otp",cred)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}
export const resendOtp=async(cred)=>{
    try {
        const res=await axiosi.post("api/auth/resend-otp",cred)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}
export const forgotPassword=async(cred)=>{
    try {
        const res=await axiosi.post("api/auth/forgot-password",cred)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}
export const resetPassword=async(cred)=>{
    try {
        const res=await axiosi.post("api/auth/reset-password",cred)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}
export const checkAuth=async(cred)=>{
    try {
        const res=await axiosi.get("api/auth/check-auth")
        return res.data
    } catch (error) {
        throw error.response.data
    }
}
export const logout=async()=>{
    try {
        const res=await axiosi.get("api/auth/logout")
        return res.data
    } catch (error) {
        throw error.response.data
    }
}