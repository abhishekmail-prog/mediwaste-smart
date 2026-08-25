import express from 'express'
import jwt from 'jsonwebtoken'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Hardcoded users (no database needed)
const USERS = [
  { id: 1, name: 'Admin', email: 'admin@mediwaste.com', password: 'admin123', role: 'admin', facility_id: null, is_active: 1 },
  { id: 2, name: 'Dr. Sharma', email: 'hospital@mediwaste.com', password: 'hospital123', role: 'staff', facility_id: 1, is_active: 1 },
  { id: 3, name: 'Ravi Kumar', email: 'collector@mediwaste.com', password: 'collector123', role: 'collector', facility_id: null, is_active: 1 }
]

router.post('/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and password are required' 
    })
  }

  const user = USERS.find(u => u.email === email && u.password === password)

  if (!user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    })
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    'mediwaste_smart_hackathon_2026_secret_key',
    { expiresIn: '7d' }
  )

  const { password: _, ...userWithoutPassword } = user

  res.json({
    success: true,
    token,
    user: userWithoutPassword
  })
})

router.get('/me', authenticate, (req, res) => {
  res.json(req.user)
})

router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' })
})

export default router
