import dotenv from "dotenv";
// Load environment variables based on NODE_ENV
// if (process.env.NODE_ENV === "production") {
// } else {
//   dotenv.config({ path: ".env" });
// }
dotenv.config({ quiet: true });

import express from "express";
import cookieParser from "cookie-parser";
// import cors from "cors";
// import rootRouter from "./routes/index.route.js";
// import { globalErrorHandler, handleNotFound } from "./middleware/errorHandler.middleware.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import router from "./all.routes";
import authRouter from "./auth.route";
import session from "express-session";
import cors from "cors";
import path from "node:path";

const app = express();
const port = process.env.PORT || 3000;
console.log("Remote server is starting...");
console.log(`Environment: ${process.env.NODE_ENV}`);

// Setup EJS view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// CORS config
const corsConfig = {
  origin: ["http://localhost:6274"],
  credentials: true, // Allow cookies (important)
  exposedHeaders: ["Mcp-Session-Id"],
  allowedHeaders: [
    "Content-Type",
    "mcp-session-id",
    "Authorization",
    "mcp-protocol-version",
  ],
};

// Express session management
const sessionConfig = {
  resave: true,
  saveUninitialized: false,
  secret: process.env.SESSION_SIGNING_SECRET as string,
  cookie: { maxAge: 60000 },
};

// Rate limiting config
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

// Helmet config
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://unpkg.com",
        "https://www.unpkg.com",
      ], // Allow inline scripts and Stytch CDN
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles if needed
      connectSrc: ["'self'", "https://api.stytch.com", "https://*.stytch.com"], // Allow Stytch API calls
    },
  },
};

app.use(cors(corsConfig));
app.use(session(sessionConfig));
app.use(express.json()); // Enable parsing of JSON request bodies from raw stream
app.use(helmet(helmetConfig)); // Helmet is a middleware that helps secure the app (security headers) by setting various HTTP headers
app.use(limiter); // Apply rate limiting to all routes
app.use(cookieParser()); // Parse cookies from the request

app.use("/", router);
app.use("/", authRouter);

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📡 API endpoints available at http://localhost:${port}`);
});
