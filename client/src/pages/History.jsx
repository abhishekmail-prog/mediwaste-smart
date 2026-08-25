import React from 'react'
import { Package } from 'lucide-react'

const History = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-primary-500" />
          Waste History
        </h1>
        <p className="text-gray-500 mt-1">View all waste records and their status</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700">📋 Waste history would go here. This is a placeholder.</p>
        </div>
      </div>
    </div>
  )
}

export default History
