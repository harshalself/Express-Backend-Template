import { RequestHandler } from "express";
import { z } from "zod";
import HttpException from "../exceptions/HttpException";

const validationMiddleware = (
  schema: z.ZodSchema,
  value: string | "body" | "query" | "params" = "body"
): RequestHandler => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req[value]);

      if (!result.success) {
        const errorMessages = result.error.issues
          .map((error) => `${error.path.join(".")}: ${error.message}`)
          .join(", ");
        next(new HttpException(400, errorMessages));
      } else {
        // Replace the request property with the validated data
        req[value] = result.data;
        next();
      }
    } catch (error) {
      next(new HttpException(500, "Validation error"));
    }
  };
};

export default validationMiddleware;
