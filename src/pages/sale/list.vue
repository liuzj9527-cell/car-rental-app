<template>
  <view class="list">
    <!-- 顶部搜索 + 城市 -->
    <view class="list-header">
      <view class="city-pick" @click="cityVisible = true">
        <text>{{ currentCity || '全国' }}</text>
        <text class="city-pick__arrow">▾</text>
      </view>
      <view class="search-box" @click="goSearch">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">{{ keyword || '搜索 品牌 / 车系 / 关键词' }}</text>
      </view>
      <view class="list-header__map" @click="goMap">地图</view>
    </view>

    <!-- 筛选条 -->
    <view class="filter-bar">
      <view v-for="(g, gi) in groups" :key="gi" class="filter-item" :class="{ active: isActive(g.key, g.value) }" @click="onTap(g)">
        <text>{{ g.label }}</text>
        <text v-if="g.children" class="filter-item__arrow">▾</text>
      </view>
      <view class="filter-item" :class="{ active: sort !== 'default' }" @click="cycleSort">
        <text>{{ sortText }}</text>
        <text class="filter-item__arrow">⇅</text>
      </view>
    </view>

    <!-- 标签筛选结果数 + 切换 -->
    <view class="result-bar">
      <text class="result-count">为您找到 <text class="result-count__num">{{ filtered.length }}</text> 辆好车</text>
      <view class="result-bar__right">
        <text :class="['view-mode', viewMode === 'card' && 'active']" @click="viewMode = 'card'">≡ 卡片</text>
        <text :class="['view-mode', viewMode === 'list' && 'active']" @click="viewMode = 'list'">⋮ 列表</text>
      </view>
    </view>

    <!-- 已选条件 -->
    <view v-if="activeTags.length" class="active-tags">
      <view v-for="t in activeTags" :key="t.k" class="active-tag" @click="clearTag(t)">
        <text>{{ t.label }}</text>
        <text class="active-tag__x">✕</text>
      </view>
      <text class="active-tags__clear" @click="resetQuery">清空</text>
    </view>

    <!-- 列表 / 空 -->
    <view v-if="!filtered.length" class="empty">
      <text class="empty-icon">🚗</text>
      暂无符合条件的车辆，换个条件试试
    </view>
    <view v-else>
      <sale-car-card v-for="car in filtered" :key="car.id" :car="car" />
      <view class="list-footer">— 已显示全部 —</view>
    </view>

    <!-- 浮层：品牌 / 类型 / 车龄 / 价格 / 月供 -->
    <view v-if="popup.visible" class="popup-mask" @click="closePopup">
      <view class="popup-panel" @click.stop>
        <view class="popup-panel__title">{{ popup.title }}</view>
        <scroll-view scroll-y class="popup-panel__scroll">
          <view
            v-for="opt in popup.options"
            :key="opt.label"
            class="popup-option"
            :class="{ active: popup.value === opt.value }"
            @click="pickPopup(opt)"
          >
            <text>{{ opt.label }}</text>
            <text v-if="popup.value === opt.value" class="popup-option__check">✓</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 城市选择 -->
    <city-picker
      v-model:visible="cityVisible"
      :selected="currentCity"
      @select="onCitySelect"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import SaleCarCard from '@/components/sale-car-card.vue'
import CityPicker from '@/components/city-picker.vue'
import {
  CAR_TYPE_OPTIONS, CAR_AGE_OPTIONS, PRICE_RANGES, MONTHLY_RANGES
} from '@/types'
import {
  saleApi, cityApi
} from '@/api/index'
const currentCity = ref('')
const keyword = ref('')
const cityVisible = ref(false)
const viewMode = ref<'card' | 'list'>('card')

const query = reactive({
  brand: '',
  type: '',
  ageRange: '',
  priceRange: '' as string,
  monthlyRange: '' as string,
  sort: 'default'
})

const popup = reactive({ visible: false, title: '', key: '', value: '', options: [] as { label: string; value: string }[] })

const brands = computed(() => saleApi.brands())
const filtered = computed(() => {
  const [pMin, pMax] = parseRange(query.priceRange, PRICE_RANGES)
  const [mMin, mMax] = parseRange(query.monthlyRange, MONTHLY_RANGES)
  return saleApi.list({
    keyword: keyword.value,
    city: currentCity.value,
    brand: query.brand,
    type: query.type,
    ageRange: query.ageRange,
    minPrice: pMin, maxPrice: pMax,
    minMonthly: mMin, maxMonthly: mMax,
    sort: query.sort
  })
})

function parseRange(label: string, ranges: { label: string; min: number; max: number }[]) {
  const r = ranges.find(x => x.label === label)
  return r ? [r.min, r.max] : [undefined, undefined]
}

const groups = computed(() => [
  { key: 'brand', label: query.brand || '品牌', value: query.brand, options: [{ label: '不限', value: '' }, ...brands.value.map(b => ({ label: b, value: b }))] },
  { key: 'price', label: query.priceRange || '价格', value: query.priceRange, options: [{ label: '不限', value: '' }, ...PRICE_RANGES.map(r => ({ label: r.label, value: r.label }))] },
  { key: 'type', label: query.type || '车型', value: query.type, options: [{ label: '不限', value: '' }, ...CAR_TYPE_OPTIONS.map(t => ({ label: t, value: t }))] },
  { key: 'age', label: query.ageRange || '车龄', value: query.ageRange, options: [{ label: '不限', value: '' }, ...CAR_AGE_OPTIONS.map(a => ({ label: a, value: a }))] },
  { key: 'monthly', label: query.monthlyRange || '月供', value: query.monthlyRange, options: [{ label: '不限', value: '' }, ...MONTHLY_RANGES.map(m => ({ label: m.label, value: m.label }))] }
])

const activeTags = computed(() => {
  const tags: { k: string; label: string }[] = []
  if (query.brand) tags.push({ k: 'brand', label: query.brand })
  if (query.priceRange) tags.push({ k: 'price', label: query.priceRange })
  if (query.type) tags.push({ k: 'type', label: query.type })
  if (query.ageRange) tags.push({ k: 'age', label: query.ageRange })
  if (query.monthlyRange) tags.push({ k: 'monthly', label: query.monthlyRange })
  return tags
})

const sortText = computed(() => ({
  default: '智能排序', priceAsc: '价格↑', priceDesc: '价格↓',
  ageAsc: '车龄少', mileageAsc: '里程少', newest: '最新'
}[query.sort] || '智能排序'))

function isActive(key: string, value: string) { return !!value }

function onTap(g: any) {
  popup.key = g.key
  popup.options = g.options
  popup.title = { brand: '选择品牌', price: '价格区间', type: '车型', age: '车龄', monthly: '月供' }[g.key]
  popup.value = (query as any)[g.key]
  popup.visible = true
}

function pickPopup(opt: { label: string; value: string }) {
  ;(query as any)[popup.key] = opt.value
  closePopup()
}
function closePopup() { popup.visible = false }
function clearTag(t: { k: string }) { (query as any)[t.k] = '' }
function resetQuery() { Object.assign(query, { brand: '', type: '', ageRange: '', priceRange: '', monthlyRange: '' }) }

function cycleSort() {
  const order = ['default', 'priceAsc', 'priceDesc', 'ageAsc', 'mileageAsc', 'newest']
  const i = order.indexOf(query.sort)
  query.sort = order[(i + 1) % order.length]
}

function onCitySelect(city: string) {
  currentCity.value = city
  cityVisible.value = false
}
function goSearch() {
  uni.navigateTo({ url: `/pages/sale/search?from=list` })
}
function goMap() { uni.navigateTo({ url: '/pages/store/map' }) }
</script>

<style lang="scss" scoped>
.list { min-height: 100vh; background: $bg; padding-bottom: 60rpx; }

/* 顶部 */
.list-header {
  display: flex; align-items: center; gap: 16rpx;
  padding: 20rpx 24rpx;
  background: #fff;
  position: sticky; top: 0; z-index: 50;
  box-shadow: 0 1rpx 0 $line;
}
.city-pick {
  font-size: 28rpx; font-weight: 600; color: $ink;
  display: flex; align-items: center; gap: 4rpx;
  &__arrow { font-size: 22rpx; color: $ink-3; }
}
.search-box {
  flex: 1; height: 64rpx; padding: 0 24rpx;
  background: #F4F5F7; border-radius: $r-pill;
  display: flex; align-items: center; gap: 10rpx;
  .search-icon { font-size: 24rpx; }
  .search-placeholder { font-size: 26rpx; color: $ink-3; }
}
.list-header__map {
  font-size: 26rpx; color: $brand;
  padding: 8rpx 16rpx;
}

/* 筛选条 */
.filter-bar {
  display: flex; align-items: center; gap: 8rpx;
  padding: 18rpx 24rpx;
  background: #fff;
  border-bottom: 1rpx solid $line;
  position: sticky; top: 104rpx; z-index: 49;
}
.filter-item {
  flex: 1; text-align: center;
  font-size: 26rpx; color: $ink-2;
  padding: 12rpx 0;
  display: flex; align-items: center; justify-content: center; gap: 4rpx;
  &.active { color: $brand; font-weight: 600; }
  &__arrow { font-size: 20rpx; }
}

/* 结果条 */
.result-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20rpx 24rpx 8rpx;
  font-size: 24rpx; color: $ink-3;
  .result-count__num { color: $brand; font-weight: 600; margin: 0 4rpx; }
}
.result-bar__right { display: flex; gap: 16rpx; }
.view-mode {
  font-size: 24rpx; color: $ink-3; padding: 6rpx 12rpx;
  border-radius: $r-xs;
  &.active { color: $brand; background: $brand-soft; }
}

/* 已选标签 */
.active-tags {
  display: flex; flex-wrap: wrap; gap: 12rpx;
  padding: 8rpx 24rpx 16rpx;
}
.active-tag {
  display: flex; align-items: center; gap: 6rpx;
  padding: 8rpx 16rpx;
  background: $brand-soft; color: $brand-deep;
  border-radius: $r-xs; font-size: 22rpx;
  &__x { font-size: 18rpx; opacity: 0.7; }
}
.active-tags__clear { font-size: 22rpx; color: $ink-3; padding: 8rpx 0; }

.list-footer { text-align: center; font-size: 22rpx; color: $ink-4; padding: 32rpx 0 16rpx; }

/* 弹层 */
.popup-mask {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0, 0, 0, 0.4);
}
.popup-panel {
  position: absolute; left: 0; right: 0; top: 0;
  max-height: 70vh;
  background: #fff;
  border-radius: 0 0 $r-lg $r-lg;
  display: flex; flex-direction: column;
}
.popup-panel__title {
  padding: 24rpx;
  font-size: 28rpx; font-weight: 600; color: $ink;
  border-bottom: 1rpx solid $line;
}
.popup-panel__scroll { flex: 1; padding: 8rpx 0; }
.popup-option {
  padding: 28rpx 24rpx;
  font-size: 28rpx; color: $ink-2;
  display: flex; align-items: center; justify-content: space-between;
  &.active { color: $brand; background: $brand-soft; }
  &__check { color: $brand; font-weight: 600; }
}
</style>
