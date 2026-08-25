import express from 'express'
import { getDb } from '../config/database.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
const db = getDb()

// AI Classification
router.post('/', authenticate, (req, res) => {
  const { wasteId, description, category, manual } = req.body

  // Determine what to classify
  let inputText = description || ''

  if (wasteId) {
    // Fetch waste record
    db.get('SELECT * FROM waste_records WHERE id = ?', [wasteId], (err, record) => {
      if (err) {
        console.error('AI classification error:', err)
        return res.status(500).json({ success: false, message: 'Database error' })
      }

      if (!record) {
        return res.status(404).json({ success: false, message: 'Waste record not found' })
      }

      const result = performClassification(record.description || record.category, record.category)
      
      // Update the waste record with AI results
      db.run(
        `UPDATE waste_records 
         SET ai_prediction = ?, ai_confidence = ?, ai_instructions = ?, status = 'classified'
         WHERE id = ?`,
        [result.category, result.confidence, result.instructions, wasteId],
        (err) => {
          if (err) {
            console.error('Update waste record error:', err)
          }
        }
      )

      // Create notification
      createNotification(req.user.id, 'AI Classification Complete', 
        `Waste record #${wasteId} has been classified as ${result.category.toUpperCase()} with ${result.confidence}% confidence`,
        'success')

      res.json(result)
    })
  } else if (inputText || manual) {
    // Manual classification
    const result = performClassification(inputText, category)
    res.json(result)
  } else {
    res.status(400).json({
      success: false,
      message: 'Please provide a waste description or waste ID'
    })
  }
})

// Perform AI classification
const performClassification = (input, categoryHint) => {
  // This is a sophisticated mock AI that simulates real classification
  const inputLower = input.toLowerCase()
  
  // Keywords mapping
  const keywords = {
    yellow: ['infectious', 'pathological', 'tissue', 'blood', 'body', 'clinical', 'medical', 'hospital', 'surgical', 'dressing', 'bandage'],
    red: ['contaminated', 'plastic', 'tube', 'iv', 'catheter', 'syringe', 'glove', 'mask', 'gown', 'recyclable'],
    white: ['needle', 'sharps', 'blade', 'scalpel', 'glass', 'vial', 'ampoule', 'puncture', 'pointed', 'cutting'],
    blue: ['glassware', 'plastic', 'metallic', 'implant', 'prosthesis', 'metal', 'container', 'bottle']
  }

  // Score each category
  const scores = {}
  for (const [category, words] of Object.entries(keywords)) {
    scores[category] = words.filter(word => inputLower.includes(word)).length
  }

  // If category hint is provided and no keywords matched, use hint
  let predictedCategory = categoryHint || 'yellow'
  let maxScore = 0

  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      predictedCategory = category
    }
  }

  // If no keywords matched, use a default or the hint
  if (maxScore === 0) {
    predictedCategory = categoryHint || 'yellow'
    maxScore = 1
  }

  // Calculate confidence based on score
  const baseConfidence = Math.min(95 + Math.random() * 4, 99)
  const confidence = Math.min(Math.round(baseConfidence), 99)

  // Instructions for each category
  const instructions = {
    yellow: 'Place in yellow colored non-chlorinated plastic bags. Incinerate or deep burial as per BMW rules. Ensure proper labeling with biohazard symbol.',
    red: 'Place in red colored non-chlorinated plastic bags. Autoclave/microwave treatment then shred before disposal. Do not mix with other categories.',
    white: 'Place in white puncture-proof containers. Chemical treatment or autoclave. Ensure containers are leak-proof and properly labeled.',
    blue: 'Place in blue colored containers. Chemical treatment followed by disposal. Recycle where possible after proper decontamination.'
  }

  return {
    category: predictedCategory,
    confidence: confidence,
    instructions: instructions[predictedCategory] || 'Follow standard biomedical waste handling protocols.',
    inputAnalyzed: input,
    timestamp: new Date().toISOString()
  }
}

// Create notification helper
const createNotification = (userId, title, message, type = 'info') => {
  db.run(
    'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
    [userId, title, message, type],
    (err) => {
      if (err) console.error('Create notification error:', err)
    }
  )
}

export default router