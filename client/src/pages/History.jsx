import React, { useState, useEffect } from 'react'
import { Package, Search, Filter, Eye } from 'lucide-react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

const History = () => {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const response = await api.get('/waste')
      setRecords(response.data)
    } catch (err) {
      console.error('Failed to fetch records:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      classified: 'bg-blue-100 text-blue-800',
      pickup_requested: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      classified: 'Classified',
      pickup_requested: 'Pickup Requested',
      completed: 'Completed'
    }
    return labels[status] || status
  }

  const getCategoryColor = (category) => {
    const colors = {
      yellow: 'bg-yellow-200 text-yellow-800',
      red: 'bg-red-200 text-red-800',
      white: 'bg-gray-200 text-gray-800',
      blue: 'bg-blue-200 text-blue-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredRecords = records.filter(record => {
    const matchSearch = 
      record.facility?.toLowerCase().includes(search.toLowerCase()) ||
      record.subCategory?.toLowerCase().includes(search.toLowerCase()) ||
      record.category?.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-primary-500" />
          Waste History
        </h1>
        <p className="text-gray-500 mt-1">View all waste records and their status</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by facility, category..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub-Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(record.category)}`}>
                      {record.category?.toUpperCase() || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {record.subCategory || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {record.quantity} {record.unit}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {getStatusLabel(record.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {record.facility || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(record.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate('/ai-classification')}
                      className="text-primary-500 hover:text-primary-600 text-sm font-medium flex items-center gap-1"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRecords.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No waste records found
          </div>
        )}
      </div>
    </div>
  )
}

export default History
