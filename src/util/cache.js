// 默认缓存过期时间：5分钟
const DEFAULT_CACHE_EXPIRATION = 5 * 60 * 1000;

// 缓存操作封装
export const cache = {
  // 获取缓存数据
  get(key) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const { data, timestamp } = JSON.parse(item);
      // 检查是否过期
      if (Date.now() - timestamp < DEFAULT_CACHE_EXPIRATION) {
        return { data, timestamp };
      }
      // 过期则删除缓存
      localStorage.removeItem(key);
      return null;
    } catch (error) {
      console.error('读取缓存出错:', error);
      return null;
    }
  },

  // 设置缓存数据
  set(key, data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('写入缓存出错:', error);
    }
  },

  // 删除缓存
  delete(key) {
    localStorage.removeItem(key);
  },

  // 清除指定前缀的所有缓存
  clearByPrefix(prefix) {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('清除缓存出错:', error);
    }
  }
};
