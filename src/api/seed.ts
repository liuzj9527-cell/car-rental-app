/**
 * Mock 种子数据 —— App 端
 * 接后端时整个文件可直接删除，仅保留 api/index.ts 的接口签名
 */
import type {
  CityItem, Comment, Coupon, InstallmentPlan, SaleCar, SellRequest, StorePoint, Vehicle, VipBenefit, VipPlan
} from '@/types'

/* ---------- 真实车型图片池（Unsplash，加载失败时组件自动降级为品牌占位图） ---------- */
const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`

const IMG = {
  sedanWhite: u('1555215695-3004980ad54e'),
  sedanBlue: u('1552519507-da3b142c6e3d'),
  suvBlack: u('1533473359331-0135ef1b58bf'),
  suvWhite: u('1568605117036-5fe5e7bab0b7'),
  sportRed: u('1494976388531-d1058494cdd8'),
  sportYellow: u('1503376780353-7e6692767b70'),
  ev1: u('1560958089-b8a1929cea89'),
  ev2: u('1571607388263-1044f9ea01dd'),
  mpv: u('1541899481282-d53bffe3c35d'),
  generic1: u('1583121274602-3e2820c69888'),
  generic2: u('1550355291-bbee04a92027'),
  generic3: u('1544636331-e26879cd4d9b'),
  generic4: u('1502877338535-766e1452684a'),
  interior1: u('1449965408869-eaa3f722e40d'),
  interior2: u('1493238792000-8113da705763'),
  detail1: u('1549317661-bd32c8ce0db2'),
  detail2: u('1553440569-bcc63803a83d')
}

const V = {
  sample1: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  sample2: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  sample3: 'https://www.w3schools.com/html/mov_bbb.mp4'
}

/* ---------- 分期方案生成 ---------- */
function plans(price: number): InstallmentPlan[] {
  const cfg = [
    { months: 12, rate: 3.5, downPaymentRate: 0.5 },
    { months: 24, rate: 4.5, downPaymentRate: 0.4 },
    { months: 36, rate: 5.5, downPaymentRate: 0.3 },
    { months: 48, rate: 6.0, downPaymentRate: 0.3 },
    { months: 60, rate: 6.5, downPaymentRate: 0.2 }
  ]
  return cfg.map(c => {
    const downPayment = Math.round(price * c.downPaymentRate)
    const loan = price - downPayment
    const totalInterest = Math.round(loan * (c.rate / 100) * (c.months / 12))
    const monthlyPayment = Math.round((loan + totalInterest) / c.months)
    return { ...c, downPayment, monthlyPayment, totalInterest }
  })
}

/* ---------- 检测报告 ---------- */
function report(base: number) {
  const items = [
    { key: 'body', label: '车身骨架', pass: base > 80 },
    { key: 'engine', label: '发动机', pass: base > 75 },
    { key: 'gearbox', label: '变速箱', pass: base > 75 },
    { key: 'paint', label: '漆面', pass: base > 70 },
    { key: 'water', label: '泡水检测', pass: base > 78 },
    { key: 'fire', label: '火烧检测', pass: base > 78 },
    { key: 'electric', label: '电子系统', pass: base > 72 }
  ]
  return items.map(i => ({ ...i, result: i.pass ? '正常' : '轻微瑕疵' }))
}

/* ===================== 门店（含经纬度，用于高德地图打点） ===================== */
export const seedStores: StorePoint[] = [
  { id: 1, name: '深圳南山旗舰店', city: '深圳', address: '南山区深南大道9988号驭驰汽车广场', phone: '0755-86001111', businessHours: '08:30-21:30', distance: '1.2km', lng: 113.9305, lat: 22.5333, type: 'both', manager: '李经理', rating: 4.9, openDate: '2019-03-12', vehicleCount: 86, saleCarCount: 42, images: [IMG.generic1, IMG.interior1] },
  { id: 2, name: '深圳福田CBD店', city: '深圳', address: '福田区福华三路卓越世纪中心1楼', phone: '0755-86002222', businessHours: '08:30-21:30', distance: '5.8km', lng: 114.0577, lat: 22.5395, type: 'rent', manager: '王经理', rating: 4.8, openDate: '2020-06-01', vehicleCount: 64, saleCarCount: 0, images: [IMG.generic2] },
  { id: 3, name: '深圳宝安机场店', city: '深圳', address: '宝安区国际机场T3航站楼交通枢纽B1', phone: '0755-86003333', businessHours: '24小时', distance: '23.5km', lng: 113.8142, lat: 22.6273, type: 'rent', manager: '陈经理', rating: 4.7, openDate: '2018-11-20', vehicleCount: 120, saleCarCount: 0, images: [IMG.generic3] },
  { id: 4, name: '广州天河中心店', city: '广州', address: '天河区华夏路富力盈凯大厦首层', phone: '020-38001111', businessHours: '08:30-21:30', distance: '102km', lng: 113.3235, lat: 23.1193, type: 'both', manager: '刘经理', rating: 4.8, openDate: '2019-09-08', vehicleCount: 72, saleCarCount: 36, images: [IMG.generic4] },
  { id: 5, name: '北京朝阳大悦城店', city: '北京', address: '朝阳区朝阳北路101号大悦城B1', phone: '010-58001111', businessHours: '09:00-21:00', distance: '', lng: 116.5186, lat: 39.9242, type: 'both', manager: '赵经理', rating: 4.9, openDate: '2018-05-18', vehicleCount: 96, saleCarCount: 58, images: [IMG.generic1] },
  { id: 6, name: '北京亦庄旗舰店', city: '北京', address: '大兴区亦庄经济技术开发区科创十四街', phone: '010-58002222', businessHours: '08:30-20:30', distance: '', lng: 116.5065, lat: 39.7956, type: 'sale', manager: '孙经理', rating: 4.8, openDate: '2021-04-02', vehicleCount: 0, saleCarCount: 88, images: [IMG.generic2] },
  { id: 7, name: '上海浦东陆家嘴店', city: '上海', address: '浦东新区世纪大道100号环球金融中心B2', phone: '021-68001111', businessHours: '09:00-21:00', distance: '', lng: 121.5057, lat: 31.2397, type: 'both', manager: '周经理', rating: 4.9, openDate: '2018-08-28', vehicleCount: 88, saleCarCount: 46, images: [IMG.generic3] },
  { id: 8, name: '上海闵行交付中心', city: '上海', address: '闵行区申北路8号驭驰交付中心', phone: '021-68002222', businessHours: '08:30-20:30', distance: '', lng: 121.3811, lat: 31.1085, type: 'sale', manager: '吴经理', rating: 4.7, openDate: '2020-12-16', vehicleCount: 0, saleCarCount: 76, images: [IMG.generic4] },
  { id: 9, name: '杭州西湖文化广场店', city: '杭州', address: '拱墅区西湖文化广场19号', phone: '0571-88001111', businessHours: '09:00-21:00', distance: '', lng: 120.1695, lat: 30.2849, type: 'both', manager: '郑经理', rating: 4.8, openDate: '2019-06-22', vehicleCount: 58, saleCarCount: 30, images: [IMG.generic1] },
  { id: 10, name: '成都高新天府店', city: '成都', address: '高新区天府大道中段500号', phone: '028-86001111', businessHours: '09:00-21:00', distance: '', lng: 104.0665, lat: 30.5721, type: 'both', manager: '冯经理', rating: 4.8, openDate: '2019-10-30', vehicleCount: 62, saleCarCount: 28, images: [IMG.generic2] },
  { id: 11, name: '武汉光谷店', city: '武汉', address: '洪山区珞喻路726号光谷广场', phone: '027-87001111', businessHours: '09:00-21:00', distance: '', lng: 114.3611, lat: 30.5074, type: 'rent', manager: '何经理', rating: 4.7, openDate: '2020-03-15', vehicleCount: 54, saleCarCount: 0, images: [IMG.generic3] },
  { id: 12, name: '西安高新店', city: '西安', address: '雁塔区高新路25号世纪金花', phone: '029-88001111', businessHours: '09:00-21:00', distance: '', lng: 108.9402, lat: 34.3416, type: 'both', manager: '许经理', rating: 4.7, openDate: '2020-07-09', vehicleCount: 48, saleCarCount: 22, images: [IMG.generic4] },
  { id: 13, name: '南京新街口店', city: '南京', address: '秦淮区中山南路1号德基广场B1', phone: '025-88001111', businessHours: '09:00-21:00', distance: '', lng: 118.7789, lat: 32.0431, type: 'rent', manager: '曹经理', rating: 4.8, openDate: '2019-12-01', vehicleCount: 52, saleCarCount: 0, images: [IMG.generic1] },
  { id: 14, name: '重庆观音桥店', city: '重庆', address: '江北区建新北路8号北城天街', phone: '023-88001111', businessHours: '09:00-21:00', distance: '', lng: 106.5489, lat: 29.5739, type: 'both', manager: '邓经理', rating: 4.7, openDate: '2020-09-18', vehicleCount: 44, saleCarCount: 26, images: [IMG.generic2] },
  { id: 15, name: '天津滨海店', city: '天津', address: '滨海新区第二大街御景华庭', phone: '022-88001111', businessHours: '09:00-20:30', distance: '', lng: 117.7000, lat: 39.0300, type: 'sale', manager: '袁经理', rating: 4.6, openDate: '2021-05-20', vehicleCount: 0, saleCarCount: 40, images: [IMG.generic3] },
  { id: 16, name: '长沙五一广场店', city: '长沙', address: '芙蓉区五一大道328号平和堂', phone: '0731-88001111', businessHours: '09:00-21:00', distance: '', lng: 112.9388, lat: 28.2282, type: 'rent', manager: '曾经理', rating: 4.7, openDate: '2020-11-11', vehicleCount: 46, saleCarCount: 0, images: [IMG.generic4] },
  { id: 17, name: '青岛万象城店', city: '青岛', address: '市南区山东路6号甲万象城B1', phone: '0532-88001111', businessHours: '09:00-21:00', distance: '', lng: 120.3824, lat: 36.0665, type: 'both', manager: '宋经理', rating: 4.8, openDate: '2020-01-08', vehicleCount: 40, saleCarCount: 18, images: [IMG.generic1] },
  { id: 18, name: '苏州工业园店', city: '苏州', address: '工业园区苏州大道东288号圆融时代广场', phone: '0512-88001111', businessHours: '09:00-21:00', distance: '', lng: 120.7253, lat: 31.3166, type: 'sale', manager: '沈经理', rating: 4.7, openDate: '2021-08-06', vehicleCount: 0, saleCarCount: 34, images: [IMG.generic2] },
  { id: 19, name: '厦门思明店', city: '厦门', address: '思明区湖滨南路299号SM城市广场', phone: '0592-88001111', businessHours: '09:00-21:00', distance: '', lng: 118.1052, lat: 24.4798, type: 'rent', manager: '方经理', rating: 4.7, openDate: '2020-05-28', vehicleCount: 38, saleCarCount: 0, images: [IMG.generic3] },
  { id: 20, name: '昆明南屏街店', city: '昆明', address: '五华区南屏街88号', phone: '0871-88001111', businessHours: '09:00-20:30', distance: '', lng: 102.8329, lat: 24.8801, type: 'both', manager: '段经理', rating: 4.6, openDate: '2021-03-10', vehicleCount: 32, saleCarCount: 16, images: [IMG.generic4] }
]

/* ===================== 城市（用于城市搜索） ===================== */
const cityRaw: [string, string, number, number, boolean][] = [
  ['北京', 'B', 116.4074, 39.9042, true],
  ['上海', 'S', 121.4737, 31.2304, true],
  ['广州', 'G', 113.2644, 23.1291, true],
  ['深圳', 'S', 114.0579, 22.5431, true],
  ['杭州', 'H', 120.1551, 30.2741, true],
  ['成都', 'C', 104.0665, 30.5723, true],
  ['武汉', 'W', 114.3055, 30.5928, true],
  ['西安', 'X', 108.9398, 34.3416, true],
  ['南京', 'N', 118.7969, 32.0603, true],
  ['重庆', 'C', 106.5516, 29.5630, true],
  ['天津', 'T', 117.2010, 39.0842, false],
  ['长沙', 'C', 112.9388, 28.2282, false],
  ['郑州', 'Z', 113.6254, 34.7466, false],
  ['青岛', 'Q', 120.3826, 36.0671, false],
  ['苏州', 'S', 120.5853, 31.2989, false],
  ['厦门', 'X', 118.0894, 24.4798, false],
  ['福州', 'F', 119.2965, 26.0745, false],
  ['昆明', 'K', 102.8329, 24.8801, false],
  ['大连', 'D', 121.6147, 38.9140, false],
  ['宁波', 'N', 121.5440, 29.8683, false],
  ['合肥', 'H', 117.2272, 31.8206, false],
  ['济南', 'J', 117.1205, 36.6510, false],
  ['沈阳', 'S', 123.4315, 41.8057, false],
  ['哈尔滨', 'H', 126.5350, 45.8038, false],
  ['石家庄', 'S', 114.5149, 38.0428, false],
  ['南昌', 'N', 115.8581, 28.6820, false],
  ['贵阳', 'G', 106.6302, 26.6477, false],
  ['南宁', 'N', 108.3669, 22.8170, false],
  ['无锡', 'W', 120.3119, 31.4912, false],
  ['佛山', 'F', 113.1220, 23.0288, false]
]
export const seedCities: CityItem[] = cityRaw.map(([name, letter, lng, lat, hot]) => ({ name, letter, lng, lat, hot }))

/* ===================== 租赁车辆 ===================== */
const rv = (
  id: number, plateNo: string, brand: string, model: string, type: Vehicle['type'],
  seats: number, energy: Vehicle['energy'], pricePerDay: number, storeId: number,
  rating: number, orders: number, tags: string[], images: string[],
  status: Vehicle['status'] = 'available', year = 2023, mileage = 15000, color = '白色'
): Vehicle => ({
  id, plateNo, brand, model, type, seats, gearbox: '自动', energy, pricePerDay,
  deposit: pricePerDay * 3, status, mileage, storeId, year, color,
  image: images[0], images, rating, orders, tags
})

export const seedVehicles: Vehicle[] = [
  rv(1, '粤B·8A120', '丰田', '卡罗拉', '经济型', 5, '燃油', 128, 1, 4.8, 356, ['经济实惠', '省油耐用'], [IMG.generic4, IMG.interior1, IMG.detail1]),
  rv(2, '粤B·8B235', '大众', '朗逸', '经济型', 5, '燃油', 118, 1, 4.7, 289, ['热门车型'], [IMG.generic3, IMG.interior2], 'rented', 2021, 45800, '银色'),
  rv(3, '粤B·9C301', '本田', '思域', '舒适型', 5, '燃油', 168, 1, 4.9, 512, ['动力好', '年轻潮流'], [IMG.sedanBlue, IMG.interior1, IMG.detail2]),
  rv(4, '粤B·7D456', '特斯拉', 'Model 3', '新能源', 5, '纯电', 268, 2, 4.9, 668, ['免押金', '自动驾驶'], [IMG.ev1, IMG.interior2, IMG.detail1]),
  rv(5, '粤B·6E520', '比亚迪', '汉EV', '新能源', 5, '纯电', 238, 2, 4.8, 445, ['长续航'], [IMG.ev2, IMG.interior1], 'rented', 2024, 5200, '蓝色'),
  rv(6, '粤B·5F610', '丰田', '汉兰达', 'SUV', 7, '混动', 328, 2, 4.9, 398, ['7座大空间', '家庭出游'], [IMG.suvWhite, IMG.interior1, IMG.detail1]),
  rv(7, '粤B·4G702', '宝马', 'X3', '豪华型', 5, '燃油', 588, 3, 5.0, 176, ['豪华体验', '四驱'], [IMG.suvBlack, IMG.interior2, IMG.detail2]),
  rv(8, '粤B·3H818', '奔驰', 'E300L', '豪华型', 5, '燃油', 528, 3, 4.9, 203, ['商务首选'], [IMG.sedanWhite, IMG.interior1], 'rented', 2023, 21000, '黑色'),
  rv(9, '粤B·2K905', '奥迪', 'A4L', '舒适型', 5, '燃油', 298, 3, 4.8, 334, ['品牌保障'], [IMG.sedanWhite, IMG.detail1]),
  rv(10, '粤A·1M103', '五菱', '宏光MINIEV', '新能源', 4, '纯电', 68, 4, 4.6, 890, ['超值代步', '新手友好'], [IMG.ev2, IMG.generic2]),
  rv(11, '粤A·6N220', '别克', 'GL8', '舒适型', 7, '燃油', 388, 4, 4.9, 267, ['商务接待', '7座'], [IMG.mpv, IMG.interior1]),
  rv(12, '粤A·9P317', '蔚来', 'ES6', 'SUV', 5, '纯电', 348, 4, 4.9, 189, ['换电无忧', '智能座舱'], [IMG.suvWhite, IMG.ev1], 'offline', 2024, 4500, '蓝色')
]

/* ===================== 二手车车源 ===================== */
interface SaleSeed {
  id: number; title: string; brand: string; series: string; type: SaleCar['type']
  price: number; originalPrice: number; firstRegister: string; carAge: number; mileage: number
  displacement: string; energy: SaleCar['energy']; color: string; city: string; storeId: number
  images: string[]; video: string; tags: string[]; score: number; ownerCount: number
  status?: SaleCar['status']; views?: number
}

const saleSeed: SaleSeed[] = [
  { id: 1, title: '2021款 宝马3系 325Li M运动套装', brand: '宝马', series: '3系', type: '轿车', price: 228000, originalPrice: 359900, firstRegister: '2021-06', carAge: 4, mileage: 42600, displacement: '2.0T', energy: '燃油', color: '白色', city: '深圳', storeId: 1, images: [IMG.sedanWhite, IMG.interior1, IMG.detail1, IMG.generic1], video: V.sample1, tags: ['严选车', '7天可退', '无事故'], score: 92, ownerCount: 1, views: 3820 },
  { id: 2, title: '2022款 特斯拉 Model 3 后轮驱动版', brand: '特斯拉', series: 'Model 3', type: '新能源', price: 189000, originalPrice: 279900, firstRegister: '2022-03', carAge: 3, mileage: 31800, displacement: '纯电', energy: '纯电', color: '白色', city: '深圳', storeId: 1, images: [IMG.ev1, IMG.interior2, IMG.detail2], video: V.sample2, tags: ['电池质保', '免购置税'], score: 95, ownerCount: 1, views: 5240 },
  { id: 3, title: '2020款 奔驰C级 C260L 运动版', brand: '奔驰', series: 'C级', type: '轿车', price: 215000, originalPrice: 356800, firstRegister: '2020-09', carAge: 5, mileage: 61200, displacement: '1.5T', energy: '燃油', color: '黑色', city: '广州', storeId: 4, images: [IMG.sedanWhite, IMG.interior1, IMG.detail1], video: V.sample3, tags: ['严选车', '原版原漆'], score: 88, ownerCount: 2, views: 2960 },
  { id: 4, title: '2021款 奥迪A4L 40 TFSI 时尚动感型', brand: '奥迪', series: 'A4L', type: '轿车', price: 203000, originalPrice: 321800, firstRegister: '2021-04', carAge: 4, mileage: 48800, displacement: '2.0T', energy: '燃油', color: '灰色', city: '北京', storeId: 5, images: [IMG.sedanBlue, IMG.interior2, IMG.detail2], video: V.sample1, tags: ['7天可退'], score: 90, ownerCount: 1, views: 3410 },
  { id: 5, title: '2020款 本田CR-V 240TURBO 两驱都市版', brand: '本田', series: 'CR-V', type: 'SUV', price: 146000, originalPrice: 212800, firstRegister: '2020-11', carAge: 5, mileage: 72400, displacement: '1.5T', energy: '燃油', color: '白色', city: '上海', storeId: 7, images: [IMG.suvWhite, IMG.interior1, IMG.detail1], video: V.sample2, tags: ['保值率高', '无事故'], score: 86, ownerCount: 2, views: 2680 },
  { id: 6, title: '2021款 丰田汉兰达 2.0T 四驱豪华版', brand: '丰田', series: '汉兰达', type: 'SUV', price: 238000, originalPrice: 315800, firstRegister: '2021-08', carAge: 4, mileage: 55300, displacement: '2.0T', energy: '燃油', color: '黑色', city: '杭州', storeId: 9, images: [IMG.suvBlack, IMG.interior2, IMG.detail1], video: V.sample3, tags: ['7座', '家庭首选'], score: 91, ownerCount: 1, views: 3120 },
  { id: 7, title: '2019款 大众迈腾 330TSI DSG 豪华型', brand: '大众', series: '迈腾', type: '轿车', price: 128000, originalPrice: 236800, firstRegister: '2019-10', carAge: 6, mileage: 88600, displacement: '2.0T', energy: '燃油', color: '银色', city: '成都', storeId: 10, images: [IMG.generic3, IMG.interior1, IMG.detail2], video: V.sample1, tags: ['价格实惠'], score: 82, ownerCount: 2, views: 2140 },
  { id: 8, title: '2022款 比亚迪汉EV 尊贵型', brand: '比亚迪', series: '汉', type: '新能源', price: 165000, originalPrice: 245800, firstRegister: '2022-05', carAge: 3, mileage: 28600, displacement: '纯电', energy: '纯电', color: '蓝色', city: '深圳', storeId: 1, images: [IMG.ev2, IMG.interior2, IMG.detail1], video: V.sample2, tags: ['刀片电池', '免购置税', '7天可退'], score: 94, ownerCount: 1, views: 4680 },
  { id: 9, title: '2020款 保时捷 Macan 2.0T', brand: '保时捷', series: 'Macan', type: 'SUV', price: 458000, originalPrice: 588000, firstRegister: '2020-07', carAge: 5, mileage: 39500, displacement: '2.0T', energy: '燃油', color: '白色', city: '上海', storeId: 8, images: [IMG.sportYellow, IMG.interior2, IMG.detail2], video: V.sample3, tags: ['豪华品牌', '原版原漆', '严选车'], score: 93, ownerCount: 1, views: 6820 },
  { id: 10, title: '2019款 福特Mustang 2.3T 敞篷版', brand: '福特', series: 'Mustang', type: '跑车', price: 269000, originalPrice: 429800, firstRegister: '2019-06', carAge: 6, mileage: 44800, displacement: '2.3T', energy: '燃油', color: '红色', city: '北京', storeId: 6, images: [IMG.sportRed, IMG.interior1, IMG.detail1], video: V.sample1, tags: ['性能跑车', '改装潜力'], score: 87, ownerCount: 2, views: 4100 },
  { id: 11, title: '2021款 别克GL8 ES陆尊 653T 尊享型', brand: '别克', series: 'GL8', type: 'MPV', price: 256000, originalPrice: 349900, firstRegister: '2021-03', carAge: 4, mileage: 47600, displacement: '2.0T', energy: '燃油', color: '黑色', city: '深圳', storeId: 1, images: [IMG.mpv, IMG.interior2, IMG.detail2], video: V.sample2, tags: ['商务接待', '7座'], score: 89, ownerCount: 1, views: 2870 },
  { id: 12, title: '2020款 丰田卡罗拉 1.2T S-CVT', brand: '丰田', series: '卡罗拉', type: '轿车', price: 89000, originalPrice: 139800, firstRegister: '2020-08', carAge: 5, mileage: 78600, displacement: '1.2T', energy: '燃油', color: '白色', city: '广州', storeId: 4, images: [IMG.generic4, IMG.interior1, IMG.detail1], video: V.sample3, tags: ['省油耐用', '新手友好'], score: 84, ownerCount: 2, views: 3560 },
  { id: 13, title: '2021款 宝马X3 xDrive30i 领先型', brand: '宝马', series: 'X3', type: 'SUV', price: 286000, originalPrice: 429800, firstRegister: '2021-09', carAge: 4, mileage: 36800, displacement: '2.0T', energy: '燃油', color: '黑色', city: '深圳', storeId: 1, images: [IMG.suvBlack, IMG.interior2, IMG.detail2], video: V.sample1, tags: ['四驱', '严选车', '无事故'], score: 94, ownerCount: 1, views: 4460 },
  { id: 14, title: '2021款 蔚来ES6 运动版 75kWh', brand: '蔚来', series: 'ES6', type: '新能源', price: 223000, originalPrice: 358000, firstRegister: '2021-12', carAge: 4, mileage: 52100, displacement: '纯电', energy: '纯电', color: '蓝色', city: '杭州', storeId: 9, images: [IMG.ev1, IMG.interior1, IMG.detail1], video: V.sample2, tags: ['换电无忧', '电池租赁'], score: 90, ownerCount: 1, views: 3980 },
  { id: 15, title: '2021款 日产轩逸 经典 1.6XL 舒适版', brand: '日产', series: '轩逸', type: '轿车', price: 78000, originalPrice: 119800, firstRegister: '2021-05', carAge: 4, mileage: 69200, displacement: '1.6L', energy: '燃油', color: '银色', city: '成都', storeId: 10, images: [IMG.generic1, IMG.interior2, IMG.detail2], video: V.sample3, tags: ['大空间', '超值代步'], score: 83, ownerCount: 2, views: 2340 },
  { id: 16, title: '2021款 理想ONE 增程6座版', brand: '理想', series: '理想ONE', type: 'SUV', price: 198000, originalPrice: 328000, firstRegister: '2021-07', carAge: 4, mileage: 61800, displacement: '增程式', energy: '混动', color: '灰色', city: '北京', storeId: 5, images: [IMG.suvWhite, IMG.interior1, IMG.detail1], video: V.sample1, tags: ['6座', '增程无焦虑'], score: 88, ownerCount: 1, views: 3120 }
]

export const seedSaleCars: SaleCar[] = saleSeed.map(s => {
  const ps = plans(s.price)
  return {
    ...s,
    downPayment: ps[2].downPayment,
    monthlyPayment: ps[2].monthlyPayment,
    gearbox: s.energy === '纯电' ? '单速变速箱' : '自动',
    inspectScore: s.score,
    inspectReport: report(s.score),
    status: s.status ?? 'on_sale',
    createdAt: `${s.firstRegister}-15 10:20`,
    views: s.views ?? 1000,
    installments: ps
  }
})

/* ===================== 卖车订单 ===================== */
export const seedSellRequests: SellRequest[] = [
  { id: 'SL20250908001', name: '陈先生', phone: '13800138000', city: '深圳', brand: '本田', model: '雅阁 2019款 260TURBO', year: 2019, mileage: 68000, expectPrice: 135000, description: '个人一手车，无事故，按时保养，四轮新胎', images: [IMG.generic4, IMG.interior1], quotePrice: 128000, status: 'quoted', storeId: 1, appointTime: '2025-09-12 10:00', createdAt: '2025-09-08 09:20', remark: '' },
  { id: 'SL20250905002', name: '陈先生', phone: '13800138000', city: '深圳', brand: '大众', model: '途观L 2020款 330TSI', year: 2020, mileage: 52000, expectPrice: 158000, description: '车况良好，内饰九成新', images: [IMG.suvWhite], quotePrice: 0, status: 'evaluating', storeId: 1, appointTime: '', createdAt: '2025-09-05 15:40', remark: '' }
]

/* ===================== 社区评价 ===================== */
export const seedComments: Comment[] = [
  { id: 1, targetType: 'sale', targetId: 1, userName: '深圳-老李', userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', vipLevel: 'platinum', rating: 5, content: '车况跟检测报告完全一致，无事故无泡水。销售顾问全程陪同看车，还帮我申请了分期，首付6.8万提车，手续一天办完，非常省心。', images: [IMG.detail1, IMG.interior1], video: '', likes: 128, liked: false, createdAt: '2025-08-28 14:32', reply: '感谢您的信任，祝您用车愉快！' },
  { id: 2, targetType: 'sale', targetId: 1, userName: '爱车一族', userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80', vipLevel: 'gold', rating: 5, content: '特意从东莞过来看车，实车比图片还好看，漆面很亮。VIP 会员送的3次免费保修很实用，专业买家顾问帮我砍了8000块，值！', images: [IMG.detail2], video: '', likes: 86, liked: true, createdAt: '2025-08-20 19:05', reply: '' },
  { id: 3, targetType: 'sale', targetId: 1, userName: '匿名用户', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', vipLevel: 'none', rating: 4, content: '整体不错，就是提车当天排队等了一会儿。车没问题，动力很充沛。', images: [], video: '', likes: 24, liked: false, createdAt: '2025-08-12 11:18', reply: '感谢反馈，我们会优化交付流程～' },
  { id: 4, targetType: 'sale', targetId: 2, userName: '电车爱好者', userAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80', vipLevel: 'diamond', rating: 5, content: '电池健康度还有94%，续航实测420公里，完全够用。平台提供了完整电池检测报告，很专业。', images: [IMG.ev1], video: '', likes: 210, liked: false, createdAt: '2025-08-30 09:44', reply: '' },
  { id: 5, targetType: 'sale', targetId: 2, userName: '小张同学', userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', vipLevel: 'none', rating: 5, content: '第一次在平台买二手车，全程有买家顾问陪着，交易失败必赔的保障让我很放心。推荐！', images: [], video: V.sample2, likes: 56, liked: false, createdAt: '2025-08-18 16:22', reply: '' },
  { id: 6, targetType: 'sale', targetId: 9, userName: '低调的老板', userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80', vipLevel: 'platinum', rating: 5, content: 'Macan 车况非常好，原版原漆，里程真实。平台交付中心环境很好，像4S店一样。', images: [IMG.interior2, IMG.detail2], video: '', likes: 93, liked: false, createdAt: '2025-08-25 20:11', reply: '' },
  { id: 7, targetType: 'rent', targetId: 4, userName: '出差党', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', vipLevel: 'none', rating: 5, content: 'Model 3 很新很干净，取车快，还车也省事，机场店24小时营业很方便。', images: [IMG.ev1], video: '', likes: 41, liked: false, createdAt: '2025-08-14 08:30', reply: '' },
  { id: 8, targetType: 'rent', targetId: 6, userName: '一家人出游', userAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80', vipLevel: 'gold', rating: 5, content: '汉兰达七座空间够大，一家六口出行毫无压力，油耗比想象中低。', images: [IMG.suvWhite], video: '', likes: 67, liked: false, createdAt: '2025-07-30 13:50', reply: '' }
]

/* ===================== VIP 方案与权益 ===================== */
export const seedVipPlans: VipPlan[] = [
  { id: 1, level: 'gold', name: '黄金会员', price: 199, originalPrice: 399, months: 12, tag: '入门首选', benefits: ['免费保修 3 次', '专业买家顾问 1 对 1', '交易失败必赔（最高 1 万）', '购车立减 500 元', '专属客服通道'] },
  { id: 2, level: 'platinum', name: '铂金会员', price: 499, originalPrice: 899, months: 12, tag: '最受欢迎', benefits: ['免费保修 6 次', '专业买家顾问 1 对 1', '交易失败必赔（最高 3 万）', '购车立减 2000 元', '免费上门取送车 2 次', '专属客服通道'] },
  { id: 3, level: 'diamond', name: '钻石会员', price: 999, originalPrice: 1999, months: 12, tag: '尊享顶配', benefits: ['免费保修 12 次', '资深买家顾问 1 对 1', '交易失败必赔（最高 10 万）', '购车立减 5000 元', '免费上门取送车不限次', '免费全车检测 2 次', '专属客服通道 + 优先提车'] }
]

export const seedVipBenefits: VipBenefit[] = [
  { icon: '🛡️', title: '免费保修', desc: '会员期内享发动机、变速箱等核心部件免费保修，黄金 3 次 / 铂金 6 次 / 钻石 12 次' },
  { icon: '👔', title: '专业买家顾问', desc: '1 对 1 资深顾问全程陪同看车、议价、验车、过户，帮你把好每一道关' },
  { icon: '💰', title: '交易失败必赔', desc: '因平台原因导致交易失败，按会员等级获赔，最高赔付 10 万元' },
  { icon: '🏷️', title: '购车立减', desc: '成交即可抵扣车款，黄金 500 / 铂金 2000 / 钻石 5000 元' },
  { icon: '🚗', title: '上门取送车', desc: '铂金及以上会员享免费上门取送车服务，足不出户完成车务' },
  { icon: '🔧', title: '免费全车检测', desc: '钻石会员赠 258 项深度检测，出具权威车况报告' }
]

/* ===================== 优惠券 ===================== */
export const seedCoupons: Coupon[] = [
  { id: 1, title: '新客专享券', amount: 50, minAmount: 200, expire: '2026-12-31', used: false, scope: 'rent' },
  { id: 2, title: '周末出行券', amount: 30, minAmount: 150, expire: '2026-10-31', used: false, scope: 'rent' },
  { id: 3, title: '豪华车型满减券', amount: 100, minAmount: 800, expire: '2026-11-30', used: false, scope: 'rent' },
  { id: 4, title: '购车抵扣券', amount: 2000, minAmount: 100000, expire: '2026-12-31', used: false, scope: 'sale' },
  { id: 5, title: '分期免息券', amount: 1500, minAmount: 0, expire: '2026-09-30', used: false, scope: 'installment' },
  { id: 6, title: '国庆出行券', amount: 80, minAmount: 400, expire: '2025-10-08', used: true, scope: 'rent' }
]
