require("dotenv").config()
const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const cookieParser = require("cookie-parser")
const session = require("express-session");
const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
const rateLimit = require("express-rate-limit");

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
const passport = require("./config/passport");
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

// --- CORS Configuration ---
const devOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
const prodOrigins = [process.env.ORIGIN || ""]; // allow prod origin via env

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow Postman & curl
    const allowed =
      process.env.NODE_ENV === "production" ? prodOrigins : devOrigins;

    if (allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  exposedHeaders: ["X-Total-Count"],
  methods: ["GET", "POST", "PATCH", "DELETE"],
  optionsSuccessStatus: 204,
};
server.use(cors(corsOptions));

// Import Passport configuration

// --- Middlewares ---
server.use(express.json());
// Initialize Passport middleware
server.use(passport.initialize());
server.use(passport.session());

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

// Optional: Rate limiting (prevent brute force / DoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit for development
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true, 
  legacyHeaders: false, 
});
server.use(limiter);

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

// --- Default Route ---
server.get("/", (req, res) => {
  res.status(200).json({ message: "running" });
});

// --- Server Startup ---
if (process.env.NODE_ENV === "production") {
  // Load SSL certs
  const options = {
    key: fs.readFileSync(path.join(__dirname, "certs", "server.key")),
    cert: fs.readFileSync(path.join(__dirname, "certs", "server.cert")),
  };

  https.createServer(options, server).listen(8000, () => {
    console.log("✅ Production server running at https://localhost:8000");
  });
} else {
  http.createServer(server).listen(8000, () => {
    console.log("✅ Dev server running at http://localhost:8000");
  });
}