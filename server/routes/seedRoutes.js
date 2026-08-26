import express from 'express'
import { getDb } from '../config/database.js'

const router = express.Router()
const db = getDb()

// Seed demo data
router.get('/', (req, res) => {
  const wasteItems = [
    { category: 'yellow', subCategory: '🩸 Blood Bags', quantity: 5.2 },
    { category: 'yellow', subCategory: '🧬 Tissue Samples', quantity: 3.8 },
    { category: 'yellow', subCategory: '🩹 Bandages & Dressings', quantity: 4.5 },
    { category: 'yellow', subCategory: '🧫 Culture Plates', quantity: 2.1 },
    { category: 'red', subCategory: '💉 IV Tubes & Catheters', quantity: 4.8 },
    { category: 'red', subCategory: '🧤 Contaminated Gloves', quantity: 3.2 },
    { category: 'red', subCategory: '😷 Used Masks', quantity: 5.5 },
    { category: 'white', subCategory: '📌 Used Needles', quantity: 3.5 },
    { category: 'white', subCategory: '🔪 Scalpel Blades', quantity: 1.2 },
    { category: 'white', subCategory: '🧫 Glass Vials', quantity: 2.8 },
    { category: 'blue', subCategory: '🧪 Lab Glassware', quantity: 2.0 },
    { category: 'blue', subCategory: '🦴 Metallic Implants', quantity: 1.0 }
  ]

  let inserted = 0
  let errors = 0

  wasteItems.forEach((item) => {
    db.run(
      `INSERT INTO waste_records 
       (facility_id, user_id, category, sub_category, quantity, unit, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [1, 2, item.category, item.subCategory, item.quantity, 'kg', 'completed'],
      function(err) {
        if (err) {
          errors++
          console.error('Error inserting:', err)
        } else {
          inserted++
        }
      }
    )
  })

  setTimeout(() => {
    res.json({ 
      success: true, 
      message: `Seeded ${inserted} waste records (${errors} errors)`
    })
  }, 2000)
})

export default router
