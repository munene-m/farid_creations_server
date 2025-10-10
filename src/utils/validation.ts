import { ObjectId } from "mongoose";
import { z } from "zod"

const validatePassword = (password: string) => {
  const hasMinLength = password.length >= 8;
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password);
  return hasMinLength && hasLetters && hasNumbers && hasSpecialChars;
}

const passwordSchema = z
  .string({
    required_error: "Password required",
    invalid_type_error: "Password must be string",
  })
  .refine(validatePassword, { message: "Password must be at least 8 characters long, contain at least one letter, one number, and one special character" })


export const validateUserSchema = z.object({
  email: z.string().email(),
  password: passwordSchema
})

export const validateLoginSchema = z.object({
  email: z.string().email(),
  password: passwordSchema
})

export const validateProductSchema = z.object({
  name: z.string().min(1, { message: "Item name is required" }),
  description: z.string().min(1, { message: "Item description is required" }),
  price: z.number().min(0, { message: "Price is required" }),
  type: z.string().min(1, { message: "Product type is required" }),
  image: z.string().min(1, { message: "Image is required" })
})

export const validateWorkSchema = z.object({
  title: z.string().min(1, { message: "Item name is required" }),
  description: z.string().min(1, { message: "Item description is required" }),
  image: z.string().min(1, { message: "Image is required" })
})

export const validateCartSchema = z.object({
  customerId: z.string().min(1, { message: "Customer ID is required" }),
  productId: z.number().min(1, { message: "Product ID is required" })
})

export const validateCartIdSchema = z.object({
  itemId: z.number()
})



// import { z, ZodError } from "zod";

// const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
// const phoneRegex = /^(?:\+254|0)[17]\d{8}$/;

// // Common schema for email
// const emailSchema = z.string().refine((value) => emailRegex.test(value), {
//   message: "Invalid email address",
// });

// // Common schema for password
// const passwordSchema = z.string().refine((value) => value.length >= 8, {
//   message: "Password must be at least 8 characters long",
// });

// // Common schema for uppercase letter in password
// const uppercaseLetterSchema = passwordSchema.refine(
//   (value) => /[A-Z]/.test(value),
//   {
//     message: "Password must contain at least one uppercase letter",
//   }
// );

// // Common schema for special character in password
// const specialCharacterSchema = passwordSchema.refine(
//   (value) => /[!@#$%^&*]/.test(value),
//   {
//     message: "Password must contain at least one special character",
//   }
// );

// // Function to handle schema validation
// const validateSchema = <T>(schema: z.ZodType<T, any, any>, data: T) => {
//   try {
//     schema.parse(data);
//     return null; // No validation message
//   } catch (error) {
//     if (error instanceof ZodError) {
//       return { message: error.errors[0].message };
//     }
//     throw error;
//   }
// };

// // Validation functions using Zod
// export const validateUserFields = (email: string, password: string) =>
//   validateSchema(
//     z.object({
//       email: emailSchema,
//       password: passwordSchema,
//     }),
//     { email, password }
//   );

// export const validateLoginFields = (email: string, password: string) =>
//   validateSchema(
//     z.object({
//       email: emailSchema,
//       password: passwordSchema,
//     }),
//     { email, password }
//   );

// export const validateAdminRegistration = (
//   phoneNumber: string,
//   email: string,
//   password: string
// ) =>
//   validateSchema(
//     z.object({
//       phoneNumber: z.string().refine((value) => phoneRegex.test(value), {
//         message: "Invalid phone number format",
//       }),
//       email: emailSchema,
//       password: passwordSchema,
//     }),
//     { phoneNumber, email, password }
//   );

// export const validateProductFields = (
//   name: string,
//   description: string,
//   price: number,
//   type: string,
//   image: Express.Multer.File | undefined
// ) =>
//   validateSchema(
//     z.object({
//       name: z.string().min(1, { message: "Item name is required" }),
//       description: z
//         .string()
//         .min(1, { message: "Item description is required" }),
//       price: z.number().min(0, { message: "Price is required" }),
//       type: z.string().min(1, { message: "Product type is required" }),
//       image: z
//         .object({
//           fieldname: z.string(),
//           originalname: z.string(),
//           encoding: z.string(),
//           mimetype: z.string(),
//           buffer: z.unknown(),
//           size: z.number(),
//         })
//         .nullable(),
//     }),
//     { name, description, price, type, image }
//   );

// export const validateWorkFields = (
//   title: string,
//   description: string,
//   image: Express.Multer.File | undefined
// ) =>
//   validateSchema(
//     z.object({
//       title: z.string().min(1, { message: "Item name is required" }),
//       description: z
//         .string()
//         .min(1, { message: "Item description is required" }),
//       image: z
//         .object({
//           fieldname: z.string(),
//           originalname: z.string(),
//           encoding: z.string(),
//           mimetype: z.string(),
//           buffer: z.unknown(),
//           size: z.number(),
//         })
//         .nullable(),
//     }),
//     { title, description, image }
//   );

// export const validateCartFields = (customerId: ObjectId, productId: ObjectId) =>
//   validateSchema(
//     z.object({
//       customerId: z.string(),
//       productId: z.string(),
//     }),
//     { customerId, productId }
//   );
