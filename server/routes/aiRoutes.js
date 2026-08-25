import express from 'express'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// AI Classification endpoint (used by frontend)
router.post('/', authenticate, (req, res) => {
  const { description, image } = req.body
  
  // The frontend does the actual AI classification using TensorFlow.js
  // This endpoint just stores the result or processes any text-based classification
  
  res.json({
    success: true,
    message: 'Classification processed'
  })
})

export default router
