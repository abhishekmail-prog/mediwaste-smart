import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  Package, 
  ClipboardList, 
  Truck, 
  TrendingUp,
  PlusCircle,
  Brain,
  Calendar,
  Clock,
  ArrowRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const StaffDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalWaste: 0,
    pendingPickups: 0,
    completedPickups: 0,
    classifications: 0
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/staff')
      setStats(response.data.stats)
      setRecentActivities(response.data.activities || [
        { id: 1, action: 'Waste record created', category: 'Yellow', time: '2 min ago' },
        { id: 2, action: 'AI Classification completed', category: 'Red', time: '15 min ago' },
        { id: 3, action: 'Pickup request raised', priority: 'High', time: '1 hour ago' },
      ])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      setStats({
        totalWaste: 245.5,
        pendingPickups: 3,
        completedPickups: 12,
        classifications: 45
      })
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { title: 'Total Waste', value: `${stats.totalWaste} kg`, icon: Package, color: 'bg-blue-50 text-blue-600', border: 'border-blue-200' },
    { title: 'Pending Pickups', value: stats.pendingPickups, icon: ClipboardList, color: 'bg-yellow-50 text-yellow-600', border: 'border-yellow-200' },
    { title: 'Completed', value: stats.completedPickups, icon: Truck, color: 'bg-green-50 text-green-600', border: 'border-green-200' },
    { title: 'AI Classified', value: stats.classifications, icon: TrendingUp, color: 'bg-purple-50 text-purple-600', border: 'border-purple-200' }
  ]

  const quickActions = [
    { label: 'Enter Waste', icon: PlusCircle, color: 'bg-primary-500', path: '/waste-entry' },
    { label: 'AI Classify', icon: Brain, color: 'bg-purple-500', path: '/ai-classification' },
    { label: 'Request Pickup', icon: Truck, color: 'bg-green-500', path: '/staff-pickups' }
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
        <p className="text-gray-500 text-sm">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-6 border border-primary-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, {user?.name} 👋
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Here's what's happening with your medical waste today</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/80 px-4 py-2 rounded-xl">
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions - Grid responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {quickActions.map((action, idx) => {
          const Icon = action.icon
          return (
            <button
              key={idx}
              onClick={() => navigate(action.path)}
              className={`${action.color} text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02]`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{action.label}</span>
            </button>
          )
        })}
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 truncate">{stat.title}</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center flex-shrink-0 ml-2`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity - Responsive */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-800">Recent Activity</h3>
          <button 
            onClick={() => navigate('/history')}
            className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
          >
            View All <ArrowRight size={16} />
          </button>
        </div>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{activity.action}</p>
                  <p className="text-xs text-gray-500">
                    {activity.category && `Category: ${activity.category}`}
                    {activity.priority && `Priority: ${activity.priority}`}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard
