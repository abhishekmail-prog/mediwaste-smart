import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

// In-memory storage for pickups
let pickups = [
  {
    id: 1,
    facility: 'City Hospital',
    facilityId: 1,
    priority: 'high',
    status: 'assigned',
    pickupDate: '2026-08-26',
    pickupTime: '10:00 AM',
    address: '123 Main Street, Mumbai',
    instructions: 'Handle with care - contains sharps',
    wasteType: 'Yellow, Red',
    quantity: '5.2 kg',
    collector: 'Ravi Kumar',
    collectorId: 3,
    createdAt: '2026-08-26T08:00:00.000Z',
    updatedAt: '2026-08-26T08:30:00.000Z',
    wasteRecords: [
      { id: 101, category: 'Yellow', quantity: '3.2 kg' },
      { id: 102, category: 'Red', quantity: '2.0 kg' }
    ]
  },
  {
    id: 2,
    facility: 'City Hospital',
    facilityId: 1,
    priority: 'medium',
    status: 'in_transit',
    pickupDate: '2026-08-26',
    pickupTime: '02:30 PM',
    address: '123 Main Street, Mumbai',
    instructions: 'Call before arrival',
    wasteType: 'White',
    quantity: '3.8 kg',
    collector: 'Priya Singh',
    collectorId: 4,
    createdAt: '2026-08-26T07:30:00.000Z',
    updatedAt: '2026-08-26T09:00:00.000Z',
    wasteRecords: [
      { id: 103, category: 'White', quantity: '3.8 kg' }
    ]
  },
  {
    id: 3,
    facility: 'City Hospital',
    facilityId: 1,
    priority: 'urgent',
    status: 'pending',
    pickupDate: '2026-08-25',
    pickupTime: '09:00 AM',
    address: '123 Main Street, Mumbai',
    instructions: 'URGENT - Lab closes at 5 PM',
    wasteType: 'Blue, Red',
    quantity: '2.1 kg',
    collector: null,
    collectorId: null,
    createdAt: '2026-08-25T16:00:00.000Z',
    updatedAt: '2026-08-25T16:00:00.000Z',
    wasteRecords: [
      { id: 104, category: 'Blue', quantity: '1.1 kg' },
      { id: 105, category: 'Red', quantity: '1.0 kg' }
    ]
  },
  {
    id: 4,
    facility: 'City Hospital',
    facilityId: 1,
    priority: 'low',
    status: 'completed',
    pickupDate: '2026-08-24',
    pickupTime: '11:30 AM',
    address: '123 Main Street, Mumbai',
    instructions: 'Completed successfully',
    wasteType: 'Yellow',
    quantity: '8.5 kg',
    collector: 'Amit Patel',
    collectorId: 5,
    createdAt: '2026-08-24T10:00:00.000Z',
    updatedAt: '2026-08-24T12:00:00.000Z',
    wasteRecords: [
      { id: 106, category: 'Yellow', quantity: '8.5 kg' }
    ]
  },
  {
    id: 5,
    facility: 'City Hospital',
    facilityId: 1,
    priority: 'high',
    status: 'pending',
    pickupDate: '2026-08-27',
    pickupTime: '09:30 AM',
    address: '123 Main Street, Mumbai',
    instructions: 'New pickup request',
    wasteType: 'Red, White',
    quantity: '4.5 kg',
    collector: null,
    collectorId: null,
    createdAt: '2026-08-26T11:00:00.000Z',
    updatedAt: '2026-08-26T11:00:00.000Z',
    wasteRecords: [
      { id: 107, category: 'Red', quantity: '2.5 kg' },
      { id: 108, category: 'White', quantity: '2.0 kg' }
    ]
  }
]

let nextId = 6

// Get all pickups (filtered by role)
router.get('/', authenticate, (req, res) => {
  let filteredPickups = [...pickups]
  
  if (req.user.role === 'staff') {
    // Staff sees only their facility's pickups
    filteredPickups = pickups.filter(p => p.facilityId === req.user.facility_id)
  } else if (req.user.role === 'collector') {
    filteredPickups = pickups.filter(p => 
      p.collectorId === req.user.id || 
      (p.status === 'pending' && p.collectorId === null)
    )
  }
  
  // Sort by priority and date
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
  filteredPickups.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
  
  res.json(filteredPickups)
})

// Get single pickup
router.get('/:id', authenticate, (req, res) => {
  const { id } = req.params
  const pickup = pickups.find(p => p.id === parseInt(id))
  
  if (!pickup) {
    return res.status(404).json({ success: false, message: 'Pickup not found' })
  }
  
  if (req.user.role === 'staff' && pickup.facilityId !== req.user.facility_id) {
    return res.status(403).json({ success: false, message: 'Access denied' })
  }
  
  res.json(pickup)
})

// Create pickup request
router.post('/', authenticate, authorize('staff', 'admin'), (req, res) => {
  const { priority, pickupDate, pickupTime, address, instructions, wasteRecordId } = req.body
  
  if (!priority || !pickupDate || !pickupTime || !address) {
    return res.status(400).json({
      success: false,
      message: 'Priority, date, time, and address are required'
    })
  }
  
  // Get facility name
  let facilityName = 'Your Facility'
  // In a real app, you'd fetch from database
  if (req.user.facility_id === 1) facilityName = 'City Hospital'
  else if (req.user.facility_id === 2) facilityName = 'Apollo Clinic'
  else if (req.user.facility_id === 3) facilityName = 'MediLab Research'
  else if (req.user.facility_id === 4) facilityName = 'Sunrise Hospital'
  else if (req.user.facility_id === 5) facilityName = 'Health Plus Clinic'
  
  const newPickup = {
    id: nextId++,
    facility: facilityName,
    facilityId: req.user.facility_id || 1,
    priority: priority,
    status: 'pending',
    pickupDate: pickupDate,
    pickupTime: pickupTime,
    address: address,
    instructions: instructions || '',
    wasteType: 'Mixed',
    quantity: '0 kg',
    collector: null,
    collectorId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    wasteRecords: []
  }
  
  pickups.push(newPickup)
  
  res.status(201).json({
    success: true,
    message: 'Pickup request created successfully',
    pickup: newPickup
  })
})

// Update pickup status
router.put('/:id/status', authenticate, (req, res) => {
  const { id } = req.params
  const { status } = req.body
  
  const validStatuses = ['pending', 'assigned', 'accepted', 'in_transit', 'collected', 'completed', 'cancelled']
  
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    })
  }
  
  const pickup = pickups.find(p => p.id === parseInt(id))
  
  if (!pickup) {
    return res.status(404).json({ success: false, message: 'Pickup not found' })
  }
  
  // Staff can only update their own pickups
  if (req.user.role === 'staff' && pickup.facilityId !== req.user.facility_id) {
    return res.status(403).json({ success: false, message: 'Access denied' })
  }
  
  pickup.status = status
  pickup.updatedAt = new Date().toISOString()
  
  if (status === 'cancelled' && req.user.role === 'staff') {
    // Staff can cancel pending pickups
  }
  
  res.json({
    success: true,
    message: `Pickup status updated to ${status}`,
    pickup: pickup
  })
})

// Delete pickup (staff can only delete their own pending pickups)
router.delete('/:id', authenticate, (req, res) => {
  const { id } = req.params
  
  const index = pickups.findIndex(p => p.id === parseInt(id))
  
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Pickup not found' })
  }
  
  const pickup = pickups[index]
  
  // Staff can only delete their own pending pickups
  if (req.user.role === 'staff') {
    if (pickup.facilityId !== req.user.facility_id) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }
    if (pickup.status !== 'pending' && pickup.status !== 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete pickup that is already in progress' 
      })
    }
  }
  
  pickups.splice(index, 1)
  
  res.json({
    success: true,
    message: 'Pickup deleted successfully'
  })
})

export default router
