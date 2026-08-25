import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Truck, Plus, MapPin, Calendar, Clock, AlertCircle, CheckCircle, User, Package, XCircle, Eye, RefreshCw, Filter, Search, Trash2, X, Building2, Phone, Navigation, Check, AlertTriangle } from 'lucide-react'
import api from '../services/api'

const StaffPickups = () => {
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
  const [showCancelConfirm, setShowCancelConfirm] = useState(null)
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 })
  const [formData, setFormData] = useState({ priority: 'medium', pickupDate: '', pickupTime: '', address: '', instructions: '' })

  useEffect(() => {
    fetchPickups()
    const interval = setInterval(fetchPickups, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchPickups = async () => {
    setLoading(true)
    try {
      const response = await api.get('/pickups')
      const data = response.data
      setPickups(data)
      const total = data.length
      const pending = data.filter(p => p.status === 'pending' || p.status === 'assigned').length
      const inProgress = data.filter(p => p.status === 'in_transit' || p.status === 'collected').length
      const completed = data.filter(p => p.status === 'completed').length
      setStats({ total, pending, inProgress, completed })
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch pickups:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = { pending: 'bg-yellow-100 text-yellow-800 border-yellow-200', assigned: 'bg-blue-100 text-blue-800 border-blue-200', accepted: 'bg-indigo-100 text-indigo-800 border-indigo-200', in_transit: 'bg-purple-100 text-purple-800 border-purple-200', collected: 'bg-teal-100 text-teal-800 border-teal-200', completed: 'bg-green-100 text-green-800 border-green-200', cancelled: 'bg-red-100 text-red-800 border-red-200' }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusLabel = (status) => {
    const labels = { pending: 'Pending', assigned: 'Assigned', accepted: 'Accepted', in_transit: 'In Transit', collected: 'Collected', completed: 'Completed', cancelled: 'Cancelled' }
    return labels[status] || status
  }

  const getPriorityColor = (priority) => {
    const colors = { urgent: 'bg-red-100 text-red-800 border-red-200', high: 'bg-orange-100 text-orange-800 border-orange-200', medium: 'bg-yellow-100 text-yellow-800 border-yellow-200', low: 'bg-green-100 text-green-800 border-green-200' }
    return colors[priority] || 'bg-gray-100 text-gray-800'
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
      setSuccess('✅ Pickup request created successfully!')
      setShowModal(false)
      setFormData({ priority: 'medium', pickupDate: '', pickupTime: '', address: '', instructions: '' })
      fetchPickups()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create pickup request')
      setTimeout(() => setError(''), 4000)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (pickupId) => {
    try {
      await api.put(`/pickups/${pickupId}/status`, { status: 'cancelled' })
      setSuccess('✅ Pickup cancelled successfully')
      setShowCancelConfirm(null)
      fetchPickups()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError('Failed to cancel pickup')
      setTimeout(() => setError(''), 4000)
    }
  }

  const handleDelete = async (pickupId) => {
    if (!confirm('Are you sure you want to delete this pickup?')) return
    try {
      await api.delete(`/pickups/${pickupId}`)
      setSuccess('✅ Pickup deleted successfully')
      fetchPickups()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError('Failed to delete pickup')
      setTimeout(() => setError(''), 4000)
    }
  }

  const viewDetails = (pickup) => {
    setSelectedPickup(pickup)
    setShowDetail(true)
  }

  const getFilteredPickups = () => {
    let filtered = pickups
    if (filter !== 'all') {
      filtered = filtered.filter(p => p.status === filter)
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(p => p.facility?.toLowerCase().includes(term) || p.address?.toLowerCase().includes(term))
    }
    return filtered
  }

  const filteredPickups = getFilteredPickups()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Truck className="text-primary-500" />
            Pickup Management
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-500">Manage your facility's pickup requests</p>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full live-pulse"></span>
              Live
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Updated: {lastUpdated.toLocaleTimeString()}</span>
          <button onClick={fetchPickups} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw size={18} className="text-gray-500" />
          </button>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg">
            <Plus size={18} /> New Pickup
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Total Pickups</p><p className="text-2xl font-bold text-gray-800">{stats.total}</p></div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"><Truck size={20} className="text-blue-500" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Pending</p><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p></div>
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center"><Clock size={20} className="text-yellow-500" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">In Progress</p><p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p></div>
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center"><Navigation size={20} className="text-purple-500" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Completed</p><p className="text-2xl font-bold text-green-600">{stats.completed}</p></div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center"><CheckCircle size={20} className="text-green-500" /></div>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2"><AlertCircle size={18} />{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2"><CheckCircle size={18} />{success}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search pickups..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
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

      <div className="space-y-4">
        {filteredPickups.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Truck size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600">No pickups found</h3>
            <p className="text-sm text-gray-400 mt-1">Create a new pickup request to get started</p>
          </div>
        ) : (
          filteredPickups.map((pickup) => (
            <div key={pickup.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800">{pickup.facility}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(pickup.priority)}`}>{pickup.priority}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pickup.status)}`}>{getStatusLabel(pickup.status)}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1"><MapPin size={14} className="flex-shrink-0" /><span className="truncate">{pickup.address}</span></div>
                    <div className="flex items-center gap-1"><Calendar size={14} className="flex-shrink-0" /><span>{pickup.pickupDate} at {pickup.pickupTime}</span></div>
                    <div className="flex items-center gap-1"><Package size={14} className="flex-shrink-0" /><span>{pickup.wasteType || 'Mixed'}</span></div>
                    <div className="flex items-center gap-1"><User size={14} className="flex-shrink-0" /><span>{pickup.collector || 'Not assigned'}</span></div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap lg:flex-nowrap">
                  {pickup.status === 'pending' && (
                    <>
                      <button onClick={() => setShowCancelConfirm(pickup.id)} className="px-3 py-1.5 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"><X size={16} />Cancel</button>
                      <button onClick={() => handleDelete(pickup.id)} className="px-3 py-1.5 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"><Trash2 size={16} />Delete</button>
                    </>
                  )}
                  <button onClick={() => viewDetails(pickup)} className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"><Eye size={16} />Details</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">Request Pickup</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><XCircle size={20} className="text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required>
                  <option value="low">🟢 Low</option><option value="medium">🟡 Medium</option><option value="high">🟠 High</option><option value="urgent">🔴 Urgent</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" name="pickupDate" value={formData.pickupDate} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                  <input type="time" name="pickupTime" value={formData.pickupTime} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address *</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Enter pickup address" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                <textarea name="instructions" value={formData.instructions} onChange={handleChange} rows="3" placeholder="Any special instructions for the collector..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Creating...</> : <><CheckCircle size={18} />Create Request</>}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center"><AlertTriangle size={24} className="text-red-600" /></div>
              <div><h3 className="text-lg font-semibold text-gray-800">Cancel Pickup?</h3><p className="text-sm text-gray-500">This action cannot be undone</p></div>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to cancel this pickup request?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelConfirm(null)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">No, Keep It</button>
              <button onClick={() => handleCancel(showCancelConfirm)} className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors">Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showDetail && selectedPickup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div><h3 className="text-xl font-semibold text-gray-800">Pickup Details</h3><p className="text-sm text-gray-500">#{selectedPickup.id} • {selectedPickup.facility}</p></div>
              <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-gray-100 rounded-lg"><XCircle size={20} className="text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">Status</p><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedPickup.status)}`}>{getStatusLabel(selectedPickup.status)}</span></div>
                <div><p className="text-xs text-gray-500">Priority</p><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getPriorityColor(selectedPickup.priority)}`}>{selectedPickup.priority}</span></div>
              </div>
              <div><p className="text-xs text-gray-500">Address</p><p className="text-sm font-medium flex items-center gap-2 mt-1"><MapPin size={16} className="text-gray-400" />{selectedPickup.address}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">Date</p><p className="text-sm font-medium mt-1">{selectedPickup.pickupDate}</p></div>
                <div><p className="text-xs text-gray-500">Time</p><p className="text-sm font-medium mt-1">{selectedPickup.pickupTime}</p></div>
              </div>
              <div><p className="text-xs text-gray-500">Waste Type</p><p className="text-sm font-medium mt-1">{selectedPickup.wasteType || 'Mixed'}</p></div>
              <div><p className="text-xs text-gray-500">Collector</p><p className="text-sm font-medium mt-1 flex items-center gap-2"><User size={16} className="text-gray-400" />{selectedPickup.collector || 'Not assigned yet'}</p></div>
              {selectedPickup.instructions && <div><p className="text-xs text-gray-500">Instructions</p><p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-1">{selectedPickup.instructions}</p></div>}
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400">Created: {new Date(selectedPickup.createdAt).toLocaleString()}</p>
                <p className="text-xs text-gray-400">Last Updated: {new Date(selectedPickup.updatedAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button onClick={() => setShowDetail(false)} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffPickups
