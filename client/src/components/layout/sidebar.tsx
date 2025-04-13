import { Link, useLocation } from "wouter";
import {
  BarChart3,
  ClipboardList,
  ShoppingCart,
  Truck,
  PackageOpen,
  PackageMinus,
  Users,
  Calculator,
  LineChart,
  FlaskConical
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/") return location === "/" || location === "/dashboard";
    return location.startsWith(path);
  };

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } h-screen bg-white shadow-md transition-all duration-300 z-20 overflow-y-auto`}
    >
      <div className="flex items-center justify-between p-5 bg-primary text-white">
        {!collapsed && <h1 className="text-xl font-semibold">LogiERP</h1>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white focus:outline-none"
        >
          <i className={`fas ${collapsed ? "fa-expand" : "fa-bars"}`}></i>
        </button>
      </div>
      <nav className="pt-2">
        <ul>
          <li>
            <Link href="/dashboard">
              <div
                className={`flex items-center py-3 px-5 ${
                  isActive("/dashboard") || isActive("/")
                    ? "text-white bg-primary border-l-4 border-white"
                    : "text-gray-700 hover:bg-primary-light/10 hover:text-primary"
                } transition-colors cursor-pointer`}
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                {!collapsed && <span>Dashboard</span>}
              </div>
            </Link>
          </li>
          <li>
            <Link href="/requirements">
              <div
                className={`flex items-center py-3 px-5 ${
                  isActive("/requirements")
                    ? "text-white bg-primary border-l-4 border-white"
                    : "text-gray-700 hover:bg-primary-light/10 hover:text-primary"
                } transition-colors cursor-pointer`}
              >
                <ClipboardList className="w-5 h-5 mr-3" />
                {!collapsed && <span>Requerimientos</span>}
              </div>
            </Link>
          </li>
          <li>
            <Link href="/purchase-orders">
              <div
                className={`flex items-center py-3 px-5 ${
                  isActive("/purchase-orders")
                    ? "text-white bg-primary border-l-4 border-white"
                    : "text-gray-700 hover:bg-primary-light/10 hover:text-primary"
                } transition-colors cursor-pointer`}
              >
                <ShoppingCart className="w-5 h-5 mr-3" />
                {!collapsed && <span>Órdenes de Compra</span>}
              </div>
            </Link>
          </li>
          <li>
            <Link href="/reception">
              <div
                className={`flex items-center py-3 px-5 ${
                  isActive("/reception")
                    ? "text-white bg-primary border-l-4 border-white"
                    : "text-gray-700 hover:bg-primary-light/10 hover:text-primary"
                } transition-colors cursor-pointer`}
              >
                <Truck className="w-5 h-5 mr-3" />
                {!collapsed && <span>Recepción</span>}
              </div>
            </Link>
          </li>
          <li>
            <Link href="/inventory">
              <div
                className={`flex items-center py-3 px-5 ${
                  isActive("/inventory")
                    ? "text-white bg-primary border-l-4 border-white"
                    : "text-gray-700 hover:bg-primary-light/10 hover:text-primary"
                } transition-colors cursor-pointer`}
              >
                <PackageOpen className="w-5 h-5 mr-3" />
                {!collapsed && <span>Inventario</span>}
              </div>
            </Link>
          </li>
          <li>
            <Link href="/outputs">
              <div
                className={`flex items-center py-3 px-5 ${
                  isActive("/outputs")
                    ? "text-white bg-primary border-l-4 border-white"
                    : "text-gray-700 hover:bg-primary-light/10 hover:text-primary"
                } transition-colors cursor-pointer`}
              >
                <PackageMinus className="w-5 h-5 mr-3" />
                {!collapsed && <span>Salidas</span>}
              </div>
            </Link>
          </li>
          <li>
            <Link href="/suppliers">
              <div
                className={`flex items-center py-3 px-5 ${
                  isActive("/suppliers")
                    ? "text-white bg-primary border-l-4 border-white"
                    : "text-gray-700 hover:bg-primary-light/10 hover:text-primary"
                } transition-colors cursor-pointer`}
              >
                <Users className="w-5 h-5 mr-3" />
                {!collapsed && <span>Proveedores</span>}
              </div>
            </Link>
          </li>
          <li>
            <Link href="/accounting">
              <div
                className={`flex items-center py-3 px-5 ${
                  isActive("/accounting")
                    ? "text-white bg-primary border-l-4 border-white"
                    : "text-gray-700 hover:bg-primary-light/10 hover:text-primary"
                } transition-colors cursor-pointer`}
              >
                <Calculator className="w-5 h-5 mr-3" />
                {!collapsed && <span>Contabilidad</span>}
              </div>
            </Link>
          </li>
          <li>
            <Link href="/reports">
              <div
                className={`flex items-center py-3 px-5 ${
                  isActive("/reports")
                    ? "text-white bg-primary border-l-4 border-white"
                    : "text-gray-700 hover:bg-primary-light/10 hover:text-primary"
                } transition-colors cursor-pointer`}
              >
                <LineChart className="w-5 h-5 mr-3" />
                {!collapsed && <span>Reportes</span>}
              </div>
            </Link>
          </li>
          <li>
            <Link href="/tests">
              <div
                className={`flex items-center py-3 px-5 ${
                  isActive("/tests")
                    ? "text-white bg-primary border-l-4 border-white"
                    : "text-gray-700 hover:bg-primary-light/10 hover:text-primary"
                } transition-colors cursor-pointer`}
              >
                <FlaskConical className="w-5 h-5 mr-3" />
                {!collapsed && <span>Test Runner</span>}
              </div>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
