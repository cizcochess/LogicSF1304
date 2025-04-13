import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertSupplierSchema, Supplier } from "@shared/schema";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

// Extended schema with validation
const extendedSupplierSchema = insertSupplierSchema.extend({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres"
  }),
  email: z.string().email({
    message: "Debe ingresar un email válido"
  }),
  phone: z.string().min(7, {
    message: "El teléfono debe tener al menos 7 caracteres"
  }),
  status: z.string().min(1, { message: "Debe seleccionar un estado" }),
});

type SupplierFormData = z.infer<typeof extendedSupplierSchema>;

interface SupplierFormProps {
  supplier?: Supplier;
  onSuccess: () => void;
  isLoading?: boolean;
}

const SupplierForm = ({
  supplier,
  onSuccess,
  isLoading = false,
}: SupplierFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!supplier;

  // Form setup
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(extendedSupplierSchema),
    defaultValues: {
      name: supplier?.name || "",
      contact: supplier?.contact || "",
      email: supplier?.email || "",
      phone: supplier?.phone || "",
      address: supplier?.address || "",
      taxId: supplier?.taxId || "",
      notes: supplier?.notes || "",
      status: supplier?.status || "active",
    }
  });

  const onSubmit = async (data: SupplierFormData) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing) {
        // Update existing supplier
        const res = await apiRequest("PUT", `/api/suppliers/${supplier.id}`, data);
        if (!res.ok) {
          throw new Error('Failed to update supplier');
        }
        
        toast({
          title: "Proveedor actualizado",
          description: `${data.name} ha sido actualizado exitosamente`,
        });
      } else {
        // Create new supplier
        const res = await apiRequest("POST", "/api/suppliers", data);
        if (!res.ok) {
          throw new Error('Failed to create supplier');
        }
        
        toast({
          title: "Proveedor creado",
          description: `${data.name} ha sido creado exitosamente`,
        });
      }
      
      // Invalidate the suppliers query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      onSuccess();
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast({
        title: "Error",
        description: `Hubo un problema al ${isEditing ? 'actualizar' : 'crear'} el proveedor`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nombre del proveedor" />
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
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="blocked">Bloqueado</SelectItem>
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
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contacto</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nombre de la persona de contacto" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Fiscal / RUC</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Identificador fiscal" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="correo@ejemplo.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Número de teléfono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Dirección completa" />
                </FormControl>
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
                  <Textarea {...field} placeholder="Información adicional sobre el proveedor" rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Guardando..." : isEditing ? "Actualizar Proveedor" : "Registrar Proveedor"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SupplierForm;