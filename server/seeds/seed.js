import { getDb } from '../config/database.js'
import bcrypt from 'bcryptjs'

const db = getDb()

const seedData = async () => {
  console.log('🌱 Seeding database...')

  const hashPassword = (password) => {
    return bcrypt.hashSync(password, 10)
  }

  // Clear existing data
  db.run('DELETE FROM notifications')
  db.run('DELETE FROM pickup_assignments')
  db.run('DELETE FROM pickup_requests')
  db.run('DELETE FROM waste_records')
  db.run('DELETE FROM users')
  db.run('DELETE FROM facilities')
  db.run("DELETE FROM sqlite_sequence WHERE name IN ('users', 'facilities', 'waste_records', 'pickup_requests', 'pickup_assignments', 'notifications')")

  // Insert facilities
  const facilities = [
    ['City Hospital', 'hospital', '123 Main Street', 'Mumbai', 'Maharashtra', '400001', '+91-9876543210', 'city@hospital.com'],
    ['Apollo Clinic', 'clinic', '456 Oak Avenue', 'Mumbai', 'Maharashtra', '400002', '+91-9876543211', 'apollo@clinic.com'],
    ['MediLab Research', 'lab', '789 Science Boulevard', 'Mumbai', 'Maharashtra', '400003', '+91-9876543212', 'medilab@research.com'],
    ['Sunrise Hospital', 'hospital', '321 Wellness Road', 'Mumbai', 'Maharashtra', '400004', '+91-9876543213', 'sunrise@hospital.com'],
    ['Health Plus Clinic', 'clinic', '654 Care Lane', 'Mumbai', 'Maharashtra', '400005', '+91-9876543214', 'healthplus@clinic.com']
  ]

  const facilityIds = []
  for (const facility of facilities) {
    const stmt = db.prepare('INSERT INTO facilities (name, type, address, city, state, pincode, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    const result = stmt.run(facility)
    facilityIds.push(result.lastInsertRowid)
    stmt.finalize()
  }

  // Insert users with proper password hashing
  const users = [
    ['Admin', 'admin@mediwaste.com', hashPassword('admin123'), 'admin', null, '+91-9876543200'],
    ['Dr. Sharma', 'hospital@mediwaste.com', hashPassword('hospital123'), 'staff', facilityIds[0], '+91-9876543201'],
    ['Ravi Kumar', 'collector@mediwaste.com', hashPassword('collector123'), 'collector', null, '+91-9876543202'],
    ['Dr. Mehta', 'staff2@mediwaste.com', hashPassword('staff123'), 'staff', facilityIds[1], '+91-9876543203']
  ]

  const userIds = []
  for (const user of users) {
    const stmt = db.prepare('INSERT INTO users (name, email, password, role, facility_id, phone) VALUES (?, ?, ?, ?, ?, ?)')
    const result = stmt.run(user)
    userIds.push(result.lastInsertRowid)
    stmt.finalize()
  }

  // Insert waste records
  const wasteRecords = [
    [facilityIds[0], userIds[1], 'yellow', 'Used syringes', 5.2, 'kg', 'Mixed used syringes and needles', null, null, null, null, 'completed'],
    [facilityIds[0], userIds[1], 'red', 'Blood bags', 12, 'units', 'Expired blood bags', null, null, null, null, 'pickup_requested'],
    [facilityIds[1], userIds[3], 'white', 'Needles', 8.5, 'kg', 'Used needles and sharps', null, null, null, null, 'classified'],
    [facilityIds[2], userIds[1], 'blue', 'Glass vials', 3.2, 'kg', 'Empty glass vials', null, null, null, null, 'pending'],
    [facilityIds[3], userIds[1], 'yellow', 'Pathological waste', 15.0, 'kg', 'Tissue samples and pathological waste', null, null, null, null, 'completed']
  ]

  const wasteIds = []
  for (const waste of wasteRecords) {
    const stmt = db.prepare(`INSERT INTO waste_records 
      (facility_id, user_id, category, sub_category, quantity, unit, description, image_url, ai_prediction, ai_confidence, ai_instructions, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    const result = stmt.run(waste)
    wasteIds.push(result.lastInsertRowid)
    stmt.finalize()
  }

  // Insert pickup requests
  const pickupRequests = [
    [facilityIds[0], userIds[1], wasteIds[0], 'high', 'assigned', '2026-08-26', '10:00 AM', '123 Main Street, Mumbai', 'Handle with care'],
    [facilityIds[0], userIds[1], wasteIds[1], 'medium', 'in_transit', '2026-08-26', '02:30 PM', '123 Main Street, Mumbai', ''],
    [facilityIds[1], userIds[3], null, 'urgent', 'pending', '2026-08-25', '09:00 AM', '456 Oak Avenue, Mumbai', 'Urgent pickup required'],
    [facilityIds[3], userIds[1], wasteIds[4], 'low', 'completed', '2026-08-24', '11:30 AM', '321 Wellness Road, Mumbai', '']
  ]

  const pickupIds = []
  for (const pickup of pickupRequests) {
    const stmt = db.prepare(`INSERT INTO pickup_requests 
      (facility_id, user_id, waste_record_id, priority, status, pickup_date, pickup_time, address, instructions) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    const result = stmt.run(pickup)
    pickupIds.push(result.lastInsertRowid)
    stmt.finalize()
  }

  // Insert pickup assignments
  const assignments = [
    [pickupIds[0], userIds[2], userIds[0], 'accepted', 'Assigned to Ravi Kumar', null, '2026-08-26T08:00:00', null, null],
    [pickupIds[1], userIds[2], userIds[0], 'in_transit', 'Ravi is on the way', null, '2026-08-26T08:30:00', null, null],
    [pickupIds[3], userIds[2], userIds[0], 'completed', 'Completed successfully', null, '2026-08-24T10:00:00', '2026-08-24T11:30:00', '2026-08-24T12:00:00']
  ]

  for (const assignment of assignments) {
    const stmt = db.prepare(`INSERT INTO pickup_assignments 
      (pickup_request_id, collector_id, assigned_by, status, notes, assigned_at, accepted_at, collected_at, completed_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    stmt.run(assignment)
    stmt.finalize()
  }

  // Insert notifications
  const notifications = [
    [userIds[2], 'New Pickup Assignment', 'You have been assigned a pickup from City Hospital.', 'info', 0, null],
    [userIds[1], 'Pickup Created', 'Your pickup request has been created successfully.', 'success', 0, null],
    [userIds[0], 'New Facility Registered', 'Health Plus Clinic has been registered on the platform.', 'info', 1, null],
    [userIds[2], 'Pickup Status Update', 'Pickup from Apollo Clinic is now in transit.', 'info', 1, null],
    [userIds[1], 'AI Classification Alert', 'AI classification requires human confirmation for sample #1245.', 'warning', 0, null],
    [userIds[0], 'Pickup Completed', 'Pickup from Sunrise Hospital has been completed.', 'success', 1, null],
    [userIds[2], 'New Pickup Assignment', 'You have been assigned an urgent pickup from MediLab Research.', 'warning', 0, null]
  ]

  for (const notification of notifications) {
    const stmt = db.prepare('INSERT INTO notifications (user_id, title, message, type, is_read, link) VALUES (?, ?, ?, ?, ?, ?)')
    stmt.run(notification)
    stmt.finalize()
  }

  console.log('✅ Database seeded successfully!')
  console.log(`👤 Created ${users.length} users`)
  console.log(`🏥 Created ${facilities.length} facilities`)
  console.log(`📦 Created ${wasteRecords.length} waste records`)
  console.log(`🚛 Created ${pickupRequests.length} pickup requests`)
  console.log(`🔔 Created ${notifications.length} notifications`)
}

// Run seed
seedData().catch(console.error).finally(() => {
  process.exit(0)
})
