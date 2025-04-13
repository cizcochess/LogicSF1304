import { pgTable, text, serial, integer, boolean, timestamp, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull(),
  department: text("department"),
  email: text("email"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Suppliers table
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  taxId: text("tax_id"),
  notes: text("notes"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true });
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  unit: text("unit").notNull(),
  minStock: integer("min_stock").default(0),
  currentStock: integer("current_stock").default(0),
  location: text("location"),
  cost: doublePrecision("cost"),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Requirements table
export const requirements = pgTable("requirements", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  requestorId: integer("requestor_id").references(() => users.id),
  departmentId: text("department_id"),
  status: text("status").notNull(),
  priority: text("priority").notNull().default("medium"),
  notes: text("notes"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRequirementSchema = z.object({
  code: z.string(),
  title: z.string().min(1, "El título es requerido"),
  requestorId: z.number().int().positive(),
  departmentId: z.string(),
  status: z.enum(["pending", "approved", "rejected", "completed"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  notes: z.string().optional(),
  dueDate: z.string().or(z.date()).optional(),
});
export type InsertRequirement = z.infer<typeof insertRequirementSchema>;
export type Requirement = typeof requirements.$inferSelect;

// Requirement Details table
export const requirementDetails = pgTable("requirement_details", {
  id: serial("id").primaryKey(),
  requirementId: integer("requirement_id").references(() => requirements.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: doublePrecision("quantity").notNull(),
  unit: text("unit").notNull(),
  notes: text("notes"),
  status: text("status").notNull(),
});

export const insertRequirementDetailSchema = createInsertSchema(requirementDetails).omit({ id: true });
export type InsertRequirementDetail = z.infer<typeof insertRequirementDetailSchema>;
export type RequirementDetail = typeof requirementDetails.$inferSelect;

// Purchase Orders table
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  requirementId: integer("requirement_id").references(() => requirements.id),
  status: text("status").notNull(),
  totalAmount: doublePrecision("total_amount"),
  currency: text("currency").default("USD"),
  notes: text("notes"),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ id: true, createdAt: true });
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

// Purchase Order Details table
export const purchaseOrderDetails = pgTable("purchase_order_details", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: doublePrecision("quantity").notNull(),
  unit: text("unit").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  totalPrice: doublePrecision("total_price").notNull(),
  notes: text("notes"),
});

export const insertPurchaseOrderDetailSchema = createInsertSchema(purchaseOrderDetails).omit({ id: true });
export type InsertPurchaseOrderDetail = z.infer<typeof insertPurchaseOrderDetailSchema>;
export type PurchaseOrderDetail = typeof purchaseOrderDetails.$inferSelect;

// Receptions table
export const receptions = pgTable("receptions", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
  receivedBy: integer("received_by").references(() => users.id),
  receivedAt: timestamp("received_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReceptionSchema = createInsertSchema(receptions).omit({ id: true, createdAt: true });
export type InsertReception = z.infer<typeof insertReceptionSchema>;
export type Reception = typeof receptions.$inferSelect;

// Reception Details table
export const receptionDetails = pgTable("reception_details", {
  id: serial("id").primaryKey(),
  receptionId: integer("reception_id").references(() => receptions.id).notNull(),
  purchaseOrderDetailId: integer("purchase_order_detail_id").references(() => purchaseOrderDetails.id),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantityExpected: doublePrecision("quantity_expected").notNull(),
  quantityReceived: doublePrecision("quantity_received").notNull(),
  unit: text("unit").notNull(),
  notes: text("notes"),
  status: text("status").notNull(),
});

export const insertReceptionDetailSchema = createInsertSchema(receptionDetails).omit({ id: true });
export type InsertReceptionDetail = z.infer<typeof insertReceptionDetailSchema>;
export type ReceptionDetail = typeof receptionDetails.$inferSelect;

// Inventory Movements table
export const inventoryMovements = pgTable("inventory_movements", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: doublePrecision("quantity").notNull(), // Can be negative for outputs
  unit: text("unit").notNull(),
  movementType: text("movement_type").notNull(), // reception, output, adjustment
  referenceId: integer("reference_id"), // ID of the reception, output or adjustment
  referenceType: text("reference_type"), // reception, output, adjustment
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInventoryMovementSchema = createInsertSchema(inventoryMovements).omit({ id: true, createdAt: true });
export type InsertInventoryMovement = z.infer<typeof insertInventoryMovementSchema>;
export type InventoryMovement = typeof inventoryMovements.$inferSelect;

// Outputs table
export const outputs = pgTable("outputs", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  destination: text("destination").notNull(),
  destinationType: text("destination_type").notNull(), // department, project, client, etc
  status: text("status").notNull(),
  notes: text("notes"),
  requestedBy: integer("requested_by").references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOutputSchema = createInsertSchema(outputs).omit({ id: true, createdAt: true });
export type InsertOutput = z.infer<typeof insertOutputSchema>;
export type Output = typeof outputs.$inferSelect;

// Output Details table
export const outputDetails = pgTable("output_details", {
  id: serial("id").primaryKey(),
  outputId: integer("output_id").references(() => outputs.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: doublePrecision("quantity").notNull(),
  unit: text("unit").notNull(),
  notes: text("notes"),
  status: text("status").notNull(),
});

export const insertOutputDetailSchema = createInsertSchema(outputDetails).omit({ id: true });
export type InsertOutputDetail = z.infer<typeof insertOutputDetailSchema>;
export type OutputDetail = typeof outputDetails.$inferSelect;

// Invoices table
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  supplierInvoiceNumber: text("supplier_invoice_number"),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id),
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").default("USD"),
  status: text("status").notNull(),
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// System Activity table
export const systemActivities = pgTable("system_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  activityType: text("activity_type").notNull(),
  description: text("description").notNull(),
  entityType: text("entity_type").notNull(), // requirement, purchase_order, etc
  entityId: integer("entity_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSystemActivitySchema = createInsertSchema(systemActivities).omit({ id: true, createdAt: true });
export type InsertSystemActivity = z.infer<typeof insertSystemActivitySchema>;
export type SystemActivity = typeof systemActivities.$inferSelect;
