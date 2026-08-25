import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PlusCircle, Package, AlertCircle, CheckCircle, Brain, Sparkles, Wifi, WifiOff } from 'lucide-react'
import api from '../services/api'
import aiService from '../services/aiService'

const WasteEntry = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    category: '',
    subCategory: '',
    quantity: '',
    unit: 'kg',
    description: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [classification, setClassification] = useState(null)
  const [aiReady, setAiReady] = useState(false)
  const [aiStatus, setAiStatus] = useState('⏳ Checking...')

  const categories = [
    { value: 'yellow', label: 'Yellow', description: 'Infectious waste, pathological waste' },
    { value: 'red', label: 'Red', description: 'Contaminated waste (recyclable)' },
    { value: 'white', label: 'White', description: 'Sharps, needles, glass' },
    { value: 'blue', label: 'Blue', description: 'Glassware, plastic, metallic implants' }
  ]

  const units = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'g', label: 'Grams (g)' },
    { value: 'l', label: 'Liters (L)' },
    { value: 'ml', label: 'Milliliters (ml)' },
    { value: 'units', label: 'Units' }
  ]

  // Check AI status when component loads
  useEffect(() => {
    checkAIStatus()
  }, [])

  const checkAIStatus = async () => {
    try {
      const ready = await aiService.loadModel()
      setAiReady(ready)
      setAiStatus(ready ? '✅ AI Ready' : '❌ AI Not Connected')
      console.log('AI Status:', ready ? 'Ready' : 'Not Ready')
    } catch (error) {
      console.error('AI Check Error:', error)
      setAiStatus('❌ Connection Failed')
      setAiReady(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setShowResult(false)
    setLoading(true)

    console.log('📝 Form submitted:', formData)

    if (!formData.category) {
      setError('Please select a waste category')
      setLoading(false)
      return
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      setError('Please enter a valid quantity')
      setLoading(false)
      return
    }

    try {
      // Step 1: Create the waste record
      console.log('📤 Creating waste record...')
      const wasteResponse = await api.post('/waste', {
        category: formData.category,
        subCategory: formData.subCategory,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        description: formData.description
      })
      
      console.log('📥 Waste record response:', wasteResponse.data)
      
      if (!wasteResponse.data.success) {
        setError('Failed to create waste record')
        setLoading(false)
        return
      }

      const wasteId = wasteResponse.data.record.id
      console.log('✅ Waste record created with ID:', wasteId)

      // Step 2: Auto-classify using AI
      const description = formData.description || formData.subCategory || formData.category
      console.log('🧠 Sending to AI for classification:', description)
      
      // Make sure AI is loaded
      if (!aiReady) {
        console.log('⏳ Waiting for AI to load...')
        await checkAIStatus()
      }

      let aiResult
      try {
        // Use the classify method directly
        aiResult = await aiService.classify(description)
        console.log('🤖 AI result:', aiResult)
      } catch (aiError) {
        console.error('❌ AI Error:', aiError)
        // If AI fails, use the user-selected category
        const selectedCategory = categories.find(c => c.value === formData.category)
        aiResult = {
          category: formData.category,
          categoryLabel: selectedCategory?.label || formData.category,
          confidence: 50,
          instructions: 'Manual classification (AI was unavailable)',
          source: 'Manual Fallback',
          reasoning: 'AI failed, using manual selection'
        }
      }

      // Step 3: Update the waste record with AI classification
      if (aiResult && !aiResult.error) {
        try {
          await api.put(`/waste/${wasteId}`, {
            ai_prediction: aiResult.category,
            ai_confidence: aiResult.confidence || 70,
            ai_instructions: aiResult.instructions || 'Follow standard biomedical waste protocols.',
            status: 'classified'
          })
          console.log('✅ Waste record updated with AI classification')
        } catch (updateError) {
          console.error('⚠️ Failed to update waste record:', updateError)
        }
      }

      setClassification(aiResult)
      setShowResult(true)
      console.log('🎉 Classification complete!')
      
    } catch (err) {
      console.error('❌ Error in handleSubmit:', err)
      setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmAndProceed = () => {
    navigate('/pickups')
  }

  const handleRetry = () => {
    setShowResult(false)
    setClassification(null)
    setError('')
  }

  // If showing result, render the result screen
  if (showResult && classification) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CheckCircle className="text-green-500" />
            Waste Entry Complete! 🎉
          </h1>
          <p className="text-gray-500 mt-1">AI has classified your waste. Review the results below.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-2 border-primary-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span>Classification Result</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                  {classification.source || 'AI Powered'}
                </span>
              </h3>
              <p className="text-sm text-gray-500">
                {classification.reasoning || 'Waste classified successfully'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-600 font-medium">
                {classification.confidence}% confidence
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border-2 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Package size={20} />
                <span className="font-bold text-lg uppercase">{classification.categoryLabel}</span>
              </div>
              <p className="text-sm">Category: {classification.categoryLabel}</p>
              <p className="text-xs mt-1 opacity-75">Confidence: {classification.confidence}%</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <AlertCircle size={18} className="text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Segregation Instructions</p>
                  <p className="text-sm text-blue-700 mt-1">{classification.instructions}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleConfirmAndProceed}
              className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <CheckCircle size={18} />
              Proceed to Pickup
            </button>
            <button
              onClick={handleRetry}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Try Another
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 mt-0.5" size={18} />
            <div>
              <p className="font-medium text-yellow-800">Need Human Confirmation?</p>
              <p className="text-sm text-yellow-700 mt-1">
                If you disagree with the AI classification, you can manually override it
                when creating the pickup request.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main form
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-primary-500" />
          Enter Medical Waste
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-gray-500">Record new medical waste - AI will auto-classify it</p>
          <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
            aiReady ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {aiReady ? <Wifi size={12} /> : <WifiOff size={12} />}
            {aiStatus}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Waste Category (User Selection)
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="">Select category</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label} - {cat.description}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">This is your initial guess. AI will verify and classify.</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sub-Category (Optional)
          </label>
          <input
            type="text"
            name="subCategory"
            value={formData.subCategory}
            onChange={handleChange}
            placeholder="e.g., Used syringes, Blood bags, etc."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="0"
              min="0.01"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit *
            </label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              {units.map(unit => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional - helps AI classify)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Describe the waste items, condition, packaging, etc."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-gray-400 mt-1">Better description = Better AI classification</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                AI is Classifying...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Submit & Auto-Classify
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/staff-dashboard')}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Brain className="text-purple-600 mt-0.5" size={18} />
          <div>
            <p className="font-medium text-purple-800">AI Auto-Classification Active</p>
            <p className="text-sm text-purple-700 mt-1">
              When you submit, the AI will automatically classify your waste using Ollama.
              You'll see the result immediately and can proceed to create a pickup request.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WasteEntry
