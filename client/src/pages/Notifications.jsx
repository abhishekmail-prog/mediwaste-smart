import React from 'react'
import { Bell } from 'lucide-react'

const Notifications = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Bell className="text-primary-500" />
          Notifications
        </h1>
        <p className="text-gray-500 mt-1">Stay updated with your waste management activities</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700">🔔 Notifications would go here. This is a placeholder.</p>
        </div>
      </div>
    </div>
  )
}

export default Notifications
