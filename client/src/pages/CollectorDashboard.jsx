import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  MapPin,
  Package,
  Calendar,
  User,
  Phone,
  TrendingUp,
  TrendingDown,
  Navigation,
  Star,
  Truck,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Check,
  X,
  Eye,
  Activity,
  Award,
  Timer,
  Route
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

const CollectorDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    assigned: 0,
    inTransit: 0,
    completed: 0,
    total: 0,
    todayPickups: 0,
    weeklyTarget: 15,
    weeklyProgress: 0,
    rating: 0,
    totalDistance: 0
  })
  const [pickups, setPickups] = useState([])
  const [activities, setActivities] = useState([])
  const [performanceData, setPerformanceData] = useState([])
  const [schedule, setSchedule] = useState([])
  const [collector, setCollector] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedPickup, setSelectedPickup] = useState(null)
  const [showPickupDetail, setShowPickupDetail] = useState(false)
  const [notification, setNotification] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    if (!isRefreshing) setIsRefreshing(true)
    
    try {
      const response = await api.get('/dashboard/collector')
      const data = response.data
      
      setStats(data.stats)
      setPickups(data.pickups || [])
      setActivities(data.activities || [])
      setPerformanceData(data.performanceData || [])
      setSchedule(data.schedule || [])
      setCollector(data.collector || {})
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Set demo data
      setStats({
        assigned: 3,
        inTransit: 1,
        completed: 8,
        total: 12,
        todayPickups: 4,
        weeklyTarget: 15,
        weeklyProgress: 65,
        rating: 4.2,
        totalDistance: 45.8
      })
      setPickups([
        {
          id: 1,
          facility: 'City Hospital',
          priority: 'High',
          status: 'assigned',
          address: '123 Main St, Mumbai',
          wasteType: 'Yellow',
          quantity: '5.2 kg',
          pickupDate: '2026-08-26',
          pickupTime: '10:00 AM',
          distance: '2.3 km'
        },
        {
          id: 2,
          facility: 'Apollo Clinic',
          priority: 'Medium',
          status: 'assigned',
          address: '456 Oak Ave, Mumbai',
          wasteType: 'Red',
          quantity: '3.8 kg',
          pickupDate: '2026-08-26',
          pickupTime: '02:30 PM',
          distance: '4.1 km'
        }
      ])
      setActivities([
        { id: 1, type: 'completed', message: 'Pickup #1243 completed', time: '5 min ago' },
        { id: 2, type: 'in_transit', message: 'En route to MediLab', time: '15 min ago' }
      ])
      setPerformanceData([
        { day: 'Mon', completed: 4, assigned: 6 },
        { day: 'Tue', completed: 5, assigned: 7 },
        { day: 'Wed', completed: 3, assigned: 5 },
        { day: 'Thu', completed: 6, assigned: 8 },
        { day: 'Fri', completed: 7, assigned: 6 },
        { day: 'Sat', completed: 2, assigned: 3 },
        { day: 'Sun', completed: 1, assigned: 2 }
      ])
      setSchedule([
        { time: '09:00 AM', facility: 'City Hospital', type: 'Pickup', status: 'assigned' },
        { time: '10:30 AM', facility: 'Apollo Clinic', type: 'Pickup', status: 'assigned' }
      ])
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleStatusUpdate = async (pickupId, status) => {
    try {
      await api.put(`/dashboard/pickup/${pickupId}/status`, { status })
      
      // Update local state
      setPickups(prev => 
        prev.map(p => p.id === pickupId ? { ...p, status: status } : p)
      )
      
      showNotification(`Pickup status updated to ${status}`, 'success')
      fetchDashboardData()
    } catch (error) {
      showNotification('Failed to update status', 'error')
    }
  }

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const viewPickupDetail = (pickup) => {
    setSelectedPickup(pickup)
    setShowPickupDetail(true)
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      assigned: 'bg-blue-100 text-blue-800 border-blue-200',
      accepted: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      in_transit: 'bg-purple-100 text-purple-800 border-purple-200',
      collected: 'bg-teal-100 text-teal-800 border-teal-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      assigned: 'Assigned',
      accepted: 'Accepted',
      in_transit: 'In Transit',
      collected: 'Collected',
      completed: 'Completed',
      rejected: 'Rejected'
    }
    return labels[status] || status
  }

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'assigned': return <ClipboardList size={16} />
      case 'accepted': return <Check size={16} />
      case 'in_transit': return <Truck size={16} />
      case 'collected': return <Package size={16} />
      case 'completed': return <CheckCircle size={16} />
      default: return <Clock size={16} />
    }
  }

  const getActivityIcon = (type) => {
    switch(type) {
      case 'completed': return <CheckCircle size={16} className="text-green-500" />
      case 'in_transit': return <Truck size={16} className="text-purple-500" />
      case 'assigned': return <ClipboardList size={16} className="text-blue-500" />
      case 'collected': return <Package size={16} className="text-teal-500" />
      default: return <Activity size={16} className="text-gray-500" />
    }
  }

  const COLORS = ['#22c55e', '#a855f7', '#f59e0b']

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
        <p className="text-gray-500">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in ${
          notification.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
          notification.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
          'bg-blue-50 border border-blue-200 text-blue-800'
        }`}>
          {notification.type === 'success' && <CheckCircle size={18} />}
          {notification.type === 'error' && <AlertCircle size={18} />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Truck className="text-primary-500" />
            Welcome back, {collector.name || user?.name}! 👋
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-500">Manage your assigned pickups and collections</p>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Activity size={12} className="text-green-500" />
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
            disabled={isRefreshing}
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          >
            <RefreshCw size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Collector Info Card */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <p className="text-sm opacity-80">Collection Staff</p>
              <p className="text-xl font-semibold">{collector.name || user?.name}</p>
              <div className="flex items-center gap-3 mt-1 text-sm opacity-90">
                <span>📱 {collector.phone || '+91-98765-43210'}</span>
                <span>🚗 {collector.vehicle || 'Collection Van'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 bg-white/10 rounded-lg px-4 py-2">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.rating || '4.2'}</p>
              <p className="text-xs opacity-80 flex items-center gap-1">
                <Star size={12} /> Rating
              </p>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.totalDistance || '45.8'} km</p>
              <p className="text-xs opacity-80 flex items-center gap-1">
                <Route size={12} /> Total Distance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Assigned</p>
              <p className="text-2xl font-bold text-blue-600">{stats.assigned}</p>
            </div>
            <ClipboardList size={20} className="text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">In Transit</p>
              <p className="text-2xl font-bold text-purple-600">{stats.inTransit}</p>
            </div>
            <Clock size={20} className="text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle size={20} className="text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <Package size={20} className="text-gray-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Today's Pickups</p>
              <p className="text-2xl font-bold text-orange-600">{stats.todayPickups}</p>
            </div>
            <Calendar size={20} className="text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Weekly Progress</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.weeklyProgress}%</p>
            </div>
            <Award size={20} className="text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pickups List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <ClipboardList size={18} className="text-primary-500" />
                Assigned Pickups
              </h3>
              <span className="text-xs text-gray-400">{pickups.length} pickups</span>
            </div>
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {pickups.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No assigned pickups at the moment 🎉
                </div>
              ) : (
                pickups.map((pickup) => (
                  <div key={pickup.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-800">{pickup.facility}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(pickup.priority)}`}>
                            {pickup.priority}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(pickup.status)}`}>
                            {getStatusIcon(pickup.status)}
                            {getStatusLabel(pickup.status)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {pickup.address}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package size={14} />
                            {pickup.wasteType}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {pickup.pickupDate} {pickup.pickupTime}
                          </span>
                          <span className="flex items-center gap-1 text-green-600">
                            <Navigation size={14} />
                            {pickup.distance}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {pickup.status === 'assigned' && (
                          <button
                            onClick={() => handleStatusUpdate(pickup.id, 'accepted')}
                            className="px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Check size={16} />
                            Accept
                          </button>
                        )}
                        {pickup.status === 'accepted' && (
                          <button
                            onClick={() => handleStatusUpdate(pickup.id, 'in_transit')}
                            className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Truck size={16} />
                            Start Route
                          </button>
                        )}
                        {pickup.status === 'in_transit' && (
                          <button
                            onClick={() => handleStatusUpdate(pickup.id, 'collected')}
                            className="px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Package size={16} />
                            Collected
                          </button>
                        )}
                        {pickup.status === 'collected' && (
                          <button
                            onClick={() => handleStatusUpdate(pickup.id, 'completed')}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                          >
                            <CheckCircle size={16} />
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => viewPickupDetail(pickup)}
                          className="px-3 py-1 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                        >
                          <Eye size={16} />
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Weekly Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary-500" />
              Weekly Performance
            </h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#22c55e" name="Completed" />
                  <Bar dataKey="assigned" fill="#3b82f6" name="Assigned" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar size={18} className="text-primary-500" />
              Today's Schedule
            </h4>
            <div className="space-y-2">
              {schedule.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-400">{item.time}</p>
                    <p className="text-sm font-medium text-gray-800">{item.facility}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                      item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status}
                    </span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Activity size={18} className="text-gray-500" />
          Recent Activity
        </h4>
        <div className="space-y-2">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
              {getActivityIcon(activity.type)}
              <div className="flex-1">
                <p className="text-sm text-gray-800">{activity.message}</p>
                <p className="text-xs text-gray-400">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pickup Detail Modal */}
      {showPickupDetail && selectedPickup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">Pickup Details</h3>
              <button
                onClick={() => setShowPickupDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Facility</p>
                <p className="font-semibold">{selectedPickup.facility}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-semibold flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  {selectedPickup.address}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Waste Type</p>
                  <p className="font-semibold">{selectedPickup.wasteType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="font-semibold">{selectedPickup.quantity}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold">{selectedPickup.pickupDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-semibold">{selectedPickup.pickupTime}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Distance</p>
                <p className="font-semibold flex items-center gap-2">
                  <Navigation size={16} className="text-green-600" />
                  {selectedPickup.distance}
                </p>
              </div>
              {selectedPickup.instructions && (
                <div>
                  <p className="text-sm text-gray-500">Instructions</p>
                  <p className="text-sm text-gray-700 bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                    {selectedPickup.instructions}
                  </p>
                </div>
              )}
              {selectedPickup.contactPerson && (
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="font-semibold flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    {selectedPickup.contactPerson}
                    <span className="text-sm font-normal text-gray-500 flex items-center gap-1">
                      <Phone size={14} />
                      {selectedPickup.contactPhone}
                    </span>
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowPickupDetail(false)
                  navigate('/pickups')
                }}
                className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
              >
                View All Pickups
              </button>
              <button
                onClick={() => setShowPickupDetail(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CollectorDashboard
