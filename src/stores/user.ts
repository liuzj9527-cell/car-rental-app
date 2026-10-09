import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'
import { vipApi } from '@/api'
import { computed, ref } from 'vue'
import type { VipInfo } from '@/types'

const USER_KEY = 'cr_app_user'

export interface AppUser {
  name: string
  phone: string
  avatar: string
  level: number
  points: number
}

/**
 * 用户全局状态
 * - 登录态
 * - VIP 权益（读取自 api 持久化层）
 * - 收藏/足迹等（可在 store 扩展）
 */
export const useUserStore = defineStore('user', () => {
  const user = ref<AppUser | null>(storage.get<AppUser>(USER_KEY))
  const isLogin = computed(() => !!user.value)
  const vipInfo = computed<VipInfo>(() => vipApi.info())
  const isVip = computed(() => vipInfo.value.level !== 'none')

  function login(phone: string, code: string): string | null {
    if (!/^1\d{10}$/.test(phone)) return '请输入正确的手机号'
    if (code !== '123456') return '验证码错误（演示验证码：123456）'
    user.value = {
      name: '张先生',
      phone,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      level: 3,
      points: 1260
    }
    storage.set(USER_KEY, user.value)
    return null
  }

  function logout() {
    user.value = null
    storage.remove(USER_KEY)
  }

  function buyVip(level: Exclude<VipInfo['level'], 'none'>) {
    vipApi.buy(level)
  }

  function resetVip() {
    vipApi.reset()
  }

  return { user, isLogin, vipInfo, isVip, login, logout, buyVip, resetVip }
})
