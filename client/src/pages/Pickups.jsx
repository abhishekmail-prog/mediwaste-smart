import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  Truck, 
  Plus, 
  MapPin, 
  Calendar, 
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Phone,
  Package,
  XCircle,
  Eye,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Navigation,
  Trash2,
  Edit
} from 'lucide-react'
import api from '../services/api'

const Pickups = () => {
  const { user } = useAuth()
  const [pickups, setPickups] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedPickup, setSelectedPickup] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [lastUpdated, setLastUpdated] = useState(new Date())
  
  const [formData, setFormData] = useState({
    priority: 'medium',
    pickupDate: '',
    pickupTime: '',
    address: '',
    instructions: ''
  })

  useEffect(() => {
    fetchPickups()
    const interval = setInterval(fetchPickups, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchPickups = async () => {
    setLoading(true)
    try {
      const response = await api.get('/pickups')
      setPickups(response.data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch pickups:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      assigned: 'bg-blue-100 text-blue-800 border-blue-200',
      accepted: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      in_transit: 'bg-purple-100 text-purple-800 border-purple-200',
      collected: 'bg-teal-100 text-teal-800 border-teal-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
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
      cancelled: 'Cancelled'
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

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'urgent': return <AlertCircle size={16} className="text-red-500" />
      case 'high': return <AlertCircle size={16} className="text-orange-500" />
      case 'medium': return <Clock size={16} className="text-yellow-500" />
      case 'low': return <Clock size={16} className="text-green-500" />
      default: return <Clock size={16} />
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await api.post('/pickups', formData)
      setSuccess('Pickup request created successfully!')
      setShowModal(false)
      setFormData({
        priority: 'medium',
        pickupDate: '',
        pickupTime: '',
        address: '',
        instructions: ''
      })
      fetchPickups()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create pickup request')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (pickupId, status) => {
    try {
      await api.put(`/pickups/${pickupId}/status`, { status })
      setSuccess(`Pickup status updated to ${getStatusLabel(status)}`)
      fetchPickups()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to update status')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleDelete = async (pickupId) => {
    if (!confirm('Are you sure you want to delete this pickup?')) return
    
    try {
      await api.delete(`/pickups/${pickupId}`)
      setSuccess('Pickup deleted successfully')
      fetchPickups()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to delete pickup')
      setTimeout(() => setError(''), 3000)
    }
  }

  const viewDetails = (pickup) => {
    setSelectedPickup(pickup)
    setShowDetail(true)
  }

  const getFilteredPickups = () => {
    let filtered = pickups
    
    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(p => p.status === filter)
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(p => 
        p.facility?.toLowerCase().includes(term) ||
        p.address?.toLowerCase().includes(term) ||
        p.wasteType?.toLowerCase().includes(term) ||
        p.collector?.toLowerCase().includes(term)
      )
    }
    
    return filtered
  }

  const filteredPickups = getFilteredPickups()

  const canCreatePickup = user?.role === 'staff' || user?.role === 'admin'
  const canManageAll = user?.role === 'admin'
  const canAcceptPickup = user?.role === 'collector'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Truck className="text-primary-500" />
            Pickup Management
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-500">Manage pickup requests and assignments</p>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full live-pulse"></span>
              Live
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchPickups}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw size={18} className="text-gray-500" />
          </button>
          {canCreatePickup && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Plus size={18} />
              New Pickup
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by facility, address, collector..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_transit">In Transit</option>
              <option value="collected">Collected</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pickup Cards */}
      <div className="space-y-4">
        {filteredPickups.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Truck size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600">No pickups found</h3>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm || filter !== 'all' ? 'Try adjusting your filters' : 'Create a new pickup request to get started'}
            </p>
          </div>
        ) : (
          filteredPickups.map((pickup) => (
            <div key={pickup.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800">{pickup.facility}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getPriorityColor(pickup.priority)}`}>
                      {getPriorityIcon(pickup.priority)}
                      {pickup.priority.charAt(0).toUpperCase() + pickup.priority.slice(1)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pickup.status)}`}>
                      {getStatusLabel(pickup.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="flex-shrink-0" />
                      <span className="truncate">{pickup.address}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="flex-shrink-0" />
                      <span>{pickup.pickupDate} at {pickup.pickupTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package size={14} className="flex-shrink-0" />
                      <span>{pickup.wasteType || 'Mixed'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={14} className="flex-shrink-0" />
                      <span>{pickup.collector || 'Not assigned'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap md:flex-nowrap">
                  {/* Action buttons based on role and status */}
                  {canAcceptPickup && pickup.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(pickup.id, 'accepted')}
                      className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                    >
                      <CheckCircle size={16} />
                      Accept
                    </button>
                  )}
                  
                  {user?.role === 'collector' && pickup.status === 'accepted' && (
                    <button
                      onClick={() => handleStatusUpdate(pickup.id, 'in_transit')}
                      className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Navigation size={16} />
                      Start Route
                    </button>
                  )}
                  
                  {user?.role === 'collector' && pickup.status === 'in_transit' && (
                    <button
                      onClick={() => handleStatusUpdate(pickup.id, 'collected')}
                      className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Package size={16} />
                      Collected
                    </button>
                  )}
                  
                  {user?.role === 'collector' && pickup.status === 'collected' && (
                    <button
                      onClick={() => handleStatusUpdate(pickup.id, 'completed')}
                      className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                    >
                      <CheckCircle size={16} />
                      Complete
                    </button>
                  )}
                  
                  {canManageAll && pickup.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(pickup.id, 'assigned')}
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                    >
                      <User size={16} />
                      Assign
                    </button>
                  )}
                  
                  <button
                    onClick={() => viewDetails(pickup)}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <Eye size={16} />
                    Details
                  </button>
                  
                  {(canManageAll || (user?.role === 'staff' && pickup.status === 'pending')) && (
                    <button
                      onClick={() => handleDelete(pickup.id)}
                      className="px-3 py-1.5 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Pickup Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">Request Pickup</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority *
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Date *
                </label>
                <input
                  type="date"
                  name="pickupDate"
                  value={formData.pickupDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Time *
                </label>
                <input
                  type="time"
                  name="pickupTime"
                  value={formData.pickupTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter pickup address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any special instructions for the collector..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pickup Detail Modal */}
      {showDetail && selectedPickup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">Pickup Details</h3>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">ID</span>
                <span className="font-medium">#{selectedPickup.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Facility</span>
                <span className="font-medium">{selectedPickup.facility}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedPickup.status)}`}>
                  {getStatusLabel(selectedPickup.status)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Priority</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedPickup.priority)}`}>
                  {selectedPickup.priority}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Date</span>
                <span className="font-medium">{selectedPickup.pickupDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Time</span>
                <span className="font-medium">{selectedPickup.pickupTime}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500 block">Address</span>
                <p className="font-medium flex items-center gap-2 mt-1">
                  <MapPin size={16} className="text-gray-400" />
                  {selectedPickup.address}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 block">Waste Type</span>
                <p className="font-medium">{selectedPickup.wasteType || 'Mixed'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 block">Collector</span>
                <p className="font-medium">{selectedPickup.collector || 'Not assigned'}</p>
              </div>
              {selectedPickup.instructions && (
                <div>
                  <span className="text-sm text-gray-500 block">Instructions</span>
                  <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    {selectedPickup.instructions}
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm text-gray-500 block">Created</span>
                <p className="text-sm text-gray-400">{new Date(selectedPickup.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowDetail(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Close
              </button>
              {selectedPickup.status === 'pending' && user?.role === 'collector' && (
                <button
                  onClick={() => {
                    handleStatusUpdate(selectedPickup.id, 'accepted')
                    setShowDetail(false)
                  }}
                  className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
                >
                  Accept Pickup
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pickups
