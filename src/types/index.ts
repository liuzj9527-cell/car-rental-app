/**
 * 全局类型定义 —— App 端
 * 与后台管理系统（car-rental-admin）保持字段一致，便于后续接入真实后端
 */

export type EnergyType = '燃油' | '纯电' | '混动'

/* ===================== 租赁业务 ===================== */

export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'offline'
export type OrderStatus = 'pending' | 'paid' | 'active' | 'returned' | 'cancelled'

export interface Vehicle {
  id: number
  plateNo: string
  brand: string
  model: string
  type: '经济型' | '舒适型' | 'SUV' | '豪华型' | '新能源'
  seats: number
  gearbox: '自动' | '手动'
  energy: EnergyType
  pricePerDay: number
  deposit: number
  status: VehicleStatus
  mileage: number
  storeId: number
  year: number
  color: string
  /** 封面图 */
  image: string
  /** 图集 */
  images: string[]
  rating: number
  orders: number
  tags: string[]
}

export interface Order {
  id: string
  customerName: string
  customerPhone: string
  vehicleId: number
  plateNo: string
  vehicleName: string
  vehicleImage: string
  storeId: number
  startDate: string
  endDate: string
  days: number
  amount: number
  deposit: number
  couponId: number
  status: OrderStatus
  createdAt: string
  remark: string
}

/* ===================== 二手车业务 ===================== */

export type SaleCarStatus = 'on_sale' | 'sold' | 'off_shelf' | 'auditing'
export type SaleCarType = '轿车' | 'SUV' | 'MPV' | '跑车' | '新能源' | '皮卡'

/** 分期方案 */
export interface InstallmentPlan {
  /** 期数（月） */
  months: number
  /** 年化利率 % */
  rate: number
  /** 首付比例 0-1 */
  downPaymentRate: number
  /** 首付金额（元） */
  downPayment: number
  /** 月供（元） */
  monthlyPayment: number
  /** 总利息（元） */
  totalInterest: number
}

/** 检测项 */
export interface InspectItem {
  key: string
  label: string
  result: string
  pass: boolean
}

export interface SaleCar {
  id: number
  /** 2021款 宝马3系 325Li M运动套装 */
  title: string
  brand: string
  series: string
  type: SaleCarType
  /** 售价（元） */
  price: number
  /** 新车指导价（元） */
  originalPrice: number
  /** 最低首付（元） */
  downPayment: number
  /** 最低月供（元，36期） */
  monthlyPayment: number
  /** 首次上牌 YYYY-MM */
  firstRegister: string
  /** 车龄（年） */
  carAge: number
  /** 表显里程（km） */
  mileage: number
  displacement: string
  gearbox: string
  energy: EnergyType
  color: string
  city: string
  storeId: number
  images: string[]
  video: string
  tags: string[]
  /** 检测评分 0-100 */
  inspectScore: number
  inspectReport: InspectItem[]
  /** 过户次数 */
  ownerCount: number
  status: SaleCarStatus
  views: number
  createdAt: string
  installments: InstallmentPlan[]
}

/** 卖车（收车）订单状态 */
export type SellStatus =
  | 'submitted'   // 已提交
  | 'evaluating'  // 检测评估中
  | 'quoted'      // 已出价
  | 'appointed'   // 已预约到店
  | 'deal'        // 已成交
  | 'rejected'    // 已驳回
  | 'cancelled'   // 已取消

export interface SellRequest {
  id: string
  name: string
  phone: string
  city: string
  brand: string
  model: string
  year: number
  mileage: number
  /** 期望售价（元） */
  expectPrice: number
  description: string
  images: string[]
  /** 平台评估价（元） */
  quotePrice: number
  status: SellStatus
  storeId: number
  /** 预约到店时间 */
  appointTime: string
  createdAt: string
  remark: string
}

/* ===================== 社区评价 ===================== */

export type VipLevel = 'none' | 'gold' | 'platinum' | 'diamond'

export interface Comment {
  id: number
  targetType: 'sale' | 'rent'
  targetId: number
  userName: string
  userAvatar: string
  vipLevel: VipLevel
  /** 评分 1-5 */
  rating: number
  content: string
  images: string[]
  /** 视频地址（单个） */
  video: string
  likes: number
  liked: boolean
  createdAt: string
  /** 官方/卖家回复 */
  reply: string
}

/* ===================== VIP 会员 ===================== */

export interface VipPlan {
  id: number
  level: Exclude<VipLevel, 'none'>
  name: string
  price: number
  originalPrice: number
  months: number
  tag: string
  benefits: string[]
}

export interface VipBenefit {
  icon: string
  title: string
  desc: string
}

export interface VipInfo {
  level: VipLevel
  /** 到期日 YYYY-MM-DD */
  expire: string
  /** 免费保修总次数 */
  freeWarrantyTotal: number
  /** 已使用次数 */
  freeWarrantyUsed: number
  /** 交易失败必赔 */
  failCompensation: boolean
  /** 最高赔付金额 */
  compensateAmount: number
  consultantName: string
  consultantPhone: string
  consultantAvatar: string
  points: number
}

/* ===================== 门店 / 城市 ===================== */

export interface StorePoint {
  id: number
  name: string
  city: string
  address: string
  phone: string
  businessHours: string
  distance: string
  /** 经度 */
  lng: number
  /** 纬度 */
  lat: number
  /** 业务类型：租车 / 卖车 / 租售一体 */
  type: 'rent' | 'sale' | 'both'
  manager: string
  rating: number
  openDate: string
  vehicleCount: number
  saleCarCount: number
  images: string[]
}

export interface CityItem {
  name: string
  /** 首字母 */
  letter: string
  lng: number
  lat: number
  hot: boolean
}

/* ===================== 优惠券 ===================== */

export interface Coupon {
  id: number
  title: string
  amount: number
  minAmount: number
  expire: string
  used: boolean
  /** 适用范围 */
  scope: 'all' | 'rent' | 'sale' | 'installment'
}

/* ===================== 枚举映射 ===================== */

export const ORDER_STATUS_TEXT: Record<OrderStatus, string> = {
  pending: '待支付',
  paid: '待取车',
  active: '租赁中',
  returned: '已完成',
  cancelled: '已取消'
}

export const SALE_STATUS_TEXT: Record<SaleCarStatus, string> = {
  on_sale: '在售',
  sold: '已售',
  off_shelf: '已下架',
  auditing: '审核中'
}

export const SELL_STATUS_TEXT: Record<SellStatus, string> = {
  submitted: '已提交',
  evaluating: '检测评估中',
  quoted: '已出价',
  appointed: '已预约到店',
  deal: '已成交',
  rejected: '已驳回',
  cancelled: '已取消'
}

export const VIP_LEVEL_TEXT: Record<VipLevel, string> = {
  none: '普通用户',
  gold: '黄金会员',
  platinum: '铂金会员',
  diamond: '钻石会员'
}

export const CAR_TYPE_OPTIONS: SaleCarType[] = ['轿车', 'SUV', 'MPV', '跑车', '新能源', '皮卡']
export const CAR_AGE_OPTIONS = ['1年内', '1-3年', '3-5年', '5-8年', '8年以上']
export const PRICE_RANGES = [
  { label: '5万以下', min: 0, max: 50000 },
  { label: '5-10万', min: 50000, max: 100000 },
  { label: '10-15万', min: 100000, max: 150000 },
  { label: '15-20万', min: 150000, max: 200000 },
  { label: '20-30万', min: 200000, max: 300000 },
  { label: '30万以上', min: 300000, max: Infinity }
]
export const MONTHLY_RANGES = [
  { label: '2000元以下', min: 0, max: 2000 },
  { label: '2000-3000元', min: 2000, max: 3000 },
  { label: '3000-5000元', min: 3000, max: 5000 },
  { label: '5000-8000元', min: 5000, max: 8000 },
  { label: '8000元以上', min: 8000, max: Infinity }
]
