import {
  supabase
} from '@/util/supabaseClient'
import {
  Response
} from '@/common/response'
import axios from 'axios'

// 获取文件列表
export const getFileList = async (userId) => {
  if (userId) {
    const {
      data,
      error
    } = await supabase.from('file').select('*').eq('user_id', userId)
    if (error) {
      throw error
    }
    return Response.success(data)
  }
  return Response.error('userId is required')
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
  return Response.success()
}
