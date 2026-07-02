import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { ValidationError } from "../errors/app-error.js";

interface ValidateSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

// Express 5 made req.query and req.params getter-only (no direct reassignment),
// so parsed/validated data is attached to res.locals instead of overwriting
// the original req properties. Controllers read from res.locals.validated.
export function validate(schemas: ValidateSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    const validated: Record<string, unknown> = {};

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        return next(new ValidationError("Invalid request body", result.error.format()));
      }
      validated.body = result.data;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        return next(new ValidationError("Invalid query parameters", result.error.format()));
      }
      validated.query = result.data;
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        return next(new ValidationError("Invalid route parameters", result.error.format()));
      }
      validated.params = result.data;
    }

    res.locals.validated = validated;
    next();
  };
}