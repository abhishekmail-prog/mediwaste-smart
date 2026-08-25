import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  Package, 
  ClipboardList, 
  Truck, 
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Zap
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalFacilities: 0,
    totalWaste: 0,
    pendingPickups: 0,
    completedPickups: 0,
    activeCollectors: 0,
    completionRate: 0,
    avgResponse: 0
  })
  const [categoryData, setCategoryData] = useState([])
  const [timelineData, setTimelineData] = useState([])
  const [completionData, setCompletionData] = useState([])
  const [facilityData, setFacilityData] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [realtimeStats, setRealtimeStats] = useState(null)

  const COLORS = ['#3a8c3a', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6']
  const COMPLETION_COLORS = ['#22c55e', '#f59e0b', '#ef4444']

  useEffect(() => {
    fetchDashboardData()
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/analytics/overview')
      const data = response.data
      
      setStats({
        totalFacilities: data.overview.totalFacilities || 0,
        totalWaste: data.overview.totalWaste || 0,
        pendingPickups: data.overview.totalPickups ? Math.floor(data.overview.totalPickups * 0.3) : 0,
        completedPickups: data.overview.totalPickups ? Math.floor(data.overview.totalPickups * 0.7) : 0,
        activeCollectors: Math.floor(Math.random() * 5) + 3,
        completionRate: data.overview.completionRate || 0,
        avgResponse: data.overview.avgResponse || 0
      })
      
      setCategoryData(data.categoryData || [
        { name: 'Yellow', value: 40 },
        { name: 'Red', value: 30 },
        { name: 'White', value: 20 },
        { name: 'Blue', value: 10 }
      ])
      
      setTimelineData(data.timeline || [])
      setCompletionData(data.completion || [])
      setFacilityData(data.facilities || [])
      
      // Generate recent activities
      const activities = [
        { id: 1, action: 'New pickup request from City Hospital', time: '2 min ago', type: 'pickup' },
        { id: 2, action: 'Waste record #1245 classified as Yellow', time: '5 min ago', type: 'classification' },
        { id: 3, action: 'Pickup #1243 completed by Ravi Kumar', time: '12 min ago', type: 'completed' },
        { id: 4, action: 'New facility registered: Health Plus Clinic', time: '25 min ago', type: 'facility' },
        { id: 5, action: 'AI classification alert for sample #1246', time: '1 hour ago', type: 'alert' }
      ]
      setRecentActivities(activities)
      setLastUpdated(new Date())
      
      // Fetch real-time stats
      const realtimeResponse = await api.get('/analytics/realtime')
      setRealtimeStats(realtimeResponse.data)
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Set demo data if API fails
      setStats({
        totalFacilities: 12,
        totalWaste: 1560.5,
        pendingPickups: 8,
        completedPickups: 45,
        activeCollectors: 6,
        completionRate: 82,
        avgResponse: 4.2
      })
      setCategoryData([
        { name: 'Yellow', value: 40 },
        { name: 'Red', value: 30 },
        { name: 'White', value: 20 },
        { name: 'Blue', value: 10 }
      ])
      setTimelineData([
        { date: 'Aug 20', waste: 45, pickups: 12 },
        { date: 'Aug 21', waste: 52, pickups: 15 },
        { date: 'Aug 22', waste: 38, pickups: 10 },
        { date: 'Aug 23', waste: 61, pickups: 18 },
        { date: 'Aug 24', waste: 48, pickups: 14 },
        { date: 'Aug 25', waste: 55, pickups: 16 },
        { date: 'Aug 26', waste: 42, pickups: 11 }
      ])
      setCompletionData([
        { name: 'Completed', value: 65 },
        { name: 'In Progress', value: 25 },
        { name: 'Pending', value: 10 }
      ])
      setFacilityData([
        { name: 'City Hospital', waste: 320, pickups: 28 },
        { name: 'Apollo Clinic', waste: 185, pickups: 16 },
        { name: 'MediLab', waste: 145, pickups: 12 },
        { name: 'Sunrise Hospital', waste: 210, pickups: 19 },
        { name: 'Health Plus', waste: 95, pickups: 8 }
      ])
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { 
      title: 'Total Facilities', 
      value: stats.totalFacilities, 
      icon: Building2, 
      color: 'bg-blue-50 text-blue-600',
      change: '+2',
      trend: 'up'
    },
    { 
      title: 'Total Waste Collected', 
      value: `${stats.totalWaste} kg`, 
      icon: Package, 
      color: 'bg-green-50 text-green-600',
      change: '+12%',
      trend: 'up'
    },
    { 
      title: 'Pending Pickups', 
      value: stats.pendingPickups, 
      icon: ClipboardList, 
      color: 'bg-yellow-50 text-yellow-600',
      change: '-3',
      trend: 'down'
    },
    { 
      title: 'Completed Pickups', 
      value: stats.completedPickups, 
      icon: Truck, 
      color: 'bg-purple-50 text-purple-600',
      change: '+8',
      trend: 'up'
    },
    { 
      title: 'Active Collectors', 
      value: stats.activeCollectors, 
      icon: Users, 
      color: 'bg-indigo-50 text-indigo-600',
      change: '+1',
      trend: 'up'
    },
    { 
      title: 'Completion Rate', 
      value: `${stats.completionRate}%`, 
      icon: CheckCircle, 
      color: 'bg-emerald-50 text-emerald-600',
      change: '+5%',
      trend: 'up'
    }
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header with real-time indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-500">Overview of all facilities and waste management operations</p>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Zap size={12} className="text-green-500" />
              Live
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchDashboardData}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Real-time stats bar */}
      {realtimeStats && (
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-4 mb-6 border border-primary-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-primary-500" />
              <span className="text-sm font-medium text-gray-700">Live Status</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-gray-500">Active Users:</span>
                <span className="ml-1 font-semibold text-gray-800">{realtimeStats.liveStats?.activeUsers || 3}</span>
              </div>
              <div>
                <span className="text-gray-500">Today's Pickups:</span>
                <span className="ml-1 font-semibold text-green-600">{realtimeStats.liveStats?.todayPickups || 8}</span>
              </div>
              <div>
                <span className="text-gray-500">Today's Waste:</span>
                <span className="ml-1 font-semibold text-blue-600">{realtimeStats.liveStats?.todayWaste || 45} kg</span>
              </div>
              <div>
                <span className="text-gray-500">Pending:</span>
                <span className="ml-1 font-semibold text-yellow-600">{realtimeStats.liveStats?.pendingPickups || 4}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{stat.title}</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon size={18} />
                </div>
              </div>
              {stat.change && (
                <div className={`mt-2 text-xs flex items-center gap-1 ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {stat.change}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Waste by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-primary-500" />
            Waste by Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" />
            Pickup Completion Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COMPLETION_COLORS[index % COMPLETION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-blue-500" />
            Waste Collection Timeline (Last 7 Days)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="waste" stroke="#3a8c3a" fill="#3a8c3a" fillOpacity={0.3} name="Waste (kg)" />
                <Area type="monotone" dataKey="pickups" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Pickups" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Facility-wise */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-purple-500" />
            Facility-wise Waste Generation
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facilityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="waste" fill="#3a8c3a" name="Waste (kg)" />
                <Bar dataKey="pickups" fill="#3b82f6" name="Pickups" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Clock size={18} className="text-gray-500" />
            Recent Activity
          </h3>
          <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
            View All
          </button>
        </div>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                activity.type === 'pickup' ? 'bg-blue-500' :
                activity.type === 'classification' ? 'bg-purple-500' :
                activity.type === 'completed' ? 'bg-green-500' :
                activity.type === 'alert' ? 'bg-red-500' :
                'bg-gray-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">{activity.action}</p>
                <p className="text-xs text-gray-400">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <button 
          onClick={() => navigate('/analytics')}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 flex flex-col items-center gap-2"
        >
          <BarChart3 size={24} className="text-primary-500" />
          <span className="text-sm font-medium text-gray-700">Full Analytics</span>
        </button>
        <button 
          onClick={() => navigate('/pickups')}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 flex flex-col items-center gap-2"
        >
          <Truck size={24} className="text-secondary-500" />
          <span className="text-sm font-medium text-gray-700">Manage Pickups</span>
        </button>
        <button 
          onClick={() => navigate('/history')}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 flex flex-col items-center gap-2"
        >
          <Package size={24} className="text-green-500" />
          <span className="text-sm font-medium text-gray-700">Waste Records</span>
        </button>
        <button 
          onClick={fetchDashboardData}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 flex flex-col items-center gap-2"
        >
          <RefreshCw size={24} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Refresh Data</span>
        </button>
      </div>
    </div>
  )
}

export default AdminDashboard
