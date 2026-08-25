export const WASTE_CATEGORIES = [
  { id: 'yellow', label: 'Yellow', description: 'Infectious waste, pathological waste' },
  { id: 'red', label: 'Red', description: 'Contaminated waste (recyclable)' },
  { id: 'white', label: 'White', description: 'Sharps, needles, glass' },
  { id: 'blue', label: 'Blue', description: 'Glassware, plastic, metallic implants' }
]

export const WASTE_UNITS = [
  { id: 'kg', label: 'Kilograms (kg)' },
  { id: 'g', label: 'Grams (g)' },
  { id: 'l', label: 'Liters (L)' },
  { id: 'ml', label: 'Milliliters (ml)' },
  { id: 'units', label: 'Units' }
]

export const PICKUP_PRIORITIES = [
  { id: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { id: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { id: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
]

export const PICKUP_STATUSES = [
  { id: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'assigned', label: 'Assigned', color: 'bg-blue-100 text-blue-800' },
  { id: 'in_transit', label: 'In Transit', color: 'bg-purple-100 text-purple-800' },
  { id: 'collected', label: 'Collected', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
]

export const USER_ROLES = [
  { id: 'admin', label: 'Admin' },
  { id: 'staff', label: 'Hospital Staff' },
  { id: 'collector', label: 'Collection Staff' }
]

export const FACILITY_TYPES = [
  { id: 'hospital', label: 'Hospital' },
  { id: 'clinic', label: 'Clinic' },
  { id: 'lab', label: 'Laboratory' }
]