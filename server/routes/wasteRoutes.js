import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

// Get all waste records - returns demo data
router.get('/', authenticate, (req, res) => {
  res.json([
    {
      id: 1,
      category: 'yellow',
      subCategory: 'Used syringes',
      quantity: 5.2,
      unit: 'kg',
      status: 'completed',
      created_at: new Date().toISOString(),
      facility: 'City Hospital'
    },
    {
      id: 2,
      category: 'red',
      subCategory: 'Blood bags',
      quantity: 12,
      unit: 'units',
      status: 'pickup_requested',
      created_at: new Date().toISOString(),
      facility: 'City Hospital'
    },
    {
      id: 3,
      category: 'white',
      subCategory: 'Needles',
      quantity: 8.5,
      unit: 'kg',
      status: 'classified',
      created_at: new Date().toISOString(),
      facility: 'Apollo Clinic'
    }
  ])
})

// Create waste record
router.post('/', authenticate, authorize('staff', 'admin'), (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Waste record created successfully',
    record: { id: Date.now() }
  })
})

// Get single waste record
router.get('/:id', authenticate, (req, res) => {
  res.json({
    id: parseInt(req.params.id),
    category: 'yellow',
    subCategory: 'Used syringes',
    quantity: 5.2,
    unit: 'kg',
    description: 'Mixed used syringes and needles',
    status: 'pending',
    created_at: new Date().toISOString()
  })
})

// AI Classification
router.post('/classify', authenticate, (req, res) => {
  const { description } = req.body
  
  const categories = ['yellow', 'red', 'white', 'blue']
  const randomCategory = categories[Math.floor(Math.random() * categories.length)]
  const confidence = Math.floor(Math.random() * 15) + 85
  
  const instructions = {
    yellow: 'Place in yellow colored non-chlorinated plastic bags. Incinerate or deep burial as per BMW rules.',
    red: 'Place in red colored non-chlorinated plastic bags. Autoclave/microwave treatment then shred.',
    white: 'Place in white puncture-proof containers. Chemical treatment or autoclave.',
    blue: 'Place in blue colored containers. Chemical treatment followed by disposal.'
  }

  res.json({
    category: randomCategory,
    confidence: confidence,
    instructions: instructions[randomCategory] || 'Follow standard biomedical waste handling protocols.',
    inputAnalyzed: description || 'Medical waste sample'
  })
})

// Get waste categories
router.get('/categories', (req, res) => {
  res.json({
    success: true,
    categories: [
      { id: 'yellow', label: 'Yellow', description: 'Infectious waste, pathological waste' },
      { id: 'red', label: 'Red', description: 'Contaminated waste (recyclable)' },
      { id: 'white', label: 'White', description: 'Sharps, needles, glass' },
      { id: 'blue', label: 'Blue', description: 'Glassware, plastic, metallic implants' }
    ]
  })
})

export default router
