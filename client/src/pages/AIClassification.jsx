import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Package, TrendingUp, CheckCircle, AlertTriangle, Info, Sparkles, Cpu, Wifi, WifiOff } from 'lucide-react'
import aiService from '../services/aiService'

const AIClassification = () => {
  const navigate = useNavigate()
  
  const [classification, setClassification] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [wasteInput, setWasteInput] = useState('')
  const [classifiedItems, setClassifiedItems] = useState([])
  const [aiStatus, setAiStatus] = useState('⏳ Checking...')
  const [aiReady, setAiReady] = useState(false)

  const categoryColors = {
    yellow: 'bg-yellow-100 border-yellow-400 text-yellow-800',
    red: 'bg-red-100 border-red-400 text-red-800',
    white: 'bg-white border-gray-400 text-gray-800',
    blue: 'bg-blue-100 border-blue-400 text-blue-800'
  }

  useEffect(() => {
    checkAIStatus()
  }, [])

  const checkAIStatus = async () => {
    try {
      const ready = await aiService.loadModel()
      setAiReady(ready)
      setAiStatus(ready ? '✅ Ollama Ready' : '❌ Ollama Not Connected')
    } catch (error) {
      setAiStatus('❌ Connection Failed')
      setAiReady(false)
    }
  }

  const handleClassify = async () => {
    if (!wasteInput.trim()) {
      setError('Please enter a waste description')
      return
    }

    setLoading(true)
    setError('')
    setClassification(null)

    try {
      const result = await aiService.classify(wasteInput)
      
      if (result.error) {
        setError(result.instructions)
        return
      }
      
      setClassification(result)
      
      setClassifiedItems(prev => [{
        id: Date.now(),
        input: wasteInput,
        result: result,
        time: new Date().toLocaleTimeString()
      }, ...prev])
      
      setWasteInput('')
    } catch (err) {
      console.error('Classification failed:', err)
      setError('Classification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const demoItems = [
    'Used syringes and needles',
    'Blood bags and contaminated IV tubes',
    'Glass vials and ampoules',
    'Plastic tubing and catheters'
  ]

  const fillDemo = (text) => {
    setWasteInput(text)
  }

  const getConfidenceEmoji = (confidence) => {
    if (confidence >= 85) return '🟢'
    if (confidence >= 70) return '🟡'
    return '🟠'
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Brain className="text-primary-500" />
          AI Waste Classification
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-gray-500">AI-powered waste classification using Ollama</p>
          <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
            aiReady ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {aiReady ? <Wifi size={12} /> : <WifiOff size={12} />}
            {aiStatus}
          </span>
        </div>
      </div>

      {/* Classification Input */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Package size={18} />
          Classify Waste
        </h3>
        
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={wasteInput}
              onChange={(e) => setWasteInput(e.target.value)}
              placeholder="Describe the waste (e.g., Used syringes)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyPress={(e) => e.key === 'Enter' && handleClassify()}
              disabled={loading}
            />
            <button
              onClick={handleClassify}
              disabled={loading || !wasteInput.trim()}
              className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Classifying...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Classify
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 flex items-center">Try:</span>
          {demoItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => fillDemo(item)}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Classification Result */}
      {classification && (
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
                {classification.reasoning || 'AI classified this waste item'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-600 font-medium">
                {classification.confidence}% confidence
              </span>
              <TrendingUp className="text-green-500" size={18} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border-2 ${categoryColors[classification.category] || 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Package size={20} />
                <span className="font-bold text-lg uppercase">{classification.categoryLabel}</span>
                <span className="text-sm ml-auto">{getConfidenceEmoji(classification.confidence)}</span>
              </div>
              <p className="text-sm">Category: {classification.categoryLabel}</p>
              <p className="text-xs mt-1 opacity-75">Confidence: {classification.confidence}%</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Info size={18} className="text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Segregation Instructions</p>
                  <p className="text-sm text-blue-700 mt-1">{classification.instructions}</p>
                </div>
              </div>
            </div>
          </div>

          {classification.scores && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">Category Scores:</p>
              <div className="flex gap-4 flex-wrap">
                {Object.entries(classification.scores).map(([cat, score]) => (
                  <div key={cat} className="text-xs">
                    <span className="font-medium">{cat}:</span>
                    <span className="ml-1 text-gray-600">{score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => navigate('/pickups')}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <CheckCircle size={18} />
              Request Pickup
            </button>
            <button
              onClick={() => setClassification(null)}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              New Classification
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {classifiedItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Classification History</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {classifiedItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800 truncate max-w-xs">{item.input}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[item.result.category]}`}>
                      {item.result.categoryLabel.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">{item.time}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-green-600 font-medium">
                    {item.result.confidence}%
                  </span>
                  <span>{getConfidenceEmoji(item.result.confidence)}</span>
                  <span className="text-xs text-gray-400">
                    {item.result.source || 'AI'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Cpu className="text-purple-600 mt-0.5" size={18} />
          <div>
            <p className="font-medium text-purple-800">Local AI with Ollama</p>
            <p className="text-sm text-purple-700 mt-1">
              This AI uses Ollama running locally on your machine with the Meditron medical model.
              All data stays on your computer - nothing is sent to the cloud!
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                {aiReady ? '✅ Ollama Connected' : '⚠️ Ollama Not Running'}
              </span>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                Model: meditron:latest
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIClassification
