import {
  supabase
} from '@/util/supabaseClient'
import bcrypt from 'bcryptjs'
import {
  Response
} from '@/common/response'

export const login = async (data) => {
  const {
    username,
    password
  } = data;
  try {
    const {
      data: userData,
      error
    } = await supabase
      .from('user')
      .select('*')
      .eq('username', username)
      .single();

    if (error) return Response.error(error.message);

    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) return Response.error('Invalid password');

    return Response.success(userData);
  } catch (error) {
    return Response.error(error.message);
  }
}

export const register = async (data) => {
  const { username, password, nickname, email } = data;
  
  try {
    // 检查用户名是否已存在
    const { data: existingUser } = await supabase
      .from('user')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      return Response.error('用户名已存在');
    }

    // 检查邮箱是否已存在
    const { data: existingEmail } = await supabase
      .from('user')
      .select('email')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return Response.error('邮箱已被注册');
    }

    // 对密码进行加密
    const hashedPassword = await bcrypt.hash(password, 8);

    // 插入新用户数据
    const { data: newUser, error } = await supabase
      .from('user')
      .insert({
        username,
        password: hashedPassword,
        nickname,
        email,
        role: 'USER',
        create_time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
      })
      .single();

    if (error) {
      return Response.error(error.message);
    }

    // 移除返回数据中的密码字段
    delete newUser.password;
    
    return Response.success(newUser, '注册成功');
  } catch (error) {
    console.error('注册错误:', error);
    return Response.error('注册过程中发生错误');
  }
}