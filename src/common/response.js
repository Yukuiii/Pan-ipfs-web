// 定义状态码常量
export const StatusCode = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500
}

// 创建响应对象
export const Response = (code, data = null, message = '') => {
    return {
      code,
      data,
      message,
      timestamp: new Date().toISOString()
    }
  }

// 添加成功响应的快捷方法
Response.success = (data = null, message = '操作成功') => {
  return Response(StatusCode.SUCCESS, data, message)
}

// 添加失败响应的快捷方法
Response.error = (message = '操作失败', data = null) => {
  return Response(StatusCode.INTERNAL_ERROR, data, message)
}

// 添加自定义错误响应方法
Response.customError = (code, message = '操作失败', data = null) => {
  return Response(code, data, message)
}