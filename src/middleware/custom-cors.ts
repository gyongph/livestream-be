import { NextFunction, Request, Response } from "express";

function customCorsMiddleware(allowedOrigins: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    // Extract the host from the request headers
    const host: string = req.headers.host as string;

    // Split the host into subdomain and domain
    const parts: string[] = host.split(".");
    const subdomain: string | null = parts.length > 2 ? parts[0] : null;
    const domain: string = parts.slice(-2).join(".");

    // Check if the domain is one of the allowed origins
    if (allowedOrigins.includes(domain)) {
      // Set CORS headers to allow the specific subdomain
      res.setHeader(
        "Access-Control-Allow-Origin",
        `https://${subdomain}.${domain}`
      );
    }

    next();
  };
}

export default customCorsMiddleware;
