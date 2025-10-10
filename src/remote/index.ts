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
const port = parseInt(process.env.PORT || "3000", 10);
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
    sameSite:
      process.env.NODE_ENV === "production"
        ? ("none" as const)
        : ("strict" as const), // Allow cross-site cookies in production for OAuth
  },
  proxy: process.env.NODE_ENV === "production", // Trust the reverse proxy (Railway)
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
// Trust Railway's proxy
app.set("trust proxy", 1);

app.use(express.json()); // Enable parsing of JSON request bodies from raw stream
app.use(helmet(helmetConfig)); // Helmet is a middleware that helps secure the app (security headers) by setting various HTTP headers
app.use(limiter); // Apply rate limiting to all routes
app.use(cookieParser()); // Parse cookies from the request
// HTTPS Enforcement in Production
if (process.env.NODE_ENV === "production") {
  // Redirect users to HTTPS in production (Railway terminates SSL at proxy level)
  app.use((req, res, next) => {
    // Skip redirect for health check
    if (req.path === "/health") {
      return next();
    }
    // Check x-forwarded-proto header set by Railway's proxy
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Health check endpoint for Railway
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/", router);
app.use("/", authRouter);

// Bind to 0.0.0.0 for Railway deployment
const host = process.env.HOST || "0.0.0.0";
app.listen(port, host, () => {
  console.log(`🚀 Server is running on ${host}:${port}`);
  console.log(`📡 API endpoints available at http://localhost:${port}`);
});
