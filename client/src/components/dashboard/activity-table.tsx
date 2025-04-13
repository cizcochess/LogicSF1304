import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SystemActivity, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

// Status badge mapping
const statusBadgeClasses = {
  create: "bg-green-100 text-green-800",
  update: "bg-blue-100 text-blue-800",
  delete: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  processing: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
  in_transit: "bg-indigo-100 text-indigo-800",
};

// Entity type mapping to friendly names
const entityTypeMap: Record<string, string> = {
  requirement: "Requerimientos",
  purchase_order: "Órdenes de Compra",
  reception: "Recepción",
  output: "Salidas",
  inventory_movement: "Inventario",
  supplier: "Proveedores",
  product: "Productos",
  invoice: "Contabilidad",
};

interface ActivityTableProps {
  activities: SystemActivity[];
  users: User[];
  isLoading: boolean;
  onFilterChange?: (type: string) => void;
  activeFilter?: string;
}

const ActivityTable = ({
  activities,
  users,
  isLoading,
  onFilterChange,
  activeFilter = "all",
}: ActivityTableProps) => {
  // Function to find user by ID
  const getUserName = (userId: number): string => {
    const user = users.find((u) => u.id === userId);
    return user ? user.fullName : "Usuario desconocido";
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
        <CardTitle className="text-lg font-semibold">Actividad Reciente</CardTitle>
        <div className="flex items-center space-x-2">
          <Select 
            value={activeFilter} 
            onValueChange={onFilterChange || (() => {})}
          >
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue placeholder="Todas las actividades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las actividades</SelectItem>
              <SelectItem value="requirement">Requerimientos</SelectItem>
              <SelectItem value="purchase_order">Órdenes</SelectItem>
              <SelectItem value="reception">Recepción</SelectItem>
              <SelectItem value="output">Salidas</SelectItem>
              <SelectItem value="inventory_movement">Inventario</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</TableHead>
                <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</TableHead>
                <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Módulo</TableHead>
                <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha/Hora</TableHead>
                <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</TableHead>
                <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Cargando actividades...
                  </TableCell>
                </TableRow>
              ) : activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No hay actividades para mostrar
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((activity) => (
                  <TableRow key={activity.id} className="border-b hover:bg-gray-50">
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{activity.description}</div>
                      <div className="text-xs text-gray-500">ID: {activity.entityId}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                      {getUserName(activity.userId || 0)}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                      {entityTypeMap[activity.entityType] || activity.entityType}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDistanceToNow(new Date(activity.createdAt), { 
                        addSuffix: true,
                        locale: es
                      })}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        statusBadgeClasses[activity.activityType as keyof typeof statusBadgeClasses] || "bg-gray-100 text-gray-800"
                      }`}>
                        {activity.activityType === "create" ? "Creado" :
                         activity.activityType === "update" ? "Actualizado" :
                         activity.activityType === "delete" ? "Eliminado" : activity.activityType}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Button variant="link" className="text-primary hover:text-primary-dark p-0 h-auto">
                        Ver detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between items-center p-4 border-t border-gray-200 mt-4">
          <div className="text-sm text-gray-600">
            Mostrando {activities.length} de {activities.length} actividades
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="sm" className="text-sm" disabled>
              <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
            </Button>
            <Button variant="default" size="sm" className="text-sm">
              1
            </Button>
            <Button variant="outline" size="sm" className="text-sm" disabled>
              Siguiente <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityTable;
