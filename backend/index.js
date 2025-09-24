// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");



// Import routes
const authRoutes = require("./routes/Auth");
const productRoutes = require("./routes/Product");
const orderRoutes = require("./routes/Order");
const cartRoutes = require("./routes/Cart");
const brandRoutes = require("./routes/Brand");
const categoryRoutes = require("./routes/Category");
const userRoutes = require("./routes/User");
const addressRoutes = require("./routes/Address");
const reviewRoutes = require("./routes/Review");
const wishlistRoutes = require("./routes/Wishlist");

const { connectToDB } = require("./database/db");

// Initialize app
const server = express();

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
const passport = require("./config/passport");

// --- Middlewares ---
server.use(express.json());
server.use(cookieParser());
server.use(morgan("tiny"));

// Express session configuration for OAuth
server.use(session({
    secret: process.env.SESSION_SECRET || process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.PRODUCTION === 'true',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport middleware
server.use(passport.initialize());
server.use(passport.session());

// Prevent NoSQL injection (strip out $ and . keys)
const mongoSanitize = require("express-mongo-sanitize");
server.use(mongoSanitize());

// Add security headers (beyond your manual CSP)
const helmet = require("helmet");
server.use(helmet());

// Optional: Rate limiting (prevent brute force / DoS)
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, 
  legacyHeaders: false, 
});
server.use(limiter);

// --- Security Headers ---
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

if (process.env.NODE_ENV === "production") {
  server.use((req, res, next) => {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
    next();
  });
}

// --- Database ---
connectToDB();

// --- Routes ---
server.use("/api/auth", authRoutes);
server.use("/api/users", userRoutes);
server.use("/api/products", productRoutes);
server.use("/api/orders", orderRoutes);
server.use("/api/cart", cartRoutes);
server.use("/api/brands", brandRoutes);
server.use("/api/categories", categoryRoutes);
server.use("/api/address", addressRoutes);
server.use("/api/reviews", reviewRoutes);
server.use("/api/wishlist", wishlistRoutes);

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
