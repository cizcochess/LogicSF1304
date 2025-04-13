import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/data-table";
import { 
  ColumnDef, 
  ColumnFiltersState,
  SortingState, 
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product, InventoryMovement } from "@shared/schema";
import { Plus, FileText, Edit, Trash, Filter, Eye, Download, BarChart, Package, ArrowUpDown } from "lucide-react";
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
import { formatStandardDate } from "@/lib/date-helpers";
import { createInventoryValueChart, createTopSuppliersChart } from "@/lib/chart-helpers";
import { queryClient } from "@/lib/queryClient";

const Inventory = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("products");
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const inventoryValueChartRef = useRef<HTMLCanvasElement>(null);
  const topSuppliersChartRef = useRef<HTMLCanvasElement>(null);
  
  // Fetch products
  const { data: products = [], isLoading: isLoadingProducts, refetch: refetchProducts } = useQuery({
    queryKey: ['/api/products'],
  });

  // Fetch inventory movements
  const { data: inventoryMovements = [], isLoading: isLoadingMovements } = useQuery({
    queryKey: ['/api/inventory/movements'],
  });

  // Fetch suppliers for the supplier chart
  const { data: suppliers = [] } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  // Initialize charts when data is loaded
  useEffect(() => {
    if (!isLoadingProducts && inventoryValueChartRef.current) {
      createInventoryValueChart(inventoryValueChartRef.current);
    }
    
    if (!isLoadingProducts && topSuppliersChartRef.current) {
      createTopSuppliersChart(topSuppliersChartRef.current);
    }
  }, [isLoadingProducts, activeTab]);

  // Function to view product details
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDialog(true);
  };

  // Function to create a new adjustment
  const handleNewAdjustment = () => {
    setShowMovementDialog(true);
  };

  // Status badge component for inventory levels
  const StockStatusBadge = ({ currentStock, minStock }: { currentStock: number, minStock: number }) => {
    if (currentStock <= 0) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Agotado
        </span>
      );
    }
    if (currentStock <= minStock) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Stock Bajo
        </span>
      );
    }
    if (currentStock <= minStock * 1.5) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Stock Medio
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Stock Normal
      </span>
    );
  };

  // Movement type badge component
  const MovementTypeBadge = ({ type }: { type: string }) => {
    const typeMap: Record<string, { label: string, className: string }> = {
      reception: { label: "Entrada", className: "bg-green-100 text-green-800" },
      output: { label: "Salida", className: "bg-red-100 text-red-800" },
      adjustment: { label: "Ajuste", className: "bg-blue-100 text-blue-800" },
    };

    const { label, className } = typeMap[type] || { label: type, className: "bg-gray-100 text-gray-800" };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
        {label}
      </span>
    );
  };

  // Products table columns
  const productColumns: ColumnDef<Product>[] = [
    {
      accessorKey: "code",
      header: "Código",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.code}</div>
      ),
    },
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.original.name}>
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Categoría",
    },
    {
      accessorKey: "currentStock",
      header: "Stock Actual",
      cell: ({ row }) => (
        <div className="text-right">{row.original.currentStock}</div>
      ),
    },
    {
      accessorKey: "minStock",
      header: "Stock Mínimo",
      cell: ({ row }) => (
        <div className="text-right">{row.original.minStock}</div>
      ),
    },
    {
      accessorKey: "unit",
      header: "Unidad",
    },
    {
      id: "stockStatus",
      header: "Estado",
      cell: ({ row }) => (
        <StockStatusBadge
          currentStock={row.original.currentStock}
          minStock={row.original.minStock || 0}
        />
      ),
    },
    {
      accessorKey: "location",
      header: "Ubicación",
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewProduct(row.original)}
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
            title="Ajustar"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Movements table columns
  const movementColumns: ColumnDef<InventoryMovement>[] = [
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ row }) => formatStandardDate(row.original.createdAt),
    },
    {
      accessorKey: "productId",
      header: "Producto",
      cell: ({ row }) => {
        const product = products.find(p => p.id === row.original.productId);
        return product ? `${product.code} - ${product.name}` : `ID: ${row.original.productId}`;
      },
    },
    {
      accessorKey: "quantity",
      header: "Cantidad",
      cell: ({ row }) => (
        <div className={row.original.quantity < 0 ? 'text-red-600' : 'text-green-600'}>
          {row.original.quantity > 0 ? '+' : ''}{row.original.quantity} {row.original.unit}
        </div>
      ),
    },
    {
      accessorKey: "movementType",
      header: "Tipo",
      cell: ({ row }) => <MovementTypeBadge type={row.original.movementType} />,
    },
    {
      accessorKey: "referenceType",
      header: "Referencia",
      cell: ({ row }) => (
        <div>
          {row.original.referenceType === 'reception' && 'Recepción'}
          {row.original.referenceType === 'output' && 'Salida'}
          {row.original.referenceType === 'adjustment' && 'Ajuste'}
          {row.original.referenceId ? ` #${row.original.referenceId}` : ''}
        </div>
      ),
    },
    {
      accessorKey: "notes",
      header: "Notas",
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.original.notes || ''}>
          {row.original.notes || '-'}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Calculate total inventory value
  const totalInventoryValue = products.reduce((total, product) => {
    return total + (product.currentStock * (product.cost || 0));
  }, 0);

  // Count products with low stock
  const lowStockCount = products.filter(product => 
    product.currentStock <= (product.minStock || 0)
  ).length;

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Gestión de Inventario</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleNewAdjustment}>
            <ArrowUpDown className="h-4 w-4 mr-2" /> Ajuste de Inventario
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Nuevo Producto
          </Button>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Productos registrados en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor de Inventario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalInventoryValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Costo total de los productos en inventario
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Productos con Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Productos que requieren reabastecimiento
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        defaultValue="products"
        className="mb-6"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="products" className="flex items-center">
            <Package className="h-4 w-4 mr-2" /> Productos
          </TabsTrigger>
          <TabsTrigger value="movements" className="flex items-center">
            <ArrowUpDown className="h-4 w-4 mr-2" /> Movimientos
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center">
            <BarChart className="h-4 w-4 mr-2" /> Reportes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader className="px-6 py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Inventario de Productos</CardTitle>
              <Button variant="outline" size="sm" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" /> Filtros
              </Button>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <DataTable
                columns={productColumns}
                data={products}
                filterColumn="name"
                filterPlaceholder="Buscar producto..."
                isLoading={isLoadingProducts}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="mt-6">
          <Card>
            <CardHeader className="px-6 py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Movimientos de Inventario</CardTitle>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  className="w-auto"
                />
                <Button variant="outline" size="sm" className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" /> Filtros
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <DataTable
                columns={movementColumns}
                data={inventoryMovements}
                filterColumn="notes"
                filterPlaceholder="Buscar movimiento..."
                isLoading={isLoadingMovements}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Valor de Inventario</CardTitle>
                <CardDescription>Evolución del valor total del inventario</CardDescription>
              </CardHeader>
              <CardContent>
                <canvas ref={inventoryValueChartRef} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Principales Proveedores</CardTitle>
                <CardDescription>Por valor total de inventario</CardDescription>
              </CardHeader>
              <CardContent>
                <canvas ref={topSuppliersChartRef} />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Reportes de Inventario</CardTitle>
              <CardDescription>Generar reportes detallados del inventario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Valoración de Inventario</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-gray-500 mb-4">Reporte detallado del valor del inventario por producto y categoría</p>
                    <Button>
                      <Download className="h-4 w-4 mr-2" /> Descargar
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Productos con Stock Bajo</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-gray-500 mb-4">Lista de productos que requieren reabastecimiento urgente</p>
                    <Button>
                      <Download className="h-4 w-4 mr-2" /> Descargar
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Movimientos del Periodo</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-gray-500 mb-4">Reporte de todos los movimientos dentro de un periodo</p>
                    <Button>
                      <Download className="h-4 w-4 mr-2" /> Descargar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalle del Producto</DialogTitle>
            <DialogDescription>
              {selectedProduct?.code} - {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Código</h4>
                  <p className="text-sm">{selectedProduct.code}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Categoría</h4>
                  <p className="text-sm">{selectedProduct.category}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Stock Actual</h4>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">{selectedProduct.currentStock} {selectedProduct.unit}</p>
                    <StockStatusBadge currentStock={selectedProduct.currentStock} minStock={selectedProduct.minStock || 0} />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Stock Mínimo</h4>
                  <p className="text-sm">{selectedProduct.minStock} {selectedProduct.unit}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Ubicación</h4>
                  <p className="text-sm">{selectedProduct.location || "No especificada"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Costo Unitario</h4>
                  <p className="text-sm">${selectedProduct.cost?.toFixed(2) || "No especificado"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Valor Total</h4>
                  <p className="text-sm font-medium">
                    ${((selectedProduct.cost || 0) * selectedProduct.currentStock).toFixed(2)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Fecha Creación</h4>
                  <p className="text-sm">{formatStandardDate(selectedProduct.createdAt)}</p>
                </div>
              </div>

              {selectedProduct.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Descripción</h4>
                  <p className="text-sm p-3 bg-gray-50 rounded-md">{selectedProduct.description}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Últimos Movimientos</h4>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventoryMovements
                        .filter(move => move.productId === selectedProduct.id)
                        .slice(0, 5)
                        .map((movement, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 text-sm">{formatStandardDate(movement.createdAt)}</td>
                            <td className="px-4 py-3 text-sm">
                              <MovementTypeBadge type={movement.movementType} />
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={movement.quantity < 0 ? 'text-red-600' : 'text-green-600'}>
                                {movement.quantity > 0 ? '+' : ''}{movement.quantity} {movement.unit}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {movement.referenceType} {movement.referenceId ? `#${movement.referenceId}` : ''}
                            </td>
                            <td className="px-4 py-3 text-sm">{movement.notes || "-"}</td>
                          </tr>
                        ))}
                      {inventoryMovements.filter(move => move.productId === selectedProduct.id).length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-3 text-sm text-center text-gray-500">
                            No hay movimientos para este producto
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
                <FileText className="h-4 w-4 mr-2" /> Historial Completo
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setShowProductDialog(false)}>
                  Cerrar
                </Button>
                <Button>
                  <ArrowUpDown className="h-4 w-4 mr-2" /> Ajustar Stock
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Movement Dialog */}
      <Dialog open={showMovementDialog} onOpenChange={setShowMovementDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajuste de Inventario</DialogTitle>
            <DialogDescription>
              Registrar un ajuste manual en el inventario
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Producto</label>
              <select className="w-full p-2 border rounded-md">
                <option value="">Seleccionar producto</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.code} - {product.name} (Stock: {product.currentStock})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cantidad</label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unidad</label>
                <Input disabled placeholder="unidad" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Ajuste</label>
              <select className="w-full p-2 border rounded-md">
                <option value="increase">Incremento</option>
                <option value="decrease">Reducción</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo</label>
              <select className="w-full p-2 border rounded-md">
                <option value="">Seleccionar motivo</option>
                <option value="inventory_count">Conteo de inventario</option>
                <option value="damage">Daño o deterioro</option>
                <option value="loss">Pérdida</option>
                <option value="expiration">Expiración</option>
                <option value="correction">Corrección de error</option>
                <option value="other">Otro</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notas</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="Ingrese información adicional sobre el ajuste"
              ></textarea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMovementDialog(false)}>
              Cancelar
            </Button>
            <Button>
              Registrar Ajuste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
