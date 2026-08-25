import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieChartIcon,
  Calendar,
  Download,
  Filter,
  Activity,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  FileJson,
  Printer
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import api from '../services/api'
import Papa from 'papaparse'
import { saveAs } from 'file-saver'

const Analytics = () => {
  const [loading, setLoading] = useState(true)
  const [categoryData, setCategoryData] = useState([])
  const [timelineData, setTimelineData] = useState([])
  const [completionData, setCompletionData] = useState([])
  const [facilityData, setFacilityData] = useState([])
  const [overview, setOverview] = useState({
    totalWaste: 0,
    totalPickups: 0,
    completionRate: 0,
    avgResponse: 0
  })
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [exporting, setExporting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await api.get('/analytics/overview')
      const data = response.data
      
      setOverview(data.overview || {
        totalWaste: 0,
        totalPickups: 0,
        completionRate: 0,
        avgResponse: 0
      })
      
      setCategoryData(data.categoryData || [
        { name: 'Yellow', value: 40 },
        { name: 'Red', value: 30 },
        { name: 'White', value: 20 },
        { name: 'Blue', value: 10 }
      ])
      
      setTimelineData(data.timeline || [
        { date: 'Aug 20', waste: 45, pickups: 12 },
        { date: 'Aug 21', waste: 52, pickups: 15 },
        { date: 'Aug 22', waste: 38, pickups: 10 },
        { date: 'Aug 23', waste: 61, pickups: 18 },
        { date: 'Aug 24', waste: 48, pickups: 14 },
        { date: 'Aug 25', waste: 55, pickups: 16 },
        { date: 'Aug 26', waste: 42, pickups: 11 }
      ])
      
      setCompletionData(data.completion || [
        { name: 'Completed', value: 65 },
        { name: 'In Progress', value: 25 },
        { name: 'Pending', value: 10 }
      ])
      
      setFacilityData(data.facilities || [
        { name: 'City Hospital', waste: 320, pickups: 28 },
        { name: 'Apollo Clinic', waste: 185, pickups: 16 },
        { name: 'MediLab', waste: 145, pickups: 12 },
        { name: 'Sunrise Hospital', waste: 210, pickups: 19 },
        { name: 'Health Plus', waste: 95, pickups: 8 }
      ])
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
      // Set demo data
      setOverview({
        totalWaste: 1560.5,
        totalPickups: 124,
        completionRate: 82,
        avgResponse: 4.2
      })
    } finally {
      setLoading(false)
    }
  }

  // Export to CSV
  const exportToCSV = () => {
    setExporting(true)
    setShowExportMenu(false)
    
    try {
      // Prepare data for export
      const exportData = []
      
      // Add overview
      exportData.push({ 
        'Report Type': 'Overview',
        'Metric': 'Total Waste (kg)',
        'Value': overview.totalWaste,
        'Date': new Date().toLocaleDateString()
      })
      exportData.push({ 
        'Report Type': 'Overview',
        'Metric': 'Total Pickups',
        'Value': overview.totalPickups,
        'Date': new Date().toLocaleDateString()
      })
      exportData.push({ 
        'Report Type': 'Overview',
        'Metric': 'Completion Rate (%)',
        'Value': overview.completionRate,
        'Date': new Date().toLocaleDateString()
      })
      exportData.push({ 
        'Report Type': 'Overview',
        'Metric': 'Avg Response Time (hrs)',
        'Value': overview.avgResponse,
        'Date': new Date().toLocaleDateString()
      })
      
      // Add category data
      categoryData.forEach(item => {
        exportData.push({
          'Report Type': 'Category Distribution',
          'Metric': item.name,
          'Value': item.value,
          'Date': new Date().toLocaleDateString()
        })
      })
      
      // Add timeline data
      timelineData.forEach(item => {
        exportData.push({
          'Report Type': 'Timeline',
          'Metric': item.date,
          'Waste (kg)': item.waste,
          'Pickups': item.pickups,
          'Date': new Date().toLocaleDateString()
        })
      })
      
      // Add facility data
      facilityData.forEach(item => {
        exportData.push({
          'Report Type': 'Facility-wise',
          'Metric': item.name,
          'Waste (kg)': item.waste,
          'Pickups': item.pickups,
          'Date': new Date().toLocaleDateString()
        })
      })
      
      // Add completion data
      completionData.forEach(item => {
        exportData.push({
          'Report Type': 'Completion Status',
          'Metric': item.name,
          'Value': item.value,
          'Date': new Date().toLocaleDateString()
        })
      })

      // Convert to CSV
      const csv = Papa.unparse(exportData)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      saveAs(blob, `mediwaste-analytics-${new Date().toISOString().split('T')[0]}.csv`)
      
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  // Export to JSON
  const exportToJSON = () => {
    setExporting(true)
    setShowExportMenu(false)
    
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        overview: overview,
        categories: categoryData,
        timeline: timelineData,
        facilities: facilityData,
        completion: completionData
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      })
      saveAs(blob, `mediwaste-analytics-${new Date().toISOString().split('T')[0]}.json`)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  // Print report
  const printReport = () => {
    window.print()
  }

  const COLORS = ['#3a8c3a', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6']
  const COMPLETION_COLORS = ['#22c55e', '#f59e0b', '#ef4444']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="print:bg-white print:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="text-primary-500" />
            Analytics & Insights
          </h1>
          <p className="text-gray-500 mt-1">Comprehensive analytics for medical waste management</p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={exporting}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Export
                </>
              )}
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={exportToCSV}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                >
                  <FileSpreadsheet size={16} className="text-green-600" />
                  Export as CSV (Excel)
                </button>
                <button
                  onClick={exportToJSON}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                >
                  <FileJson size={16} className="text-blue-600" />
                  Export as JSON
                </button>
                <button
                  onClick={printReport}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm border-t border-gray-100"
                >
                  <Printer size={16} className="text-gray-600" />
                  Print Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Waste</p>
              <p className="text-2xl font-bold text-gray-800">{overview.totalWaste} kg</p>
              <p className="text-xs text-green-600 mt-1">↑ 12% from last month</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Package size={24} className="text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Pickups</p>
              <p className="text-2xl font-bold text-gray-800">{overview.totalPickups}</p>
              <p className="text-xs text-green-600 mt-1">↑ 8% from last month</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Truck size={24} className="text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completion Rate</p>
              <p className="text-2xl font-bold text-green-600">{overview.completionRate}%</p>
              <p className="text-xs text-green-600 mt-1">↑ 5% from last month</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <CheckCircle size={24} className="text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Response Time</p>
              <p className="text-2xl font-bold text-blue-600">{overview.avgResponse} hrs</p>
              <p className="text-xs text-green-600 mt-1">↑ Faster by 1.2 hrs</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Activity size={24} className="text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Waste by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pickup Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pickup Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COMPLETION_COLORS[index % COMPLETION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Waste Collection Timeline</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="waste" stroke="#3a8c3a" fill="#3a8c3a" fillOpacity={0.3} name="Waste (kg)" />
                <Area type="monotone" dataKey="pickups" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Pickups" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Facility-wise */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Facility-wise Waste Generation</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facilityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="waste" fill="#3a8c3a" name="Waste (kg)" />
                <Bar dataKey="pickups" fill="#3b82f6" name="Pickups" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart - Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={[
                { metric: 'Efficiency', value: 85 },
                { metric: 'Compliance', value: 92 },
                { metric: 'Speed', value: 78 },
                { metric: 'Accuracy', value: 88 },
                { metric: 'Safety', value: 95 },
                { metric: 'Satisfaction', value: 82 }
              ]}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar name="Performance" dataKey="value" stroke="#3a8c3a" fill="#3a8c3a" fillOpacity={0.6} />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
