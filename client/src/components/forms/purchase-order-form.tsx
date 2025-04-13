import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  insertPurchaseOrderSchema, 
  Product, 
  Supplier, 
  User,
  Requirement,
} from "@shared/schema";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Extended schema with validation
const extendedPurchaseOrderSchema = insertPurchaseOrderSchema.extend({
  title: z.string().min(5, {
    message: "El título debe tener al menos 5 caracteres"
  }),
  code: z.string().min(3, {
    message: "El código debe tener al menos 3 caracteres"
  }).regex(/^OC-\d{4}-\d{3}$/, {
    message: "El código debe tener el formato OC-YYYY-NNN"
  }),
  expectedDeliveryDate: z.string().refine(date => new Date(date) > new Date(), {
    message: "La fecha de entrega debe ser en el futuro"
  }),
  supplierId: z.string().min(1, { message: "Debe seleccionar un proveedor" }),
  requirementId: z.string().optional(),
  status: z.string().min(1, { message: "Debe seleccionar un estado" }),
  currency: z.string().min(1, { message: "Debe seleccionar una moneda" }),
});

// Detail schema for the form
const detailFormSchema = z.object({
  productId: z.string().min(1, { message: "Seleccione un producto" }),
  quantity: z.string().min(1, { message: "Ingrese una cantidad" }).refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "La cantidad debe ser un número positivo" }
  ),
  unit: z.string().min(1, { message: "Ingrese una unidad" }),
  unitPrice: z.string().min(1, { message: "Ingrese un precio unitario" }).refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "El precio debe ser un número positivo" }
  ),
  notes: z.string().optional(),
});

type PurchaseOrderFormData = z.infer<typeof extendedPurchaseOrderSchema>;
type DetailFormData = z.infer<typeof detailFormSchema>;

interface PurchaseOrderFormProps {
  products: Product[];
  suppliers: Supplier[];
  users: User[];
  requirements: Requirement[];
  onSuccess: () => void;
  isLoading?: boolean;
}

const PurchaseOrderForm = ({
  products,
  suppliers,
  users,
  requirements,
  onSuccess,
  isLoading = false,
  purchaseOrder,
}: PurchaseOrderFormProps) => {
  const detailForm = useForm<DetailFormData>({
    resolver: zodResolver(detailFormSchema),
    defaultValues: {
      productId: "",
      quantity: "",
      unit: "",
      unitPrice: "",
      notes: "",
    }
  });
  const { toast } = useToast();
  const [details, setDetails] = useState<Array<{
    productId: number;
    productName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
  }>>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Main form
  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(extendedPurchaseOrderSchema),
    defaultValues: {
      code: `OC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
      title: "",
      supplierId: "",
      requirementId: "",
      status: "pending",
      totalAmount: 0,
      currency: "USD",
      notes: "",
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdBy: 1, // Default to first user as number
    }
  });

  // Placeholder function - needs implementation based on your data structure
  const getProductName = (productId: number): string => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : "Producto no encontrado";
  };

  // Cargar datos del requerimiento si se proporciona
  const loadRequirementData = async (requirementId: number) => {
    try {
      const requirement = requirements.find(r => r.id === requirementId);
      if (requirement && requirement.status === 'approved') {
        // Actualizar datos básicos del requerimiento
        form.setValue('title', `OC para ${requirement.title}`);
        form.setValue('requirementId', requirementId.toString());
        form.setValue('departmentId', requirement.departmentId);
        form.setValue('notes', requirement.notes || '');

        // Obtener detalles del requerimiento
        const response = await fetch(`/api/requirements/${requirementId}/details`);
        const requirementDetails = await response.json();

        // Convertir detalles a formato de orden de compra
        const newDetails = requirementDetails.map((detail: any) => {
          const product = products.find(p => p.id === detail.productId);
          const defaultPrice = product?.cost || 0;
          const quantity = parseFloat(detail.quantity);

          return {
            productId: detail.productId,
            productName: product?.name || 'Producto no encontrado',
            quantity: quantity,
            unit: detail.unit,
            unitPrice: defaultPrice,
            totalPrice: defaultPrice * quantity,
            notes: detail.notes
          };
        });

        // Actualizar detalles y total
        setDetails(newDetails);
        const newTotal = newDetails.reduce((sum, detail) => sum + detail.totalPrice, 0);
        setTotalAmount(newTotal);
        form.setValue('totalAmount', newTotal.toString());

        // Notificar al usuario
        toast({
          title: "Datos cargados",
          description: `Se han cargado los datos del requerimiento ${requirement.code}`,
        });
      }
    } catch (error) {
      console.error('Error loading requirement data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del requerimiento",
        variant: "destructive"
      });
    }
  };

  const addDetail = (data: DetailFormData) => {
    const productId = parseInt(data.productId);
    const product = products.find(p => p.id === productId);

    if (!product) {
      toast({
        title: "Error",
        description: "Producto no encontrado",
        variant: "destructive"
      });
      return;
    }

    const quantity = parseFloat(data.quantity);
    const unitPrice = parseFloat(data.unitPrice);
    const totalPrice = quantity * unitPrice;

    const newDetails = [
      ...details,
      {
        productId,
        productName: product.name,
        quantity,
        unit: data.unit,
        unitPrice,
        totalPrice,
        notes: data.notes
      }
    ];

    setDetails(newDetails);

    // Update total amount
    const newTotal = newDetails.reduce((sum, detail) => sum + detail.totalPrice, 0);
    setTotalAmount(newTotal);
    form.setValue("totalAmount", newTotal.toString());

    detailForm.reset({
      productId: "",
      quantity: "",
      unit: product.unit, // Pre-fill with product's default unit
      unitPrice: product.cost ? product.cost.toString() : "", // Pre-fill with product's cost if available
      notes: "",
    });
  };

  const removeDetail = (index: number) => {
    const newDetails = details.filter((_, i) => i !== index);
    setDetails(newDetails);

    // Update total amount
    const newTotal = newDetails.reduce((sum, detail) => sum + detail.totalPrice, 0);
    setTotalAmount(newTotal);
    form.setValue("totalAmount", newTotal.toString());
  };

  const handleProductSelect = (value: string) => {
    const productId = parseInt(value);
    const product = products.find(p => p.id === productId);

    if (product) {
      detailForm.setValue("unit", product.unit);
      if (product.cost) {
        detailForm.setValue("unitPrice", product.cost.toString());
      }
    }
  };

  const onSubmit = async (data: PurchaseOrderFormData) => {
    if (details.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un producto a la orden de compra",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert string values to their appropriate types
      const purchaseOrderData = {
        ...data,
        supplierId: parseInt(data.supplierId),
        requirementId: data.requirementId ? parseInt(data.requirementId) : null,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        createdBy: parseInt(data.createdBy.toString()),
        expectedDeliveryDate: new Date(data.expectedDeliveryDate).toISOString()
      };

      // Create purchase order first
      const res = await apiRequest("POST", "/api/purchase-orders", purchaseOrderData);
      if (!res.ok) {
        throw new Error('Error creating purchase order');
      }
      const purchaseOrder = await res.json();

      // Then create all details
      for (const detail of details) {
        const detailData = {
          purchaseOrderId: purchaseOrder.id,
          productId: detail.productId,
          quantity: detail.quantity,
          unit: detail.unit,
          unitPrice: detail.unitPrice,
          totalPrice: detail.totalPrice,
          notes: detail.notes,
        };

        await apiRequest("POST", `/api/purchase-orders/${purchaseOrder.id}/details`, detailData);
      }

      toast({
        title: "Orden de compra creada",
        description: `La orden de compra ${purchaseOrder.code} ha sido creada exitosamente`,
      });

      onSuccess();
    } catch (error) {
      console.error("Error creating purchase order:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear la orden de compra",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nueva Orden de Compra</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input {...field} disabled placeholder="OC-2023-001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Título de la orden de compra" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proveedor</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar proveedor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers.map(supplier => (
                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requirementId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requerimiento (opcional)</FormLabel>
                      <Select 
                        onValueChange={async (value) => {
                          field.onChange(value);
                          if (value !== "0") {
                            await loadRequirementData(parseInt(value));
                          } else {
                            setDetails([]);
                            form.setValue('title', '');
                          }
                        }} 
                        value={field.value?.toString() || "0"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar requerimiento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Ninguno</SelectItem>
                          {requirements
                            .filter(req => req.status === 'approved')
                            .map(req => (
                              <SelectItem key={req.id} value={req.id.toString()}>
                                {req.code} - {req.title}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || "pending"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="confirmed">Confirmada</SelectItem>
                          <SelectItem value="partial">Parcialmente recibida</SelectItem>
                          <SelectItem value="completed">Completada</SelectItem>
                          <SelectItem value="cancelled">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expectedDeliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de entrega esperada</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || "USD"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar moneda" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                          <SelectItem value="COP">COP - Peso Colombiano</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="createdBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Creado por</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value?.toString() || "1"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar usuario" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Observaciones o comentarios adicionales" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </form>
        </Form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...detailForm}>
            <form onSubmit={detailForm.handleSubmit(addDetail)} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
              <FormField
                control={detailForm.control}
                name="productId"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Producto</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleProductSelect(value);
                      }} 
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar producto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.code} - {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={detailForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0.01" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={detailForm.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="unidad, kg, m, etc." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={detailForm.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio Unitario</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0.01" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={detailForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Notas" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Agregar
                </Button>
              </div>
            </form>
          </Form>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Precio Unit.</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-6">
                      No hay productos agregados
                    </TableCell>
                  </TableRow>
                ) : (
                  details.map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell>{detail.productName}</TableCell>
                      <TableCell>{detail.quantity}</TableCell>
                      <TableCell>{detail.unit}</TableCell>
                      <TableCell>{detail.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>{detail.totalPrice.toFixed(2)}</TableCell>
                      <TableCell>{detail.notes || '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDetail(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex justify-end">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="font-semibold">Total: {form.watch("currency")} {totalAmount.toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" /> Vista Previa
          </Button>
          <div className="space-x-2">
            <Button variant="outline">Cancelar</Button>
            <Button 
              onClick={form.handleSubmit(onSubmit)} 
              disabled={isSubmitting || isLoading || details.length === 0}
            >
              {isSubmitting ? "Guardando..." : "Crear Orden de Compra"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PurchaseOrderForm;