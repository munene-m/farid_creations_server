import { ObjectId } from "mongoose";

export function validateUserFields(email: string, password: string) {
  if (!email || !password) {
    switch (true) {
      case !email:
        return { message: "Email is required" };
      case !password:
        return { message: "Password is required" };
      default:
        return { message: "Please enter all required fields" };
    }
  }
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!email.match(emailRegex)) {
    return { message: "Invalid email address" };
  }
  if (password.length < 8) {
    return { message: "Password must be at least 8 characters long" };
  }

  if (!/[A-Z]/.test(password)) {
    return { message: "Password must contain at least one uppercase letter" };
  }

  if (!/[!@#$%^&*]/.test(password)) {
    return { message: "Password must contain at least one special character" };
  }

  return null; // No validation message
}

export function validateLoginFields(email: string, password: string) {
  if (!email || !password) {
    switch (true) {
      case !email:
        return { message: "Email is required" };
      case !password:
        return { message: "Password is required" };
      default:
        return { message: "Please enter all required fields" };
    }
  }
  return null;
}

export function validateProductFields(
  name: string,
  description: string,
  price: string,
  type: string,
  image: Express.Multer.File | undefined,
  deliveryFee: string
) {
  if (!name || !price || !description || !image || !type) {
    if (!name) {
      return { message: "Item name is required" };
    } else if (!price) {
      return { message: "Price is required" };
    } else if (!description) {
      return { message: "Item description is required" };
    } else if (!image) {
      return { message: "Image is required" };
    } else if (!type) {
      return { message: "Product type is required" };
    } else if (!deliveryFee) {
      return { message: "Delivery fee is required" };
    } else {
      return { message: "Please enter all required fields" };
    }
  }
  return null;
}

export function validateWorkFields(
  title: string,
  description: string,
  image: Express.Multer.File | undefined
) {
  if (!title || !description || !image) {
    if (!title) {
      return { message: "Item name is required" };
    } else if (!image) {
      return { message: "Image is required" };
    } else if (!description) {
      return { message: "Item description is required" };
    } else {
      return { message: "Please enter all required fields" };
    }
  }
  return null;
}

export function validateCartFields(customerId: ObjectId, productId: ObjectId) {
  if (!customerId || !productId) {
    if (!customerId) {
      return { message: "customerId is required" };
    } else if (!productId) {
      return { message: "productId is required" };
    } else {
      return { message: "Please enter all required fields" };
    }
  }
  return null;
}

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
