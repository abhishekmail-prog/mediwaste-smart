import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  History, 
  BarChart3, 
  Bell as BellIcon,
  LogOut,
  Home,
  ClipboardList,
  Menu,
  X,
  User,
  ChevronDown,
  Truck,
  Brain,
  Settings,
  HelpCircle
} from 'lucide-react'
import NotificationBell from './NotificationBell'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
      if (width >= 1024) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return [
        { path: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/pickups', label: 'All Pickups', icon: ClipboardList },
      ]
    }
    if (user?.role === 'staff') {
      return [
        { path: '/staff-dashboard', label: 'Dashboard', icon: Home },
        { path: '/waste-entry', label: 'Waste Entry', icon: PlusCircle },
        { path: '/ai-classification', label: 'AI Classification', icon: Brain },
        { path: '/staff-pickups', label: 'Pickups', icon: ClipboardList },
        { path: '/history', label: 'History', icon: History },
      ]
    }
    if (user?.role === 'collector') {
      return [
        { path: '/collector-dashboard', label: 'Dashboard', icon: Home },
        { path: '/pickups', label: 'Pickups', icon: ClipboardList },
      ]
    }
    return []
  }

  const menuItems = getMenuItems()
  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
        ${isMobile ? 'w-72' : isTablet ? 'w-64' : 'w-64'}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        flex flex-col
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">MW</span>
            </div>
            <div>
              <span className="text-lg font-bold text-gray-800 block">MediWaste</span>
              <span className="text-xs text-gray-400">Smart</span>
            </div>
          </Link>
          {isMobile && (
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${active 
                    ? 'bg-primary-50 text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                  }
                `}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <Icon size={20} className={active ? 'text-primary-500' : ''} />
                <span className={`font-medium ${active ? 'text-primary-700' : ''}`}>
                  {item.label}
                </span>
                {active && (
                  <div className="ml-auto w-1.5 h-8 bg-primary-500 rounded-full"></div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                <User size={20} className="text-primary-600" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'Role'}</p>
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-slide-up">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors rounded-lg"
                >
                  <LogOut size={18} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`
        flex-1 flex flex-col min-h-screen transition-all duration-300
        ${isMobile ? 'ml-0' : isTablet ? 'ml-64' : 'ml-64'}
        ${!sidebarOpen && isMobile ? 'ml-0' : ''}
      `}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Menu size={24} className="text-gray-600" />
                </button>
              )}
              <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">
                MediWaste Smart
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Actions */}
              {user?.role === 'staff' && (
                <>
                  <Link
                    to="/waste-entry"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <PlusCircle size={16} />
                    Add Waste
                  </Link>
                  <Link
                    to="/staff-pickups"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Truck size={16} />
                    Pickups
                  </Link>
                </>
              )}

              {/* Notifications */}
              <NotificationBell />

              {/* User Profile (Mobile) */}
              {isMobile && (
                <button
                  onClick={() => navigate('/profile')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <User size={22} className="text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Quick Actions */}
          {isMobile && user?.role === 'staff' && (
            <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
              <Link
                to="/waste-entry"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded-lg whitespace-nowrap"
              >
                <PlusCircle size={14} />
                Add Waste
              </Link>
              <Link
                to="/staff-pickups"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg whitespace-nowrap"
              >
                <Truck size={14} />
                Pickups
              </Link>
              <Link
                to="/ai-classification"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 text-white text-xs font-medium rounded-lg whitespace-nowrap"
              >
                <Brain size={14} />
                AI Classify
              </Link>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden pb-24 sm:pb-6">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-bottom">
            <div className="flex items-center justify-around px-2 py-2">
              {menuItems.slice(0, 4).map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors touch-target
                      ${active ? 'text-primary-500' : 'text-gray-500'}
                    `}
                  >
                    <Icon size={20} className={active ? 'text-primary-500' : ''} />
                    <span className={`text-[10px] ${active ? 'text-primary-500 font-medium' : ''}`}>
                      {item.label.length > 8 ? item.label.slice(0, 8) + '..' : item.label}
                    </span>
                  </Link>
                )
              })}
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-gray-500 touch-target"
              >
                <Menu size={20} />
                <span className="text-[10px]">More</span>
              </button>
            </div>
          </nav>
        )}
      </div>

      {/* Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.2s ease-out;
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

export default Layout
