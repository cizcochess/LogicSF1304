import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card, CardContent, CardHeader, CardTitle, 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/data-table";
import { 
  ColumnDef, 
  ColumnFiltersState,
  SortingState, 
} from "@tanstack/react-table";
import { Supplier } from "@shared/schema";
import { Plus, FileText, Edit, Trash, Filter, Eye } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter, 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import SupplierForm from "@/components/forms/supplier-form";

const Suppliers = () => {
  const { toast } = useToast();
  const [showNewForm, setShowNewForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  
  // Fetch suppliers
  const { data: suppliers = [], isLoading, refetch } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
  });

  // Function to handle delete
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete supplier');
      }
      
      toast({
        title: "Proveedor eliminado",
        description: "El proveedor ha sido eliminado exitosamente",
      });
      
      // Invalidate query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el proveedor",
        variant: "destructive",
      });
    }
  };

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowViewDialog(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowEditForm(true);
  };

  const handleFormSuccess = () => {
    setShowNewForm(false);
    setShowEditForm(false);
    refetch();
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusMap: Record<string, { label: string, className: string }> = {
      active: { label: "Activo", className: "bg-green-100 text-green-800" },
      inactive: { label: "Inactivo", className: "bg-gray-100 text-gray-800" },
      blocked: { label: "Bloqueado", className: "bg-red-100 text-red-800" },
    };

    const { label, className } = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
        {label}
      </span>
    );
  };

  // Table columns definition
  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "contact",
      header: "Contacto",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Teléfono",
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewSupplier(row.original)}
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditSupplier(row.original)}
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.original.id)}
            title="Eliminar"
            className="text-red-500 hover:text-red-700"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Gestión de Proveedores</h1>
        <Button onClick={() => setShowNewForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nuevo Proveedor
        </Button>
      </header>

      <Card>
        <CardHeader className="px-6 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Lista de Proveedores</CardTitle>
          <Button variant="outline" size="sm" className="flex items-center">
            <Filter className="h-4 w-4 mr-2" /> Filtros
          </Button>
        </CardHeader>
        <CardContent className="px-0 py-0">
          <DataTable
            columns={columns}
            data={suppliers}
            filterColumn="name"
            filterPlaceholder="Buscar proveedor..."
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* New Supplier Dialog */}
      <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo Proveedor</DialogTitle>
            <DialogDescription>
              Complete la información para registrar un nuevo proveedor.
            </DialogDescription>
          </DialogHeader>
          <SupplierForm
            onSuccess={handleFormSuccess}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Supplier Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Proveedor</DialogTitle>
            <DialogDescription>
              Modifique la información del proveedor.
            </DialogDescription>
          </DialogHeader>
          {selectedSupplier && (
            <SupplierForm
              supplier={selectedSupplier}
              onSuccess={handleFormSuccess}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Supplier Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Proveedor</DialogTitle>
            <DialogDescription>
              Información completa del proveedor.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSupplier && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Nombre</h4>
                  <p className="text-base">{selectedSupplier.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Estado</h4>
                  <StatusBadge status={selectedSupplier.status} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Contacto</h4>
                  <p className="text-base">{selectedSupplier.contact || 'No especificado'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">ID Fiscal</h4>
                  <p className="text-base">{selectedSupplier.taxId || 'No especificado'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                  <p className="text-base">{selectedSupplier.email || 'No especificado'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Teléfono</h4>
                  <p className="text-base">{selectedSupplier.phone || 'No especificado'}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Dirección</h4>
                <p className="text-base">{selectedSupplier.address || 'No especificada'}</p>
              </div>

              {selectedSupplier.notes && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Notas</h4>
                  <p className="text-base p-3 bg-gray-50 rounded-md">{selectedSupplier.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => handleEditSupplier(selectedSupplier!)}>
                <Edit className="h-4 w-4 mr-2" /> Editar
              </Button>
              <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                Cerrar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Suppliers;