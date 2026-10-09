/**
 * 高德地图加载器
 * H5 端动态注入 AMap JSAPI；小程序 / App 端请使用原生 <map> 组件
 */
import { AMAP_KEY, AMAP_SECURITY_CODE } from '@/config'

declare const window: any
declare const document: any

let loading: Promise<any> | null = null

/** 是否已配置可用的高德 Key */
export function hasAmapKey(): boolean {
  return typeof AMAP_KEY === 'string' && AMAP_KEY.length >= 16
}

/** 动态加载高德 JSAPI，返回 AMap 命名空间 */
export function loadAMap(): Promise<any> {
  // #ifdef H5
  if (window.AMap) return Promise.resolve(window.AMap)
  if (loading) return loading
  loading = new Promise((resolve, reject) => {
    if (!hasAmapKey()) {
      reject(new Error('NO_KEY'))
      return
    }
    if (AMAP_SECURITY_CODE) {
      window._AMapSecurityConfig = { securityJsCode: AMAP_SECURITY_CODE }
    }
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Scale,AMap.ToolBar,AMap.InfoWindow`
    script.onload = () => {
      if (window.AMap) resolve(window.AMap)
      else reject(new Error('AMAP_LOAD_FAILED'))
    }
    script.onerror = () => {
      loading = null
      reject(new Error('AMAP_SCRIPT_ERROR'))
    }
    document.head.appendChild(script)
  })
  return loading
  // #endif

  // #ifndef H5
  return Promise.reject(new Error('PLATFORM_NOT_SUPPORT'))
  // #endif
}

/** 高德 Key 配置状态：'ready' | 'no-key' | 'error' */
export async function checkAmap(): Promise<'ready' | 'no-key' | 'error'> {
  if (!hasAmapKey()) return 'no-key'
  try {
    await loadAMap()
    return 'ready'
  } catch {
    return 'error'
  }
}
