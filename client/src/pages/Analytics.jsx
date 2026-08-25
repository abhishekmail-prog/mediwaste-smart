import React from 'react'
import { BarChart3 } from 'lucide-react'

const Analytics = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="text-primary-500" />
          Analytics & Insights
        </h1>
        <p className="text-gray-500 mt-1">Comprehensive analytics for medical waste management</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700">📊 Analytics dashboard would go here. This is a placeholder.</p>
        </div>
      </div>
    </div>
  )
}

export default Analytics
