import React from 'react'
import { Truck } from 'lucide-react'

const Pickups = () => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Truck className="text-primary-500" />
            Pickup Management
          </h1>
          <p className="text-gray-500 mt-1">Manage pickup requests and assignments</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700">🚛 Pickup management interface would go here. This is a placeholder.</p>
        </div>
      </div>
    </div>
  )
}

export default Pickups
