import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart2, CheckSquare, Home, Book, User, LogOut,
  Award, Calendar, FileText, GraduationCap, Menu, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/', icon: <Home size={20} />, label: 'Inicio' },
  { to: '/tasks', icon: <CheckSquare size={20} />, label: 'Tareas' },
  { to: '/subjects', icon: <Book size={20} />, label: 'Materias' },
  { to: '/grades', icon: <Award size={20} />, label: 'Notas' },
  { to: '/schedule', icon: <Calendar size={20} />, label: 'Horario' },
  { to: '/notes', icon: <FileText size={20} />, label: 'Apuntes' },
  { to: '/gpa', icon: <GraduationCap size={20} />, label: 'GPA' },
  { to: '/analytics', icon: <BarChart2 size={20} />, label: 'Stats' },
  { to: '/profile', icon: <User size={20} />, label: 'Perfil' },
];

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada exitosamente');
    setMobileMenuOpen(false);
  };
<<<<<<< HEAD
=======
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 overflow-x-auto md:top-0 md:bottom-auto md:right-auto md:h-screen md:w-64 md:border-t-0 md:border-r md:flex md:flex-col md:overflow-x-visible">
      <div className="hidden md:flex md:items-center md:h-20 md:px-4 md:shrink-0">
        <h1 className="text-2xl font-bold text-indigo-600">GestorAcadémico</h1>
      </div>
>>>>>>> 095bcf6becc43f97a06b5bd989b8ecb5fa3844c5

  return (
    <>
      {/* ===== SIDEBAR DESKTOP (md+) ===== */}
      <nav className="hidden md:flex md:flex-col fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-30">
        <div className="flex items-center h-20 px-4 shrink-0">
          <h1 className="text-xl font-bold text-indigo-600">GestorAcadémico</h1>
        </div>

        {user && (
          <div className="px-4 py-3 border-b shrink-0">
            <div className="font-medium text-sm truncate">{user.user_metadata?.name || 'Usuario'}</div>
            <div className="text-xs text-gray-500 truncate">{user.email}</div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <ul className="flex flex-col px-3 py-3 space-y-1">
            {navItems.map(item => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium
                    ${isActive(item.to)
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {user && (
          <div className="p-3 mt-auto border-t border-gray-200 shrink-0">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </nav>

      {/* ===== MOBILE TOP HEADER ===== */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14">
        <h1 className="text-base font-bold text-indigo-600">GestorAcadémico</h1>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
      </header>



      {/* ===== MOBILE DRAWER MENU ===== */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div className="relative ml-auto w-72 max-w-full h-full bg-white flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <h2 className="text-lg font-bold text-indigo-600">GestorAcadémico</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {user && (
              <div className="px-4 py-3 border-b bg-gray-50">
                <div className="font-semibold text-gray-800 truncate">{user.user_metadata?.name || 'Usuario'}</div>
                <div className="text-sm text-gray-500 truncate">{user.email}</div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-3">
              <ul className="space-y-1 px-3">
                {navItems.map(item => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-sm font-medium
                        ${isActive(item.to)
                          ? 'text-indigo-600 bg-indigo-50'
                          : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {user && (
              <div className="p-4 border-t">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                >
                  <LogOut size={20} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
<<<<<<< HEAD
    </>
=======

      {/* Contenedor con scroll para evitar que los items colisionen con el botón de logout */}
      <div className="md:flex-1 md:overflow-y-auto min-w-max md:min-w-0">
        <ul className="flex justify-around gap-2 px-4 py-2 md:px-4 md:py-4 md:flex-col md:space-y-2 md:gap-0">
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
>>>>>>> 095bcf6becc43f97a06b5bd989b8ecb5fa3844c5
  );
}