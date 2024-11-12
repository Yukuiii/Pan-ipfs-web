import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 5000
})

// 请求拦截器添加token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = token
  }
  return config
})

// 获取统计数据
export const getStatistics = () => {
  return api.get('/admin/statistics')
}

// 获取用户列表
export const getUserList = () => {
  return api.get('/admin/users')
}

// 删除用户
export const deleteUser = (userId) => {
  return api.delete(`/admin/users/${userId}`)
}

// 获取所有文件
export const getAllFiles = () => {
  return api.get('/admin/files')
}

// 删除文件
export const deleteFile = (fileId) => {
  return api.delete(`/admin/files/${fileId}`)
}

// 获取公告列表
export const getAnnouncements = () => {
  return api.get('/admin/announcements')
}

// 添加公告
export const addAnnouncement = (data) => {
  return api.post('/admin/announcements', data)
}

// 更新公告
export const updateAnnouncement = (id, data) => {
  return api.put(`/admin/announcements/${id}`, data)
}

// 删除公告
export const deleteAnnouncement = (id) => {
  return api.delete(`/admin/announcements/${id}`)
}

// 添加用户
export const addUser = (data) => {
  return api.post('/admin/users', data)
} 