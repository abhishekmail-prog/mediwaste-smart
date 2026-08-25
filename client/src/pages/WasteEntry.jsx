import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'

const WasteEntry = () => {
  const navigate = useNavigate()
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Enter Medical Waste</h1>
        <p className="text-gray-500 mt-1">Record new medical waste for AI classification</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-700">📝 Waste entry form would go here. This is a placeholder.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <PlusCircle size={20} />
          Create & Classify
        </button>
      </div>
    </div>
  )
}

export default WasteEntry
