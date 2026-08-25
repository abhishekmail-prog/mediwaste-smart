import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

// Staff Dashboard
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

// Admin Dashboard
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
      { id: 3, action: 'AI classification flagged for review', time: '1 hour ago' }
    ]
  })
})

// Collector Dashboard - Enhanced with real-time data
router.get('/collector', authenticate, authorize('collector'), (req, res) => {
  const collectorId = req.user.id
  
  // Generate realistic collector data
  const now = new Date()
  
  // Today's date for pickup dates
  const today = now.toISOString().split('T')[0]
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]
  
  const stats = {
    assigned: Math.floor(Math.random() * 4) + 2,
    inTransit: Math.floor(Math.random() * 3) + 1,
    completed: Math.floor(Math.random() * 8) + 5,
    total: Math.floor(Math.random() * 15) + 10,
    todayPickups: Math.floor(Math.random() * 4) + 2,
    weeklyTarget: 15,
    weeklyProgress: Math.floor(Math.random() * 60) + 40,
    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
    totalDistance: (Math.random() * 50 + 20).toFixed(1)
  }
  
  // Assigned pickups with realistic data
  const pickups = [
    {
      id: 1,
      facility: 'City Hospital',
      priority: 'High',
      status: 'assigned',
      address: '123 Main Street, Mumbai',
      wasteType: 'Yellow, Red',
      quantity: '5.2 kg',
      pickupDate: today,
      pickupTime: '10:00 AM',
      distance: '2.3 km',
      estimatedTime: '15 min',
      instructions: 'Handle with care - contains sharps',
      contactPerson: 'Dr. Sharma',
      contactPhone: '+91-98765-43210'
    },
    {
      id: 2,
      facility: 'Apollo Clinic',
      priority: 'Medium',
      status: 'assigned',
      address: '456 Oak Avenue, Mumbai',
      wasteType: 'White',
      quantity: '3.8 kg',
      pickupDate: today,
      pickupTime: '02:30 PM',
      distance: '4.1 km',
      estimatedTime: '20 min',
      instructions: 'Call before arrival',
      contactPerson: 'Dr. Mehta',
      contactPhone: '+91-98765-43211'
    },
    {
      id: 3,
      facility: 'MediLab Research',
      priority: 'Urgent',
      status: 'in_transit',
      address: '789 Science Boulevard, Mumbai',
      wasteType: 'Blue',
      quantity: '2.1 kg',
      pickupDate: today,
      pickupTime: '09:00 AM',
      distance: '3.7 km',
      estimatedTime: '12 min',
      instructions: 'URGENT - Lab closes at 5 PM',
      contactPerson: 'Dr. Patel',
      contactPhone: '+91-98765-43212'
    },
    {
      id: 4,
      facility: 'Sunrise Hospital',
      priority: 'Low',
      status: 'collected',
      address: '321 Wellness Road, Mumbai',
      wasteType: 'Yellow',
      quantity: '8.5 kg',
      pickupDate: yesterday,
      pickupTime: '11:30 AM',
      distance: '5.8 km',
      estimatedTime: '25 min',
      instructions: 'Completed - Awaiting confirmation',
      contactPerson: 'Dr. Kumar',
      contactPhone: '+91-98765-43213'
    }
  ]
  
  // Recent activity
  const activities = [
    {
      id: 1,
      type: 'completed',
      message: 'Pickup #1243 completed at City Hospital',
      time: '5 min ago',
      facility: 'City Hospital'
    },
    {
      id: 2,
      type: 'in_transit',
      message: 'En route to MediLab Research',
      time: '15 min ago',
      facility: 'MediLab Research'
    },
    {
      id: 3,
      type: 'assigned',
      message: 'New pickup assigned from Apollo Clinic',
      time: '25 min ago',
      facility: 'Apollo Clinic'
    },
    {
      id: 4,
      type: 'completed',
      message: 'Pickup #1241 completed at Wellness Center',
      time: '1 hour ago',
      facility: 'Sunrise Hospital'
    }
  ]
  
  // Performance data for charts
  const performanceData = [
    { day: 'Mon', completed: 4, assigned: 6 },
    { day: 'Tue', completed: 5, assigned: 7 },
    { day: 'Wed', completed: 3, assigned: 5 },
    { day: 'Thu', completed: 6, assigned: 8 },
    { day: 'Fri', completed: 7, assigned: 6 },
    { day: 'Sat', completed: 2, assigned: 3 },
    { day: 'Sun', completed: 1, assigned: 2 }
  ]
  
  // Upcoming schedule
  const schedule = [
    { time: '09:00 AM', facility: 'City Hospital', type: 'Pickup', status: 'assigned' },
    { time: '10:30 AM', facility: 'Apollo Clinic', type: 'Pickup', status: 'assigned' },
    { time: '01:00 PM', facility: 'MediLab', type: 'Pickup', status: 'pending' },
    { time: '03:00 PM', facility: 'Sunrise Hospital', type: 'Drop-off', status: 'pending' }
  ]
  
  res.json({
    success: true,
    stats: stats,
    pickups: pickups,
    activities: activities,
    performanceData: performanceData,
    schedule: schedule,
    collector: {
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone || '+91-98765-43214',
      joinDate: '2026-01-15',
      vehicle: 'Collection Van MH-01-AB-1234'
    }
  })
})

// Update pickup status (for collector actions)
router.put('/pickup/:id/status', authenticate, authorize('collector'), (req, res) => {
  const { id } = req.params
  const { status } = req.body
  
  const validStatuses = ['accepted', 'in_transit', 'collected', 'completed', 'rejected']
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid status' 
    })
  }
  
  res.json({
    success: true,
    message: `Pickup ${id} status updated to ${status}`,
    timestamp: new Date().toISOString()
  })
})

export default router
