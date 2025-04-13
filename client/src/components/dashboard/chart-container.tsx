import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";

interface ChartContainerProps {
  title: string;
  children: ReactNode;
  timeFilter?: boolean;
  onTimeFilterChange?: (value: string) => void;
  timeFilterValue?: string;
  actions?: ReactNode;
}

const ChartContainer = ({
  title,
  children,
  timeFilter = true,
  onTimeFilterChange,
  timeFilterValue = "30",
  actions,
}: ChartContainerProps) => {
  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <div className="flex items-center space-x-2">
          {timeFilter && (
            <Select 
              value={timeFilterValue} 
              onValueChange={onTimeFilterChange || (() => {})}
            >
              <SelectTrigger className="w-[180px] h-9 text-sm">
                <SelectValue placeholder="Seleccione período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 días</SelectItem>
                <SelectItem value="30">Últimos 30 días</SelectItem>
                <SelectItem value="90">Últimos 90 días</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="year">Este año</SelectItem>
              </SelectContent>
            </Select>
          )}
          {actions || (
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0 h-64">
        {children}
      </CardContent>
    </Card>
  );
};

export default ChartContainer;
