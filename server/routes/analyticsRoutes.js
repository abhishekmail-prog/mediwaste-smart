import express from 'express'
import { getDb } from '../config/database.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()
const db = getDb()

router.get('/overview', authenticate, authorize('admin'), (req, res) => {
  // Get total waste
  db.get('SELECT COALESCE(SUM(quantity), 0) as totalWaste FROM waste_records', (err, wasteTotal) => {
    if (err) {
      console.error('Error fetching total waste:', err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }

    // Get total pickups
    db.get('SELECT COUNT(*) as totalPickups FROM pickup_requests', (err, pickupTotal) => {
      if (err) {
        console.error('Error fetching total pickups:', err)
        return res.status(500).json({ success: false, message: 'Database error' })
      }

      // Get completion rate
      db.get(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
         FROM pickup_requests`,
        (err, completionData) => {
          if (err) {
            console.error('Error fetching completion:', err)
            return res.status(500).json({ success: false, message: 'Database error' })
          }

          const completionRate = completionData?.total > 0 
            ? Math.round((completionData.completed / completionData.total) * 100) 
            : 0

          // Get category distribution
          db.all(
            `SELECT category, COUNT(*) as count, SUM(quantity) as total 
             FROM waste_records 
             GROUP BY category`,
            (err, categoryData) => {
              if (err) {
                console.error('Error fetching categories:', err)
                return res.status(500).json({ success: false, message: 'Database error' })
              }

              // Get detailed waste types
              db.all(
                `SELECT 
                  sub_category as name,
                  category,
                  SUM(quantity) as value
                 FROM waste_records 
                 WHERE sub_category IS NOT NULL AND sub_category != ''
                 GROUP BY sub_category, category
                 ORDER BY value DESC`,
                (err, subCategoryData) => {
                  if (err) {
                    console.error('Error fetching sub-categories:', err)
                    return res.status(500).json({ success: false, message: 'Database error' })
                  }

                  // Get timeline data
                  db.all(
                    `SELECT 
                      date(created_at) as date,
                      SUM(quantity) as waste,
                      COUNT(*) as pickups
                     FROM waste_records 
                     WHERE created_at >= date('now', '-7 days')
                     GROUP BY date(created_at)
                     ORDER BY date(created_at)`,
                    (err, timelineData) => {
                      if (err) {
                        console.error('Error fetching timeline:', err)
                        return res.status(500).json({ success: false, message: 'Database error' })
                      }

                      // Get facility data
                      db.all(
                        `SELECT 
                          f.name,
                          COALESCE(SUM(wr.quantity), 0) as waste,
                          COUNT(DISTINCT pr.id) as pickups
                         FROM facilities f
                         LEFT JOIN waste_records wr ON f.id = wr.facility_id
                         LEFT JOIN pickup_requests pr ON f.id = pr.facility_id
                         GROUP BY f.id
                         ORDER BY waste DESC`,
                        (err, facilityData) => {
                          if (err) {
                            console.error('Error fetching facilities:', err)
                            return res.status(500).json({ success: false, message: 'Database error' })
                          }

                          // Build response safely
                          const response = {
                            success: true,
                            overview: {
                              totalWaste: wasteTotal?.totalWaste || 0,
                              totalPickups: pickupTotal?.totalPickups || 0,
                              completionRate: completionRate || 0,
                              avgResponse: 4.2
                            },
                            categoryData: (categoryData || []).map(c => ({
                              name: c.category ? c.category.charAt(0).toUpperCase() + c.category.slice(1) : 'Unknown',
                              value: Math.round(c.total || 0),
                              color: {
                                yellow: '#f59e0b',
                                red: '#ef4444',
                                white: '#9ca3af',
                                blue: '#3b82f6'
                              }[c.category] || '#888888'
                            })),
                            subCategoryData: (subCategoryData || []).map(s => ({
                              name: s.name || s.category || 'Unknown',
                              category: s.category ? s.category.charAt(0).toUpperCase() + s.category.slice(1) : 'Unknown',
                              value: Math.round(s.value || 0),
                              color: {
                                yellow: '#fbbf24',
                                red: '#fca5a5',
                                white: '#d1d5db',
                                blue: '#93c5fd'
                              }[s.category] || '#888888'
                            })),
                            timeline: (timelineData || []).map(t => ({
                              date: t.date || 'N/A',
                              waste: Math.round(t.waste || 0),
                              pickups: t.pickups || 0
                            })),
                            facilities: (facilityData || []).map(f => ({
                              name: f.name || 'Unknown',
                              waste: Math.round(f.waste || 0),
                              pickups: f.pickups || 0
                            })),
                            completion: [
                              { name: 'Completed', value: completionRate || 0, color: '#22c55e' },
                              { name: 'In Progress', value: Math.max(0, 100 - completionRate - 10), color: '#f59e0b' },
                              { name: 'Pending', value: 10, color: '#ef4444' }
                            ]
                          }

                          res.json(response)
                        }
                      )
                    }
                  )
                }
              )
            }
          )
        }
      )
    })
  })
})

export default router
