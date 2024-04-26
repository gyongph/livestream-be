import { NextFunction, Request, Response } from "express";

function customCorsMiddleware(allowedOrigins: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    // Extract the source domain from the request headers
    const originHeader: string | undefined = req.headers.origin as string;
    // console.log(req.headers)
    // Check if there's an origin header
    if (originHeader) {
      // Extract the source domain from the origin header
      const parts: string[] = originHeader.split(".");
      const subdomain: string | null = parts.length > 2 ? parts[0] : null;
      const domain: string = parts.slice(-2).join(".");
      // Check if the domain is one of the allowed origins
      if (allowedOrigins.includes(domain)) {
        // Set CORS headers to allow the specific subdomain
        res.setHeader(
          "Access-Control-Allow-Origin",
          `${subdomain}.${domain}`
        );
      }
    }

    next();
  };
}

export default customCorsMiddleware;
