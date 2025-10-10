import { Router, Request, Response } from "express";
import path from "node:path";

const router = Router();

// Login page
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// Identity Provider page
router.get("/oauth/authorize", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "IdentityProvider.html"));
});

// Authenticate page
router.get("/authenticate", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "authenticate.html"));
});

// Logout page
router.get("/logout", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "logout.html"));
});

// OAuth protected resource page
router.get(
  "/.well-known/oauth-protected-resource",
  (req: Request, res: Response) => {
    // return res.json({
    //   resource: req.get("host"),
    //   authorization_servers: [process.env.STYTCH_PROJECT_DOMAIN],
    //   scopes_supported: ["openid", "email", "profile"],
    // });
    const resource =
      process.env.NODE_ENV === "development"
        ? `http://${req.get("host")}`
        : `https://${req.get("host")}`;

    console.log("In protected resource route, Resource:", resource);

    try {
      const meta_data = {
        resource: resource,
        authorization_servers: [process.env.STYTCH_PROJECT_DOMAIN],
        scopes_supported: ["openid", "email", "profile"],
      };

      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.json(meta_data);
    } catch (error) {
      console.error("Error in protected resource route:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
