import React, { useState } from 'react'
import axios from 'axios'

const AITest = () => {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])

  const addLog = (msg) => {
    setLogs(prev => [...prev, msg])
  }

  const testOllama = async () => {
    setLoading(true)
    setResult(null)
    setLogs([])
    
    try {
      addLog('🔍 Testing Ollama connection...')
      
      // Test 1: Check if Ollama is running
      const tagsResponse = await axios.get('/ollama/api/tags')
      addLog('✅ Ollama is running!')
      addLog(`📦 Models: ${tagsResponse.data.models.map(m => m.name).join(', ')}`)
      
      // Test 2: Try to classify
      addLog(`🧠 Sending to Meditron: "${input}"`)
      
      const response = await axios.post('/ollama/api/generate', {
        model: 'meditron:latest',
        prompt: `Classify this medical waste: "${input}". Return only one word: Yellow, Red, White, or Blue`,
        stream: false,
        temperature: 0.1
      })
      
      addLog('📥 Response received!')
      addLog(`📝 Raw response: ${response.data.response}`)
      
      setResult(response.data.response)
    } catch (error) {
      addLog(`❌ Error: ${error.message}`)
      if (error.response) {
        addLog(`Status: ${error.response.status}`)
        addLog(`Data: ${JSON.stringify(error.response.data)}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">AI Debug Test</h1>
      
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter waste description..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button
          onClick={testOllama}
          disabled={loading || !input}
          className="px-6 py-2 bg-primary-500 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test AI'}
        </button>
      </div>

      {result && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
          <h3 className="font-bold text-green-800">AI Response:</h3>
          <p className="text-green-700">{result}</p>
        </div>
      )}

      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
        <h3 className="text-gray-400 mb-2">📋 Logs:</h3>
        {logs.map((log, i) => (
          <div key={i} className="py-0.5">{log}</div>
        ))}
      </div>
    </div>
  )
}

export default AITest
