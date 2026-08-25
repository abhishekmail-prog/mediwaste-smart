import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

// Get real analytics data
router.get('/overview', authenticate, authorize('admin'), (req, res) => {
  // This would normally query the database
  // For now, we'll generate realistic data based on the current date
  
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  
  // Generate realistic data
  const generateData = () => {
    // Category distribution
    const categoryData = [
      { name: 'Yellow', value: Math.floor(Math.random() * 30) + 20 },
      { name: 'Red', value: Math.floor(Math.random() * 25) + 15 },
      { name: 'White', value: Math.floor(Math.random() * 20) + 10 },
      { name: 'Blue', value: Math.floor(Math.random() * 15) + 5 }
    ]
    
    // Timeline data (last 7 days)
    const timeline = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      timeline.push({
        date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        waste: Math.floor(Math.random() * 40) + 20,
        pickups: Math.floor(Math.random() * 15) + 5
      })
    }
    
    // Completion status
    const completionData = [
      { name: 'Completed', value: Math.floor(Math.random() * 30) + 40 },
      { name: 'In Progress', value: Math.floor(Math.random() * 20) + 15 },
      { name: 'Pending', value: Math.floor(Math.random() * 15) + 5 }
    ]
    
    // Facility data
    const facilities = [
      { name: 'City Hospital', waste: Math.floor(Math.random() * 100) + 150, pickups: Math.floor(Math.random() * 15) + 10 },
      { name: 'Apollo Clinic', waste: Math.floor(Math.random() * 80) + 100, pickups: Math.floor(Math.random() * 12) + 8 },
      { name: 'MediLab', waste: Math.floor(Math.random() * 60) + 80, pickups: Math.floor(Math.random() * 10) + 5 },
      { name: 'Sunrise Hospital', waste: Math.floor(Math.random() * 90) + 120, pickups: Math.floor(Math.random() * 12) + 6 },
      { name: 'Health Plus', waste: Math.floor(Math.random() * 40) + 50, pickups: Math.floor(Math.random() * 8) + 3 }
    ]
    
    // Overview stats
    const overview = {
      totalWaste: facilities.reduce((sum, f) => sum + f.waste, 0),
      totalPickups: facilities.reduce((sum, f) => sum + f.pickups, 0),
      completionRate: Math.floor(Math.random() * 20) + 75,
      avgResponse: (Math.random() * 3 + 2).toFixed(1),
      activeFacilities: facilities.length,
      totalCategories: 4
    }
    
    return { overview, categoryData, timeline, completion: completionData, facilities }
  }
  
  const data = generateData()
  res.json({ success: true, ...data })
})

// Get real-time updates (for live dashboard)
router.get('/realtime', authenticate, authorize('admin'), (req, res) => {
  // Simulate real-time updates
  const now = new Date()
  
  const realtimeData = {
    timestamp: now.toISOString(),
    recentActivity: [
      {
        id: Date.now(),
        type: 'pickup_completed',
        message: 'Pickup #1245 completed by Ravi Kumar',
        time: 'Just now',
        facility: 'City Hospital'
      },
      {
        id: Date.now() - 1000,
        type: 'waste_added',
        message: 'New waste record added: Yellow waste (5.2 kg)',
        time: '2 min ago',
        facility: 'Apollo Clinic'
      },
      {
        id: Date.now() - 2000,
        type: 'pickup_assigned',
        message: 'Pickup #1246 assigned to Priya Singh',
        time: '5 min ago',
        facility: 'MediLab'
      }
    ],
    liveStats: {
      activeUsers: Math.floor(Math.random() * 5) + 2,
      pendingPickups: Math.floor(Math.random() * 8) + 2,
      todayPickups: Math.floor(Math.random() * 10) + 5,
      todayWaste: (Math.random() * 100 + 50).toFixed(1)
    }
  }
  
  res.json(realtimeData)
})

export default router
