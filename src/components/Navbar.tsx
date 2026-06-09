import { Link, useLocation } from 'react-router-dom';
import { BarChart2, CheckSquare, Home, Book, Bot, User, LogOut, Award, Calendar, FileText, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada exitosamente');
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 md:top-0 md:bottom-auto md:right-auto md:h-screen md:w-64 md:border-t-0 md:border-r md:flex md:flex-col">
      <div className="hidden md:flex md:items-center md:h-20 md:px-4 md:shrink-0">
        <h1 className="text-2xl font-bold text-indigo-600">GestorAcadémico</h1>
      </div>

      {user && (
        <div className="hidden md:block px-4 py-4 border-b md:shrink-0">
          <div className="font-medium">{user.user_metadata?.name || 'Usuario'}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      )}

      {/* Contenedor con scroll para evitar que los items colisionen con el botón de logout */}
      <div className="md:flex-1 md:overflow-y-auto">
        <ul className="flex justify-around px-4 py-2 md:px-4 md:py-4 md:flex-col md:space-y-2">
          <NavItem to="/" icon={<Home />} label="Inicio" isActive={isActive('/')} />
          <NavItem to="/tasks" icon={<CheckSquare />} label="Tareas" isActive={isActive('/tasks')} />
          <NavItem to="/subjects" icon={<Book />} label="Materias" isActive={isActive('/subjects')} />
          <NavItem to="/grades" icon={<Award />} label="Calificaciones" isActive={isActive('/grades')} />
          <NavItem to="/schedule" icon={<Calendar />} label="Horario" isActive={isActive('/schedule')} />
          <NavItem to="/notes" icon={<FileText />} label="Apuntes" isActive={isActive('/notes')} />
          <NavItem to="/gpa" icon={<GraduationCap />} label="Promedio GPA" isActive={isActive('/gpa')} />
          <NavItem to="/analytics" icon={<BarChart2 />} label="Estadísticas" isActive={isActive('/analytics')} />
          {/*<NavItem to="/ai-assistant" icon={<Bot />} label="Asistente IA" isActive={isActive('/ai-assistant')} />*/}
          <NavItem to="/profile" icon={<User />} label="Perfil" isActive={isActive('/profile')} />
        </ul>
      </div>

      {/* Botón de logout asegurado en la parte inferior */}
      {user && (
        <div className="hidden md:block p-4 mt-auto border-t border-gray-200 md:shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </nav>
  );
}

function NavItem({ to, icon, label, isActive }: { to: string; icon: React.ReactNode; label: string; isActive: boolean }) {
  return (
    <li>
      <Link
        to={to}
        className={`flex items-center gap-3 p-3 rounded-lg transition-colors
          ${isActive 
            ? 'text-indigo-600 bg-indigo-50' 
            : 'text-gray-600 hover:bg-gray-100'}`}
      >
        {icon}
        <span className="hidden md:inline">{label}</span>
      </Link>
    </li>
  );
}