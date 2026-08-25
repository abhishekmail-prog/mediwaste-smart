import api from './api'

export const classifyWaste = async (data) => {
  const response = await api.post('/waste/classify', data)
  return response.data
}

export const getCategories = async () => {
  const response = await api.get('/waste/categories')
  return response.data
}