import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  Check, 
  CheckCheck,
  Info,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  X,
  Clock,
  Filter,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const Notifications = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await api.get('/notifications')
      setNotifications(response.data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      )
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'info': return <Info size={18} className="text-blue-500" />
      case 'success': return <CheckCircle size={18} className="text-green-500" />
      case 'warning': return <AlertTriangle size={18} className="text-yellow-500" />
      case 'error': return <AlertCircle size={18} className="text-red-500" />
      default: return <Info size={18} className="text-blue-500" />
    }
  }

  const getTypeColor = (type) => {
    switch(type) {
      case 'info': return 'bg-blue-50 border-blue-200 hover:bg-blue-100'
      case 'success': return 'bg-green-50 border-green-200 hover:bg-green-100'
      case 'warning': return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
      case 'error': return 'bg-red-50 border-red-200 hover:bg-red-100'
      default: return 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    }
  }

  const getTypeLabel = (type) => {
    switch(type) {
      case 'info': return 'Information'
      case 'success': return 'Success'
      case 'warning': return 'Warning'
      case 'error': return 'Error'
      default: return 'Info'
    }
  }

  const formatDate = (date) => {
    const d = new Date(date)
    const now = new Date()
    const diff = Math.floor((now - d) / 1000) // seconds
    
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 172800) return 'Yesterday'
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications
    if (filter === 'unread') return notifications.filter(n => !n.isRead)
    if (filter === 'read') return notifications.filter(n => n.isRead)
    return notifications.filter(n => n.type === filter)
  }

  const filteredNotifications = getFilteredNotifications()
  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
        <p className="text-gray-500 text-sm">Loading notifications...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="text-primary-500" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Stay updated with your waste management activities</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:block">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchNotifications}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw size={18} className="text-gray-500" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-primary-500 hover:text-primary-600 font-medium text-sm flex items-center gap-2 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
            >
              <CheckCheck size={16} />
              <span className="hidden sm:inline">Mark all as read</span>
              <span className="sm:hidden">Read all</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-4 overflow-x-auto">
        <div className="flex gap-2">
          {['all', 'unread', 'read', 'info', 'success', 'warning', 'error'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap
                ${filter === f 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {f === 'all' && 'All'}
              {f === 'unread' && '📬 Unread'}
              {f === 'read' && '📖 Read'}
              {f === 'info' && 'ℹ️ Info'}
              {f === 'success' && '✅ Success'}
              {f === 'warning' && '⚠️ Warning'}
              {f === 'error' && '❌ Error'}
            </button>
          ))}
        </div>
      </div>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Bell size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No notifications</h3>
          <p className="text-sm text-gray-400 mt-1">
            {filter !== 'all' ? 'Try adjusting your filter' : "You're all caught up!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`
                bg-white rounded-xl shadow-sm border p-4 transition-all duration-200
                ${!notification.isRead ? 'border-primary-300 shadow-md' : 'border-gray-200'}
                ${getTypeColor(notification.type)}
                hover:shadow-md cursor-pointer
              `}
              onClick={() => {
                if (!notification.isRead) markAsRead(notification.id)
                if (notification.link) navigate(notification.link)
              }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {getTypeIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-gray-800 text-sm">
                          {notification.title}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                          {getTypeLabel(notification.type)}
                        </span>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
                    </div>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {notification.link && (
                        <span className="text-xs text-primary-500 hover:text-primary-600">
                          View →
                        </span>
                      )}
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification.id)
                          }}
                          className="p-1 text-gray-400 hover:text-primary-500 transition-colors"
                          title="Mark as read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} />
                      {formatDate(notification.createdAt)}
                    </span>
                    {notification.link && (
                      <span className="text-xs text-primary-400">
                        Click to view
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {notifications.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400 border-t border-gray-200 pt-4">
          <span>Total: {notifications.length} notifications</span>
          <span>Unread: {unreadCount}</span>
          <span>Read: {notifications.length - unreadCount}</span>
        </div>
      )}
    </div>
  )
}

export default Notifications
