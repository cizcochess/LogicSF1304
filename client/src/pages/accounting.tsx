import { useState } from "react";
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
import { Invoice } from "@shared/schema";
import { Plus, FileText, Edit, Filter, Eye, Download, CreditCard, DollarSign, ArrowUpDown } from "lucide-react";
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
import { formatStandardDate } from "@/lib/date-helpers";

const Accounting = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch invoices
  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
  });

  // Filter invoices based on active tab
  const filteredInvoices = invoices.filter((invoice: Invoice) => {
    if (activeTab === "all") return true;
    if (activeTab === "due") return invoice.status === "pending" && new Date(invoice.dueDate) < new Date();
    return invoice.status === activeTab;
  });

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusMap: Record<string, { label: string, className: string }> = {
      paid: { label: "Pagada", className: "bg-green-100 text-green-800" },
      pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
      partial: { label: "Pago Parcial", className: "bg-blue-100 text-blue-800" },
      cancelled: { label: "Cancelada", className: "bg-red-100 text-red-800" },
    };

    const { label, className } = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
        {label}
      </span>
    );
  };

  // Table columns definition
  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "code",
      header: "Número",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.code}</div>
      ),
    },
    {
      accessorKey: "issueDate",
      header: "Fecha Emisión",
      cell: ({ row }) => formatStandardDate(row.original.issueDate),
    },
    {
      accessorKey: "dueDate",
      header: "Fecha Vencimiento",
      cell: ({ row }) => formatStandardDate(row.original.dueDate),
    },
    {
      accessorKey: "supplierId",
      header: "Proveedor",
      cell: ({ row }) => `ID: ${row.original.supplierId}`,
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => (
        <div className="text-right font-medium">
          ${row.original.amount.toFixed(2)} {row.original.currency}
        </div>
      ),
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
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Registrar pago"
          >
            <CreditCard className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Calculate totals
  const totalPending = filteredInvoices
    .filter((invoice: Invoice) => invoice.status === 'pending')
    .reduce((sum: number, invoice: Invoice) => sum + invoice.amount, 0);
  
  const totalPaid = filteredInvoices
    .filter((invoice: Invoice) => invoice.status === 'paid')
    .reduce((sum: number, invoice: Invoice) => sum + invoice.amount, 0);

  const totalOverdue = filteredInvoices
    .filter((invoice: Invoice) => invoice.status === 'pending' && new Date(invoice.dueDate) < new Date())
    .reduce((sum: number, invoice: Invoice) => sum + invoice.amount, 0);

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Contabilidad y Finanzas</h1>
        <div className="space-x-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" /> Exportar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Nueva Factura
          </Button>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Facturas Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalPending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de pagos por realizar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Facturas Vencidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">${totalOverdue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de pagos con atraso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagos Realizados (Mes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${totalPaid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total pagado en el mes actual
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        defaultValue="all"
        className="mb-6"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="due">Vencidas</TabsTrigger>
          <TabsTrigger value="paid">Pagadas</TabsTrigger>
          <TabsTrigger value="partial">Pago Parcial</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader className="px-6 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Facturas de Proveedores</CardTitle>
          <Button variant="outline" size="sm" className="flex items-center">
            <Filter className="h-4 w-4 mr-2" /> Filtros
          </Button>
        </CardHeader>
        <CardContent className="px-0 py-0">
          <DataTable
            columns={columns}
            data={filteredInvoices}
            filterColumn="code"
            filterPlaceholder="Buscar factura..."
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Accounting;