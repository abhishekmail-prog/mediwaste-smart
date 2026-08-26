import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initializeDatabase } from './config/database.js'

import authRoutes from './routes/authRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import wasteRoutes from './routes/wasteRoutes.js'
import pickupRoutes from './routes/pickupRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import seedRoutes from './routes/seedRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

const db = initializeDatabase()

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/waste', wasteRoutes)
app.use('/api/pickups', pickupRoutes)
app.use('/api/waste/classify', aiRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/seed', seedRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MediWaste Smart API is running' })
})

app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MediWaste Smart Server running on port ${PORT}`)
})
