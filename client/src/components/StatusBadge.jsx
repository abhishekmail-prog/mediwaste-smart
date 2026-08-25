import React from 'react'

const StatusBadge = ({ status, type = 'status', className = '' }) => {
  const getStatusConfig = () => {
    if (type === 'status') {
      const configs = {
        pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
        classified: { label: 'Classified', color: 'bg-blue-100 text-blue-800' },
        pickup_requested: { label: 'Pickup Requested', color: 'bg-purple-100 text-purple-800' },
        completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
        cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
        assigned: { label: 'Assigned', color: 'bg-indigo-100 text-indigo-800' },
        in_transit: { label: 'In Transit', color: 'bg-orange-100 text-orange-800' },
        collected: { label: 'Collected', color: 'bg-teal-100 text-teal-800' }
      }
      return configs[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    }
    
    if (type === 'priority') {
      const configs = {
        low: { label: 'Low', color: 'bg-green-100 text-green-800' },
        medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
        high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
        urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' }
      }
      return configs[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    }

    if (type === 'category') {
      const configs = {
        yellow: { label: 'Yellow', color: 'bg-yellow-200 text-yellow-800' },
        red: { label: 'Red', color: 'bg-red-200 text-red-800' },
        white: { label: 'White', color: 'bg-gray-200 text-gray-800' },
        blue: { label: 'Blue', color: 'bg-blue-200 text-blue-800' }
      }
      return configs[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    }

    return { label: status, color: 'bg-gray-100 text-gray-800' }
  }

  const config = getStatusConfig()

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color} ${className}`}>
      {config.label}
    </span>
  )
}

export default StatusBadge