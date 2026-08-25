import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  History, 
  BarChart3, 
  Bell, 
  LogOut,
  Home,
  ClipboardList,
  Menu,
  X,
  User
} from 'lucide-react'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
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
        { path: '/ai-classification', label: 'AI Classification', icon: Package },
        { path: '/pickups', label: 'Pickups', icon: ClipboardList },
        { path: '/history', label: 'History', icon: History },
      ]
    }
    if (user?.role === 'collector') {
      return [
        { path: '/collector-dashboard', label: 'Dashboard', icon: Home },
        { path: '/pickups', label: 'Assigned Pickups', icon: ClipboardList },
      ]
    }
    return []
  }

  const menuItems = getMenuItems()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 w-64 bg-white border-r border-gray-200 h-full transition-transform duration-300 ease-in-out ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MW</span>
            </div>
            <span className="text-lg font-bold text-gray-800">MediWaste</span>
          </div>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
              <X size={24} />
            </button>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-primary-50 hover:text-primary-600 text-gray-600"
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-50">
            <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
              <User size={18} className="text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role || 'Role'}</p>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
              <LogOut size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isMobile && (
                <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
                  <Menu size={24} />
                </button>
              )}
              <h1 className="text-lg font-semibold text-gray-800">MediWaste Smart</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => navigate('/notifications')} className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell size={22} className="text-gray-600" />
              </button>
              <span className="hidden sm:block text-sm text-gray-600">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
