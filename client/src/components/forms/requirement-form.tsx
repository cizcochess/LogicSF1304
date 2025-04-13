import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertRequirementSchema, insertRequirementDetailSchema, Product, User } from "@shared/schema";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Card, CardContent, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Extended schema with validation
const extendedRequirementSchema = insertRequirementSchema.extend({
  title: z.string().min(5, {
    message: "El título debe tener al menos 5 caracteres"
  }),
  code: z.string().min(3, {
    message: "El código debe tener al menos 3 caracteres"
  }).regex(/^REQ-\d{4}-\d{3}$/, {
    message: "El código debe tener el formato REQ-YYYY-NNN"
  }),
  dueDate: z.string().refine(date => new Date(date) > new Date(), {
    message: "La fecha de vencimiento debe ser en el futuro"
  }),
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

type RequirementFormData = z.infer<typeof extendedRequirementSchema>;
type DetailFormData = z.infer<typeof detailFormSchema>;

interface RequirementFormProps {
  products: Product[];
  users: User[];
  departments: string[];
  onSuccess: () => void;
  isLoading?: boolean;
}

const RequirementForm = ({ 
  products, 
  users, 
  departments, 
  onSuccess, 
  isLoading = false 
}: RequirementFormProps) => {
  const { toast } = useToast();
  const [details, setDetails] = useState<Array<{
    productId: number;
    productName: string;
    quantity: number;
    unit: string;
    notes?: string;
  }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Main form
  const form = useForm<RequirementFormData>({
    resolver: zodResolver(extendedRequirementSchema),
    defaultValues: requirement ? {
      ...requirement,
      dueDate: requirement.dueDate ? new Date(requirement.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      requestorId: requirement.requestorId || 1,
    } : {
      code: `REQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
      title: "",
      requestorId: 1,
      departmentId: "",
      status: "pending",
      priority: "medium",
      notes: "",
      dueDate: new Date().toISOString().split('T')[0],
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

    setDetails([
      ...details,
      {
        productId,
        productName: product.name,
        quantity: parseFloat(data.quantity),
        unit: data.unit,
        notes: data.notes
      }
    ]);

    detailForm.reset();
  };

  const removeDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: RequirementFormData) => {
    if (details.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un detalle al requerimiento",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format date in ISO format
      const requirementData = {
        ...data,
        dueDate: new Date(data.dueDate).toISOString()
      };

      // Create requirement first
      const res = await apiRequest("POST", "/api/requirements", requirementData);
      const requirement = await res.json();

      // Then create all details
      for (const detail of details) {
        const detailData = {
          requirementId: requirement.id,
          productId: detail.productId,
          quantity: detail.quantity,
          unit: detail.unit,
          notes: detail.notes,
          status: "pending"
        };

        await apiRequest("POST", `/api/requirements/${requirement.id}/details`, detailData);
      }

      toast({
        title: "Requerimiento creado",
        description: `El requerimiento ${requirement.code} ha sido creado exitosamente`,
      });

      onSuccess();
    } catch (error) {
      console.error("Error creating requirement:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear el requerimiento",
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
          <CardTitle>Nuevo Requerimiento</CardTitle>
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
                        <Input {...field} disabled placeholder="REQ-2023-001" />
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
                        <Input {...field} placeholder="Título del requerimiento" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="requestorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solicitante</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value?.toString() || "1"}
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
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar departamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.filter(dept => dept && dept.trim() !== '').map(dept => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
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
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha requerida</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || "medium"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar prioridad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Baja</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
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
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="approved">Aprobado</SelectItem>
                          <SelectItem value="rejected">Rechazado</SelectItem>
                          <SelectItem value="completed">Completado</SelectItem>
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
            <form onSubmit={detailForm.handleSubmit(addDetail)} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
              <FormField
                control={detailForm.control}
                name="productId"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Producto</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                name="notes"
                render={({ field }) => (
                  <FormItem className="col-span-1">
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
                  <TableHead>Notas</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-6">
                      No hay productos agregados
                    </TableCell>
                  </TableRow>
                ) : (
                  details.map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell>{detail.productName}</TableCell>
                      <TableCell>{detail.quantity}</TableCell>
                      <TableCell>{detail.unit}</TableCell>
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
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline">Cancelar</Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isSubmitting || isLoading || details.length === 0}
          >
            {isSubmitting ? "Guardando..." : "Guardar Requerimiento"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RequirementForm;