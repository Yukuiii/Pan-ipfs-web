import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 5000
})

export const login = (data) => {
  return api.post('/auth/login', data)
} 