import { useState, useRef, useEffect } from "react";
import { Bell, Search, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";

interface TopbarProps {
  toggleSidebar: () => void;
}

const Topbar = ({ toggleSidebar }: TopbarProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const notifications = [
    {
      id: 1,
      title: "Nueva orden recibida",
      description: "Orden #82452 creada por Dpto. Operaciones",
      time: "Hace 5 minutos",
    },
    {
      id: 2,
      title: "Stock bajo en producto A123",
      description: "Nivel actual: 5 unidades (mínimo: 10)",
      time: "Hace 2 horas",
    },
    {
      id: 3,
      title: "Requerimiento aprobado #8742",
      description: "Listo para generar orden de compra",
      time: "Hace 1 día",
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node) &&
        showNotifications
      ) {
        setShowNotifications(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node) &&
        showProfile
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications, showProfile]);

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="mr-4 lg:hidden"
        >
          <i className="fas fa-bars text-xl"></i>
        </Button>

        <div className="relative">
          <Input
            type="text"
            placeholder="Buscar..."
            className="w-64 pl-10 h-9 bg-gray-100 focus-visible:ring-primary"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative" ref={notificationsRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="relative text-gray-600"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </Button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-20">
              <div className="px-4 py-2 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Notificaciones</h3>
                  <Button variant="link" className="text-primary text-sm p-0 h-auto">
                    Marcar todo como leído
                  </Button>
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                  >
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {notification.time}
                    </p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-200 text-center">
                <Link href="/notifications">
                  <a className="text-primary text-sm hover:text-primary-dark">
                    Ver todas las notificaciones
                  </a>
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <Button
            variant="ghost"
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-2 text-gray-700"
          >
            <Avatar>
              <AvatarImage src="https://via.placeholder.com/40" alt="Admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium">Admin</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
          </Button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
              <Link href="/profile">
                <a className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <User className="mr-2 h-4 w-4 text-gray-500" />
                  Mi Perfil
                </a>
              </Link>
              <Link href="/settings">
                <a className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Settings className="mr-2 h-4 w-4 text-gray-500" />
                  Configuración
                </a>
              </Link>
              <div className="border-t border-gray-100 my-1"></div>
              <Link href="/logout">
                <a className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <LogOut className="mr-2 h-4 w-4 text-gray-500" />
                  Cerrar Sesión
                </a>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
