require("dotenv").config()
const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const cookieParser = require("cookie-parser")
const authRoutes = require("./routes/Auth")
const productRoutes = require("./routes/Product")
const orderRoutes = require("./routes/Order")
const cartRoutes = require("./routes/Cart")
const brandRoutes = require("./routes/Brand")
const categoryRoutes = require("./routes/Category")
const userRoutes = require("./routes/User")
const addressRoutes = require("./routes/Address")
const reviewRoutes = require("./routes/Review")
const wishlistRoutes = require("./routes/Wishlist")
const { connectToDB } = require("./database/db")

const path = require("path")
const helmet = require("helmet")

// server init
const server = express()

// CSP middleware
server.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data:; " +
    "object-src 'none'; " +
    "frame-ancestors 'self'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );
  next();
});

// database connection
connectToDB()

// SECURITY HEADERS - Apply early in middleware chain
//.HSTS Header - Only in production or when HTTPS is available
server.use((req, res, next) => {
  // Only set HSTS if connection is secure
  if (req.secure || req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production') {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload" 
    )
  }
  next()
})

// .Anti-Clickjacking Protection
server.use(helmet.frameguard({ action: "deny" })) // X-Frame-Options: DENY

//  Additional Security Headers
server.use(helmet.noSniff()) // X-Content-Type-Options: nosniff
server.use(helmet.xssFilter()) // X-XSS-Protection: 1; mode=block
server.use(helmet.referrerPolicy({ policy: "same-origin" })) // Referrer-Policy
server.use(helmet.hidePoweredBy()) // Remove X-Powered-By header

// CORS Configuration
const allowedOrigins = [
  "http://localhost:3000", // React dev server
  "http://localhost:3001", // Alternative React port
  "https://yourdomain.com" // Production domain (replace with actual)
]

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.log(`Blocked CORS request from origin: ${origin}`)
      callback(new Error('Not allowed by CORS'), false)
    }
  },
  credentials: true, // Important for HttpOnly cookies
  exposedHeaders: ["X-Total-Count"],
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  preflightContinue: false,
  optionsSuccessStatus: 200, // Changed from 204 to 200 for better compatibility
}

server.use(cors(corsOptions))

// Basic middlewares
server.use(express.json({ limit: '10mb' })) // Added limit for file uploads
server.use(express.urlencoded({ extended: true }))
server.use(cookieParser())
server.use(morgan("tiny"))

// API routes
server.use("/auth", authRoutes)
server.use("/users", userRoutes)
server.use("/products", productRoutes)
server.use("/orders", orderRoutes)
server.use("/cart", cartRoutes)
server.use("/brands", brandRoutes)
server.use("/categories", categoryRoutes)
server.use("/address", addressRoutes)
server.use("/reviews", reviewRoutes)
server.use("/wishlist", wishlistRoutes)

// Test endpoint for security headers
server.get("/api/security-test", (req, res) => {
  res.json({
    message: "Security headers test",
    secure: req.secure,
    protocol: req.protocol,
    headers: {
      'strict-transport-security': res.getHeader('strict-transport-security'),
      'x-frame-options': res.getHeader('x-frame-options'),
      'x-content-type-options': res.getHeader('x-content-type-options')
    },
    timestamp: new Date().toISOString()
  })
})

// Serve React build folder (only in production)
if (process.env.NODE_ENV === 'production') {
  server.use(express.static(path.join(__dirname, "build")))
  
  // Catch-all route for React (only in production)
  server.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"))
  })
} else {
  // Development route
  server.get("/", (req, res) => {
    res.json({ 
      message: "API Server Running", 
      environment: "development",
      port: 8000
    })
  })
}

// Error handling middleware
server.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  })
})

// 404 handler
server.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

const PORT = process.env.PORT || 8000
server.listen(PORT, () => {
  console.log(`Server [STARTED] ~ http://localhost:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Security headers enabled: HSTS, CSP, X-Frame-Options`)
})

module.exports = server