import { integer, pgTable, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const userTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 255 }),
  password: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  role: varchar({ length: 255 }).notNull(),
  passResetToken: varchar({ length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const cartTable = pgTable('cart', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  customer: varchar({ length: 255 }),
  customerId: integer().notNull().references(() => userTable.id),
  productId: integer().notNull().references(() => productTable.id),
  productName: varchar({ length: 255 }),
  productDescription: varchar({ length: 255 }),
  quantity: integer().default(1),
  price: integer().notNull(),
  productImage: varchar({ length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const paymentTable = pgTable('payments', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  data: jsonb(), // This might need to be jsonb if you want to store objects directly
  transactionRef: varchar({ length: 255 }),
  payoutRef: varchar({ length: 255 }),
  transactionType: varchar({ length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const workTable = pgTable('work', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  image: varchar({ length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const productTable = pgTable('products', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({length: 255}).notNull(),
  type: varchar({length: 255}).notNull(),
  packagingType: varchar({length: 255}).notNull(),
  price: integer().notNull(),
  deliveryFee: integer().notNull(),
  category: varchar({length: 255}).notNull(),
  image: varchar({length: 255}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})