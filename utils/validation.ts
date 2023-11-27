import { ObjectId } from "mongoose";

export function validateUserFields(email: string, password: string) {
  if (!email || !password) {
    switch (true) {
      case !email:
        return { error: "Email is required" };
      case !password:
        return { error: "Password is required" };
      default:
        return { error: "Please enter all required fields" };
    }
  }
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!email.match(emailRegex)) {
    return { error: "Invalid email address" };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long" };
  }

  if (!/[A-Z]/.test(password)) {
    return { error: "Password must contain at least one uppercase letter" };
  }

  if (!/[!@#$%^&*]/.test(password)) {
    return { error: "Password must contain at least one special character" };
  }

  return null; // No validation error
}

export function validateLoginFields(email: string, password: string) {
  if (!email || !password) {
    switch (true) {
      case !email:
        return { error: "Email is required" };
      case !password:
        return { error: "Password is required" };
      default:
        return { error: "Please enter all required fields" };
    }
  }
  return null;
}

export function validateAdminRegistration(
  phoneNumber: string,
  email: string,
  password: string
) {
  if (!phoneNumber || !email || !password) {
    switch (true) {
      case !phoneNumber:
        return { error: "Phone number is required" };
      case !email:
        return { error: "Email is required" };
      case !password:
        return { error: "Password is required" };
      default:
        return { error: "Please enter all required fields" };
    }
  }

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!email.match(emailRegex)) {
    return { error: "Invalid email address" };
  }
  const phoneRegex = /^(?:\+254|0)[17]\d{8}$/; // Matches +254 or 0, followed by 1 or 7, and then 8 digits

  if (!phoneNumber.match(phoneRegex)) {
    return { error: "Invalid phone number format" };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long" };
  }

  if (!/[A-Z]/.test(password)) {
    return { error: "Password must contain at least one uppercase letter" };
  }

  if (!/[!@#$%^&*]/.test(password)) {
    return { error: "Password must contain at least one special character" };
  }

  return null; // No validation error
}

export function validateProductFields(
  name: string,
  description: string,
  price: number,
  type: string,
  image: Express.Multer.File | undefined
) {
  if (!name || !price || !description || !image || !type) {
    if (!name) {
      return { error: "Item name is required" };
    } else if (!price) {
      return { error: "Price is required" };
    } else if (!description) {
      return { error: "Item description is required" };
    } else if (!image) {
      return { error: "Image is required" };
    } else if (!type) {
      return { error: "Product type is required" };
    } else {
      return { error: "Please enter all required fields" };
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
      return { error: "Item name is required" };
    } else if (!image) {
      return { error: "Image is required" };
    } else if (!description) {
      return { error: "Item description is required" };
    } else {
      return { error: "Please enter all required fields" };
    }
  }
  return null;
}

export function validateCartFields(customerId: ObjectId, productId: ObjectId) {
  if (!customerId || !productId) {
    if (!customerId) {
      return { error: "customerId is required" };
    } else if (!productId) {
      return { error: "productId is required" };
    } else {
      return { error: "Please enter all required fields" };
    }
  }
  return null;
}
