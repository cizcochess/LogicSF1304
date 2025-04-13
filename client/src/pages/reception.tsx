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
import { Reception, ReceptionDetail, User, Supplier, Product, PurchaseOrder } from "@shared/schema";
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
import ReceptionForm from "@/components/forms/reception-form";
import { formatStandardDate, formatDateTime } from "@/lib/date-helpers";
import { queryClient } from "@/lib/queryClient";

const ReceptionPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [showNewForm, setShowNewForm] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedReception, setSelectedReception] = useState<Reception | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<ReceptionDetail[]>([]);
  
  // Fetch receptions
  const { data: receptions = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/receptions'],
  });

  // Fetch purchase orders for the form
  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ['/api/purchase-orders'],
  });

  // Fetch suppliers for the form
  const { data: suppliers = [] } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  // Fetch users for the form
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  // Fetch products for product details
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  // Function to get reception details
  const getReceptionDetails = async (receptionId: number) => {
    try {
      const response = await fetch(`/api/receptions/${receptionId}/details`);
      if (!response.ok) {
        throw new Error('Failed to fetch reception details');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching reception details:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de la recepción",
        variant: "destructive",
      });
      return [];
    }
  };

  // Function to get purchase order details
  const getPurchaseOrderDetails = async (purchaseOrderId: number) => {
    try {
      const response = await fetch(`/api/purchase-orders/${purchaseOrderId}/details`);
      if (!response.ok) {
        throw new Error('Failed to fetch purchase order details');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching purchase order details:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de la orden de compra",
        variant: "destructive",
      });
      return [];
    }
  };

  // Filter receptions based on active tab
  const filteredReceptions = receptions.filter((reception: Reception) => {
    if (activeTab === "all") return true;
    return reception.status === activeTab;
  });

  // Function to view reception details
  const handleViewReception = async (reception: Reception) => {
    setSelectedReception(reception);
    const details = await getReceptionDetails(reception.id);
    setSelectedDetails(details);
    setShowViewDialog(true);
  };

  // Function to handle successful form submission
  const handleFormSuccess = () => {
    setShowNewForm(false);
    refetch();
    toast({
      title: "Recepción creada",
      description: "La recepción ha sido registrada exitosamente",
    });
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusMap: Record<string, { label: string, className: string }> = {
      scheduled: { label: "Programada", className: "bg-blue-100 text-blue-800" },
      pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
      partial: { label: "Parcial", className: "bg-purple-100 text-purple-800" },
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

  // Helper function to get supplier name by ID
  const getSupplierName = (supplierId: number): string => {
    const supplier = suppliers.find((s: Supplier) => s.id === supplierId);
    return supplier ? supplier.name : "N/A";
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

  // Helper function to get purchase order code by ID
  const getPurchaseOrderCode = (purchaseOrderId: number | null): string => {
    if (!purchaseOrderId) return "N/A";
    const po = purchaseOrders.find((po: PurchaseOrder) => po.id === purchaseOrderId);
    return po ? po.code : "N/A";
  };

  // Table columns definition
  const columns: ColumnDef<Reception>[] = [
    {
      accessorKey: "code",
      header: "Código",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.code}</div>
      ),
    },
    {
      accessorKey: "purchaseOrderId",
      header: "Orden de Compra",
      cell: ({ row }) => getPurchaseOrderCode(row.original.purchaseOrderId),
    },
    {
      accessorKey: "supplierId",
      header: "Proveedor",
      cell: ({ row }) => getSupplierName(row.original.supplierId),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "receivedBy",
      header: "Recibido por",
      cell: ({ row }) => getUserName(row.original.receivedBy || null),
    },
    {
      accessorKey: "receivedAt",
      header: "Fecha Recepción",
      cell: ({ row }) => formatStandardDate(row.original.receivedAt),
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
            onClick={() => handleViewReception(row.original)}
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
        <h1 className="text-2xl font-semibold">Recepción de Mercancía</h1>
        <Button onClick={() => setShowNewForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nueva Recepción
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
          <TabsTrigger value="scheduled">Programadas</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="partial">Parciales</TabsTrigger>
          <TabsTrigger value="completed">Completadas</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader className="px-6 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recepciones</CardTitle>
          <Button variant="outline" size="sm" className="flex items-center">
            <Filter className="h-4 w-4 mr-2" /> Filtros
          </Button>
        </CardHeader>
        <CardContent className="px-0 py-0">
          <DataTable
            columns={columns}
            data={filteredReceptions}
            filterColumn="code"
            filterPlaceholder="Buscar recepción..."
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* New Reception Dialog */}
      <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Recepción</DialogTitle>
            <DialogDescription>
              Complete la información para registrar una nueva recepción.
            </DialogDescription>
          </DialogHeader>
          
          <ReceptionForm
            purchaseOrders={purchaseOrders}
            suppliers={suppliers}
            users={users}
            onSuccess={handleFormSuccess}
            isLoading={isLoading}
            getPurchaseOrderDetails={getPurchaseOrderDetails}
          />
        </DialogContent>
      </Dialog>

      {/* View Reception Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalles de Recepción</DialogTitle>
            <DialogDescription>
              {selectedReception?.code}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReception && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Proveedor</h4>
                  <p className="text-sm">{getSupplierName(selectedReception.supplierId)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Orden de Compra</h4>
                  <p className="text-sm">{getPurchaseOrderCode(selectedReception.purchaseOrderId)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Estado</h4>
                  <StatusBadge status={selectedReception.status} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Recibido por</h4>
                  <p className="text-sm">{getUserName(selectedReception.receivedBy || null)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Fecha de Recepción</h4>
                  <p className="text-sm">{formatDateTime(selectedReception.receivedAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Fecha Creación</h4>
                  <p className="text-sm">{formatDateTime(selectedReception.createdAt)}</p>
                </div>
              </div>

              {selectedReception.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Notas</h4>
                  <p className="text-sm p-3 bg-gray-50 rounded-md">{selectedReception.notes}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Productos Recibidos</h4>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Esperado</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recibido</th>
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
                            <td className="px-4 py-3 text-sm">{detail.quantityExpected}</td>
                            <td className="px-4 py-3 text-sm">{detail.quantityReceived}</td>
                            <td className="px-4 py-3 text-sm">{detail.unit}</td>
                            <td className="px-4 py-3 text-sm">
                              <StatusBadge status={detail.status} />
                            </td>
                            <td className="px-4 py-3 text-sm">{detail.notes || "-"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-3 text-sm text-center text-gray-500">
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
              <div className="space-x-2">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" /> Imprimir
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" /> PDF
                </Button>
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                  Cerrar
                </Button>
                <Button>
                  <CheckCircle className="h-4 w-4 mr-2" /> Completar
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceptionPage;
