import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertSupplierSchema, insertProductSchema, 
  insertRequirementSchema, insertRequirementDetailSchema,
  insertPurchaseOrderSchema, insertPurchaseOrderDetailSchema,
  insertReceptionSchema, insertReceptionDetailSchema,
  insertInventoryMovementSchema, insertOutputSchema, 
  insertOutputDetailSchema, insertInvoiceSchema,
  insertSystemActivitySchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users", async (_req: Request, res: Response) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });

  // Dashboard data routes
  app.get("/api/dashboard", async (_req: Request, res: Response) => {
    const pendingRequirements = await storage.getPendingRequirements();
    const activeOrders = await storage.getActivePurchaseOrders();
    const scheduledReceptions = await storage.getScheduledReceptions();
    const pendingOutputs = await storage.getPendingOutputs();
    const lowStockProducts = await storage.getProductsWithLowStock();
    const delayedOrders = await storage.getDelayedPurchaseOrders();
    const dueInvoices = await storage.getDueInvoices();
    const recentActivities = await storage.getSystemActivities(8);
    
    const inventoryMovements = await storage.getRecentInventoryMovements(7);
    
    res.json({
      pendingRequirementsCount: pendingRequirements.length,
      activeOrdersCount: activeOrders.length,
      scheduledReceptionsCount: scheduledReceptions.length,
      pendingOutputsCount: pendingOutputs.length,
      lowStockProducts,
      delayedOrders,
      dueInvoices,
      recentActivities,
      inventoryMovements
    });
  });

  // Supplier routes
  app.get("/api/suppliers", async (_req: Request, res: Response) => {
    const suppliers = await storage.getSuppliers();
    res.json(suppliers);
  });

  app.get("/api/suppliers/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const supplier = await storage.getSupplier(id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json(supplier);
  });

  app.post("/api/suppliers", async (req: Request, res: Response) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      
      // Log activity
      await storage.createSystemActivity({
        userId: 1, // Assuming admin user for now
        activityType: "create",
        description: `Creó proveedor ${supplier.name}`,
        entityType: "supplier",
        entityId: supplier.id
      });
      
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Error creating supplier" });
    }
  });

  app.put("/api/suppliers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(id, validatedData);
      
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      // Log activity
      await storage.createSystemActivity({
        userId: 1, // Assuming admin user for now
        activityType: "update",
        description: `Actualizó proveedor ${supplier.name}`,
        entityType: "supplier",
        entityId: supplier.id
      });
      
      res.json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Error updating supplier" });
    }
  });

  app.delete("/api/suppliers/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const supplier = await storage.getSupplier(id);
    
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    
    const result = await storage.deleteSupplier(id);
    
    if (result) {
      // Log activity
      await storage.createSystemActivity({
        userId: 1, // Assuming admin user for now
        activityType: "delete",
        description: `Eliminó proveedor ${supplier.name}`,
        entityType: "supplier",
        entityId: id
      });
      
      res.status(204).send();
    } else {
      res.status(500).json({ message: "Error deleting supplier" });
    }
  });

  // Product routes
  app.get("/api/products", async (_req: Request, res: Response) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/low-stock", async (_req: Request, res: Response) => {
    const products = await storage.getProductsWithLowStock();
    res.json(products);
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  app.post("/api/products", async (req: Request, res: Response) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      
      // Log activity
      await storage.createSystemActivity({
        userId: 1,
        activityType: "create",
        description: `Creó producto ${product.name}`,
        entityType: "product",
        entityId: product.id
      });
      
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Error creating product" });
    }
  });

  app.put("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Log activity
      await storage.createSystemActivity({
        userId: 1,
        activityType: "update",
        description: `Actualizó producto ${product.name}`,
        entityType: "product",
        entityId: product.id
      });
      
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Error updating product" });
    }
  });

  app.delete("/api/products/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const product = await storage.getProduct(id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    const result = await storage.deleteProduct(id);
    
    if (result) {
      // Log activity
      await storage.createSystemActivity({
        userId: 1,
        activityType: "delete",
        description: `Eliminó producto ${product.name}`,
        entityType: "product",
        entityId: id
      });
      
      res.status(204).send();
    } else {
      res.status(500).json({ message: "Error deleting product" });
    }
  });

  // Requirement routes
  app.get("/api/requirements", async (_req: Request, res: Response) => {
    const requirements = await storage.getRequirements();
    res.json(requirements);
  });

  app.get("/api/requirements/pending", async (_req: Request, res: Response) => {
    const requirements = await storage.getPendingRequirements();
    res.json(requirements);
  });

  app.get("/api/requirements/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const requirement = await storage.getRequirement(id);
    if (!requirement) {
      return res.status(404).json({ message: "Requirement not found" });
    }
    res.json(requirement);
  });

  app.get("/api/requirements/:id/details", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const requirement = await storage.getRequirement(id);
    if (!requirement) {
      return res.status(404).json({ message: "Requirement not found" });
    }
    const details = await storage.getRequirementDetails(id);
    res.json(details);
  });

  app.post("/api/requirements", async (req: Request, res: Response) => {
    try {
      const validatedData = insertRequirementSchema.parse(req.body);
      const requirement = await storage.createRequirement(validatedData);
      
      // Log activity
      await storage.createSystemActivity({
        userId: 1,
        activityType: "create",
        description: `Creó requerimiento ${requirement.code}`,
        entityType: "requirement",
        entityId: requirement.id
      });
      
      res.status(201).json(requirement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Error creating requirement" });
    }
  });

  app.post("/api/requirements/:id/details", async (req: Request, res: Response) => {
    try {
      const requirementId = parseInt(req.params.id);
      const requirement = await storage.getRequirement(requirementId);
      if (!requirement) {
        return res.status(404).json({ message: "Requirement not found" });
      }

      const validatedData = insertRequirementDetailSchema.parse({
        ...req.body,
        requirementId
      });
      
      const detail = await storage.createRequirementDetail(validatedData);
      
      res.status(201).json(detail);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Error creating requirement detail" });
    }
  });

  app.put("/api/requirements/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertRequirementSchema.partial().parse(req.body);
      const requirement = await storage.updateRequirement(id, validatedData);
      
      if (!requirement) {
        return res.status(404).json({ message: "Requirement not found" });
      }
      
      // Log activity
      await storage.createSystemActivity({
        userId: 1,
        activityType: "update",
        description: `Actualizó requerimiento ${requirement.code}`,
        entityType: "requirement",
        entityId: requirement.id
      });
      
      res.json(requirement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Error updating requirement" });
    }
  });

  // Purchase Order routes
  app.get("/api/purchase-orders", async (_req: Request, res: Response) => {
    const orders = await storage.getPurchaseOrders();
    res.json(orders);
  });

  app.get("/api/purchase-orders/active", async (_req: Request, res: Response) => {
    const orders = await storage.getActivePurchaseOrders();
    res.json(orders);
  });

  app.get("/api/purchase-orders/delayed", async (_req: Request, res: Response) => {
    const orders = await storage.getDelayedPurchaseOrders();
    res.json(orders);
  });

  app.get("/api/purchase-orders/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const order = await storage.getPurchaseOrder(id);
    if (!order) {
      return res.status(404).json({ message: "Purchase order not found" });
    }
    res.json(order);
  });

  app.get("/api/purchase-orders/:id/details", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const order = await storage.getPurchaseOrder(id);
    if (!order) {
      return res.status(404).json({ message: "Purchase order not found" });
    }
    const details = await storage.getPurchaseOrderDetails(id);
    res.json(details);
  });

  app.post("/api/purchase-orders", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPurchaseOrderSchema.parse(req.body);
      const order = await storage.createPurchaseOrder(validatedData);
      
      // Log activity
      await storage.createSystemActivity({
        userId: 1,
        activityType: "create",
        description: `Creó orden de compra ${order.code}`,
        entityType: "purchase_order",
        entityId: order.id
      });
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Error creating purchase order" });
    }
  });

  app.post("/api/purchase-orders/:id/details", async (req: Request, res: Response) => {
    try {
      const purchaseOrderId = parseInt(req.params.id);
      const order = await storage.getPurchaseOrder(purchaseOrderId);
      if (!order) {
        return res.status(404).json({ message: "Purchase order not found" });
      }

      const validatedData = insertPurchaseOrderDetailSchema.parse({
        ...req.body,
        purchaseOrderId
      });
      
      const detail = await storage.createPurchaseOrderDetail(validatedData);
      
      res.status(201).json(detail);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Error creating purchase order detail" });
    }
  });

  app.put("/api/purchase-orders/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPurchaseOrderSchema.partial().parse(req.body);
      const order = await storage.updatePurchaseOrder(id, validatedData);
      
      if (!order) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      
      // Log activity
      await storage.createSystemActivity({
        userId: 1,
        activityType: "update",
        description: `Actualizó orden de compra ${order.code}`,
        entityType: "purchase_order",
        entityId: order.id
      });
      
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Error updating purchase order" });
    }
  });

  // Reception routes
  app.get("/api/receptions", async (_req: Request, res: Response) => {
    const receptions = await storage.getReceptions();
    res.json(receptions);
  });

  app.get("/api/receptions/scheduled", async (_req: Request, res: Response) => {
    const receptions = await storage.getScheduledReceptions();
    res.json(receptions);
  });

  app.get("/api/receptions/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const reception = await storage.getReception(id);
    if (!reception) {
      return res.status(404).json({ message: "Reception not found" });
    }
    res.json(reception);
  });

  app.get("/api/receptions/:id/details", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const reception = await storage.getReception(id);
    if (!reception) {
      return res.status(404).json({ message: "Reception not found" });
    }
    const details = await storage.getReceptionDetails(id);
    res.json(details);
  });

  app.post("/api/receptions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertReceptionSchema.parse(req.body);
      const reception = await storage.createReception(validatedData);
      
      // Log activity
      await storage.createSystemActivity({
        userId: 1,
        activityType: "create",
        description: `Creó recepción ${reception.code}`,
        entityType: "reception",
        entityId: reception.id
      });
      
      res.status(201).json(reception);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Error creating reception" });
    }
  });

  app.post("/api/receptions/:id/details", async (req: Request, res: Response) => {
    try {
      const receptionId = parseInt(req.params.id);
      const reception = await storage.getReception(receptionId);
      if (!reception) {
        return res.status(404).json({ message: "Reception not found" });
      }

      const validatedData = insertReceptionDetailSchema.parse({
        ...req.body,
        receptionId
      });
      
      const detail = await storage.createReceptionDetail(validatedData);
      
      // Create inventory movement
      if (detail.status === 'completed' || detail.status === 'partial') {
        const product = await storage.getProduct(detail.productId);
        if (product) {
          // Update product stock
          await storage.updateProductStock(detail.productId, detail.quantityReceived);
          
          // Create inventory movement record
          await storage.createInventoryMovement({
            productId: detail.productId,
            quantity: detail.quantityReceived,
            unit: detail.unit,
            movementType: 'reception',
            referenceId: reception.id,
            referenceType: 'reception',
            notes: `Recepción ${reception.code}`,
            createdBy: 1
          });
        }
      }
      
      res.status(201).json(detail);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Error creating reception detail" });
    }
  });

  app.put("/api/receptions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertReceptionSchema.partial().parse(req.body);
      const reception = await storage.updateReception(id, validatedData);
      
      if (!reception) {
        return res.status(404).json({ message: "Reception not found" });
      }
      
      // Log activity
      await storage.createSystemActivity({
        userId: 1,
        activityType: "update",
        description: `Actualizó recepción ${reception.code}`,
        entityType: "reception",
        entityId: reception.id
      });
      
      res.json(reception);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Error updating reception" });
    }
  });

  // Inventory routes
  app.get("/api/inventory/movements", async (req: Request, res: Response) => {
    const productId = req.query.productId ? parseInt(req.query.productId as string) : undefined;
    const movements = await storage.getInventoryMovements(productId);
    res.json(movements);
  });

  app.get("/api/inventory/recent-movements", async (req: Request, res: Response) => {
    const days = req.query.days ? parseInt(req.query.days as string) : 7;
    const movements = await storage.getRecentInventoryMovements(days);
    res.json(movements);
  });

  app.post("/api/inventory/movements", async (req: Request, res: Response) => {
    try {
      const validatedData = insertInventoryMovementSchema.parse(req.body);
      const movement = await storage.createInventoryMovement(validatedData);
      
      // Update product stock
      await storage.updateProductStock(movement.productId, movement.quantity);
      
      // Log activity
      await storage.createSystemActivity({
        userId: 1,
        activityType: "create",
        description: `Registró movimiento de inventario`,
        entityType: "inventory_movement",
        entityId: movement.id
      });
      
      res.status(201).json(movement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Error creating inventory movement" });
    }
  });

  // Output routes
  app.get("/api/outputs", async (_req: Request, res: Response) => {
    const outputs = await storage.getOutputs();
    res.json(outputs);
  });

  app.get("/api/outputs/pending", async (_req: Request, res: Response) => {
    const outputs = await storage.getPendingOutputs();
    res.json(outputs);
  });

  app.get("/api/outputs/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const output = await storage.getOutput(id);
    if (!output) {
      return res.status(404).json({ message: "Output not found" });
    }
    res.json(output);
  });

  app.get("/api/outputs/:id/details", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const output = await storage.getOutput(id);
    if (!output) {
      return res.status(404).json({ message: "Output not found" });
    }
    const details = await storage.getOutputDetails(id);
    res.json(details);
  });

  app.post("/api/outputs", async (req: Request, res: Response) => {
    try {
      const validatedData = insertOutputSchema.parse(req.body);
      const output = await storage.createOutput(validatedData);
      
      // Log activity
      await storage.createSystemActivity({
        userId: 1,
        activityType: "create",
        description: `Creó salida ${output.code}`,
        entityType: "output",
        entityId: output.id
      });
      
      res.status(201).json(output);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Error creating output" });
    }
  });

  app.post("/api/outputs/:id/details", async (req: Request, res: Response) => {
    try {
      const outputId = parseInt(req.params.id);
      const output = await storage.getOutput(outputId);
      if (!output) {
        return res.status(404).json({ message: "Output not found" });
      }

      const validatedData = insertOutputDetailSchema.parse({
        ...req.body,
        outputId
      });
      
      const detail = await storage.createOutputDetail(validatedData);
      
      // If the output is completed, update inventory
      if (output.status === 'completed' || detail.status === 'completed') {
        const product = await storage.getProduct(detail.productId);
        if (product) {
          // Update product stock
          await storage.updateProductStock(detail.productId, -detail.quantity);
          
          // Create inventory movement record
          await storage.createInventoryMovement({
            productId: detail.productId,
            quantity: -detail.quantity,
            unit: detail.unit,
            movementType: 'output',
            referenceId: output.id,
            referenceType: 'output',
            notes: `Salida ${output.code}`,
            createdBy: 1
          });
        }
      }
      
      res.status(201).json(detail);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Error creating output detail" });
    }
  });

  app.put("/api/outputs/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertOutputSchema.partial().parse(req.body);
      
      const existingOutput = await storage.getOutput(id);
      if (!existingOutput) {
        return res.status(404).json({ message: "Output not found" });
      }
      
      // If changing status to completed, process inventory movements
      if (validatedData.status === 'completed' && existingOutput.status !== 'completed') {
        const details = await storage.getOutputDetails(id);
        
        for (const detail of details) {
          if (detail.status !== 'completed') {
            // Update product stock
            await storage.updateProductStock(detail.productId, -detail.quantity);
            
            // Update detail status
            await storage.updateOutputDetail(detail.id, { status: 'completed' });
            
            // Create inventory movement record
            await storage.createInventoryMovement({
              productId: detail.productId,
              quantity: -detail.quantity,
              unit: detail.unit,
              movementType: 'output',
              referenceId: id,
              referenceType: 'output',
              notes: `Salida ${existingOutput.code}`,
              createdBy: 1
            });
          }
        }
      }
      
      const output = await storage.updateOutput(id, validatedData);
      
      // Log activity
      await storage.createSystemActivity({
        userId: 1,
        activityType: "update",
        description: `Actualizó salida ${output.code}`,
        entityType: "output",
        entityId: output.id
      });
      
      res.json(output);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Error updating output" });
    }
  });

  // Invoice routes
  app.get("/api/invoices", async (_req: Request, res: Response) => {
    const invoices = await storage.getInvoices();
    res.json(invoices);
  });

  app.get("/api/invoices/due", async (_req: Request, res: Response) => {
    const invoices = await storage.getDueInvoices();
    res.json(invoices);
  });

  app.get("/api/invoices/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const invoice = await storage.getInvoice(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json(invoice);
  });

  app.post("/api/invoices", async (req: Request, res: Response) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData);
      
      // Log activity
      await storage.createSystemActivity({
        userId: 1,
        activityType: "create",
        description: `Registró factura ${invoice.code}`,
        entityType: "invoice",
        entityId: invoice.id
      });
      
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Error creating invoice" });
    }
  });

  app.put("/api/invoices/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertInvoiceSchema.partial().parse(req.body);
      const invoice = await storage.updateInvoice(id, validatedData);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // Log activity
      await storage.createSystemActivity({
        userId: 1,
        activityType: "update",
        description: `Actualizó factura ${invoice.code}`,
        entityType: "invoice",
        entityId: invoice.id
      });
      
      res.json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Error updating invoice" });
    }
  });

  // System Activity routes
  app.get("/api/activities", async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const activities = await storage.getSystemActivities(limit);
    res.json(activities);
  });

  app.post("/api/activities", async (req: Request, res: Response) => {
    try {
      const validatedData = insertSystemActivitySchema.parse(req.body);
      const activity = await storage.createSystemActivity(validatedData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Error creating activity" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
