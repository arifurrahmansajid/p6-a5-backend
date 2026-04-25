import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      errors: err.issues.map((issue) => issue.message),
    });
  }

  const message = err instanceof Error ? err.message : "Something went wrong";
  return res.status(500).json({ message });
}
