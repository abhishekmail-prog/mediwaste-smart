import express from 'express'
import { getDb } from '../config/database.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
const db = getDb()

// Get user notifications
router.get('/', authenticate, (req, res) => {
  db.all(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [req.user.id],
    (err, notifications) => {
      if (err) {
        console.error('Get notifications error:', err)
        return res.status(500).json({ success: false, message: 'Database error' })
      }
      res.json(notifications)
    }
  )
})

// Get unread count
router.get('/unread-count', authenticate, (req, res) => {
  db.get(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
    [req.user.id],
    (err, result) => {
      if (err) {
        console.error('Get unread count error:', err)
        return res.status(500).json({ success: false, message: 'Database error' })
      }
      res.json({ count: result?.count || 0 })
    }
  )
})

// Mark notification as read
router.put('/:id/read', authenticate, (req, res) => {
  const { id } = req.params

  db.run(
    'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    function(err) {
      if (err) {
        console.error('Mark as read error:', err)
        return res.status(500).json({ success: false, message: 'Database error' })
      }

      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: 'Notification not found' })
      }

      res.json({ success: true, message: 'Notification marked as read' })
    }
  )
})

// Mark all as read
router.put('/read-all', authenticate, (req, res) => {
  db.run(
    'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
    [req.user.id],
    function(err) {
      if (err) {
        console.error('Mark all as read error:', err)
        return res.status(500).json({ success: false, message: 'Database error' })
      }

      res.json({ success: true, message: `${this.changes} notifications marked as read` })
    }
  )
})

// Delete notification
router.delete('/:id', authenticate, (req, res) => {
  const { id } = req.params

  db.run(
    'DELETE FROM notifications WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    function(err) {
      if (err) {
        console.error('Delete notification error:', err)
        return res.status(500).json({ success: false, message: 'Database error' })
      }

      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: 'Notification not found' })
      }

      res.json({ success: true, message: 'Notification deleted' })
    }
  )
})

export default router