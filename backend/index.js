// require("dotenv").config()
// const express=require('express')
// const cors=require('cors')
// const morgan=require("morgan")
// const cookieParser=require("cookie-parser")
// const authRoutes=require("./routes/Auth")
// const productRoutes=require("./routes/Product")
// const orderRoutes=require("./routes/Order")
// const cartRoutes=require("./routes/Cart")
// const brandRoutes=require("./routes/Brand")
// const categoryRoutes=require("./routes/Category")
// const userRoutes=require("./routes/User")
// const addressRoutes=require('./routes/Address')
// const reviewRoutes=require("./routes/Review")
// const wishlistRoutes=require("./routes/Wishlist")
// const { connectToDB } = require("./database/db")


// // server init
// const server=express()

// // database connection
// connectToDB()


// // middlewares
// server.use(cors({origin:process.env.ORIGIN,credentials:true,exposedHeaders:['X-Total-Count'],methods:['GET','POST','PATCH','DELETE']}))
// server.use(express.json())
// server.use(cookieParser())
// server.use(morgan("tiny"))

// // routeMiddleware
// server.use("/auth",authRoutes)
// server.use("/users",userRoutes)
// server.use("/products",productRoutes)
// server.use("/orders",orderRoutes)
// server.use("/cart",cartRoutes)
// server.use("/brands",brandRoutes)
// server.use("/categories",categoryRoutes)
// server.use("/address",addressRoutes)
// server.use("/reviews",reviewRoutes)
// server.use("/wishlist",wishlistRoutes)



// server.get("/",(req,res)=>{
//     res.status(200).json({message:'running'})
// })

// server.listen(8000,()=>{
//     console.log('server [STARTED] ~ http://localhost:8000');
// })

require("dotenv").config()
const express=require('express')
const cors=require('cors')
const morgan=require("morgan")
const cookieParser=require("cookie-parser")
const authRoutes=require("./routes/Auth")
const productRoutes=require("./routes/Product")
const orderRoutes=require("./routes/Order")
const cartRoutes=require("./routes/Cart")
const brandRoutes=require("./routes/Brand")
const categoryRoutes=require("./routes/Category")
const userRoutes=require("./routes/User")
const addressRoutes=require('./routes/Address')
const reviewRoutes=require("./routes/Review")
const wishlistRoutes=require("./routes/Wishlist")
const { connectToDB } = require("./database/db")


// server init
const server=express()

// ✅ Add CSP middleware here, before routes
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


// ✅ Add HSTS header middleware (after CSP, before routes)
server.use((req, res, next) => {
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  next();
});

// database connection
connectToDB()

const allowedOrigins = [
  'http://localhost:3000'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, false); // don't allow, but don't throw error
    }
  },
  credentials: true,
  exposedHeaders: ['X-Total-Count'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

server.use(cors(corsOptions));

// middlewares
// server.use(cors({origin:process.env.ORIGIN,credentials:true,exposedHeaders:['X-Total-Count'],methods:['GET','POST','PATCH','DELETE']}))
server.use(express.json())
server.use(cookieParser())
server.use(morgan("tiny"))
// routeMiddleware
server.use("/auth",authRoutes)
server.use("/users",userRoutes)
server.use("/products",productRoutes)
server.use("/orders",orderRoutes)
server.use("/cart",cartRoutes)
server.use("/brands",brandRoutes)
server.use("/categories",categoryRoutes)
server.use("/address",addressRoutes)
server.use("/reviews",reviewRoutes)
server.use("/wishlist",wishlistRoutes)



server.get("/",(req,res)=>{
    res.status(200).json({message:'running'})
})

server.listen(8000,()=>{
    console.log('server [STARTED] ~ http://localhost:8000');
})