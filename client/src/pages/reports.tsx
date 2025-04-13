import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PieChart, BarChart, LineChart, ArrowUpDown, Calendar, Download, FileText, Filter, FileBarChart, Loader 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter, 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createInventoryValueChart } from "@/lib/chart-helpers";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("inventory");
  const [period, setPeriod] = useState("month");
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  const inventoryValueChartRef = useRef<HTMLCanvasElement>(null);
  const supplierPurchasesChartRef = useRef<HTMLCanvasElement>(null);
  const inventoryMovementsChartRef = useRef<HTMLCanvasElement>(null);
  
  // Fetch inventory data
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products'],
  });

  // Fetch suppliers
  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  // Fetch inventory movements
  const { data: movements = [], isLoading: isLoadingMovements } = useQuery({
    queryKey: ['/api/inventory/movements'],
  });
  
  // Initialize charts when data is loaded
  useEffect(() => {
    if (!isLoadingProducts && inventoryValueChartRef.current && activeTab === "inventory") {
      createInventoryValueChart(inventoryValueChartRef.current);
    }
  }, [isLoadingProducts, activeTab]);

  // Calculate inventory stats
  const totalInventoryValue = products.reduce((total, product) => {
    return total + (product.currentStock * (product.cost || 0));
  }, 0);

  const lowStockCount = products.filter(product => 
    product.currentStock <= (product.minStock || 0)
  ).length;

  const reportTypes = [
    {
      title: "Inventario y Stock",
      icon: <PieChart className="h-5 w-5" />,
      description: "Reportes sobre niveles de inventario y valoración",
      items: [
        "Valoración de Inventario",
        "Productos con Stock Bajo",
        "Rotación de Inventario",
        "Stock por Categoría"
      ]
    },
    {
      title: "Compras y Proveedores",
      icon: <BarChart className="h-5 w-5" />,
      description: "Análisis de compras y desempeño de proveedores",
      items: [
        "Compras por Proveedor",
        "Evolución de Precios",
        "Órdenes Pendientes",
        "Tiempos de Entrega"
      ]
    },
    {
      title: "Operaciones",
      icon: <ArrowUpDown className="h-5 w-5" />,
      description: "Reportes sobre movimientos y operaciones logísticas",
      items: [
        "Movimientos de Inventario",
        "Salidas por Departamento",
        "Recepciones de Material",
        "Histórico de Movimientos"
      ]
    },
    {
      title: "Financieros",
      icon: <LineChart className="h-5 w-5" />,
      description: "Reportes financieros relacionados con la logística",
      items: [
        "Costos de Inventario",
        "Gastos por Proveedor",
        "Proyección de Pagos",
        "Análisis de Costos"
      ]
    }
  ];

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Reportes y Análisis</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => setShowExportDialog(true)}>
            <FileText className="h-4 w-4 mr-2" /> Exportar Reporte
          </Button>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mes</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="year">Este Año</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <Tabs
        defaultValue="inventory"
        className="mb-6"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="inventory" className="flex items-center">
            <PieChart className="h-4 w-4 mr-2" /> Inventario
          </TabsTrigger>
          <TabsTrigger value="purchasing" className="flex items-center">
            <BarChart className="h-4 w-4 mr-2" /> Compras
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center">
            <ArrowUpDown className="h-4 w-4 mr-2" /> Operaciones
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center">
            <LineChart className="h-4 w-4 mr-2" /> Financieros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Valor del Inventario</CardTitle>
                <CardDescription>Valor total: ${totalInventoryValue.toFixed(2)}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <canvas ref={inventoryValueChartRef} />
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" /> Exportar
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stock por Categoría</CardTitle>
                <CardDescription>Distribución de productos por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Gráfico de distribución por categoría
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" /> Exportar
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Productos con Stock Bajo</CardTitle>
                <CardDescription>Total productos con bajo stock: {lowStockCount}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="border rounded-md divide-y">
                    {products
                      .filter(product => product.currentStock <= (product.minStock || 0))
                      .slice(0, 5)
                      .map(product => (
                        <div key={product.id} className="p-4 flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Código: {product.code} | Categoría: {product.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-red-600">
                              {product.currentStock} / {product.minStock}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Unidad: {product.unit}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" /> Exportar Completo
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="purchasing" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compras por Proveedor</CardTitle>
                <CardDescription>Distribución del volumen de compras</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSuppliers ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Gráfico de compras por proveedor
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" /> Exportar
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evolución de Compras</CardTitle>
                <CardDescription>Tendencia de compras en el tiempo</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSuppliers ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Gráfico de evolución de compras
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" /> Exportar
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Movimientos de Inventario</CardTitle>
                <CardDescription>Entradas y salidas de productos</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingMovements ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Gráfico de movimientos de inventario
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" /> Exportar
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Salidas por Departamento</CardTitle>
                <CardDescription>Distribución de salidas por departamento</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingMovements ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Gráfico de salidas por departamento
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" /> Exportar
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Costos de Inventario</CardTitle>
                <CardDescription>Análisis de inversión en inventario</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Gráfico de costos de inventario
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" /> Exportar
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gastos por Proveedor</CardTitle>
                <CardDescription>Análisis de gastos por proveedor</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSuppliers ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Gráfico de gastos por proveedor
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" /> Exportar
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {reportTypes.map((type, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                {type.icon}
                <CardTitle>{type.title}</CardTitle>
              </div>
              <CardDescription>{type.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {type.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <FileBarChart className="h-4 w-4 mr-2" /> Ver Reportes
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Export Report Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Reporte</DialogTitle>
            <DialogDescription>
              Seleccione el tipo de reporte y el formato para exportar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Tipo de Reporte</Label>
              <Select defaultValue="inventory-value">
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Seleccionar reporte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory-value">Valoración de Inventario</SelectItem>
                  <SelectItem value="low-stock">Productos con Stock Bajo</SelectItem>
                  <SelectItem value="purchases">Compras por Proveedor</SelectItem>
                  <SelectItem value="movements">Movimientos de Inventario</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="format">Formato</Label>
              <Select defaultValue="pdf">
                <SelectTrigger id="format">
                  <SelectValue placeholder="Seleccionar formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Rango de Fechas</Label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="date-from" className="text-xs">Desde</Label>
                  <Input id="date-from" type="date" />
                </div>
                <div className="flex-1">
                  <Label htmlFor="date-to" className="text-xs">Hasta</Label>
                  <Input id="date-to" type="date" />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancelar
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" /> Exportar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;