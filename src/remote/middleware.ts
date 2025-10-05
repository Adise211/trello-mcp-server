import { NextFunction, Request, Response } from "express";
import stytch from "stytch";

export const stytchClient = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID as string,
  secret: process.env.STYTCH_SECRET as string,
  custom_base_url: process.env.STYTCH_DOMAIN as string,
});

export const authorizeTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("In authorizeTokenMiddleware.....");

  const wwwAuthValue =
    `Bearer error="Unauthorized", ` +
    `error_description="Unauthorized",` +
    `resource_metadata="${req.get(
      "host"
    )}/.well-known/oauth-protected-resource"`;

  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token) {
      console.log("In authorizeTokenMiddleware, token is not found!!!!!!");
      res.setHeader("WWW-Authenticate", wwwAuthValue);
      res.status(401).json({ error: "Unauthorized" });
    } else {
      const tokenData = await stytchClient.idp.introspectTokenLocal(
        token as string
      );
      (req as any).user = tokenData;
      next();
    }
  } catch (error) {
    console.error("Error in middleware:", error);
    res.setHeader("WWW-Authenticate", wwwAuthValue);
    res.status(401).json({ error: "Unauthorized" });
  }
};
