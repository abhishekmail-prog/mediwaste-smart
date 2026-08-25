import api from './api'

export const createPickup = async (data) => {
  const response = await api.post('/pickups', data)
  return response.data
}

export const getPickups = async () => {
  const response = await api.get('/pickups')
  return response.data
}

export const getPickup = async (id) => {
  const response = await api.get(`/pickups/${id}`)
  return response.data
}

export const updatePickup = async (id, data) => {
  const response = await api.put(`/pickups/${id}`, data)
  return response.data
}

export const updatePickupStatus = async (id, status) => {
  const response = await api.put(`/pickups/${id}/status`, { status })
  return response.data
}

export const assignPickup = async (id, collectorId) => {
  const response = await api.post(`/pickups/${id}/assign`, { collectorId })
  return response.data
}