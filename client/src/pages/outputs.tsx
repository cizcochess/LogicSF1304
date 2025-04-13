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
import { Output, OutputDetail, User, Product } from "@shared/schema";
import { Plus, FileText, Edit, Trash, Filter, Eye, Download, CheckCircle } from "lucide-react";
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
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import OutputForm from "@/components/forms/output-form";
import { formatStandardDate } from "@/lib/date-helpers";
import { queryClient } from "@/lib/queryClient";

const Outputs = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [showNewForm, setShowNewForm] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedOutput, setSelectedOutput] = useState<Output | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<OutputDetail[]>([]);
  
  // Fetch outputs
  const { data: outputs = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/outputs'],
  });

  // Fetch users for the form
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  // Fetch products for the form
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  // Departments for the form
  const departments = ["Mantenimiento", "Producción", "Administración", "Almacén", "Logística", "Compras", "IT"];

  // Function to get output details
  const getOutputDetails = async (outputId: number) => {
    try {
      const response = await fetch(`/api/outputs/${outputId}/details`);
      if (!response.ok) {
        throw new Error('Failed to fetch output details');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching output details:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de la salida",
        variant: "destructive",
      });
      return [];
    }
  };

  // Filter outputs based on active tab
  const filteredOutputs = outputs.filter((output: Output) => {
    if (activeTab === "all") return true;
    return output.status === activeTab;
  });

  // Function to view output details
  const handleViewOutput = async (output: Output) => {
    setSelectedOutput(output);
    const details = await getOutputDetails(output.id);
    setSelectedDetails(details);
    setShowViewDialog(true);
  };

  // Function to handle successful form submission
  const handleFormSuccess = () => {
    setShowNewForm(false);
    refetch();
    toast({
      title: "Salida creada",
      description: "La salida ha sido registrada exitosamente",
    });
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusMap: Record<string, { label: string, className: string }> = {
      pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Aprobada", className: "bg-blue-100 text-blue-800" },
      completed: { label: "Completada", className: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelada", className: "bg-red-100 text-red-800" },
    };

    const { label, className } = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
        {label}
      </span>
    );
  };

  // Helper function to get destination type displayed name
  const getDestinationTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      department: "Departamento",
      project: "Proyecto",
      branch: "Sucursal",
      client: "Cliente",
      other: "Otro",
    };
    
    return typeMap[type] || type;
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
  const columns: ColumnDef<Output>[] = [
    {
      accessorKey: "code",
      header: "Código",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.code}</div>
      ),
    },
    {
      accessorKey: "destination",
      header: "Destino",
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.original.destination}>
          {row.original.destination}
        </div>
      ),
    },
    {
      accessorKey: "destinationType",
      header: "Tipo",
      cell: ({ row }) => getDestinationTypeLabel(row.original.destinationType),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "requestedBy",
      header: "Solicitado por",
      cell: ({ row }) => getUserName(row.original.requestedBy || null),
    },
    {
      accessorKey: "approvedBy",
      header: "Aprobado por",
      cell: ({ row }) => getUserName(row.original.approvedBy || null),
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
            onClick={() => handleViewOutput(row.original)}
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
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
        <h1 className="text-2xl font-semibold">Salidas de Inventario</h1>
        <Button onClick={() => setShowNewForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nueva Salida
        </Button>
      </header>

      <Tabs
        defaultValue="all"
        className="mb-6"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="approved">Aprobadas</TabsTrigger>
          <TabsTrigger value="completed">Completadas</TabsTrigger>
          <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader className="px-6 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Salidas</CardTitle>
          <Button variant="outline" size="sm" className="flex items-center">
            <Filter className="h-4 w-4 mr-2" /> Filtros
          </Button>
        </CardHeader>
        <CardContent className="px-0 py-0">
          <DataTable
            columns={columns}
            data={filteredOutputs}
            filterColumn="destination"
            filterPlaceholder="Buscar salida..."
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* New Output Dialog */}
      <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Salida de Inventario</DialogTitle>
            <DialogDescription>
              Complete la información para registrar una nueva salida de inventario.
            </DialogDescription>
          </DialogHeader>
          
          <OutputForm
            products={products}
            users={users}
            departments={departments}
            onSuccess={handleFormSuccess}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* View Output Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalles de Salida</DialogTitle>
            <DialogDescription>
              {selectedOutput?.code}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOutput && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Destino</h4>
                  <p className="text-sm">{selectedOutput.destination}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Tipo de Destino</h4>
                  <p className="text-sm">{getDestinationTypeLabel(selectedOutput.destinationType)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Estado</h4>
                  <StatusBadge status={selectedOutput.status} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Solicitado por</h4>
                  <p className="text-sm">{getUserName(selectedOutput.requestedBy || null)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Aprobado por</h4>
                  <p className="text-sm">{getUserName(selectedOutput.approvedBy || null)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Fecha Creación</h4>
                  <p className="text-sm">{formatStandardDate(selectedOutput.createdAt)}</p>
                </div>
              </div>

              {selectedOutput.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Notas</h4>
                  <p className="text-sm p-3 bg-gray-50 rounded-md">{selectedOutput.notes}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Productos</h4>
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
                {selectedOutput && selectedOutput.status === 'pending' && (
                  <Button>
                    <CheckCircle className="h-4 w-4 mr-2" /> Completar
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Outputs;
