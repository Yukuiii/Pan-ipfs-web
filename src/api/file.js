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
  const formData = new FormData()
  formData.append('file', file)
  const {
    data
  } = await axios.post('https://api.img2ipfs.org/api/v0/add', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  const fileData = {
    file_name: data.Name,
    file_hash: data.Hash,
    file_size: data.Size,
    file_url: `https://i0.img2ipfs.com/ipfs/${data.Hash}`
  }


  await uploadFileToSupabase(fileData, userId)
  return Response.success(fileData)
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
