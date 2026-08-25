import axios from 'axios'

class AIService {
  constructor() {
    this.ollamaUrl = 'http://localhost:11434/api/generate'
    this.model = 'meditron:latest'
    this.ready = false
    this.loading = false
  }

  async loadModel() {
    // If already ready, return true
    if (this.ready) return true
    
    // If currently loading, wait
    if (this.loading) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return this.ready
    }

    this.loading = true
    try {
      console.log('🔍 Checking Ollama connection...')
      const response = await axios.get('http://localhost:11434/api/tags', {
        timeout: 5000
      })
      
      if (response.status === 200) {
        this.ready = true
        console.log('✅ Ollama connected! Model:', this.model)
        return true
      }
    } catch (error) {
      console.error('❌ Ollama not accessible:', error.message)
      this.ready = false
    } finally {
      this.loading = false
    }
    return false
  }

  async classify(description) {
    console.log('🔍 Classifying:', description)
    
    // Make sure AI is loaded
    if (!this.ready) {
      console.log('⏳ Loading AI model...')
      await this.loadModel()
    }
    
    if (this.ready) {
      try {
        const result = await this.classifyWithOllama(description)
        if (result) {
          console.log('✅ Ollama result:', result)
          return result
        }
      } catch (error) {
        console.error('❌ Ollama error:', error.message)
        // Return a fallback result
        return this.getFallbackResult(description)
      }
    }
    
    return this.getFallbackResult(description)
  }

  async classifyWithOllama(description) {
    const prompt = `Classify this medical waste: "${description}". 
Return ONLY JSON: {"category":"yellow|red|white|blue","confidence":90,"reasoning":"brief","instructions":"disposal"}`

    const response = await axios.post(this.ollamaUrl, {
      model: this.model,
      prompt: prompt,
      stream: false,
      temperature: 0.1
    }, {
      timeout: 30000
    })

    let result
    const jsonMatch = response.data.response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0])
    } else {
      throw new Error('No JSON found')
    }

    const validCategories = ['yellow', 'red', 'white', 'blue']
    if (!validCategories.includes(result.category)) {
      result.category = 'yellow'
    }

    const instructions = {
      yellow: 'Place in yellow colored non-chlorinated plastic bags. Incinerate or deep burial.',
      red: 'Place in red colored non-chlorinated plastic bags. Autoclave then shred.',
      white: 'Place in white puncture-proof containers. Chemical treatment or autoclave.',
      blue: 'Place in blue colored containers. Chemical treatment followed by disposal.'
    }

    return {
      category: result.category,
      categoryLabel: result.category.charAt(0).toUpperCase() + result.category.slice(1),
      confidence: parseInt(result.confidence) || 85,
      reasoning: result.reasoning || 'AI classified based on description.',
      instructions: result.instructions || instructions[result.category],
      source: '🧠 Ollama: ' + this.model,
      scores: { llm: parseInt(result.confidence) || 85 }
    }
  }

  getFallbackResult(description) {
    // Simple keyword matching as fallback
    const words = description.toLowerCase().split(/\s+/)
    
    const keywords = {
      yellow: ['infectious', 'pathological', 'tissue', 'blood', 'body', 'clinical', 'medical', 'hospital', 'surgical', 'dressing', 'bandage', 'wound', 'surgery'],
      red: ['contaminated', 'plastic', 'tube', 'iv', 'catheter', 'glove', 'mask', 'gown', 'recyclable', 'tubing', 'bag'],
      white: ['needle', 'sharps', 'blade', 'scalpel', 'glass', 'vial', 'ampoule', 'puncture', 'pointed', 'cutting', 'inject'],
      blue: ['glassware', 'metallic', 'implant', 'prosthesis', 'metal', 'laboratory', 'beaker', 'flask']
    }

    let scores = {}
    let totalScore = 0

    for (const [category, kw] of Object.entries(keywords)) {
      let score = 0
      for (const word of words) {
        for (const k of kw) {
          if (word.includes(k) || k.includes(word)) score += 1
        }
      }
      scores[category] = score
      totalScore += score
    }

    let maxScore = 0
    let predictedCategory = 'yellow'
    for (const [category, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score
        predictedCategory = category
      }
    }

    const instructions = {
      yellow: 'Place in yellow colored non-chlorinated plastic bags. Incinerate or deep burial.',
      red: 'Place in red colored non-chlorinated plastic bags. Autoclave then shred.',
      white: 'Place in white puncture-proof containers. Chemical treatment or autoclave.',
      blue: 'Place in blue colored containers. Chemical treatment followed by disposal.'
    }

    return {
      category: predictedCategory,
      categoryLabel: predictedCategory.charAt(0).toUpperCase() + predictedCategory.slice(1),
      confidence: 60,
      reasoning: 'Fallback classification using keyword matching',
      instructions: instructions[predictedCategory],
      source: '📝 Fallback Local',
      scores: scores
    }
  }

  getCategories() {
    return [
      { id: 'yellow', label: 'Yellow', description: 'Infectious waste' },
      { id: 'red', label: 'Red', description: 'Contaminated waste' },
      { id: 'white', label: 'White', description: 'Sharps, needles' },
      { id: 'blue', label: 'Blue', description: 'Glassware, metallic' }
    ]
  }
}

export default new AIService()
