import { Request, Response } from "express";
import {
  cartModel,
  deleteAllItems,
  getCart,
  deleteItemById,
  findExisting,
  updateCartById,
  getCartItemById,
} from "../models/cart";
import { getProductById } from "../models/products";
import { getUserById } from "../models/auth";
import logger from "../helpers/logging";
import { validateCartSchema, validateCartIdSchema } from "../utils/validation";
import { ZodIssue } from "zod";
import { db } from '../../db'
import { cartTable, productTable, userTable } from '../../db/schema'
import { and, eq } from "drizzle-orm"

type CartUpdatePayload = {
  quantity?: number;
  productName?: string; // Add other updatable fields as needed
  price?: string;
  
};

export async function addCartItem(req: Request, res: Response) {
  const { customerId, productId, quantity } = req.body;
  const validationError = validateCartSchema.safeParse(customerId, productId);
  const { error } = validationError;
  const errorLists = error?.issues.map((err: ZodIssue) => err.message)
  if (!validationError.success) {
    return res.status(400).json(errorLists);
  }
  try {
    const products = await db.select().from(productTable).where(eq(productTable.id, productId));
    const product = products[0]
    const customers = await db.select().from(userTable).where(eq(userTable.id, customerId))
    const customer = customers[0]

    if (!product) {
      return res.status(404).json({ error: "Product does not exist" });
    }
    if (!customer) {
      return res.status(404).json({ error: "Customer does not exist" });
    }

    const existingCartItem = await db.select()
    .from(cartTable)
    .where(
      and(
        eq(cartTable.productId, productId),
        eq(cartTable.customerId, customerId)
      )
    ).limit(1)
    if (existingCartItem) {
      return res
        .status(400)
        .json({ error: "This item is already in the cart" });
    }

    const insertedItems = await db.insert(cartTable).values({
      customer: customer.username,
      customerId,
      productId,
      productName: product.name,
      productDescription: product.description,
      productImage: product.image,
      quantity,
      price: product.price,
    }).returning()

    const newItem = insertedItems[0]

    if(!newItem){
      logger.error(`Failed to add item for customer - ${customerId} to cart`)
      return res.status(400).json({
        message: "Failed to add item to cart"
      })
    }

    res.status(201).json(newItem);
    logger.info(`Cart item added by: ${customer.email}`);
  } catch (error) {
    logger.error("An error occured when adding item to cart", error);
    res
      .status(400)
      .json({ message: "An error occured when adding item to cart" });
  }
}

export async function updateCart(req: Request, res: Response) {
  try {
    const itemId = req.params.id
    const updatePayload: CartUpdatePayload = req.body;
    const validatedItemId = validateCartIdSchema.safeParse(itemId)
    if(!validatedItemId.success){
      return res.status(400).json({
        message: "Cart item Id should be a string"
      })
    }
    const cartItem = await db.select().from(cartTable).where(eq(cartTable.id, validatedItemId.data.itemId))
    if (!cartItem) {
      return res.status(400).json({ error: "Cart item does not exist" });
    }
    const updatedItems = await db
    .update(cartTable)
    .set(req.body) 
    .where(eq(cartTable.id, validatedItemId.data.itemId))
    .returning();

  const updatedCartItem = updatedItems[0];

  if (!updatedCartItem) {
    logger.error(`Failed to update cart item with ID: ${validatedItemId.data.itemId}`);
    return res.status(400).json({
      message: 'Failed to update cart item. Please try again.',
    });
  }

  res.status(200).json(updatedCartItem);
  logger.info(`Cart item ID ${validatedItemId.data.itemId} updated successfully.`);
  } catch (error) {
    logger.error("An error occured when updating cart", error);
    res.status(400).json({ error: "An error occurred when updating cart" });
  }
}

export async function getCartItems(req: Request, res: Response) {
  try {
    const customerId = req.params.customerId;

    if (!customerId) {
      return res.status(400).json({ message: 'Customer ID is required.' });
    }
    const userCart = await db.query.cartTable.findFirst({
      where: eq(cartTable.customerId, parseInt(customerId))
    })
    if (!userCart) {
      // If no cart exists for the user, return an empty cart
      return res.status(200).json({
        message: `No active cart found for user ID ${customerId}.`,
        cartId: null,
        items: [],
      });
    }
    res.status(200).json({
      cartId: userCart.id,
      items: userCart
    })
  } catch (error) {
    logger.error("Cannot get cart items for this customer", error);
    res.status(500).json({ message: 'Failed to retrieve cart items.' });
  }
}

export async function deleteItem(req: Request, res: Response) {
  try {
    await db.delete(cartTable).where(eq(cartTable.id, parseInt(req.params.id)))
    
    res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    logger.error("An error occurred when deleting the cart item: ", error);
    res.status(400)
      .json({ message: "An error occurred when deleting the cart item" });
  }
}

export async function deleteCartItems(req: Request, res: Response) {
  try {
    const customerId = req.params.customerId;
    if(!customerId){
      return res.status(400).json({
        message: "Customer ID is required"
      })
    }

    // Find and delete all cart items for the specified customerId
    const result = await deleteAllItems(customerId);

    if (result.deletedCount === 0) {
      res.status(400).json({ message: "No cart items found for the customer" });
    } else {
      res.status(200).json({ message: "Cart items deleted" });
    }
  } catch (error) {
    logger.error("An error occurred when deleting cart items: ", error);
    res
      .status(400)
      .json({ message: "An error occurred when deleting cart items" });
  }
}
