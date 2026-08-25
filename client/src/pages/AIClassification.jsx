import React from 'react'
import { Brain } from 'lucide-react'

const AIClassification = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Brain className="text-primary-500" />
          AI Waste Classification
        </h1>
        <p className="text-gray-500 mt-1">AI-powered waste classification and segregation guidance</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700">🤖 AI Classification interface would go here. This is a placeholder.</p>
        </div>
      </div>
    </div>
  )
}

export default AIClassification
