import express from 'express'
import { getDb } from '../config/database.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// In-memory notifications store (simulating database)
let notifications = [
  {
    id: 1,
    userId: 2, // staff
    title: 'New Pickup Request Created',
    message: 'Your pickup request #1245 has been created successfully.',
    type: 'success',
    isRead: false,
    link: '/staff-pickups',
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString() // 2 min ago
  },
  {
    id: 2,
    userId: 2, // staff
    title: 'Pickup Assigned',
    message: 'Ravi Kumar has been assigned to your pickup #1245.',
    type: 'info',
    isRead: false,
    link: '/staff-pickups',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 min ago
  },
  {
    id: 3,
    userId: 2, // staff
    title: 'AI Classification Complete',
    message: 'Waste record #101 has been classified as Yellow with 94% confidence.',
    type: 'success',
    isRead: true,
    link: '/ai-classification',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 min ago
  },
  {
    id: 4,
    userId: 2, // staff
    title: 'Pickup Completed',
    message: 'Pickup #1243 from City Hospital has been completed successfully.',
    type: 'success',
    isRead: true,
    link: '/staff-pickups',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 min ago
  },
  {
    id: 5,
    userId: 2, // staff
    title: 'Action Required: Verification',
    message: 'AI classification requires human confirmation for waste record #105.',
    type: 'warning',
    isRead: false,
    link: '/ai-classification',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 min ago
  },
  {
    id: 6,
    userId: 2, // staff
    title: 'New Waste Record Added',
    message: 'You have added a new waste record for Yellow category (5.2 kg).',
    type: 'info',
    isRead: true,
    link: '/history',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
  },
  {
    id: 7,
    userId: 2, // staff
    title: 'System Update',
    message: 'MediWaste Smart v2.1 has been deployed with new features.',
    type: 'info',
    isRead: true,
    link: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
  },
  {
    id: 8,
    userId: 2, // staff
    title: 'Pickup Delayed',
    message: 'Pickup #1242 has been delayed due to traffic. Estimated arrival: 3:30 PM.',
    type: 'warning',
    isRead: false,
    link: '/staff-pickups',
    createdAt: new Date(Date.now() - 1000 * 60 * 150).toISOString() // 2.5 hours ago
  }
]

let nextId = 9

// Get all notifications for user
router.get('/', authenticate, (req, res) => {
  const userNotifications = notifications
    .filter(n => n.userId === req.user.id || n.userId === 0) // 0 = system notifications
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  
  res.json(userNotifications)
})

// Get unread count
router.get('/unread-count', authenticate, (req, res) => {
  const count = notifications.filter(n => 
    (n.userId === req.user.id || n.userId === 0) && !n.isRead
  ).length
  
  res.json({ count })
})

// Mark notification as read
router.put('/:id/read', authenticate, (req, res) => {
  const { id } = req.params
  const notification = notifications.find(n => n.id === parseInt(id))
  
  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' })
  }
  
  if (notification.userId !== req.user.id && notification.userId !== 0) {
    return res.status(403).json({ success: false, message: 'Access denied' })
  }
  
  notification.isRead = true
  
  res.json({ 
    success: true, 
    message: 'Notification marked as read',
    notification
  })
})

// Mark all as read
router.put('/read-all', authenticate, (req, res) => {
  const userNotifications = notifications.filter(n => 
    n.userId === req.user.id || n.userId === 0
  )
  
  userNotifications.forEach(n => n.isRead = true)
  
  res.json({ 
    success: true, 
    message: `${userNotifications.length} notifications marked as read` 
  })
})

// Delete notification
router.delete('/:id', authenticate, (req, res) => {
  const { id } = req.params
  const index = notifications.findIndex(n => n.id === parseInt(id))
  
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Notification not found' })
  }
  
  const notification = notifications[index]
  
  if (notification.userId !== req.user.id && notification.userId !== 0) {
    return res.status(403).json({ success: false, message: 'Access denied' })
  }
  
  notifications.splice(index, 1)
  
  res.json({ 
    success: true, 
    message: 'Notification deleted' 
  })
})

// Create notification (for internal use)
export const createNotification = (userId, title, message, type = 'info', link = null) => {
  const newNotification = {
    id: nextId++,
    userId: userId,
    title: title,
    message: message,
    type: type,
    isRead: false,
    link: link,
    createdAt: new Date().toISOString()
  }
  
  notifications.push(newNotification)
  return newNotification
}

// Get notification by ID
router.get('/:id', authenticate, (req, res) => {
  const { id } = req.params
  const notification = notifications.find(n => n.id === parseInt(id))
  
  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' })
  }
  
  if (notification.userId !== req.user.id && notification.userId !== 0) {
    return res.status(403).json({ success: false, message: 'Access denied' })
  }
  
  res.json(notification)
})

export default router
