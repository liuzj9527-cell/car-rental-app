/**
 * uni-app 存储封装（跨端统一，替代直接操作 localStorage）
 */

export const storage = {
  get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const val = uni.getStorageSync(key)
      return (val === '' || val === null || val === undefined) ? defaultValue : (val as T)
    } catch {
      return defaultValue
    }
  },
  set(key: string, value: unknown) {
    try {
      uni.setStorageSync(key, value)
    } catch {
      console.error('storage set failed:', key)
    }
  },
  remove(key: string) {
    try {
      uni.removeStorageSync(key)
    } catch {
      console.error('storage remove failed:', key)
    }
  }
}
