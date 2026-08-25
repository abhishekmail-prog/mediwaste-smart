import express from 'express'
import { getDb } from '../config/database.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()
const db = getDb()

// Get all pickups (filtered by role)
router.get('/', authenticate, (req, res) => {
  let query = `
    SELECT pr.*, f.name as facility_name, u.name as user_name,
      (SELECT name FROM users WHERE id = pa.collector_id) as collector_name,
      pa.status as assignment_status
    FROM pickup_requests pr
    LEFT JOIN facilities f ON pr.facility_id = f.id
    LEFT JOIN users u ON pr.user_id = u.id
    LEFT JOIN pickup_assignments pa ON pr.id = pa.pickup_request_id
  `
  const params = []

  // Filter by role
  if (req.user.role === 'staff') {
    query += ' WHERE pr.facility_id = ?'
    params.push(req.user.facility_id)
  } else if (req.user.role === 'collector') {
    query += ' WHERE pa.collector_id = ? OR pr.status = "pending"'
    params.push(req.user.id)
  }

  query += ' ORDER BY pr.priority = "urgent" DESC, pr.priority = "high" DESC, pr.created_at DESC'

  db.all(query, params, (err, pickups) => {
    if (err) {
      console.error('Get pickups error:', err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }
    res.json(pickups)
  })
})

// Get single pickup
router.get('/:id', authenticate, (req, res) => {
  const { id } = req.params

  db.get(
    `SELECT pr.*, f.name as facility_name, u.name as user_name,
      (SELECT name FROM users WHERE id = pa.collector_id) as collector_name,
      pa.status as assignment_status, pa.notes as assignment_notes
     FROM pickup_requests pr
     LEFT JOIN facilities f ON pr.facility_id = f.id
     LEFT JOIN users u ON pr.user_id = u.id
     LEFT JOIN pickup_assignments pa ON pr.id = pa.pickup_request_id
     WHERE pr.id = ?`,
    [id],
    (err, pickup) => {
      if (err) {
        console.error('Get pickup error:', err)
        return res.status(500).json({ success: false, message: 'Database error' })
      }

      if (!pickup) {
        return res.status(404).json({ success: false, message: 'Pickup not found' })
      }

      // Check permissions
      if (req.user.role === 'staff' && req.user.facility_id !== pickup.facility_id) {
        return res.status(403).json({ success: false, message: 'Access denied' })
      }

      res.json(pickup)
    }
  )
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

  const facilityId = req.user.role === 'staff' ? req.user.facility_id : req.body.facility_id

  if (!facilityId) {
    return res.status(400).json({
      success: false,
      message: 'Facility ID is required'
    })
  }

  db.run(
    `INSERT INTO pickup_requests 
     (facility_id, user_id, waste_record_id, priority, status, pickup_date, pickup_time, address, instructions)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [facilityId, req.user.id, wasteRecordId || null, priority, 'pending', pickupDate, pickupTime, address, instructions || null],
    function(err) {
      if (err) {
        console.error('Create pickup error:', err)
        return res.status(500).json({ success: false, message: 'Database error' })
      }

      const pickupId = this.lastID

      // Create notification for admin
      db.run(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [1, 'New Pickup Request', `Pickup request #${pickupId} created from facility ID ${facilityId}`, 'info']
      )

      res.status(201).json({
        success: true,
        message: 'Pickup request created successfully',
        pickup: { id: pickupId }
      })
    }
  )
})

// Update pickup
router.put('/:id', authenticate, (req, res) => {
  const { id } = req.params
  const updates = req.body

  const fields = []
  const values = []

  const allowedFields = ['priority', 'status', 'pickup_date', 'pickup_time', 'address', 'instructions']
  
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      fields.push(`${field} = ?`)
      values.push(updates[field])
    }
  }

  if (fields.length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update' })
  }

  fields.push('updated_at = CURRENT_TIMESTAMP')
  values.push(id)

  const query = `UPDATE pickup_requests SET ${fields.join(', ')} WHERE id = ?`

  db.run(query, values, function(err) {
    if (err) {
      console.error('Update pickup error:', err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }

    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Pickup not found' })
    }

    res.json({ success: true, message: 'Pickup updated successfully' })
  })
})

// Update pickup status
router.put('/:id/status', authenticate, (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (!status || !['pending', 'assigned', 'in_transit', 'collected', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    })
  }

  db.run(
    'UPDATE pickup_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, id],
    function(err) {
      if (err) {
        console.error('Update pickup status error:', err)
        return res.status(500).json({ success: false, message: 'Database error' })
      }

      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: 'Pickup not found' })
      }

      // Create notification
      db.run(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [req.user.id, 'Pickup Status Updated', `Pickup #${id} status changed to ${status}`, 'info']
      )

      res.json({ success: true, message: 'Pickup status updated successfully' })
    }
  )
})

// Assign collector to pickup
router.post('/:id/assign', authenticate, authorize('admin', 'collector'), (req, res) => {
  const { id } = req.params
  const { collectorId } = req.body

  const assignedBy = req.user.id
  const collector = req.user.role === 'collector' ? req.user.id : collectorId

  if (!collector) {
    return res.status(400).json({
      success: false,
      message: 'Collector ID is required'
    })
  }

  // Check if pickup exists
  db.get('SELECT * FROM pickup_requests WHERE id = ?', [id], (err, pickup) => {
    if (err) {
      console.error('Get pickup error:', err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }

    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup not found' })
    }

    // Check if already assigned
    db.get(
      'SELECT * FROM pickup_assignments WHERE pickup_request_id = ?',
      [id],
      (err, existing) => {
        if (err) {
          console.error('Check assignment error:', err)
          return res.status(500).json({ success: false, message: 'Database error' })
        }

        if (existing) {
          return res.status(400).json({ success: false, message: 'Pickup already assigned' })
        }

        // Create assignment
        db.run(
          `INSERT INTO pickup_assignments 
           (pickup_request_id, collector_id, assigned_by, status)
           VALUES (?, ?, ?, ?)`,
          [id, collector, assignedBy, 'assigned'],
          function(err) {
            if (err) {
              console.error('Assign pickup error:', err)
              return res.status(500).json({ success: false, message: 'Database error' })
            }

            // Update pickup status
            db.run(
              'UPDATE pickup_requests SET status = "assigned", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
              [id]
            )

            // Create notification for collector
            db.run(
              'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
              [collector, 'New Pickup Assignment', `You have been assigned pickup #${id}`, 'info']
            )

            res.json({
              success: true,
              message: 'Pickup assigned successfully',
              assignment: { id: this.lastID }
            })
          }
        )
      }
    )
  })
})

export default router