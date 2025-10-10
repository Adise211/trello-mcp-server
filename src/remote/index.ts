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
  // Allow all origins (Auth is handled by Stytch)
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow all origins
    callback(null, true);
  },
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
const sessionSecret = process.env.SESSION_SIGNING_SECRET as string;
if (!sessionSecret) {
  throw new Error("SESSION_SIGNING_SECRET environment variable is required");
}

const sessionConfig = {
  resave: true,
  saveUninitialized: false,
  secret: sessionSecret,
  cookie: {
    maxAge: 60000,
    httpOnly: true, // Prevent XSS access
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict" as const, // CSRF protection
  },
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

app.use((req, res, next) => {
  if (req.path === "/.well-known/oauth-protected-resource") {
    return next(); // Skip CORS for this route, it has its own CORS config
  }
  cors(corsConfig)(req, res, next);
});

app.use(session(sessionConfig));
app.use(express.json()); // Enable parsing of JSON request bodies from raw stream
app.use(helmet(helmetConfig)); // Helmet is a middleware that helps secure the app (security headers) by setting various HTTP headers
app.use(limiter); // Apply rate limiting to all routes
app.use(cookieParser()); // Parse cookies from the request
// HTTPS Enforcement in Production
if (process.env.NODE_ENV === "production") {
  // Redirect users to HTTPS in production
  app.use((req, res, next) => {
    if (!req.secure) {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

app.use("/", router);
app.use("/", authRouter);

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📡 API endpoints available at http://localhost:${port}`);
});
