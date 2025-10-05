import { NextFunction, Request, Response } from "express";
import { stytchClient } from "./mcp-config";

// export async function authenticateUser(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) {
//   try {
//     const authHeader = req.headers["authorization"];
//     console.log("In authenticateUser - authHeader: ", authHeader);
//     if (!authHeader) {
//       console.log("No credentials → 401 with WWW-Authenticate");
//       // No credentials → 401 with WWW-Authenticate
//       res
//         .status(401)
//         .set(
//           "WWW-Authenticate",
//           `Bearer realm="https://${process.env.APP_DOMAIN}/.well-known/oauth-protected-resource", error="invalid_token"`
//         )
//         .json(createErrorResponse("Unauthorized", -32000));
//     }

//     // Example: "Bearer <token>"
//     const token = authHeader?.split(" ")[1];
//     console.log("In authenticateUser - token: ", token);

//     // TODO: Verify with Stytch (check access_token/session)
//     const isValid = await stytchClient.oauth.authenticate({
//       token: token as string,
//     });
//     console.log("In authenticateUser - isValid: ", isValid);

//     if (!isValid) {
//       res
//         .status(401)
//         .set(
//           "WWW-Authenticate",
//           `Bearer realm="https://${process.env.APP_DOMAIN}/.well-known/oauth-protected-resource", error="invalid_token"`
//         )
//         .json(createErrorResponse("Invalid or expired token", -32000));
//     }
//     console.log("In authenticateUser - next()");

//     next();
//   } catch (error) {
//     console.error("Error in authenticateUser: ", error);
//   }
// }
// @ts-ignore
export const authorizeTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(
    "In authorizeTokenMiddleware, req.get('authorization')",
    req.get("authorization")
  );
  const wwwAuthValue =
    `Bearer error="Unauthorized", ` +
    `error_description="Unauthorized",` +
    `resource_metadata="${req.get(
      "host"
    )}/.well-known/oauth-protected-resource"`;

  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    console.log("In authorizeTokenMiddleware, token", token);
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
