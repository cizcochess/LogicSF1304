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
import { Requirement, RequirementDetail, User, Product } from "@shared/schema";
import { Plus, FileText, Edit, Trash, Filter, Eye, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import RequirementForm from "@/components/forms/requirement-form";
import { formatStandardDate } from "@/lib/date-helpers";
import { queryClient } from "@/lib/queryClient";

const Requirements = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [showNewForm, setShowNewForm] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<RequirementDetail[]>([]);

  // Fetch requirements
  const { data: requirements = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/requirements'],
  });

  // Fetch users, products, and departments for the form
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const departments = ["Mantenimiento", "Producción", "Administración", "Almacén", "Logística", "Compras", "IT"];

  // Get requirement details when a requirement is selected
  const getRequirementDetails = async (requirementId: number) => {
    try {
      const response = await fetch(`/api/requirements/${requirementId}/details`);
      if (!response.ok) {
        throw new Error('Failed to fetch requirement details');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching requirement details:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del requerimiento",
        variant: "destructive",
      });
      return [];
    }
  };

  // Filter requirements based on active tab
  const filteredRequirements = requirements.filter((req: Requirement) => {
    if (activeTab === "all") return true;
    return req.status === activeTab;
  });

  // Function to view requirement details
  const handleViewRequirement = async (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    const details = await getRequirementDetails(requirement.id);
    setSelectedDetails(details);
    setShowViewDialog(true);
  };

  const handleDeleteRequirement = async (id: number) => {
    try {
      const response = await fetch(`/api/requirements/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Requerimiento eliminado",
          description: "El requerimiento ha sido eliminado exitosamente",
        });
        refetch();
      }
    } catch (error) {
      console.error('Error deleting requirement:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el requerimiento",
        variant: "destructive",
      });
    }
  };

  const handleEditRequirement = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setShowNewForm(true);
  };

  // Function to handle successful form submission
  const handleFormSuccess = () => {
    setShowNewForm(false);
    refetch();
    toast({
      title: "Requerimiento creado",
      description: "El requerimiento ha sido creado exitosamente",
    });
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusMap: Record<string, { label: string, className: string }> = {
      pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Aprobado", className: "bg-blue-100 text-blue-800" },
      completed: { label: "Completado", className: "bg-green-100 text-green-800" },
      rejected: { label: "Rechazado", className: "bg-red-100 text-red-800" },
    };

    const { label, className } = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
        {label}
      </span>
    );
  };

  // Priority badge component
  const PriorityBadge = ({ priority }: { priority: string }) => {
    const priorityMap: Record<string, { label: string, className: string }> = {
      low: { label: "Baja", className: "bg-gray-100 text-gray-800" },
      medium: { label: "Media", className: "bg-blue-100 text-blue-800" },
      high: { label: "Alta", className: "bg-orange-100 text-orange-800" },
      urgent: { label: "Urgente", className: "bg-red-100 text-red-800" },
    };

    const { label, className } = priorityMap[priority] || { label: priority, className: "bg-gray-100 text-gray-800" };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
        {label}
      </span>
    );
  };

  // Helper function to get user name by ID
  const getUserName = (userId: number | null): string => {
    if (!userId) return "N/A";
    const user = users.find((u: User) => u.id === userId);
    return user ? user.fullName : "N/A";
  };

  // Helper function to get product name by ID
  const getProductName = (productId: number): string => {
    const product = products.find((p: Product) => p.id === productId);
    return product ? product.name : "N/A";
  };

  // Table columns definition
  const columns: ColumnDef<Requirement>[] = [
    {
      accessorKey: "code",
      header: "Código",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.code}</div>
      ),
    },
    {
      accessorKey: "title",
      header: "Título",
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.original.title}>
          {row.original.title}
        </div>
      ),
    },
    {
      accessorKey: "requestorId",
      header: "Solicitante",
      cell: ({ row }) => getUserName(row.original.requestorId || null),
    },
    {
      accessorKey: "departmentId",
      header: "Departamento",
      cell: ({ row }) => row.original.departmentId || "N/A",
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "priority",
      header: "Prioridad",
      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
    },
    {
      accessorKey: "dueDate",
      header: "Fecha Requerida",
      cell: ({ row }) => row.original.dueDate ? formatStandardDate(row.original.dueDate) : "N/A",
    },
    {
      accessorKey: "createdAt",
      header: "Fecha Creación",
      cell: ({ row }) => formatStandardDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewRequirement(row.original)}
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.original.status === 'pending' && (
            <Button
              variant="ghost"
              size="icon"
              title="Aprobar"
              className="text-green-500 hover:text-green-700"
              onClick={async () => {
                try {
                  const response = await fetch(`/api/requirements/${row.original.id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      status: 'approved'
                    })
                  });

                  if (response.ok) {
                    toast({
                      title: "Requerimiento aprobado",
                      description: "El requerimiento ha sido aprobado exitosamente"
                    });
                    refetch();
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "No se pudo aprobar el requerimiento",
                    variant: "destructive"
                  });
                }
              }}
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            title="Editar"
            onClick={() => handleEditRequirement(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Eliminar"
            className="text-red-500 hover:text-red-700"
            onClick={() => handleDeleteRequirement(row.original.id)}
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
        <h1 className="text-2xl font-semibold">Gestión de Requerimientos</h1>
        <Button onClick={() => setShowNewForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nuevo Requerimiento
        </Button>
      </header>

      <Tabs
        defaultValue="all"
        className="mb-6"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="approved">Aprobados</TabsTrigger>
          <TabsTrigger value="completed">Completados</TabsTrigger>
          <TabsTrigger value="rejected">Rechazados</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader className="px-6 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Requerimientos</CardTitle>
          <Button variant="outline" size="sm" className="flex items-center">
            <Filter className="h-4 w-4 mr-2" /> Filtros
          </Button>
        </CardHeader>
        <CardContent className="px-0 py-0">
          <DataTable
            columns={columns}
            data={filteredRequirements}
            filterColumn="title"
            filterPlaceholder="Buscar requerimiento..."
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* New Requirement Dialog */}
      <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Requerimiento</DialogTitle>
            <DialogDescription>
              Complete la información para crear un nuevo requerimiento.
            </DialogDescription>
          </DialogHeader>

          <RequirementForm
            products={products}
            users={users}
            departments={departments}
            onSuccess={handleFormSuccess}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* View Requirement Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalles del Requerimiento</DialogTitle>
            <DialogDescription>
              {selectedRequirement?.code} - {selectedRequirement?.title}
            </DialogDescription>
          </DialogHeader>

          {selectedRequirement && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Solicitante</h4>
                  <p className="text-sm">{getUserName(selectedRequirement.requestorId || null)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Departamento</h4>
                  <p className="text-sm">{selectedRequirement.departmentId || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Estado</h4>
                  <StatusBadge status={selectedRequirement.status} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Prioridad</h4>
                  <PriorityBadge priority={selectedRequirement.priority} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Fecha Requerida</h4>
                  <p className="text-sm">{selectedRequirement.dueDate ? formatStandardDate(selectedRequirement.dueDate) : "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Fecha Creación</h4>
                  <p className="text-sm">{formatStandardDate(selectedRequirement.createdAt)}</p>
                </div>
              </div>

              {selectedRequirement.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Notas</h4>
                  <p className="text-sm p-3 bg-gray-50 rounded-md">{selectedRequirement.notes}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Productos Solicitados</h4>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedDetails.length > 0 ? (
                        selectedDetails.map((detail) => (
                          <tr key={detail.id}>
                            <td className="px-4 py-3 text-sm">{getProductName(detail.productId)}</td>
                            <td className="px-4 py-3 text-sm">{detail.quantity}</td>
                            <td className="px-4 py-3 text-sm">{detail.unit}</td>
                            <td className="px-4 py-3 text-sm">
                              <StatusBadge status={detail.status} />
                            </td>
                            <td className="px-4 py-3 text-sm">{detail.notes || "-"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-3 text-sm text-center text-gray-500">
                            No hay detalles disponibles
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <div className="flex justify-between w-full">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" /> Imprimir
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                  Cerrar
                </Button>
                <Button>
                  <Edit className="h-4 w-4 mr-2" /> Editar
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Requirements;