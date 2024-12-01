import {
  supabase
} from '@/util/supabaseClient'
import {
  Response
} from '@/common/response'
import axios from 'axios'
import { cache } from '@/util/cache'

// 获取文件列表
// @param {string} userId - 用户ID
// @param {boolean} forceRefresh - 是否强制刷新缓存，默认false
export const getFileList = async (userId, forceRefresh = false) => {
  if (!userId) {
    return Response.error('userId is required');
  }

  // 生成缓存键名
  const cacheKey = `files_${userId}`;
  
  // 检查缓存是否存在且未过期，且不是强制刷新
  const cachedData = cache.get(cacheKey);
  if (!forceRefresh && cachedData) {
    console.log('从缓存获取文件列表');
    return Response.success(cachedData.data);
  }

  // 如果缓存不存在、已过期或强制刷新，从数据库获取
  console.log(forceRefresh ? '强制刷新文件列表' : '从数据库获取文件列表');
  const { data, error } = await supabase.from('file').select('*').eq('user_id', userId);
  if (error) {
    throw error;
  }

  // 存入缓存
  cache.set(cacheKey, data);

  return Response.success(data);
}

// 清除指定用户的文件列表缓存
const clearFileListCache = (userId) => {
  const cacheKey = `files_${userId}`;
  cache.delete(cacheKey);
}

// 上传文件
export const uploadFile = async (file, userId) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    // 上传到IPFS
    const response = await axios.post('https://api.img2ipfs.org/api/v0/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // 检查IPFS响应
    if (!response.data || !response.data.Hash) {
      console.error('IPFS上传响应无效:', response)
      return Response.error('IPFS上传失败')
    }

    const { data } = response
    const fileData = {
      file_name: file.name || data.Name, // 优先使用原始文件名
      file_hash: data.Hash,
      file_size: file.size || data.Size, // 优先使用原始文件大小
      file_url: `https://i0.img2ipfs.com/ipfs/${data.Hash}`
    }

    // 保存到数据库
    try {
      await uploadFileToSupabase(fileData, userId)
      // 清除缓存
      clearFileListCache(userId);
      return Response.success(fileData)
    } catch (error) {
      console.error('数据库保存失败:', error)
      return Response.error('文件信息保存失败')
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    if (error.response) {
      // 服务器响应了错误状态码
      return Response.error(`上传失败: ${error.response.data?.message || error.response.statusText}`)
    } else if (error.request) {
      // 请求已发出但没有收到响应
      return Response.error('上传服务器无响应')
    } else {
      // 请求配置出错
      return Response.error('上传请求配置错误')
    }
  }
}

const uploadFileToSupabase = async (fileData, userId) => {
  try {
    const {
      data,
      error
    } = await supabase.from('file').insert({
        user_id: userId,
      file_name: fileData.file_name,
      file_hash: fileData.file_hash,
      file_size: fileData.file_size,
      file_url: fileData.file_url,
      create_time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    })
      .single()
    if (error) {
      throw error
    }
  } catch (error) {
    console.error(error)
  }
}

// 删除文件
export const deleteFile = async (fileId) => {
  const {
    error
  } = await supabase.from('file').delete().eq('id', fileId)
  if (error) {
    throw error
  }
  // 清除缓存
  const { data } = await supabase.from('file').select('user_id').eq('id', fileId);
  if (data && data.length > 0) {
    clearFileListCache(data[0].user_id);
  }
  return Response.success()
}
