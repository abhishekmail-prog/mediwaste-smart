import React, { useState, useEffect } from 'react'
import { Building2, Package, ClipboardList, Truck, Users, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalFacilities: 0,
    totalWaste: 0,
    pendingPickups: 0,
    completedPickups: 0,
    activeCollectors: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard/admin')
        setStats(response.data.stats)
      } catch (error) {
        console.log('Using demo data for admin dashboard')
        setStats({
          totalFacilities: 12,
          totalWaste: 1560.5,
          pendingPickups: 8,
          completedPickups: 45,
          activeCollectors: 6
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    { title: 'Total Facilities', value: stats.totalFacilities, icon: Building2, color: 'bg-blue-50 text-blue-600' },
    { title: 'Total Waste', value: `${stats.totalWaste} kg`, icon: Package, color: 'bg-green-50 text-green-600' },
    { title: 'Pending Pickups', value: stats.pendingPickups, icon: ClipboardList, color: 'bg-yellow-50 text-yellow-600' },
    { title: 'Completed Pickups', value: stats.completedPickups, icon: Truck, color: 'bg-purple-50 text-purple-600' },
    { title: 'Active Collectors', value: stats.activeCollectors, icon: Users, color: 'bg-indigo-50 text-indigo-600' }
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
        <p className="text-gray-500">Loading admin dashboard...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of all facilities and waste management operations</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{stat.title}</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon size={18} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button onClick={() => navigate('/analytics')} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2">
          <BarChart3 size={20} className="text-primary-500" />
          <span className="font-medium text-gray-700">View Analytics</span>
        </button>
        <button onClick={() => navigate('/pickups')} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2">
          <ClipboardList size={20} className="text-secondary-500" />
          <span className="font-medium text-gray-700">Manage Pickups</span>
        </button>
        <button onClick={() => navigate('/history')} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2">
          <Package size={20} className="text-green-500" />
          <span className="font-medium text-gray-700">Waste Records</span>
        </button>
      </div>
    </div>
  )
}

export default AdminDashboard
