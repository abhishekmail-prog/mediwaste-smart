import api from './api'

export const createWasteRecord = async (data) => {
  const response = await api.post('/waste', data)
  return response.data
}

export const getWasteRecords = async () => {
  const response = await api.get('/waste')
  return response.data
}

export const getWasteRecord = async (id) => {
  const response = await api.get(`/waste/${id}`)
  return response.data
}

export const updateWasteRecord = async (id, data) => {
  const response = await api.put(`/waste/${id}`, data)
  return response.data
}

export const deleteWasteRecord = async (id) => {
  const response = await api.delete(`/waste/${id}`)
  return response.data
}

export const classifyWaste = async (data) => {
  const response = await api.post('/waste/classify', data)
  return response.data
}