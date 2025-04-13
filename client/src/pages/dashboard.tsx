import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/dashboard/stat-card";
import ChartContainer from "@/components/dashboard/chart-container";
import AlertPanel from "@/components/dashboard/alert-panel";
import ActivityTable from "@/components/dashboard/activity-table";
import { 
  ClipboardList, 
  ShoppingCart, 
  Truck, 
  PackageMinus 
} from "lucide-react";
import { createOrderStatusChart, createCostCategoryChart, createInventoryMovementChart } from "@/lib/chart-helpers";
import { formatDateDistance } from "@/lib/date-helpers";

const Dashboard = () => {
  const orderStatusChartRef = useRef<HTMLCanvasElement>(null);
  const costCategoryChartRef = useRef<HTMLCanvasElement>(null);
  const inventoryMovementChartRef = useRef<HTMLCanvasElement>(null);
  
  const [orderChartPeriod, setOrderChartPeriod] = useState<string>("30");
  const [costChartPeriod, setCostChartPeriod] = useState<string>("30");
  const [inventoryChartPeriod, setInventoryChartPeriod] = useState<string>("7");

  // Fetch dashboard data
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/dashboard'],
    refetchInterval: 60000, // Refresh every minute
  });

  useEffect(() => {
    if (data && !isLoading) {
      if (orderStatusChartRef.current) {
        createOrderStatusChart(orderStatusChartRef.current);
      }
      
      if (costCategoryChartRef.current) {
        createCostCategoryChart(costCategoryChartRef.current);
      }
      
      if (inventoryMovementChartRef.current) {
        createInventoryMovementChart(inventoryMovementChartRef.current, data.inventoryMovements);
      }
    }
  }, [data, isLoading, orderChartPeriod, costChartPeriod, inventoryChartPeriod]);

  if (isError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <h2 className="text-xl font-bold text-red-800 mb-2">Error al cargar el dashboard</h2>
        <p className="text-red-600 mb-4">Hubo un problema al obtener los datos del dashboard.</p>
        <button 
          onClick={() => refetch()} 
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Requerimientos Pendientes"
          value={isLoading ? "-" : data?.pendingRequirementsCount || 0}
          description="Por procesar"
          icon={<ClipboardList className="h-6 w-6" />}
          color="blue"
        />
        <StatCard 
          title="Órdenes Activas"
          value={isLoading ? "-" : data?.activeOrdersCount || 0}
          description="En proceso"
          icon={<ShoppingCart className="h-6 w-6" />}
          color="orange"
        />
        <StatCard 
          title="Recepciones Programadas"
          value={isLoading ? "-" : data?.scheduledReceptionsCount || 0}
          description="Próximos 7 días"
          icon={<Truck className="h-6 w-6" />}
          color="green"
        />
        <StatCard 
          title="Salidas Pendientes"
          value={isLoading ? "-" : data?.pendingOutputsCount || 0}
          description="Por procesar"
          icon={<PackageMinus className="h-6 w-6" />}
          color="purple"
        />
      </div>
      
      {/* Charts - First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartContainer 
          title="Órdenes por Estado" 
          timeFilter={true}
          timeFilterValue={orderChartPeriod}
          onTimeFilterChange={setOrderChartPeriod}
        >
          <canvas ref={orderStatusChartRef} />
        </ChartContainer>
        
        <ChartContainer 
          title="Costos por Categoría" 
          timeFilter={true}
          timeFilterValue={costChartPeriod}
          onTimeFilterChange={setCostChartPeriod}
        >
          <canvas ref={costCategoryChartRef} />
        </ChartContainer>
      </div>
      
      {/* Charts - Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartContainer 
          title="Movimientos de Inventario" 
          timeFilter={true}
          timeFilterValue={inventoryChartPeriod}
          onTimeFilterChange={setInventoryChartPeriod}
        >
          <canvas ref={inventoryMovementChartRef} />
        </ChartContainer>
        
        <AlertPanel 
          lowStockProducts={data?.lowStockProducts || []}
          delayedOrders={data?.delayedOrders || []}
          dueInvoices={data?.dueInvoices || []}
          isLoading={isLoading}
          onRefresh={() => refetch()}
        />
      </div>
      
      {/* Activity Table */}
      <ActivityTable 
        activities={data?.recentActivities || []}
        users={[{ id: 1, username: 'admin', fullName: 'Administrador', role: 'admin', password: '', department: 'IT', email: 'admin@example.com' }]}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Dashboard;
