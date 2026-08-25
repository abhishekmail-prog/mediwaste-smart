import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { ClipboardList, CheckCircle, Clock, Package } from 'lucide-react'
import api from '../services/api'

const CollectorDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({ assigned: 0, inTransit: 0, completed: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard/collector')
        setStats(response.data.stats)
      } catch (error) {
        console.log('Using demo data for collector')
        setStats({ assigned: 3, inTransit: 1, completed: 8, total: 12 })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
        <p className="text-gray-500">Loading collector dashboard...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name} 🚛</h1>
        <p className="text-gray-500 mt-1">Manage your assigned pickups and collections</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Assigned</p><p className="text-xl font-bold text-blue-600">{stats.assigned}</p></div>
            <ClipboardList size={20} className="text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">In Transit</p><p className="text-xl font-bold text-yellow-600">{stats.inTransit}</p></div>
            <Clock size={20} className="text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Completed</p><p className="text-xl font-bold text-green-600">{stats.completed}</p></div>
            <CheckCircle size={20} className="text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Total</p><p className="text-xl font-bold text-purple-600">{stats.total}</p></div>
            <Package size={20} className="text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollectorDashboard
