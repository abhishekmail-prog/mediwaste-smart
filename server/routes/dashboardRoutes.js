import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

// Staff Dashboard - returns demo data
router.get('/staff', authenticate, authorize('staff', 'admin'), (req, res) => {
  res.json({
    success: true,
    stats: {
      totalWaste: 245.5,
      pendingPickups: 3,
      completedPickups: 12,
      classifications: 45
    },
    activities: [
      { id: 1, action: 'Waste record created', category: 'Yellow', time: '2 min ago' },
      { id: 2, action: 'AI Classification completed', category: 'Red', time: '15 min ago' },
      { id: 3, action: 'Pickup request raised', priority: 'High', time: '1 hour ago' }
    ]
  })
})

// Admin Dashboard - returns demo data
router.get('/admin', authenticate, authorize('admin'), (req, res) => {
  res.json({
    success: true,
    stats: {
      totalFacilities: 12,
      totalWaste: 1560.5,
      pendingPickups: 8,
      completedPickups: 45,
      activeCollectors: 6
    },
    categoryData: [
      { name: 'Yellow', value: 40 },
      { name: 'Red', value: 30 },
      { name: 'White', value: 20 },
      { name: 'Blue', value: 10 }
    ],
    activities: [
      { id: 1, action: 'New facility registered: City Hospital', time: '5 min ago' },
      { id: 2, action: 'Pickup completed by Ravi Kumar', time: '20 min ago' },
      { id: 3, action: 'AI classification flagged for review', time: '1 hour ago' },
      { id: 4, action: 'New pickup request from Apollo Clinic', time: '2 hours ago' }
    ]
  })
})

// Collector Dashboard - returns demo data
router.get('/collector', authenticate, authorize('collector'), (req, res) => {
  res.json({
    success: true,
    stats: {
      assigned: 3,
      inTransit: 1,
      completed: 8,
      total: 12
    },
    pickups: [
      {
        id: 1,
        facility: 'City Hospital',
        priority: 'High',
        status: 'assigned',
        address: '123 Main St, Mumbai',
        wasteType: 'Yellow',
        time: '2 hours ago'
      },
      {
        id: 2,
        facility: 'Apollo Clinic',
        priority: 'Medium',
        status: 'in_transit',
        address: '456 Oak Ave, Mumbai',
        wasteType: 'Red',
        time: '1 hour ago'
      }
    ]
  })
})

export default router
