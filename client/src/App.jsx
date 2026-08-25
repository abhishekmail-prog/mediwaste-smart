import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import StaffDashboard from './pages/StaffDashboard'
import AdminDashboard from './pages/AdminDashboard'
import CollectorDashboard from './pages/CollectorDashboard'
import WasteEntry from './pages/WasteEntry'
import AIClassification from './pages/AIClassification'
import Pickups from './pages/Pickups'
import StaffPickups from './pages/StaffPickups'
import History from './pages/History'
import Analytics from './pages/Analytics'
import Notifications from './pages/Notifications'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/staff-dashboard" element={<StaffDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/collector-dashboard" element={<CollectorDashboard />} />
              <Route path="/waste-entry" element={<WasteEntry />} />
              <Route path="/ai-classification" element={<AIClassification />} />
              <Route path="/pickups" element={<Pickups />} />
              <Route path="/staff-pickups" element={<StaffPickups />} />
              <Route path="/history" element={<History />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
