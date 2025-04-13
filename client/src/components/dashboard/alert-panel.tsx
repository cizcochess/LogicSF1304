import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { 
  Product,
  PurchaseOrder,
  Invoice,
  SystemActivity
} from "@shared/schema";

interface AlertPanelProps {
  lowStockProducts: Product[];
  delayedOrders: PurchaseOrder[];
  dueInvoices: Invoice[];
  isLoading: boolean;
  onRefresh: () => void;
}

const AlertPanel = ({
  lowStockProducts,
  delayedOrders,
  dueInvoices,
  isLoading,
  onRefresh,
}: AlertPanelProps) => {
  const [activeTab, setActiveTab] = useState<string>("low-stock");

  return (
    <Card className="shadow-sm h-full">
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-lg font-semibold">Alertas del Sistema</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="text-primary hover:text-primary-dark"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex border-b">
          <button
            className={`px-6 py-3 font-medium text-sm flex items-center ${
              activeTab === "low-stock"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("low-stock")}
          >
            Stock Bajo{" "}
            <span className={`ml-2 ${activeTab === "low-stock" ? "bg-red-500" : "bg-gray-200 text-gray-600"} text-white text-xs rounded-full px-2 py-0.5`}>
              {lowStockProducts.length}
            </span>
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm flex items-center ${
              activeTab === "delayed-orders"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("delayed-orders")}
          >
            OC Retrasadas{" "}
            <span className={`ml-2 ${activeTab === "delayed-orders" ? "bg-amber-500" : "bg-gray-200 text-gray-600"} text-white text-xs rounded-full px-2 py-0.5`}>
              {delayedOrders.length}
            </span>
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm flex items-center ${
              activeTab === "due-invoices"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("due-invoices")}
          >
            Facturas por Vencer{" "}
            <span className={`ml-2 ${activeTab === "due-invoices" ? "bg-blue-500" : "bg-gray-200 text-gray-600"} text-white text-xs rounded-full px-2 py-0.5`}>
              {dueInvoices.length}
            </span>
          </button>
        </div>
      </div>

      <div className="overflow-y-auto h-56 p-4 space-y-3">
        {activeTab === "low-stock" && (
          <>
            {lowStockProducts.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                No hay productos con stock bajo
              </div>
            ) : (
              lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 rounded-md bg-red-50 border border-red-100 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-sm font-medium">{product.name}</h3>
                    <p className="text-xs text-gray-500">
                      Stock actual: {product.currentStock} (mínimo: {product.minStock})
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    Generar OC
                  </Button>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === "delayed-orders" && (
          <>
            {delayedOrders.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                No hay órdenes retrasadas
              </div>
            ) : (
              delayedOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3 rounded-md bg-amber-50 border border-amber-100 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-sm font-medium">Orden #{order.code}</h3>
                    <p className="text-xs text-gray-500">
                      Retraso: {Math.floor((new Date().getTime() - new Date(order.expectedDeliveryDate!).getTime()) / (1000 * 60 * 60 * 24))} días • Proveedor: {order.supplierId}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white"
                  >
                    Contactar
                  </Button>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === "due-invoices" && (
          <>
            {dueInvoices.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                No hay facturas por vencer
              </div>
            ) : (
              dueInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="p-3 rounded-md bg-blue-50 border border-blue-100 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-sm font-medium">Factura #{invoice.code}</h3>
                    <p className="text-xs text-gray-500">
                      Vence en: {Math.floor((new Date(invoice.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días • Monto: ${invoice.amount.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                  >
                    Programar pago
                  </Button>
                </div>
              ))
            )}
          </>
        )}
      </div>

      <div className="border-t border-gray-200 px-6 py-3 text-center">
        <Button variant="link" className="text-primary text-sm hover:text-primary-dark p-0 h-auto">
          Ver todas las alertas
        </Button>
      </div>
    </Card>
  );
};

export default AlertPanel;
