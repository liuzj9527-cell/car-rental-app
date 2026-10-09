/**
 * 请求封装 —— 基于 uni.request，含拦截器、loading、统一错误处理
 * 当前为本地 Mock 模式；接入真实后端时将 USE_MOCK 置为 false 即可
 */
import { storage } from './storage'

const USE_MOCK = true
const BASE_URL = 'https://api.example.com'
const TOKEN_KEY = 'cr_app_token'

interface HttpOptions<T> {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, unknown>
  loading?: boolean
  /** mock 模式下的本地数据源 */
  mock?: () => T
}

export function http<T>(options: HttpOptions<T>): Promise<T> {
  if (USE_MOCK && options.mock) {
    return new Promise(resolve => {
      setTimeout(() => resolve(options.mock!()), 200)
    })
  }

  return new Promise((resolve, reject) => {
    if (options.loading !== false) {
      uni.showLoading({ title: '加载中', mask: true })
    }
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        // 请求拦截器：注入 token
        Authorization: 'Bearer ' + (storage.get<string>(TOKEN_KEY, '') || '')
      },
      success: (res) => {
        // 响应拦截器：统一处理业务码
        const body = res.data as { code: number; data: T; message: string }
        if (body.code === 0) {
          resolve(body.data)
        } else if (body.code === 401) {
          uni.showToast({ title: '请先登录', icon: 'none' })
          uni.navigateTo({ url: '/pages/login/login' })
          reject(body)
        } else {
          uni.showToast({ title: body.message || '请求失败', icon: 'none' })
          reject(body)
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
        reject(err)
      },
      complete: () => {
        if (options.loading !== false) uni.hideLoading()
      }
    })
  })
}
