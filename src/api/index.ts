/**
 * 接口层 —— Mock 数据服务（uni storage 持久化）
 * 页面统一通过 api 层访问数据，接后端时只改此文件（签名与真实 REST 接口保持一致）
 */
import { storage } from '@/utils/storage'
import {
  seedCities, seedComments, seedCoupons, seedSaleCars, seedSellRequests,
  seedStores, seedVehicles, seedVipBenefits, seedVipPlans
} from './seed'
import type {
  CityItem, Comment, Coupon, Order, SaleCar, SellRequest, StorePoint, Vehicle, VipBenefit, VipInfo, VipPlan
} from '@/types'

const DB_KEY = 'car_rental_app_db_v2'

interface DB {
  vehicles: Vehicle[]
  orders: Order[]
  stores: StorePoint[]
  coupons: Coupon[]
  saleCars: SaleCar[]
  comments: Comment[]
  sellRequests: SellRequest[]
  vipPlans: VipPlan[]
  cities: CityItem[]
}

function seed(): DB {
  return {
    vehicles: JSON.parse(JSON.stringify(seedVehicles)),
    orders: [
      {
        id: 'CR20250908001', customerName: '张三', customerPhone: '13800138000', vehicleId: 5,
        plateNo: '粤B·6E520', vehicleName: '比亚迪 汉EV', vehicleImage: '', storeId: 2,
        startDate: '2025-09-08 10:00', endDate: '2025-09-11 10:00', days: 3, amount: 714,
        deposit: 714, couponId: 0, status: 'active', createdAt: '2025-09-07 20:15', remark: ''
      },
      {
        id: 'CR20250906003', customerName: '张三', customerPhone: '13800138000', vehicleId: 3,
        plateNo: '粤B·9C301', vehicleName: '本田 思域', vehicleImage: '', storeId: 1,
        startDate: '2025-09-06 14:00', endDate: '2025-09-09 14:00', days: 3, amount: 434,
        deposit: 504, couponId: 1, status: 'paid', createdAt: '2025-09-04 11:20', remark: ''
      },
      {
        id: 'CR20250905004', customerName: '张三', customerPhone: '13800138000', vehicleId: 1,
        plateNo: '粤B·8A120', vehicleName: '丰田 卡罗拉', vehicleImage: '', storeId: 1,
        startDate: '2025-09-05 10:00', endDate: '2025-09-06 10:00', days: 1, amount: 128,
        deposit: 384, couponId: 0, status: 'returned', createdAt: '2025-09-04 18:00', remark: ''
      }
    ],
    stores: JSON.parse(JSON.stringify(seedStores)),
    coupons: JSON.parse(JSON.stringify(seedCoupons)),
    saleCars: JSON.parse(JSON.stringify(seedSaleCars)),
    comments: JSON.parse(JSON.stringify(seedComments)),
    sellRequests: JSON.parse(JSON.stringify(seedSellRequests)),
    vipPlans: JSON.parse(JSON.stringify(seedVipPlans)),
    cities: JSON.parse(JSON.stringify(seedCities))
  }
}

function load(): DB {
  const db = storage.get<DB>(DB_KEY)
  if (db) return db
  const fresh = seed()
  storage.set(DB_KEY, fresh)
  return fresh
}

function save(db: DB) {
  storage.set(DB_KEY, db)
}

/* ===================== 租赁车辆 ===================== */
export interface VehicleQuery {
  keyword?: string
  city?: string
  storeId?: number
  type?: string
  energy?: string
  minPrice?: number
  maxPrice?: number
}

export const vehicleApi = {
  list(query: VehicleQuery = {}): Vehicle[] {
    let list = load().vehicles.filter(v => v.status !== 'offline')
    if (query.keyword) {
      const k = query.keyword.trim()
      list = list.filter(v => `${v.brand}${v.model}`.includes(k))
    }
    if (query.city) {
      const storeIds = load().stores.filter(s => s.city === query.city).map(s => s.id)
      list = list.filter(v => storeIds.includes(v.storeId))
    }
    if (query.storeId) list = list.filter(v => v.storeId === query.storeId)
    if (query.type) list = list.filter(v => v.type === query.type)
    if (query.energy) list = list.filter(v => v.energy === query.energy)
    if (query.minPrice != null) list = list.filter(v => v.pricePerDay >= query.minPrice!)
    if (query.maxPrice != null && query.maxPrice !== Infinity) list = list.filter(v => v.pricePerDay <= query.maxPrice!)
    return list
  },
  detail(id: number): Vehicle | undefined {
    return load().vehicles.find(v => v.id === id)
  },
  setStatus(id: number, status: Vehicle['status']) {
    const db = load()
    const v = db.vehicles.find(x => x.id === id)
    if (v) { v.status = status; save(db) }
  }
}

/* ===================== 租赁订单 ===================== */
export const orderApi = {
  listByPhone(phone: string): Order[] {
    return load().orders
      .filter(o => o.customerPhone === phone)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
  detail(id: string): Order | undefined { return load().orders.find(o => o.id === id) },
  create(order: Order) {
    const db = load()
    db.orders.unshift(order)
    save(db)
  },
  update(id: string, patch: Partial<Order>) {
    const db = load()
    const idx = db.orders.findIndex(o => o.id === id)
    if (idx > -1) { db.orders[idx] = { ...db.orders[idx], ...patch }; save(db) }
  }
}

/* ===================== 二手车 ===================== */
export interface SaleQuery {
  keyword?: string
  city?: string
  brand?: string
  type?: string
  /** 车龄档位 */
  ageRange?: string
  minPrice?: number
  maxPrice?: number
  minMonthly?: number
  maxMonthly?: number
  /** 排序：default | priceAsc | priceDesc | ageAsc | mileageAsc | newest */
  sort?: string
  onlyVipPrivilege?: boolean
}

/** 车龄 → [min, max] 年 */
function ageToRange(age?: string): [number, number] | null {
  switch (age) {
    case '1年内': return [0, 1]
    case '1-3年': return [1, 3]
    case '3-5年': return [3, 5]
    case '5-8年': return [5, 8]
    case '8年以上': return [8, 99]
    default: return null
  }
}

export const saleApi = {
  /** 品牌列表（筛选用） */
  brands(): string[] {
    return Array.from(new Set(load().saleCars.map(c => c.brand)))
  },
  list(query: SaleQuery = {}): SaleCar[] {
    let list = load().saleCars.filter(c => c.status === 'on_sale')
    if (query.keyword) {
      const k = query.keyword.trim()
      list = list.filter(c => `${c.title}${c.brand}${c.series}`.includes(k))
    }
    if (query.city) list = list.filter(c => c.city === query.city)
    if (query.brand) list = list.filter(c => c.brand === query.brand)
    if (query.type) list = list.filter(c => c.type === query.type)
    if (query.minPrice != null) list = list.filter(c => c.price >= query.minPrice!)
    if (query.maxPrice != null && query.maxPrice !== Infinity) list = list.filter(c => c.price <= query.maxPrice!)
    if (query.minMonthly != null) list = list.filter(c => c.monthlyPayment >= query.minMonthly!)
    if (query.maxMonthly != null && query.maxMonthly !== Infinity) list = list.filter(c => c.monthlyPayment <= query.maxMonthly!)
    const ar = ageToRange(query.ageRange)
    if (ar) list = list.filter(c => c.carAge >= ar[0] && c.carAge < ar[1])
    switch (query.sort) {
      case 'priceAsc': list = [...list].sort((a, b) => a.price - b.price); break
      case 'priceDesc': list = [...list].sort((a, b) => b.price - a.price); break
      case 'ageAsc': list = [...list].sort((a, b) => a.carAge - b.carAge); break
      case 'mileageAsc': list = [...list].sort((a, b) => a.mileage - b.mileage); break
      case 'newest': list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break
      default: list = [...list].sort((a, b) => b.views - a.views)
    }
    return list
  },
  detail(id: number): SaleCar | undefined {
    const db = load()
    const car = db.saleCars.find(c => c.id === id)
    if (car) { car.views += 1; save(db) }
    return car
  },
  /** 同城/同类推荐 */
  recommend(id: number, limit = 4): SaleCar[] {
    const all = load().saleCars.filter(c => c.status === 'on_sale' && c.id !== id)
    const cur = load().saleCars.find(c => c.id === id)
    if (!cur) return all.slice(0, limit)
    return all
      .sort((a, b) => {
        const sa = (a.brand === cur.brand ? 0 : 1) + (a.city === cur.city ? 0 : 1)
        const sb = (b.brand === cur.brand ? 0 : 1) + (b.city === cur.city ? 0 : 1)
        return sa - sb
      })
      .slice(0, limit)
  }
}

/* ===================== 卖车订单 ===================== */
export const sellApi = {
  listByPhone(phone: string): SellRequest[] {
    return load().sellRequests
      .filter(s => s.phone === phone)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
  create(req: SellRequest) {
    const db = load()
    db.sellRequests.unshift(req)
    save(db)
  },
  update(id: string, patch: Partial<SellRequest>) {
    const db = load()
    const idx = db.sellRequests.findIndex(s => s.id === id)
    if (idx > -1) { db.sellRequests[idx] = { ...db.sellRequests[idx], ...patch }; save(db) }
  }
}

/* ===================== 评价 ===================== */
export const commentApi = {
  list(targetType: Comment['targetType'], targetId: number): Comment[] {
    return load().comments
      .filter(c => c.targetType === targetType && c.targetId === targetId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
  all(): Comment[] {
    return [...load().comments].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
  add(c: Comment) {
    const db = load()
    db.comments.unshift(c)
    save(db)
  },
  toggleLike(id: number) {
    const db = load()
    const c = db.comments.find(x => x.id === id)
    if (c) { c.liked = !c.liked; c.likes += c.liked ? 1 : -1; save(db) }
    return c
  }
}

/* ===================== 门店 / 城市 ===================== */
export const storeApi = {
  list(city?: string): StorePoint[] {
    const list = load().stores
    return city ? list.filter(s => s.city === city) : list
  },
  detail(id: number): StorePoint | undefined {
    return load().stores.find(s => s.id === id)
  },
  /** 按城市分组统计，用于地图页侧栏 */
  groupByCity(): { city: string; count: number; lng: number; lat: number }[] {
    const map = new Map<string, { city: string; count: number; lng: number; lat: number }>()
    load().stores.forEach(s => {
      const g = map.get(s.city)
      if (g) g.count++
      else map.set(s.city, { city: s.city, count: 1, lng: s.lng, lat: s.lat })
    })
    return Array.from(map.values())
  }
}

export const cityApi = {
  /** 城市搜索：支持中文名 / 首字母 模糊匹配 */
  search(keyword: string): CityItem[] {
    const k = keyword.trim().toUpperCase()
    if (!k) return load().cities
    return load().cities.filter(c => c.name.includes(keyword.trim()) || c.letter === k)
  },
  hot(): CityItem[] { return load().cities.filter(c => c.hot) },
  all(): CityItem[] { return load().cities }
}

/* ===================== VIP ===================== */
const DEFAULT_VIP: VipInfo = {
  level: 'none', expire: '', freeWarrantyTotal: 0, freeWarrantyUsed: 0,
  failCompensation: false, compensateAmount: 0,
  consultantName: '', consultantPhone: '', consultantAvatar: '', points: 0
}

const VIP_PRESET: Record<Exclude<VipInfo['level'], 'none'>, Partial<VipInfo>> = {
  gold: { freeWarrantyTotal: 3, compensateAmount: 10000, failCompensation: true },
  platinum: { freeWarrantyTotal: 6, compensateAmount: 30000, failCompensation: true },
  diamond: { freeWarrantyTotal: 12, compensateAmount: 100000, failCompensation: true }
}

const VIP_KEY = 'car_rental_app_vip_v1'

export const vipApi = {
  plans(): VipPlan[] { return load().vipPlans },
  benefits(): VipBenefit[] { return seedVipBenefits },
  info(): VipInfo {
    return storage.get<VipInfo>(VIP_KEY) ?? { ...DEFAULT_VIP }
  },
  buy(level: Exclude<VipInfo['level'], 'none'>): VipInfo {
    const plan = load().vipPlans.find(p => p.level === level)!
    const d = new Date()
    d.setMonth(d.getMonth() + plan.months)
    const p = (x: number) => String(x).padStart(2, '0')
    const info: VipInfo = {
      level,
      expire: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
      freeWarrantyTotal: VIP_PRESET[level].freeWarrantyTotal ?? 0,
      freeWarrantyUsed: 0,
      failCompensation: true,
      compensateAmount: VIP_PRESET[level].compensateAmount ?? 0,
      consultantName: level === 'diamond' ? '刘建国（资深顾问）' : '王雨欣（高级顾问）',
      consultantPhone: '400-888-6688',
      consultantAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
      points: 1000
    }
    storage.set(VIP_KEY, info)
    return info
  },
  /** 使用一次免费保修 */
  useWarranty(): VipInfo {
    const info = this.info()
    if (info.freeWarrantyUsed < info.freeWarrantyTotal) {
      info.freeWarrantyUsed += 1
      storage.set(VIP_KEY, info)
    }
    return info
  },
  reset() { storage.remove(VIP_KEY) }
}

/* ===================== 优惠券 ===================== */
export const couponApi = {
  list(scope?: Coupon['scope']): Coupon[] {
    const list = load().coupons
    return scope ? list.filter(c => c.scope === scope || c.scope === 'all') : list
  },
  use(id: number) {
    const db = load()
    const c = db.coupons.find(x => x.id === id)
    if (c) { c.used = true; save(db) }
  }
}

/* ===================== 工具 ===================== */
export function resetDB() {
  storage.remove(DB_KEY)
  storage.remove(VIP_KEY)
  load()
}

let seq = 100
export function genOrderId(): string {
  const d = new Date()
  const p = (x: number) => String(x).padStart(2, '0')
  seq++
  return `CR${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${String(seq).padStart(3, '0')}`
}

let sellSeq = 100
export function genSellId(): string {
  const d = new Date()
  const p = (x: number) => String(x).padStart(2, '0')
  sellSeq++
  return `SL${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${String(sellSeq).padStart(3, '0')}`
}

let commentSeq = 1000
export function genCommentId(): number {
  commentSeq++
  return commentSeq
}
