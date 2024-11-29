import { supabase } from '@/util/supabaseClient'
import { Response } from '@/common/response'
import bcrypt from 'bcryptjs'

// 获取统计数据
export const getStatistics = async () => {
  try {
    // 获取用户总数
    const { count: userCount, error: userError } = await supabase
      .from('user')
      .select('*', { count: 'exact', head: true })

    if (userError) return Response.error(userError.message)

    // 获取文件总数和总大小
    const { data: files, error: fileError } = await supabase
      .from('file')
      .select('file_size')

    if (fileError) return Response.error(fileError.message)

    const fileCount = files.length
    const totalSize = files.reduce((sum, file) => sum + (parseInt(file.file_size) || 0), 0)

    // 返回统计结果
    return Response.success({
      userCount,
      fileCount,
      totalSize
    })
  } catch (error) {
    return Response.error(error.message)
  }
}

// 获取所有用户
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('user')
      .select('*')
    
    if (error) return Response.error(error.message)
    return Response.success(data)
  } catch (error) {
    return Response.error(error.message)
  }
}

// 删除用户
export const deleteUser = async (userId) => {
  if (!userId) return Response.error('userId is required')
  
  try {
    const { error } = await supabase
      .from('user')
      .delete()
      .eq('id', userId)
    
    if (error) return Response.error(error.message)
    return Response.success(true)
  } catch (error) {
    return Response.error(error.message)
  }
}

// 根据用户ID获取用户信息
const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from('user')
    .select('id, username, nickname')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
  return data
}

// 获取所有文件
export const getAllFiles = async () => {
  try {
    const { data: files, error: filesError } = await supabase
      .from('file')
      .select('*')
    
    if (filesError) return Response.error(filesError.message)

    // 为每个文件获取用户信息
    const filesWithUsers = await Promise.all(
      files.map(async (file) => {
        const user = await getUserById(file.user_id)
        return {
          ...file,
          users: user
        }
      })
    )
    
    return Response.success(filesWithUsers)
  } catch (error) {
    console.error('获取文件列表失败:', error)
    return Response.error(error.message)
  }
}

// 删除文件
export const deleteFile = async (fileId) => {
  if (!fileId) return Response.error('fileId is required')

  try {
    const { error } = await supabase
      .from('file')
      .delete()
      .eq('id', fileId)
    
    if (error) return Response.error(error.message)
    return Response.success(true)
  } catch (error) {
    return Response.error(error.message)
  }
}

// 获取公告列表
export const getAnnouncements = async () => {
  try {
    const { data, error } = await supabase
      .from('announcement')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) return Response.error(error.message)
    return Response.success(data)
  } catch (error) {
    return Response.error(error.message)
  }
}

// 添加公告
export const addAnnouncement = async (data) => {
  if (!data) return Response.error('announcement data is required')
  
  try {
    const { error } = await supabase
      .from('announcement')
      .insert([data])
    
    if (error) return Response.error(error.message)
    return Response.success(true)
  } catch (error) {
    return Response.error(error.message)
  }
}

// 更新公告
export const updateAnnouncement = async (id, data) => {
  if (!id) return Response.error('announcement id is required')
  if (!data) return Response.error('announcement data is required')

  try {
    const { error } = await supabase
      .from('announcement')
      .update(data)
      .eq('id', id)
    
    if (error) return Response.error(error.message)
    return Response.success(true)
  } catch (error) {
    return Response.error(error.message)
  }
}

// 删除公告
export const deleteAnnouncement = async (id) => {
  if (!id) return Response.error('announcement id is required')

  try {
    const { error } = await supabase
      .from('announcement')
      .delete()
      .eq('id', id)
    
    if (error) return Response.error(error.message)
    return Response.success(true)
  } catch (error) {
    return Response.error(error.message)
  }
}

// 添加用户
export const addUser = async (data) => {
  if (!data) return Response.error('user data is required')
    
    // 密码加密
    data.password = await bcrypt.hash(data.password, 8)

  try {
    const { error } = await supabase
      .from('user')
      .insert(data)
    
    if (error) return Response.error(error.message)
    return Response.success(true)
  } catch (error) {
    return Response.error(error.message)
  }
}

// 更新用户
export const updateUser = async (id, data) => {
  if (!id || !data) return Response.error('user data is required')
  
  // 如果有新密码，进行加密
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 8)
  } else {
    // 如果没有新密码，删除password字段，避免覆盖原密码
    delete data.password
  }

  try {
    const { error } = await supabase
      .from('user')
      .update(data)
      .eq('id', id)
    
    if (error) return Response.error(error.message)
    return Response.success(true)
  } catch (error) {
    return Response.error(error.message)
  }
}