import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  insertOutputSchema, 
  Product, 
  User 
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
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Extended schema with validation
const extendedOutputSchema = insertOutputSchema.extend({
  code: z.string().min(3, {
    message: "El código debe tener al menos 3 caracteres"
  }).regex(/^SAL-\d{4}-\d{3}$/, {
    message: "El código debe tener el formato SAL-YYYY-NNN"
  }),
  destination: z.string().min(3, {
    message: "El destino debe tener al menos 3 caracteres"
  }),
  destinationType: z.string().min(1, { message: "Debe seleccionar un tipo de destino" }),
  status: z.string().min(1, { message: "Debe seleccionar un estado" }),
  requestedBy: z.string().min(1, { message: "Debe seleccionar un solicitante" }),
});

// Detail schema for the form
const detailFormSchema = z.object({
  productId: z.string().min(1, { message: "Seleccione un producto" }),
  quantity: z.string().min(1, { message: "Ingrese una cantidad" }).refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "La cantidad debe ser un número positivo" }
  ),
  unit: z.string().min(1, { message: "Ingrese una unidad" }),
  notes: z.string().optional(),
});

type OutputFormData = z.infer<typeof extendedOutputSchema>;
type DetailFormData = z.infer<typeof detailFormSchema>;

interface OutputFormProps {
  products: Product[];
  users: User[];
  departments: string[];
  onSuccess: () => void;
  isLoading?: boolean;
}

const OutputForm = ({
  products,
  users,
  departments,
  onSuccess,
  isLoading = false,
}: OutputFormProps) => {
  const { toast } = useToast();
  const [details, setDetails] = useState<Array<{
    productId: number;
    productName: string;
    currentStock: number;
    quantity: number;
    unit: string;
    notes?: string;
    status: string;
    isOverStock: boolean;
  }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Main form
  const form = useForm<OutputFormData>({
    resolver: zodResolver(extendedOutputSchema),
    defaultValues: {
      code: `SAL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
      destination: "",
      destinationType: "department",
      status: "pending",
      notes: "",
      requestedBy: "1", // Default to first user
      approvedBy: 0,
    }
  });

  // Detail form
  const detailForm = useForm<DetailFormData>({
    resolver: zodResolver(detailFormSchema),
    defaultValues: {
      productId: "",
      quantity: "",
      unit: "",
      notes: "",
    }
  });

  const handleProductSelect = (value: string) => {
    const productId = parseInt(value);
    const product = products.find(p => p.id === productId);
    
    if (product) {
      detailForm.setValue("unit", product.unit);
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
    const isOverStock = quantity > product.currentStock;

    if (isOverStock) {
      toast({
        title: "Advertencia",
        description: `La cantidad solicitada (${quantity}) es mayor al stock disponible (${product.currentStock})`,
        variant: "warning"
      });
    }

    setDetails([
      ...details,
      {
        productId,
        productName: product.name,
        currentStock: product.currentStock,
        quantity,
        unit: data.unit,
        notes: data.notes,
        status: "pending",
        isOverStock
      }
    ]);

    detailForm.reset({
      productId: "",
      quantity: "",
      unit: "",
      notes: "",
    });
  };

  const removeDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: OutputFormData) => {
    if (details.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un producto a la salida",
        variant: "destructive"
      });
      return;
    }

    const hasOverStock = details.some(detail => detail.isOverStock);
    if (hasOverStock && data.status === "completed") {
      toast({
        title: "Error",
        description: "No se puede completar una salida con productos que exceden el stock disponible",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Convert string values to their appropriate types
      const outputData = {
        ...data,
        requestedBy: parseInt(data.requestedBy.toString()),
        approvedBy: data.approvedBy ? parseInt(data.approvedBy.toString()) : null,
      };

      // Convert approvedBy if it's "0" or "null"
      if (outputData.approvedBy === 0 || outputData.approvedBy === "0" || outputData.approvedBy === "null") {
        outputData.approvedBy = null;
      }
      
      // Create output first
      const res = await apiRequest("POST", "/api/outputs", outputData);
      const output = await res.json();

      // Then create all details
      for (const detail of details) {
        const detailData = {
          outputId: output.id,
          productId: detail.productId,
          quantity: detail.quantity,
          unit: detail.unit,
          notes: detail.notes,
          status: output.status === "completed" ? "completed" : "pending"
        };

        await apiRequest("POST", `/api/outputs/${output.id}/details`, detailData);
      }

      toast({
        title: "Salida creada",
        description: `La salida ${output.code} ha sido creada exitosamente`,
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error creating output:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear la salida",
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
          <CardTitle>Nueva Salida de Inventario</CardTitle>
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
                        <Input {...field} disabled placeholder="SAL-2023-001" />
                      </FormControl>
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
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="approved">Aprobada</SelectItem>
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
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destino</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Departamento, proyecto, etc." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="destinationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Destino</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="department">Departamento</SelectItem>
                          <SelectItem value="project">Proyecto</SelectItem>
                          <SelectItem value="branch">Sucursal</SelectItem>
                          <SelectItem value="client">Cliente</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
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
                  name="requestedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solicitado por</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar solicitante" />
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
                  name="approvedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aprobado por (opcional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value ? field.value.toString() : "0"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar aprobador" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Ninguno</SelectItem>
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
          <CardTitle>Detalle de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...detailForm}>
            <form onSubmit={detailForm.handleSubmit(addDetail)} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar producto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.code} - {product.name} (Stock: {product.currentStock})
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
                  <TableHead>Stock Actual</TableHead>
                  <TableHead>Cantidad Solicitada</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-6">
                      No hay productos agregados
                    </TableCell>
                  </TableRow>
                ) : (
                  details.map((detail, index) => (
                    <TableRow key={index} className={detail.isOverStock ? "bg-red-50" : ""}>
                      <TableCell>{detail.productName}</TableCell>
                      <TableCell>{detail.currentStock}</TableCell>
                      <TableCell className={detail.isOverStock ? "text-red-600 font-medium" : ""}>
                        {detail.quantity}
                        {detail.isOverStock && (
                          <span className="ml-2 text-xs text-red-500">
                            <AlertTriangle className="inline-block h-3 w-3 mr-1" />
                            Excede stock
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{detail.unit}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pendiente
                        </span>
                      </TableCell>
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

          {details.some(detail => detail.isOverStock) && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
              <AlertTriangle className="text-red-500 h-5 w-5 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-800">Advertencia: Stock insuficiente</h4>
                <p className="text-sm text-red-700">
                  Hay productos que exceden el stock disponible. Si la salida se marca como completada, no se podrá procesar.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline">Cancelar</Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isSubmitting || isLoading || details.length === 0}
          >
            {isSubmitting ? "Guardando..." : "Registrar Salida"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OutputForm;
