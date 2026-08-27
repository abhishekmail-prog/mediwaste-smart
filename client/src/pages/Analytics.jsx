import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Download, Activity, Package, Truck, CheckCircle, FileSpreadsheet, FileJson, Printer, Info, RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import api from '../services/api'

const Analytics = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    overview: { totalWaste: 0, totalPickups: 0, completionRate: 0, avgResponse: 0 },
    categoryData: [],
    subCategoryData: [],
    timeline: [],
    facilities: [],
    completion: []
  })
  const [error, setError] = useState(null)
  const [showExportMenu, setShowExportMenu] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/analytics/overview')
      console.log('📊 Analytics data:', response.data)
      
      // Safely set data with fallbacks
      setData({
        overview: response.data?.overview || { totalWaste: 0, totalPickups: 0, completionRate: 0, avgResponse: 0 },
        categoryData: response.data?.categoryData || [],
        subCategoryData: response.data?.subCategoryData || [],
        timeline: response.data?.timeline || [],
        facilities: response.data?.facilities || [],
        completion: response.data?.completion || []
      })
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
      setError('Failed to load analytics data. Please try again.')
      // Set fallback data so page doesn't break
      setData({
        overview: { totalWaste: 0, totalPickups: 0, completionRate: 0, avgResponse: 0 },
        categoryData: [],
        subCategoryData: [],
        timeline: [],
        facilities: [],
        completion: []
      })
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#f59e0b', '#ef4444', '#9ca3af', '#3b82f6', '#8b5cf6', '#22c55e', '#f472b6', '#14b8a6']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  // If no data, show message
  const hasData = data.categoryData && data.categoryData.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="text-primary-500" />
            Waste Analytics Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Real-time medical waste analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Waste</p>
              <p className="text-2xl font-bold text-gray-800">{data.overview?.totalWaste || 0} kg</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Package size={24} className="text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Pickups</p>
              <p className="text-2xl font-bold text-gray-800">{data.overview?.totalPickups || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Truck size={24} className="text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completion Rate</p>
              <p className="text-2xl font-bold text-green-600">{data.overview?.completionRate || 0}%</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <CheckCircle size={24} className="text-emerald-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Response</p>
              <p className="text-2xl font-bold text-blue-600">{data.overview?.avgResponse || 0} hrs</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Activity size={24} className="text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts - Only show if there's data */}
      {hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Waste by Category */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Waste by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Waste Types */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Waste Types</h3>
            {data.subCategoryData && data.subCategoryData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.subCategoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip formatter={(value) => [`${value} kg`, 'Quantity']} />
                    <Legend />
                    <Bar dataKey="value" fill="#3a8c3a" name="Quantity (kg)">
                      {data.subCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No detailed waste data available yet
              </div>
            )}
          </div>

          {/* Timeline */}
          {data.timeline && data.timeline.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Waste Collection Timeline</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.timeline}>
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
          )}

          {/* Facility-wise */}
          {data.facilities && data.facilities.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Facility-wise Waste Generation</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.facilities}>
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
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No analytics data available</h3>
          <p className="text-sm text-gray-400 mt-1">Start adding waste records to see analytics</p>
        </div>
      )}

      {/* Data Source Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 text-sm text-blue-700">
        <Info size={16} />
        <span>📊 Showing real data from your waste records</span>
      </div>
    </div>
  )
}

export default Analytics
