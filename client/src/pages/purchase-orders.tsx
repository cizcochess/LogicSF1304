import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/data-table";
import { 
  ColumnDef, 
  ColumnFiltersState,
  SortingState, 
} from "@tanstack/react-table";
import { PurchaseOrder, PurchaseOrderDetail, User, Supplier, Product, Requirement } from "@shared/schema";
import { Plus, FileText, Edit, Trash, Filter, Eye, Download } from "lucide-react";
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
import PurchaseOrderForm from "@/components/forms/purchase-order-form";
import { formatStandardDate } from "@/lib/date-helpers";
import { queryClient } from "@/lib/queryClient";

const PurchaseOrders = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [showNewForm, setShowNewForm] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showRequirementDialog, setShowRequirementDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<PurchaseOrderDetail[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);

  // Función para eliminar orden de compra
  const handleDeleteOrder = async (id: number) => {
    try {
      const response = await fetch(`/api/purchase-orders/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Orden eliminada",
          description: "La orden de compra ha sido eliminada exitosamente",
        });
        refetch();
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la orden de compra",
        variant: "destructive",
      });
    }
  };

  // Función para editar orden de compra
  const handleEditOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsEditing(true);
    setShowNewForm(true);
  };

  // Fetch purchase orders
  const { data: purchaseOrders = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/purchase-orders'],
  });

  // Fetch requirements for the form
  const { data: requirements = [] } = useQuery({
    queryKey: ['/api/requirements'],
  });

  // Fetch users for the form
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  // Fetch suppliers for the form
  const { data: suppliers = [] } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  // Fetch products for the form
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

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

  // Filter purchase orders based on active tab
  const filteredOrders = purchaseOrders.filter((order: PurchaseOrder) => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  // Function to view purchase order details
  const handleViewPurchaseOrder = async (order: PurchaseOrder) => {
    setSelectedOrder(order);
    const details = await getPurchaseOrderDetails(order.id);
    setSelectedDetails(details);
    setShowViewDialog(true);
  };

  // Function to handle successful form submission
  const handleFormSuccess = () => {
    setShowNewForm(false);
    refetch();
    toast({
      title: "Orden de compra creada",
      description: "La orden de compra ha sido creada exitosamente",
    });
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusMap: Record<string, { label: string, className: string }> = {
      pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
      confirmed: { label: "Confirmada", className: "bg-blue-100 text-blue-800" },
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

  // Table columns definition
  const columns: ColumnDef<PurchaseOrder>[] = [
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
      accessorKey: "totalAmount",
      header: "Monto Total",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.totalAmount ? `$${row.original.totalAmount.toFixed(2)}` : "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "expectedDeliveryDate",
      header: "Entrega Esperada",
      cell: ({ row }) => row.original.expectedDeliveryDate ? formatStandardDate(row.original.expectedDeliveryDate) : "N/A",
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
            onClick={() => handleViewPurchaseOrder(row.original)}
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Editar"
            onClick={() => handleEditOrder(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Eliminar"
            className="text-red-500 hover:text-red-700"
            onClick={() => handleDeleteOrder(row.original.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleEditRequirement = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setShowNewForm(true);
  };

  // Cargar automáticamente el requerimiento cuando se accede desde la página de requerimientos
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reqId = params.get('requirementId');
    if (reqId) {
      const requirement = requirements.find(r => r.id === parseInt(reqId));
      if (requirement) {
        setSelectedRequirement(requirement);
        setShowNewForm(true);
      }
    }
  }, [requirements]);

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Órdenes de Compra</h1>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowRequirementDialog(true)}
          >
            <FileText className="h-4 w-4 mr-2" /> Desde Requerimiento
          </Button>
          <Button onClick={() => setShowNewForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nueva Orden
          </Button>
        </div>
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
          <TabsTrigger value="confirmed">Confirmadas</TabsTrigger>
          <TabsTrigger value="partial">Parciales</TabsTrigger>
          <TabsTrigger value="completed">Completadas</TabsTrigger>
          <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader className="px-6 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Órdenes de Compra</CardTitle>
          <Button variant="outline" size="sm" className="flex items-center">
            <Filter className="h-4 w-4 mr-2" /> Filtros
          </Button>
        </CardHeader>
        <CardContent className="px-0 py-0">
          <DataTable
            columns={columns}
            data={filteredOrders}
            filterColumn="title"
            filterPlaceholder="Buscar orden..."
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* New Purchase Order Dialog */}
      <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Orden de Compra</DialogTitle>
            <DialogDescription>
              Complete la información para crear una nueva orden de compra.
            </DialogDescription>
          </DialogHeader>

          <PurchaseOrderForm
            products={products}
            suppliers={suppliers}
            users={users}
            requirements={requirements}
            onSuccess={handleFormSuccess}
            isLoading={isLoading}
            purchaseOrder={isEditing ? selectedOrder : undefined}
            requirement={selectedRequirement} // Pass selectedRequirement to the form
          />
        </DialogContent>
      </Dialog>

      {/* View Purchase Order Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalles de Orden de Compra</DialogTitle>
            <DialogDescription>
              {selectedOrder?.code} - {selectedOrder?.title}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Proveedor</h4>
                  <p className="text-sm">{getSupplierName(selectedOrder.supplierId)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Estado</h4>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Monto Total</h4>
                  <p className="text-sm font-medium">{selectedOrder.totalAmount ? `$${selectedOrder.totalAmount.toFixed(2)} ${selectedOrder.currency}` : "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Fecha de Entrega Esperada</h4>
                  <p className="text-sm">{selectedOrder.expectedDeliveryDate ? formatStandardDate(selectedOrder.expectedDeliveryDate) : "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Creado por</h4>
                  <p className="text-sm">{getUserName(selectedOrder.createdBy || null)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Fecha Creación</h4>
                  <p className="text-sm">{formatStandardDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Notas</h4>
                  <p className="text-sm p-3 bg-gray-50 rounded-md">{selectedOrder.notes}</p>
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unit.</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
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
                            <td className="px-4 py-3 text-sm">${detail.unitPrice.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm">${detail.totalPrice.toFixed(2)}</td>
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
                    {selectedDetails.length > 0 && (
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-sm text-right font-medium">
                            Total:
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            ${selectedOrder.totalAmount?.toFixed(2) || "0.00"} {selectedOrder.currency}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
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
                  <Edit className="h-4 w-4 mr-2" /> Editar
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Requirement Selection Dialog */}
      <Dialog open={showRequirementDialog} onOpenChange={setShowRequirementDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Seleccionar Requerimiento</DialogTitle>
            <DialogDescription>
              Seleccione un requerimiento aprobado para crear una orden de compra.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requirements
                    .filter(req => req.status === 'approved')
                    .map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>{req.code}</TableCell>
                        <TableCell>{req.title}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Aprobado
                          </span>
                        </TableCell>
                        <TableCell>{formatStandardDate(req.createdAt)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleEditRequirement(req);
                              setShowRequirementDialog(false);
                              setShowNewForm(true);
                            }}
                          >
                            Seleccionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequirementDialog(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseOrders;