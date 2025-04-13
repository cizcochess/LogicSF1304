import {
  users, suppliers, products, requirements, requirementDetails, 
  purchaseOrders, purchaseOrderDetails, receptions, receptionDetails,
  inventoryMovements, outputs, outputDetails, invoices, systemActivities,
  type User, type InsertUser, type Supplier, type InsertSupplier,
  type Product, type InsertProduct, type Requirement, type InsertRequirement,
  type RequirementDetail, type InsertRequirementDetail, type PurchaseOrder, type InsertPurchaseOrder,
  type PurchaseOrderDetail, type InsertPurchaseOrderDetail, type Reception, type InsertReception,
  type ReceptionDetail, type InsertReceptionDetail, type InventoryMovement, type InsertInventoryMovement,
  type Output, type InsertOutput, type OutputDetail, type InsertOutputDetail,
  type Invoice, type InsertInvoice, type SystemActivity, type InsertSystemActivity
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;

  // Supplier operations
  getSupplier(id: number): Promise<Supplier | undefined>;
  getSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;

  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProductByCode(code: string): Promise<Product | undefined>;
  getProducts(): Promise<Product[]>;
  getProductsWithLowStock(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  updateProductStock(id: number, quantity: number): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Requirement operations
  getRequirement(id: number): Promise<Requirement | undefined>;
  getRequirementByCode(code: string): Promise<Requirement | undefined>;
  getRequirements(): Promise<Requirement[]>;
  getPendingRequirements(): Promise<Requirement[]>;
  createRequirement(requirement: InsertRequirement): Promise<Requirement>;
  updateRequirement(id: number, requirement: Partial<InsertRequirement>): Promise<Requirement | undefined>;
  deleteRequirement(id: number): Promise<boolean>;

  // Requirement Detail operations
  getRequirementDetails(requirementId: number): Promise<RequirementDetail[]>;
  createRequirementDetail(detail: InsertRequirementDetail): Promise<RequirementDetail>;
  updateRequirementDetail(id: number, detail: Partial<InsertRequirementDetail>): Promise<RequirementDetail | undefined>;
  deleteRequirementDetail(id: number): Promise<boolean>;

  // Purchase Order operations
  getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined>;
  getPurchaseOrderByCode(code: string): Promise<PurchaseOrder | undefined>;
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  getActivePurchaseOrders(): Promise<PurchaseOrder[]>;
  getDelayedPurchaseOrders(): Promise<PurchaseOrder[]>;
  createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: number, order: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined>;
  deletePurchaseOrder(id: number): Promise<boolean>;

  // Purchase Order Detail operations
  getPurchaseOrderDetails(purchaseOrderId: number): Promise<PurchaseOrderDetail[]>;
  createPurchaseOrderDetail(detail: InsertPurchaseOrderDetail): Promise<PurchaseOrderDetail>;
  updatePurchaseOrderDetail(id: number, detail: Partial<InsertPurchaseOrderDetail>): Promise<PurchaseOrderDetail | undefined>;
  deletePurchaseOrderDetail(id: number): Promise<boolean>;

  // Reception operations
  getReception(id: number): Promise<Reception | undefined>;
  getReceptionByCode(code: string): Promise<Reception | undefined>;
  getReceptions(): Promise<Reception[]>;
  getScheduledReceptions(): Promise<Reception[]>;
  createReception(reception: InsertReception): Promise<Reception>;
  updateReception(id: number, reception: Partial<InsertReception>): Promise<Reception | undefined>;
  deleteReception(id: number): Promise<boolean>;

  // Reception Detail operations
  getReceptionDetails(receptionId: number): Promise<ReceptionDetail[]>;
  createReceptionDetail(detail: InsertReceptionDetail): Promise<ReceptionDetail>;
  updateReceptionDetail(id: number, detail: Partial<InsertReceptionDetail>): Promise<ReceptionDetail | undefined>;
  deleteReceptionDetail(id: number): Promise<boolean>;

  // Inventory Movement operations
  getInventoryMovements(productId?: number): Promise<InventoryMovement[]>;
  getRecentInventoryMovements(days: number): Promise<InventoryMovement[]>;
  createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement>;

  // Output operations
  getOutput(id: number): Promise<Output | undefined>;
  getOutputByCode(code: string): Promise<Output | undefined>;
  getOutputs(): Promise<Output[]>;
  getPendingOutputs(): Promise<Output[]>;
  createOutput(output: InsertOutput): Promise<Output>;
  updateOutput(id: number, output: Partial<InsertOutput>): Promise<Output | undefined>;
  deleteOutput(id: number): Promise<boolean>;

  // Output Detail operations
  getOutputDetails(outputId: number): Promise<OutputDetail[]>;
  createOutputDetail(detail: InsertOutputDetail): Promise<OutputDetail>;
  updateOutputDetail(id: number, detail: Partial<InsertOutputDetail>): Promise<OutputDetail | undefined>;
  deleteOutputDetail(id: number): Promise<boolean>;

  // Invoice operations
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoiceByCode(code: string): Promise<Invoice | undefined>;
  getInvoices(): Promise<Invoice[]>;
  getDueInvoices(): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;

  // System Activity operations
  getSystemActivities(limit?: number): Promise<SystemActivity[]>;
  createSystemActivity(activity: InsertSystemActivity): Promise<SystemActivity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private suppliers: Map<number, Supplier>;
  private products: Map<number, Product>;
  private requirements: Map<number, Requirement>;
  private requirementDetails: Map<number, RequirementDetail>;
  private purchaseOrders: Map<number, PurchaseOrder>;
  private purchaseOrderDetails: Map<number, PurchaseOrderDetail>;
  private receptions: Map<number, Reception>;
  private receptionDetails: Map<number, ReceptionDetail>;
  private inventoryMovements: Map<number, InventoryMovement>;
  private outputs: Map<number, Output>;
  private outputDetails: Map<number, OutputDetail>;
  private invoices: Map<number, Invoice>;
  private systemActivities: Map<number, SystemActivity>;

  private userId: number;
  private supplierId: number;
  private productId: number;
  private requirementId: number;
  private requirementDetailId: number;
  private purchaseOrderId: number;
  private purchaseOrderDetailId: number;
  private receptionId: number;
  private receptionDetailId: number;
  private inventoryMovementId: number;
  private outputId: number;
  private outputDetailId: number;
  private invoiceId: number;
  private systemActivityId: number;

  constructor() {
    this.users = new Map();
    this.suppliers = new Map();
    this.products = new Map();
    this.requirements = new Map();
    this.requirementDetails = new Map();
    this.purchaseOrders = new Map();
    this.purchaseOrderDetails = new Map();
    this.receptions = new Map();
    this.receptionDetails = new Map();
    this.inventoryMovements = new Map();
    this.outputs = new Map();
    this.outputDetails = new Map();
    this.invoices = new Map();
    this.systemActivities = new Map();

    this.userId = 1;
    this.supplierId = 1;
    this.productId = 1;
    this.requirementId = 1;
    this.requirementDetailId = 1;
    this.purchaseOrderId = 1;
    this.purchaseOrderDetailId = 1;
    this.receptionId = 1;
    this.receptionDetailId = 1;
    this.inventoryMovementId = 1;
    this.outputId = 1;
    this.outputDetailId = 1;
    this.invoiceId = 1;
    this.systemActivityId = 1;

    // Create admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      fullName: "Administrator",
      role: "admin",
      department: "IT",
      email: "admin@logierp.com"
    });

    // Seed with initial data for demo purposes
    this.seedInitialData();
  }

  private seedInitialData() {
    // Seed suppliers
    const suppliers = [
      { name: "Aceros Industriales", contact: "Juan Pérez", email: "juan@aceros.com", phone: "555-1234", address: "Calle Industrial 123", taxId: "AI12345", notes: "Proveedor principal de materiales metálicos", status: "active" },
      { name: "Electrónicos SA", contact: "María López", email: "maria@electronicos.com", phone: "555-5678", address: "Av. Tecnología 456", taxId: "ES67890", notes: "Componentes electrónicos", status: "active" },
      { name: "Químicos Unidos", contact: "Pedro Ramírez", email: "pedro@quimicos.com", phone: "555-9012", address: "Blvd. Ciencia 789", taxId: "QU34567", notes: "Productos químicos industriales", status: "active" }
    ];

    suppliers.forEach(s => {
      this.createSupplier(s);
    });

    // Seed products
    const products = [
      { code: "TH-5-16", name: "Tornillos hexagonales 5/16", description: "Tornillos hexagonales de acero inoxidable", category: "Ferretería", unit: "unidad", minStock: 25, currentStock: 8, location: "A-101", cost: 0.5, supplierId: 1 },
      { code: "CE-12AWG", name: "Cables eléctricos 12AWG", description: "Cable eléctrico flexible", category: "Eléctricos", unit: "metro", minStock: 50, currentStock: 15, location: "B-202", cost: 1.2, supplierId: 2 },
      { code: "LI-TIPO-A", name: "Lubricante industrial tipo A", description: "Lubricante para maquinaria pesada", category: "Químicos", unit: "litro", minStock: 5, currentStock: 2, location: "C-303", cost: 25.0, supplierId: 3 },
      { code: "TU-PVC-2", name: "Tubería PVC 2\"", description: "Tubería de PVC para instalaciones hidráulicas", category: "Plomería", unit: "metro", minStock: 30, currentStock: 45, location: "D-404", cost: 3.75, supplierId: 1 },
      { code: "FO-LED-20W", name: "Focos LED 20W", description: "Focos LED de alta eficiencia", category: "Eléctricos", unit: "unidad", minStock: 15, currentStock: 28, location: "B-205", cost: 8.5, supplierId: 2 }
    ];

    products.forEach(p => {
      this.createProduct(p);
    });

    // Seed requirements
    const requirements = [
      { code: "REQ-2023-001", title: "Materiales para mantenimiento", requestorId: 1, departmentId: "Mantenimiento", status: "pending", priority: "high", notes: "Urgente para reparación de maquinaria", dueDate: new Date(Date.now() + 86400000 * 3) },
      { code: "REQ-2023-002", title: "Insumos eléctricos", requestorId: 1, departmentId: "Producción", status: "approved", priority: "medium", notes: "Para actualización de panel eléctrico", dueDate: new Date(Date.now() + 86400000 * 5) },
      { code: "REQ-2023-003", title: "Materiales de oficina", requestorId: 1, departmentId: "Administración", status: "completed", priority: "low", notes: "Reposición de inventario de oficina", dueDate: new Date(Date.now() + 86400000 * 10) }
    ];

    requirements.forEach(r => {
      this.createRequirement(r);
    });

    // Seed requirement details
    const requirementDetails = [
      { requirementId: 1, productId: 1, quantity: 50, unit: "unidad", notes: "Para reparación de estanterías", status: "pending" },
      { requirementId: 1, productId: 3, quantity: 10, unit: "litro", notes: "Para mantenimiento de montacargas", status: "pending" },
      { requirementId: 2, productId: 2, quantity: 100, unit: "metro", notes: "Para renovación de cableado", status: "approved" },
      { requirementId: 2, productId: 5, quantity: 30, unit: "unidad", notes: "Para reemplazo de iluminación", status: "approved" },
      { requirementId: 3, productId: 4, quantity: 20, unit: "metro", notes: "Para reparación de baños", status: "completed" }
    ];

    requirementDetails.forEach(rd => {
      this.createRequirementDetail(rd);
    });

    // Seed purchase orders
    const purchaseOrders = [
      { code: "OC-2023-001", title: "Compra de tornillos y lubricantes", supplierId: 1, requirementId: 1, status: "pending", totalAmount: 150.0, currency: "USD", notes: "Entrega urgente", expectedDeliveryDate: new Date(Date.now() + 86400000 * 2), createdBy: 1 },
      { code: "OC-2023-002", title: "Compra de materiales eléctricos", supplierId: 2, requirementId: 2, status: "confirmed", totalAmount: 375.0, currency: "USD", notes: "Entrega parcial aceptada", expectedDeliveryDate: new Date(Date.now() + 86400000 * 7), createdBy: 1 },
      { code: "OC-2023-003", title: "Compra de tuberías", supplierId: 1, requirementId: 3, status: "completed", totalAmount: 75.0, currency: "USD", notes: "Entrega completada", expectedDeliveryDate: new Date(Date.now() - 86400000 * 3), createdBy: 1 }
    ];

    purchaseOrders.forEach(po => {
      this.createPurchaseOrder(po);
    });

    // Seed purchase order details
    const purchaseOrderDetails = [
      { purchaseOrderId: 1, productId: 1, quantity: 50, unit: "unidad", unitPrice: 0.5, totalPrice: 25.0, notes: "Según especificaciones" },
      { purchaseOrderId: 1, productId: 3, quantity: 5, unit: "litro", unitPrice: 25.0, totalPrice: 125.0, notes: "Marca específica requerida" },
      { purchaseOrderId: 2, productId: 2, quantity: 100, unit: "metro", unitPrice: 1.2, totalPrice: 120.0, notes: "Color azul preferido" },
      { purchaseOrderId: 2, productId: 5, quantity: 30, unit: "unidad", unitPrice: 8.5, totalPrice: 255.0, notes: "Luz cálida" },
      { purchaseOrderId: 3, productId: 4, quantity: 20, unit: "metro", unitPrice: 3.75, totalPrice: 75.0, notes: "Enviar en cortes de 2m" }
    ];

    purchaseOrderDetails.forEach(pod => {
      this.createPurchaseOrderDetail(pod);
    });

    // Seed receptions
    const receptions = [
      { code: "REC-2023-001", purchaseOrderId: 3, supplierId: 1, status: "completed", notes: "Recepción completa y en buenas condiciones", receivedBy: 1, receivedAt: new Date(Date.now() - 86400000 * 2) },
      { code: "REC-2023-002", purchaseOrderId: 2, supplierId: 2, status: "partial", notes: "Recepción parcial, pendiente el resto", receivedBy: 1, receivedAt: new Date(Date.now() - 86400000 * 1) },
      { code: "REC-2023-003", purchaseOrderId: 1, supplierId: 1, status: "scheduled", notes: "Programada para mañana", receivedBy: 1, receivedAt: new Date(Date.now() + 86400000 * 1) }
    ];

    receptions.forEach(r => {
      this.createReception(r);
    });

    // Seed reception details
    const receptionDetails = [
      { receptionId: 1, purchaseOrderDetailId: 5, productId: 4, quantityExpected: 20, quantityReceived: 20, unit: "metro", notes: "Verificado por control de calidad", status: "completed" },
      { receptionId: 2, purchaseOrderDetailId: 3, productId: 2, quantityExpected: 100, quantityReceived: 75, unit: "metro", notes: "Pendiente 25 metros", status: "partial" },
      { receptionId: 2, purchaseOrderDetailId: 4, productId: 5, quantityExpected: 30, quantityReceived: 30, unit: "unidad", notes: "Completo", status: "completed" }
    ];

    receptionDetails.forEach(rd => {
      this.createReceptionDetail(rd);
    });

    // Update stock based on receptions
    this.updateProductStock(4, 20); // Add 20 to current stock of product 4
    this.updateProductStock(2, 75); // Add 75 to current stock of product 2
    this.updateProductStock(5, 30); // Add 30 to current stock of product 5

    // Seed inventory movements
    const now = new Date();
    const dates = [
      new Date(now.getTime() - 86400000 * 6),
      new Date(now.getTime() - 86400000 * 5),
      new Date(now.getTime() - 86400000 * 4),
      new Date(now.getTime() - 86400000 * 3),
      new Date(now.getTime() - 86400000 * 2),
      new Date(now.getTime() - 86400000 * 1),
      new Date()
    ];

    const inventoryMovements = [
      { productId: 4, quantity: 20, unit: "metro", movementType: "reception", referenceId: 1, referenceType: "reception", notes: "Recepción OC-2023-003", createdBy: 1 },
      { productId: 2, quantity: 75, unit: "metro", movementType: "reception", referenceId: 2, referenceType: "reception", notes: "Recepción parcial OC-2023-002", createdBy: 1 },
      { productId: 5, quantity: 30, unit: "unidad", movementType: "reception", referenceId: 2, referenceType: "reception", notes: "Recepción OC-2023-002", createdBy: 1 },
      { productId: 4, quantity: -5, unit: "metro", movementType: "output", referenceId: 1, referenceType: "output", notes: "Salida para reparación", createdBy: 1 },
      { productId: 5, quantity: -10, unit: "unidad", movementType: "output", referenceId: 2, referenceType: "output", notes: "Salida para instalación", createdBy: 1 },
      { productId: 1, quantity: -2, unit: "unidad", movementType: "output", referenceId: 3, referenceType: "output", notes: "Salida para mantenimiento", createdBy: 1 },
      { productId: 3, quantity: -1, unit: "litro", movementType: "output", referenceId: 3, referenceType: "output", notes: "Salida para mantenimiento", createdBy: 1 }
    ];

    inventoryMovements.forEach((im, index) => {
      const movement = { ...im, createdAt: dates[index] };
      this.inventoryMovements.set(this.inventoryMovementId++, { ...movement, id: this.inventoryMovementId - 1 } as InventoryMovement);
    });

    // Seed outputs
    const outputs = [
      { code: "SAL-2023-001", destination: "Planta de Producción", destinationType: "department", status: "completed", notes: "Para reparación de tuberías", requestedBy: 1, approvedBy: 1 },
      { code: "SAL-2023-002", destination: "Área de Oficinas", destinationType: "department", status: "completed", notes: "Para renovación de iluminación", requestedBy: 1, approvedBy: 1 },
      { code: "SAL-2023-003", destination: "Departamento de Mantenimiento", destinationType: "department", status: "pending", notes: "Para reparaciones generales", requestedBy: 1, approvedBy: null }
    ];

    outputs.forEach(o => {
      this.createOutput(o);
    });

    // Seed output details
    const outputDetails = [
      { outputId: 1, productId: 4, quantity: 5, unit: "metro", notes: "Para reparación en zona A", status: "completed" },
      { outputId: 2, productId: 5, quantity: 10, unit: "unidad", notes: "Para oficinas administrativas", status: "completed" },
      { outputId: 3, productId: 1, quantity: 2, unit: "unidad", notes: "Para reparación de estanterías", status: "pending" },
      { outputId: 3, productId: 3, quantity: 1, unit: "litro", notes: "Para mantenimiento preventivo", status: "pending" }
    ];

    outputDetails.forEach(od => {
      this.createOutputDetail(od);
    });

    // Update stock based on outputs
    this.updateProductStock(4, -5); // Subtract 5 from current stock of product 4
    this.updateProductStock(5, -10); // Subtract 10 from current stock of product 5
    this.updateProductStock(1, -2); // Subtract 2 from current stock of product 1
    this.updateProductStock(3, -1); // Subtract 1 from current stock of product 3

    // Seed invoices
    const invoices = [
      { code: "INV-2023-001", supplierInvoiceNumber: "F-12345", supplierId: 1, purchaseOrderId: 3, amount: 75.0, currency: "USD", status: "paid", issueDate: new Date(Date.now() - 86400000 * 5), dueDate: new Date(Date.now() - 86400000 * 1), notes: "Pagado por transferencia" },
      { code: "INV-2023-002", supplierInvoiceNumber: "F-23456", supplierId: 2, purchaseOrderId: 2, amount: 375.0, currency: "USD", status: "pending", issueDate: new Date(Date.now() - 86400000 * 2), dueDate: new Date(Date.now() + 86400000 * 3), notes: "Pendiente de pago" },
      { code: "INV-2023-003", supplierInvoiceNumber: "F-34567", supplierId: 3, purchaseOrderId: null, amount: 150.0, currency: "USD", status: "pending", issueDate: new Date(Date.now() - 86400000 * 1), dueDate: new Date(Date.now() + 86400000 * 7), notes: "Compra fuera de sistema" }
    ];

    invoices.forEach(i => {
      this.createInvoice(i);
    });

    // Seed system activities
    const activities = [
      { userId: 1, activityType: "create", description: "Creó la orden de compra OC-2023-001", entityType: "purchase_order", entityId: 1 },
      { userId: 1, activityType: "update", description: "Actualizó el estado de la orden OC-2023-002 a confirmada", entityType: "purchase_order", entityId: 2 },
      { userId: 1, activityType: "create", description: "Creó la recepción REC-2023-001", entityType: "reception", entityId: 1 },
      { userId: 1, activityType: "create", description: "Creó la salida SAL-2023-001", entityType: "output", entityId: 1 },
      { userId: 1, activityType: "create", description: "Registró la factura INV-2023-001", entityType: "invoice", entityId: 1 },
      { userId: 1, activityType: "update", description: "Actualizó el stock del producto TU-PVC-2", entityType: "product", entityId: 4 },
      { userId: 1, activityType: "create", description: "Creó la salida SAL-2023-002", entityType: "output", entityId: 2 },
      { userId: 1, activityType: "create", description: "Creó el requerimiento REQ-2023-001", entityType: "requirement", entityId: 1 }
    ];

    activities.forEach((a, index) => {
      const activity = {
        ...a,
        createdAt: new Date(Date.now() - (8 - index) * 3600000)
      };
      this.systemActivities.set(this.systemActivityId++, { ...activity, id: this.systemActivityId - 1 } as SystemActivity);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Supplier operations
  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const id = this.supplierId++;
    const now = new Date();
    const newSupplier: Supplier = { ...supplier, id, createdAt: now };
    this.suppliers.set(id, newSupplier);
    return newSupplier;
  }

  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const existingSupplier = this.suppliers.get(id);
    if (!existingSupplier) return undefined;

    const updatedSupplier = { ...existingSupplier, ...supplier };
    this.suppliers.set(id, updatedSupplier);
    return updatedSupplier;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    return this.suppliers.delete(id);
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductByCode(code: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.code === code,
    );
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductsWithLowStock(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.currentStock <= product.minStock
    );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const now = new Date();
    const newProduct: Product = { ...product, id, createdAt: now };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;

    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async updateProductStock(id: number, quantity: number): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;

    const updatedProduct = { 
      ...existingProduct, 
      currentStock: existingProduct.currentStock + quantity 
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Requirement operations
  async getRequirement(id: number): Promise<Requirement | undefined> {
    return this.requirements.get(id);
  }

  async getRequirementByCode(code: string): Promise<Requirement | undefined> {
    return Array.from(this.requirements.values()).find(
      (requirement) => requirement.code === code,
    );
  }

  async getRequirements(): Promise<Requirement[]> {
    return Array.from(this.requirements.values());
  }

  async getPendingRequirements(): Promise<Requirement[]> {
    return Array.from(this.requirements.values()).filter(
      requirement => requirement.status === 'pending'
    );
  }

  async createRequirement(requirement: InsertRequirement): Promise<Requirement> {
    const id = this.requirementId++;
    const now = new Date();
    const newRequirement: Requirement = { ...requirement, id, createdAt: now };
    this.requirements.set(id, newRequirement);
    return newRequirement;
  }

  async updateRequirement(id: number, requirement: Partial<InsertRequirement>): Promise<Requirement | undefined> {
    const existingRequirement = this.requirements.get(id);
    if (!existingRequirement) return undefined;

    const updatedRequirement = { ...existingRequirement, ...requirement };
    this.requirements.set(id, updatedRequirement);
    return updatedRequirement;
  }

  async deleteRequirement(id: number): Promise<boolean> {
    return this.requirements.delete(id);
  }

  // Requirement Detail operations
  async getRequirementDetails(requirementId: number): Promise<RequirementDetail[]> {
    return Array.from(this.requirementDetails.values()).filter(
      detail => detail.requirementId === requirementId
    );
  }

  async createRequirementDetail(detail: InsertRequirementDetail): Promise<RequirementDetail> {
    const id = this.requirementDetailId++;
    const newDetail: RequirementDetail = { ...detail, id };
    this.requirementDetails.set(id, newDetail);
    return newDetail;
  }

  async updateRequirementDetail(id: number, detail: Partial<InsertRequirementDetail>): Promise<RequirementDetail | undefined> {
    const existingDetail = this.requirementDetails.get(id);
    if (!existingDetail) return undefined;

    const updatedDetail = { ...existingDetail, ...detail };
    this.requirementDetails.set(id, updatedDetail);
    return updatedDetail;
  }

  async deleteRequirementDetail(id: number): Promise<boolean> {
    return this.requirementDetails.delete(id);
  }

  // Purchase Order operations
  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    return this.purchaseOrders.get(id);
  }

  async getPurchaseOrderByCode(code: string): Promise<PurchaseOrder | undefined> {
    return Array.from(this.purchaseOrders.values()).find(
      (order) => order.code === code,
    );
  }

  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return Array.from(this.purchaseOrders.values());
  }

  async getActivePurchaseOrders(): Promise<PurchaseOrder[]> {
    return Array.from(this.purchaseOrders.values()).filter(
      order => ['pending', 'confirmed'].includes(order.status)
    );
  }

  async getDelayedPurchaseOrders(): Promise<PurchaseOrder[]> {
    const now = new Date();
    return Array.from(this.purchaseOrders.values()).filter(
      order => 
        ['pending', 'confirmed'].includes(order.status) && 
        order.expectedDeliveryDate && 
        order.expectedDeliveryDate < now
    );
  }

  async createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const id = this.purchaseOrderId++;
    const now = new Date();
    const newOrder: PurchaseOrder = { ...order, id, createdAt: now };
    this.purchaseOrders.set(id, newOrder);
    return newOrder;
  }

  async updatePurchaseOrder(id: number, order: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const existingOrder = this.purchaseOrders.get(id);
    if (!existingOrder) return undefined;

    const updatedOrder = { ...existingOrder, ...order };
    this.purchaseOrders.set(id, updatedOrder);
    return updatedOrder;
  }

  async deletePurchaseOrder(id: number): Promise<boolean> {
    return this.purchaseOrders.delete(id);
  }

  // Purchase Order Detail operations
  async getPurchaseOrderDetails(purchaseOrderId: number): Promise<PurchaseOrderDetail[]> {
    return Array.from(this.purchaseOrderDetails.values()).filter(
      detail => detail.purchaseOrderId === purchaseOrderId
    );
  }

  async createPurchaseOrderDetail(detail: InsertPurchaseOrderDetail): Promise<PurchaseOrderDetail> {
    const id = this.purchaseOrderDetailId++;
    const newDetail: PurchaseOrderDetail = { ...detail, id };
    this.purchaseOrderDetails.set(id, newDetail);
    return newDetail;
  }

  async updatePurchaseOrderDetail(id: number, detail: Partial<InsertPurchaseOrderDetail>): Promise<PurchaseOrderDetail | undefined> {
    const existingDetail = this.purchaseOrderDetails.get(id);
    if (!existingDetail) return undefined;

    const updatedDetail = { ...existingDetail, ...detail };
    this.purchaseOrderDetails.set(id, updatedDetail);
    return updatedDetail;
  }

  async deletePurchaseOrderDetail(id: number): Promise<boolean> {
    return this.purchaseOrderDetails.delete(id);
  }

  // Reception operations
  async getReception(id: number): Promise<Reception | undefined> {
    return this.receptions.get(id);
  }

  async getReceptionByCode(code: string): Promise<Reception | undefined> {
    return Array.from(this.receptions.values()).find(
      (reception) => reception.code === code,
    );
  }

  async getReceptions(): Promise<Reception[]> {
    return Array.from(this.receptions.values());
  }

  async getScheduledReceptions(): Promise<Reception[]> {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return Array.from(this.receptions.values()).filter(
      reception => 
        reception.status === 'scheduled' &&
        reception.receivedAt > now &&
        reception.receivedAt < nextWeek
    );
  }

  async createReception(reception: InsertReception): Promise<Reception> {
    const id = this.receptionId++;
    const now = new Date();
    const newReception: Reception = { ...reception, id, createdAt: now };
    this.receptions.set(id, newReception);
    return newReception;
  }

  async updateReception(id: number, reception: Partial<InsertReception>): Promise<Reception | undefined> {
    const existingReception = this.receptions.get(id);
    if (!existingReception) return undefined;

    const updatedReception = { ...existingReception, ...reception };
    this.receptions.set(id, updatedReception);
    return updatedReception;
  }

  async deleteReception(id: number): Promise<boolean> {
    return this.receptions.delete(id);
  }

  // Reception Detail operations
  async getReceptionDetails(receptionId: number): Promise<ReceptionDetail[]> {
    return Array.from(this.receptionDetails.values()).filter(
      detail => detail.receptionId === receptionId
    );
  }

  async createReceptionDetail(detail: InsertReceptionDetail): Promise<ReceptionDetail> {
    const id = this.receptionDetailId++;
    const newDetail: ReceptionDetail = { ...detail, id };
    this.receptionDetails.set(id, newDetail);
    return newDetail;
  }

  async updateReceptionDetail(id: number, detail: Partial<InsertReceptionDetail>): Promise<ReceptionDetail | undefined> {
    const existingDetail = this.receptionDetails.get(id);
    if (!existingDetail) return undefined;

    const updatedDetail = { ...existingDetail, ...detail };
    this.receptionDetails.set(id, updatedDetail);
    return updatedDetail;
  }

  async deleteReceptionDetail(id: number): Promise<boolean> {
    return this.receptionDetails.delete(id);
  }

  // Inventory Movement operations
  async getInventoryMovements(productId?: number): Promise<InventoryMovement[]> {
    const movements = Array.from(this.inventoryMovements.values());
    if (productId) {
      return movements.filter(movement => movement.productId === productId);
    }
    return movements;
  }

  async getRecentInventoryMovements(days: number): Promise<InventoryMovement[]> {
    const now = new Date();
    const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return Array.from(this.inventoryMovements.values()).filter(
      movement => movement.createdAt > pastDate
    );
  }

  async createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement> {
    const id = this.inventoryMovementId++;
    const now = new Date();
    const newMovement: InventoryMovement = { ...movement, id, createdAt: now };
    this.inventoryMovements.set(id, newMovement);
    return newMovement;
  }

  // Output operations
  async getOutput(id: number): Promise<Output | undefined> {
    return this.outputs.get(id);
  }

  async getOutputByCode(code: string): Promise<Output | undefined> {
    return Array.from(this.outputs.values()).find(
      (output) => output.code === code,
    );
  }

  async getOutputs(): Promise<Output[]> {
    return Array.from(this.outputs.values());
  }

  async getPendingOutputs(): Promise<Output[]> {
    return Array.from(this.outputs.values()).filter(
      output => output.status === 'pending'
    );
  }

  async createOutput(output: InsertOutput): Promise<Output> {
    const id = this.outputId++;
    const now = new Date();
    const newOutput: Output = { ...output, id, createdAt: now };
    this.outputs.set(id, newOutput);
    return newOutput;
  }

  async updateOutput(id: number, output: Partial<InsertOutput>): Promise<Output | undefined> {
    const existingOutput = this.outputs.get(id);
    if (!existingOutput) return undefined;

    const updatedOutput = { ...existingOutput, ...output };
    this.outputs.set(id, updatedOutput);
    return updatedOutput;
  }

  async deleteOutput(id: number): Promise<boolean> {
    return this.outputs.delete(id);
  }

  // Output Detail operations
  async getOutputDetails(outputId: number): Promise<OutputDetail[]> {
    return Array.from(this.outputDetails.values()).filter(
      detail => detail.outputId === outputId
    );
  }

  async createOutputDetail(detail: InsertOutputDetail): Promise<OutputDetail> {
    const id = this.outputDetailId++;
    const newDetail: OutputDetail = { ...detail, id };
    this.outputDetails.set(id, newDetail);
    return newDetail;
  }

  async updateOutputDetail(id: number, detail: Partial<InsertOutputDetail>): Promise<OutputDetail | undefined> {
    const existingDetail = this.outputDetails.get(id);
    if (!existingDetail) return undefined;

    const updatedDetail = { ...existingDetail, ...detail };
    this.outputDetails.set(id, updatedDetail);
    return updatedDetail;
  }

  async deleteOutputDetail(id: number): Promise<boolean> {
    return this.outputDetails.delete(id);
  }

  // Invoice operations
  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getInvoiceByCode(code: string): Promise<Invoice | undefined> {
    return Array.from(this.invoices.values()).find(
      (invoice) => invoice.code === code,
    );
  }

  async getInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values());
  }

  async getDueInvoices(): Promise<Invoice[]> {
    const now = new Date();
    return Array.from(this.invoices.values()).filter(
      invoice => 
        invoice.status === 'pending' && 
        invoice.dueDate > now && 
        invoice.dueDate < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    );
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const id = this.invoiceId++;
    const now = new Date();
    const newInvoice: Invoice = { ...invoice, id, createdAt: now };
    this.invoices.set(id, newInvoice);
    return newInvoice;
  }

  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const existingInvoice = this.invoices.get(id);
    if (!existingInvoice) return undefined;

    const updatedInvoice = { ...existingInvoice, ...invoice };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    return this.invoices.delete(id);
  }

  // System Activity operations
  async getSystemActivities(limit?: number): Promise<SystemActivity[]> {
    const activities = Array.from(this.systemActivities.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (limit) {
      return activities.slice(0, limit);
    }
    return activities;
  }

  async createSystemActivity(activity: InsertSystemActivity): Promise<SystemActivity> {
    const id = this.systemActivityId++;
    const now = new Date();
    const newActivity: SystemActivity = { ...activity, id, createdAt: now };
    this.systemActivities.set(id, newActivity);
    return newActivity;
  }
}

export const storage = new MemStorage();
