import mongoose from "mongoose";
import z from "zod";

export const objectIdSchema = z
  .string()
  .trim()
  .length(24, { message: "Invalid ID format" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid ID format" })
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ID format",
  });

export const objectIdSchemaOptional = z
  .string()
  .trim()
  .length(24)
  .regex(/^[0-9a-fA-F]{24}$/)
  .refine((val) => mongoose.Types.ObjectId.isValid(val))
  .nullable()
  .optional();
