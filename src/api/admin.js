import { supabase } from '@/util/supabaseClient'
import { Response } from '@/common/response'
import { cache } from '@/util/cache'
import bcrypt from 'bcryptjs'
import { ca } from 'element-plus/es/locales.mjs'

// 获取统计数据
export const getStatistics = async (forceRefresh = false) => {
  try {
    // 检查缓存
    const cacheKey = 'admin_statistics';
    const cachedData = cache.get(cacheKey);
    if (!forceRefresh && cachedData) {
      console.log('从缓存获取统计数据');
      return Response.success(cachedData.data);
    }

    // 从数据库获取数据
    console.log(forceRefresh ? '强制刷新统计数据' : '从数据库获取统计数据');
    
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

    const statistics = {
      userCount,
      fileCount,
      totalSize
    };

    // 存入缓存
    cache.set(cacheKey, statistics);

    // 返回统计结果
    return Response.success(statistics);
  } catch (error) {
    return Response.error(error.message)
  }
}

// 获取所有用户
export const getAllUsers = async (forceRefresh = false) => {
  try {
    // 检查缓存
    const cacheKey = 'admin_users';
    const cachedData = cache.get(cacheKey);
    if (!forceRefresh && cachedData) {
      console.log('从缓存获取用户列表');
      return Response.success(cachedData.data);
    }

    console.log(forceRefresh ? '强制刷新用户列表' : '从数据库获取用户列表');
    const { data, error } = await supabase
      .from('user')
      .select('*')
    
    if (error) return Response.error(error.message)

    // 存入缓存
    cache.set(cacheKey, data);
    
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

    // 清除缓存
    cache.delete('admin_users');
    
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
export const getAllFiles = async (forceRefresh = false) => {
  try {
    // 检查缓存
    const cacheKey = 'admin_files';
    const cachedData = cache.get(cacheKey);
    if (!forceRefresh && cachedData) {
      console.log('从缓存获取文件列表');
      return Response.success(cachedData.data);
    }

    console.log(forceRefresh ? '强制刷新文件列表' : '从数据库获取文件列表');
    const { data, error } = await supabase
      .from('file')
      .select('*')


    // 为每个文件获取用户信息
    const filesWithUser = await Promise.all(data.map(async (file) => {
      const user = await getUserById(file.user_id)
      return { ...file,user }
    }))
      
    if (error) return Response.error(error.message)

    // 存入缓存
    cache.set(cacheKey, filesWithUser);
    
    return Response.success(filesWithUser)
  } catch (error) {
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
    // 清除缓存
    cache.delete('admin_files');
    return Response.success(true)
  } catch (error) {
    return Response.error(error.message)
  }
}

// 获取公告列表
export const getAnnouncements = async (forceRefresh = false) => {
  try {
    // 检查缓存
    const cacheKey = 'admin_announcements';
    const cachedData = cache.get(cacheKey);
    if (!forceRefresh && cachedData) {
      console.log('从缓存获取公告列表');
      return Response.success(cachedData.data);
    }

    console.log(forceRefresh ? '强制刷新公告列表' : '从数据库获取公告列表');
    const { data, error } = await supabase
      .from('announcement')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return Response.error(error.message)

    // 存入缓存
    cache.set(cacheKey, data);
    
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
    // 清除缓存
    cache.delete('admin_users');
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