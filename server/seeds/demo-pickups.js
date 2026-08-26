import { getDb } from '../config/database.js'

const db = getDb()

const seedPickups = () => {
  console.log('🌱 Seeding demo pickup data...')

  const facilities = [
    { id: 1, name: 'City Hospital' },
    { id: 2, name: 'Apollo Clinic' },
    { id: 3, name: 'MediLab Research' },
    { id: 4, name: 'Sunrise Hospital' },
    { id: 5, name: 'Health Plus Clinic' }
  ]

  const priorities = ['low', 'medium', 'high', 'urgent']
  const statuses = ['pending', 'assigned', 'in_transit', 'collected', 'completed']

  for (let i = 0; i < 20; i++) {
    const facility = facilities[Math.floor(Math.random() * facilities.length)]
    const priority = priorities[Math.floor(Math.random() * priorities.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 10))
    const dateStr = date.toISOString().split('T')[0]
    const time = `${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`

    db.run(
      `INSERT INTO pickup_requests 
       (facility_id, user_id, priority, status, pickup_date, pickup_time, address, instructions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        facility.id,
        2, // user_id 2 (staff)
        priority,
        status,
        dateStr,
        time,
        `${facility.name}, ${['123 Main St', '456 Oak Ave', '789 Science Blvd', '321 Wellness Rd', '654 Care Ln'][Math.floor(Math.random() * 5)]}, Mumbai`,
        `Pickup request ${i + 1}`
      ],
      function(err) {
        if (err) {
          console.error('Error inserting pickup:', err)
        }
      }
    )
  }

  console.log('✅ Demo pickups seeded successfully!')
  console.log('📦 Added 20 pickup requests')
}

seedPickups()
