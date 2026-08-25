import jwt from 'jsonwebtoken'

// Hardcoded users for token verification
const USERS = [
  { id: 1, name: 'Admin', email: 'admin@mediwaste.com', role: 'admin', facility_id: null, is_active: 1 },
  { id: 2, name: 'Dr. Sharma', email: 'hospital@mediwaste.com', role: 'staff', facility_id: 1, is_active: 1 },
  { id: 3, name: 'Ravi Kumar', email: 'collector@mediwaste.com', role: 'collector', facility_id: null, is_active: 1 }
]

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const token = authHeader.split(' ')[1]
    
    const decoded = jwt.verify(token, 'mediwaste_smart_hackathon_2026_secret_key')
    
    const user = USERS.find(u => u.id === decoded.id)

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }

    req.user = user
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ success: false, message: 'Invalid token' })
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ success: false, message: 'Token expired' })
    }
    console.error('Auth error:', error)
    return res.status(500).json({ success: false, message: 'Authentication error' })
  }
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }
    
    next()
  }
}
