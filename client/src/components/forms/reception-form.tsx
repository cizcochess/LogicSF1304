import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  insertReceptionSchema, 
  PurchaseOrder, 
  PurchaseOrderDetail,
  Supplier, 
  User 
} from "@shared/schema";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle2, AlertTriangle } from "lucide-react";

// Extended schema with validation
const extendedReceptionSchema = insertReceptionSchema.extend({
  code: z.string().min(3, {
    message: "El código debe tener al menos 3 caracteres"
  }).regex(/^REC-\d{4}-\d{3}$/, {
    message: "El código debe tener el formato REC-YYYY-NNN"
  }),
  purchaseOrderId: z.string().optional(),
  supplierId: z.string().min(1, { message: "Debe seleccionar un proveedor" }),
  status: z.string().min(1, { message: "Debe seleccionar un estado" }),
  receivedBy: z.string().min(1, { message: "Debe seleccionar un responsable" }),
});

type ReceptionFormData = z.infer<typeof extendedReceptionSchema>;

interface ReceptionFormProps {
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  users: User[];
  onSuccess: () => void;
  isLoading?: boolean;
  // Function to fetch purchase order details
  getPurchaseOrderDetails: (id: number) => Promise<PurchaseOrderDetail[]>;
}

const ReceptionForm = ({
  purchaseOrders,
  suppliers,
  users,
  onSuccess,
  isLoading = false,
  getPurchaseOrderDetails
}: ReceptionFormProps) => {
  const { toast } = useToast();
  const [poDetails, setPODetails] = useState<PurchaseOrderDetail[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [receptionDetails, setReceptionDetails] = useState<Array<{
    purchaseOrderDetailId: number;
    productId: number;
    productName: string;
    quantityExpected: number;
    quantityReceived: number;
    unit: string;
    notes?: string;
    status: string;
  }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Main form
  const form = useForm<ReceptionFormData>({
    resolver: zodResolver(extendedReceptionSchema),
    defaultValues: {
      code: `REC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
      purchaseOrderId: "",
      supplierId: "",
      status: "pending",
      notes: "",
      receivedBy: "1", // Default to first user
      receivedAt: new Date().toISOString().split('T')[0],
    }
  });

  // Handle purchase order selection
  const handlePurchaseOrderChange = async (poId: string) => {
    if (!poId) {
      setPODetails([]);
      setReceptionDetails([]);
      return;
    }

    setIsLoadingDetails(true);

    try {
      const purchaseOrderId = parseInt(poId);
      const po = purchaseOrders.find(po => po.id === purchaseOrderId);
      
      if (po) {
        // Update supplier value
        form.setValue("supplierId", po.supplierId.toString());
      }

      // Fetch purchase order details
      const details = await getPurchaseOrderDetails(purchaseOrderId);
      setPODetails(details);
      
      // Pre-populate reception details
      const newReceptionDetails = details.map(detail => ({
        purchaseOrderDetailId: detail.id,
        productId: detail.productId,
        productName: detail.productId.toString(), // This would ideally be product name, but we'll use id for now
        quantityExpected: detail.quantity,
        quantityReceived: detail.quantity, // Default to expected quantity
        unit: detail.unit,
        notes: "",
        status: "pending"
      }));
      
      setReceptionDetails(newReceptionDetails);
    } catch (error) {
      console.error("Error fetching purchase order details:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de la orden de compra",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Update reception detail
  const updateReceptionDetail = (index: number, field: string, value: any) => {
    const updatedDetails = [...receptionDetails];
    
    if (field === "quantityReceived") {
      const parsedValue = parseFloat(value);
      
      if (isNaN(parsedValue) || parsedValue < 0) {
        return; // Invalid input
      }
      
      updatedDetails[index].quantityReceived = parsedValue;
      
      // Automatically update status based on quantity
      const detail = updatedDetails[index];
      if (parsedValue === 0) {
        updatedDetails[index].status = "pending";
      } else if (parsedValue < detail.quantityExpected) {
        updatedDetails[index].status = "partial";
      } else {
        updatedDetails[index].status = "completed";
      }
    } else if (field === "notes") {
      updatedDetails[index].notes = value;
    } else if (field === "status") {
      updatedDetails[index].status = value;
    }
    
    setReceptionDetails(updatedDetails);
  };

  const onSubmit = async (data: ReceptionFormData) => {
    if (receptionDetails.length === 0) {
      toast({
        title: "Error",
        description: "No hay detalles para esta recepción",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Convert string values to their appropriate types
      const receptionData = {
        ...data,
        purchaseOrderId: data.purchaseOrderId ? parseInt(data.purchaseOrderId.toString()) : null,
        supplierId: parseInt(data.supplierId.toString()),
        receivedBy: parseInt(data.receivedBy.toString()),
        receivedAt: new Date(data.receivedAt || new Date()).toISOString()
      };

      // Create reception first
      const res = await apiRequest("POST", "/api/receptions", receptionData);
      const reception = await res.json();

      // Then create all details
      for (const detail of receptionDetails) {
        const detailData = {
          receptionId: reception.id,
          purchaseOrderDetailId: detail.purchaseOrderDetailId,
          productId: detail.productId,
          quantityExpected: detail.quantityExpected,
          quantityReceived: detail.quantityReceived,
          unit: detail.unit,
          notes: detail.notes,
          status: detail.status
        };

        await apiRequest("POST", `/api/receptions/${reception.id}/details`, detailData);
      }

      toast({
        title: "Recepción creada",
        description: `La recepción ${reception.code} ha sido creada exitosamente`,
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error creating reception:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear la recepción",
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
          <CardTitle>Nueva Recepción</CardTitle>
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
                        <Input {...field} disabled placeholder="REC-2023-001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purchaseOrderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Orden de Compra (opcional)</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          handlePurchaseOrderChange(value);
                        }} 
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar orden de compra" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Ninguna</SelectItem>
                          {purchaseOrders.map(po => (
                            <SelectItem key={po.id} value={po.id.toString()}>
                              {po.code} - {po.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Al seleccionar una orden de compra, se cargarán automáticamente los productos asociados
                      </FormDescription>
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
                        value={field.value.toString()}
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
                          <SelectItem value="scheduled">Programada</SelectItem>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="partial">Parcial</SelectItem>
                          <SelectItem value="completed">Completada</SelectItem>
                          <SelectItem value="cancelled">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="receivedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recibido por</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar responsable" />
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
                  name="receivedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de recepción</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
          <CardTitle>Detalle de Recepción</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingDetails ? (
            <div className="text-center py-8">Cargando detalles de la orden de compra...</div>
          ) : receptionDetails.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {form.watch('purchaseOrderId') 
                ? "No hay productos en esta orden de compra" 
                : "Seleccione una orden de compra para cargar sus productos"}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad Esperada</TableHead>
                    <TableHead>Cantidad Recibida</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receptionDetails.map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell>{detail.productName}</TableCell>
                      <TableCell>{detail.quantityExpected}</TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          min="0"
                          step="0.01"
                          value={detail.quantityReceived}
                          onChange={(e) => updateReceptionDetail(index, "quantityReceived", e.target.value)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>{detail.unit}</TableCell>
                      <TableCell>
                        <Select 
                          value={detail.status}
                          onValueChange={(value) => updateReceptionDetail(index, "status", value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="partial">Parcial</SelectItem>
                            <SelectItem value="completed">Completado</SelectItem>
                            <SelectItem value="rejected">Rechazado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={detail.notes || ''}
                          onChange={(e) => updateReceptionDetail(index, "notes", e.target.value)}
                          placeholder="Notas"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4">
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-yellow-800">Importante</h4>
                <p className="text-sm text-yellow-700">
                  Al registrar una recepción, se actualizará automáticamente el inventario según las cantidades recibidas.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
            {receptionDetails.length} productos listos para recepción
          </div>
          <div className="space-x-2">
            <Button variant="outline">Cancelar</Button>
            <Button 
              onClick={form.handleSubmit(onSubmit)} 
              disabled={isSubmitting || isLoading || receptionDetails.length === 0}
            >
              {isSubmitting ? "Guardando..." : "Registrar Recepción"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ReceptionForm;
