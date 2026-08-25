import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Package, ClipboardList, Truck, TrendingUp, PlusCircle } from 'lucide-react'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard/staff')
        setStats(response.data.stats)
      } catch (error) {
        console.log('Using demo data')
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
    fetchData()
  }, [])

  const statCards = [
    { title: 'Total Waste', value: `${stats.totalWaste} kg`, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { title: 'Pending Pickups', value: stats.pendingPickups, icon: ClipboardList, color: 'bg-yellow-50 text-yellow-600' },
    { title: 'Completed Pickups', value: stats.completedPickups, icon: Truck, color: 'bg-green-50 text-green-600' },
    { title: 'AI Classifications', value: stats.classifications, icon: TrendingUp, color: 'bg-purple-50 text-purple-600' }
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name} 👋</h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your medical waste today</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <button onClick={() => navigate('/waste-entry')} className="bg-primary-500 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2">
          <PlusCircle size={20} />
          <span className="font-semibold">Enter Waste</span>
        </button>
        <button onClick={() => navigate('/ai-classification')} className="bg-secondary-500 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2">
          <Package size={20} />
          <span className="font-semibold">AI Classify</span>
        </button>
        <button onClick={() => navigate('/pickups')} className="bg-green-500 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2">
          <Truck size={20} />
          <span className="font-semibold">Request Pickup</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StaffDashboard
