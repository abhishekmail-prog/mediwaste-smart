import axios from 'axios'

class AIService {
  constructor() {
    // Use the Render backend URL
    this.apiUrl = 'https://mediwaste-backend.onrender.com/api/waste/classify'
    this.ready = true
  }

  async loadModel() {
    console.log('✅ AI ready!')
    return true
  }

  async classify(description) {
    console.log('🔍 Classifying:', description)
    
    try {
      const response = await axios.post(this.apiUrl, { description })
      
      if (response.data.success) {
        return {
          category: response.data.category,
          categoryLabel: response.data.categoryLabel,
          confidence: response.data.confidence || 85,
          reasoning: response.data.reasoning || 'AI classified based on description.',
          instructions: response.data.instructions,
          source: response.data.source || '🧠 AI',
          scores: { ai: response.data.confidence || 85 }
        }
      } else {
        throw new Error('Classification failed')
      }
    } catch (error) {
      console.error('❌ Classification error:', error.response?.data || error.message)
      return this.classifyLocal(description)
    }
  }

  classifyLocal(description) {
    const categories = {
      yellow: {
        label: 'Yellow',
        keywords: ['infectious', 'pathological', 'tissue', 'blood', 'body', 'clinical', 'medical', 'hospital'],
        instructions: 'Place in yellow colored non-chlorinated plastic bags. Incinerate or deep burial as per BMW rules.'
      },
      red: {
        label: 'Red',
        keywords: ['contaminated', 'plastic', 'tube', 'iv', 'catheter', 'syringe', 'glove', 'mask'],
        instructions: 'Place in red colored non-chlorinated plastic bags. Autoclave/microwave treatment then shred.'
      },
      white: {
        label: 'White',
        keywords: ['needle', 'sharps', 'blade', 'scalpel', 'glass', 'vial', 'ampoule'],
        instructions: 'Place in white puncture-proof containers. Chemical treatment or autoclave.'
      },
      blue: {
        label: 'Blue',
        keywords: ['glassware', 'metallic', 'implant', 'prosthesis', 'metal', 'laboratory'],
        instructions: 'Place in blue colored containers. Chemical treatment followed by disposal.'
      }
    }

    const words = description.toLowerCase().split(/\s+/)
    let scores = {}
    let totalScore = 0

    for (const [category, data] of Object.entries(categories)) {
      let score = 0
      for (const word of words) {
        for (const keyword of data.keywords) {
          if (word.includes(keyword) || keyword.includes(word)) {
            score += 1
          }
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

    const categoryData = categories[predictedCategory]
    const confidence = totalScore > 0 ? Math.min(Math.round((maxScore / totalScore) * 100), 90) : 50

    return {
      category: predictedCategory,
      categoryLabel: categoryData.label,
      confidence: Math.max(confidence, 50),
      reasoning: 'Local keyword matching (AI unavailable)',
      instructions: categoryData.instructions,
      source: '📝 Local Fallback'
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
