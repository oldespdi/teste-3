import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Sparkles, 
  MessageCircle, 
  User, 
  Settings, 
  LogOut,
  Crown
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/reading', icon: Sparkles, label: 'Tiragem' },
    { path: '/chat', icon: MessageCircle, label: 'Esmeralda' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  // Adicionar item admin se o usuário for admin
  if (user?.email === 'admin@oraculo.com') {
    navItems.push({ path: '/admin', icon: Crown, label: 'Admin' });
  }

  return (
    <div className="min-h-screen bg-mystic-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-mystic-800 border-r border-mystic-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-mystic-700">
          <h1 className="text-2xl font-mystic text-primary-400 text-center">
            🔮 Oráculo Digital
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                      isActive(item.path)
                        ? 'bg-primary-600 text-white'
                        : 'text-mystic-300 hover:bg-mystic-700 hover:text-mystic-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-mystic-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-mystic-100 font-medium text-sm">{user?.name}</p>
              <p className="text-mystic-400 text-xs">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-mystic-300 hover:bg-mystic-700 hover:text-mystic-100 rounded-lg transition-colors duration-200"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout; 