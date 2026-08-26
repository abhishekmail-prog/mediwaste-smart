import { getDb } from '../config/database.js'

const db = getDb()

// Helper to get random date in last 7 days
const getRandomDate = (daysBack = 7) => {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack))
  return date.toISOString().split('T')[0]
}

// Helper to get random time
const getRandomTime = () => {
  const hours = String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')
  const minutes = String(Math.floor(Math.random() * 60)).padStart(2, '0')
  return `${hours}:${minutes}`
}

// Seed data
const seedDemoData = () => {
  console.log('🌱 Seeding demo waste data...')

  // Waste types with realistic data
  const wasteItems = [
    // Yellow Category - Infectious Waste
    { category: 'yellow', subCategory: '🩸 Blood Bags', quantity: 5.2, unit: 'kg' },
    { category: 'yellow', subCategory: '🧬 Tissue Samples', quantity: 3.8, unit: 'kg' },
    { category: 'yellow', subCategory: '🩹 Bandages & Dressings', quantity: 4.5, unit: 'kg' },
    { category: 'yellow', subCategory: '🧫 Culture Plates', quantity: 2.1, unit: 'kg' },
    { category: 'yellow', subCategory: '🦠 Infectious Waste', quantity: 6.0, unit: 'kg' },
    
    // Red Category - Contaminated Waste
    { category: 'red', subCategory: '💉 IV Tubes & Catheters', quantity: 4.8, unit: 'kg' },
    { category: 'red', subCategory: '🧤 Contaminated Gloves', quantity: 3.2, unit: 'kg' },
    { category: 'red', subCategory: '😷 Used Masks', quantity: 5.5, unit: 'kg' },
    { category: 'red', subCategory: '🧪 Plastic Test Tubes', quantity: 2.5, unit: 'kg' },
    { category: 'red', subCategory: '🩸 Blood Collection Sets', quantity: 1.8, unit: 'kg' },
    
    // White Category - Sharps
    { category: 'white', subCategory: '📌 Used Needles', quantity: 3.5, unit: 'kg' },
    { category: 'white', subCategory: '🔪 Scalpel Blades', quantity: 1.2, unit: 'kg' },
    { category: 'white', subCategory: '🧫 Glass Vials', quantity: 2.8, unit: 'kg' },
    { category: 'white', subCategory: '💊 Ampoules', quantity: 1.5, unit: 'kg' },
    
    // Blue Category - Glass/Metal
    { category: 'blue', subCategory: '🧪 Lab Glassware', quantity: 2.0, unit: 'kg' },
    { category: 'blue', subCategory: '🔬 Microscope Slides', quantity: 0.8, unit: 'kg' },
    { category: 'blue', subCategory: '🦴 Metallic Implants', quantity: 1.0, unit: 'kg' },
    { category: 'blue', subCategory: '🧴 Chemical Bottles', quantity: 1.5, unit: 'kg' }
  ]

  // Insert each waste item
  wasteItems.forEach((item, index) => {
    const date = getRandomDate()
    const time = getRandomTime()
    const facilityId = Math.floor(Math.random() * 5) + 1 // Random facility 1-5
    
    db.run(
      `INSERT INTO waste_records 
       (facility_id, user_id, category, sub_category, quantity, unit, description, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        facilityId,
        2, // user_id 2 (staff)
        item.category,
        item.subCategory,
        item.quantity,
        item.unit,
        `Demo waste record: ${item.subCategory}`,
        ['pending', 'classified', 'pickup_requested', 'completed'][Math.floor(Math.random() * 4)],
        `${date} ${time}:00`
      ],
      function(err) {
        if (err) {
          console.error('Error inserting:', err)
        }
      }
    )
  })

  console.log('✅ Demo data seeded successfully!')
  console.log(`📦 Added ${wasteItems.length} waste records`)
}

seedDemoData()
