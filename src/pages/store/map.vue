<template>
  <view class="map-page">
    <!-- 顶部搜索 + 城市 -->
    <view class="map-header">
      <view class="map-header__back" @click="goBack">‹</view>
      <view class="map-header__search">
        <text class="search-icon">🔍</text>
        <input
          v-model="keyword"
          class="map-header__input"
          placeholder="搜索城市 / 门店名称"
          confirm-type="search"
          @confirm="onSearch"
        />
        <text v-if="keyword" class="map-header__clear" @click="keyword = ''">✕</text>
      </view>
      <view class="map-header__city" @click="cityVisible = true">
        <text>{{ currentCity || '全国' }}</text>
        <text class="city-arrow">▾</text>
      </view>
    </view>

    <!-- 地图容器 / 备用占位 -->
    <view class="map-area">
      <view v-if="amapStatus === 'ready'" id="amap-container" class="amap-container"></view>
      <view v-else class="amap-fallback">
        <text class="amap-fallback__title">🗺️ 高德地图</text>
        <text class="amap-fallback__sub">{{ fallbackHint }}</text>
        <view class="amap-fallback__list">
          <view
            v-for="s in currentStores"
            :key="s.id"
            class="amap-fallback__row"
            @click="goStore(s.id)"
          >
            <view class="amap-fallback__pin">📍</view>
            <view class="amap-fallback__info">
              <view class="amap-fallback__name">{{ s.name }}</view>
              <view class="amap-fallback__addr">{{ s.address }}</view>
            </view>
            <text class="amap-fallback__arrow">›</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 城市侧栏 + 门店列表 -->
    <view class="map-side">
      <view class="map-side__tabs">
        <view v-for="t in tabs" :key="t" :class="['map-side__tab', { active: typeFilter === t }]" @click="typeFilter = t">{{ t }}</view>
      </view>
      <view class="map-side__head">
        <text>共 {{ filteredStores.length }} 家门店</text>
        <text class="map-side__sort" @click="sortBy = sortBy === 'distance' ? 'rating' : 'distance'">
          {{ sortBy === 'distance' ? '距离最近 ⇅' : '评分最高 ⇅' }}
        </text>
      </view>
      <scroll-view scroll-y class="map-side__list">
        <view
          v-for="s in filteredStores"
          :key="s.id"
          class="store-card"
          @click="goStore(s.id)"
        >
          <view class="store-card__top">
            <text class="store-card__name">{{ s.name }}</text>
            <view class="store-card__rating">★ {{ s.rating }}</view>
          </view>
          <view class="store-card__addr">{{ s.address }}</view>
          <view class="store-card__meta">
            <text class="tag tag--blue" v-if="s.type === 'rent'">租车</text>
            <text class="tag tag--green" v-else-if="s.type === 'sale'">二手车</text>
            <text class="tag" v-else>租售一体</text>
            <text class="store-card__hours">营业 {{ s.businessHours }}</text>
            <text class="store-card__dist">{{ s.distance }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <city-picker
      v-model:visible="cityVisible"
      :selected="currentCity"
      @select="onCitySelect"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import CityPicker from '@/components/city-picker.vue'
import { storeApi } from '@/api'
import { hasAmapKey, loadAMap, checkAmap } from '@/utils/amap'

const keyword = ref('')
const currentCity = ref('')
const cityVisible = ref(false)
const typeFilter = ref<'全部' | '租车' | '二手车' | '租售一体'>('全部')
const sortBy = ref<'distance' | 'rating'>('distance')
const amapStatus = ref<'pending' | 'ready' | 'no-key' | 'error'>('pending')
const fallbackHint = ref('正在加载地图...')

const tabs: ('全部' | '租车' | '二手车' | '租售一体')[] = ['全部', '租车', '二手车', '租售一体']

const allStores = computed(() => storeApi.list())
const filteredStores = computed(() => {
  let list = allStores.value
  if (currentCity.value) list = list.filter(s => s.city === currentCity.value)
  if (keyword.value) {
    const k = keyword.value.toLowerCase()
    list = list.filter(s => s.name.toLowerCase().includes(k) || s.city.includes(keyword.value))
  }
  if (typeFilter.value !== '全部') {
    const map: Record<string, string> = { '租车': 'rent', '二手车': 'sale', '租售一体': 'both' }
    list = list.filter(s => s.type === map[typeFilter.value])
  }
  list = [...list].sort((a, b) => sortBy.value === 'distance'
    ? parseFloat(a.distance) - parseFloat(b.distance)
    : b.rating - a.rating)
  return list
})

const currentStores = computed(() => filteredStores.value)

onMounted(async () => {
  // 优先尝试加载 AMap（H5 才有）
  // #ifdef H5
  if (!hasAmapKey()) {
    amapStatus.value = 'no-key'
    fallbackHint.value = '未配置 AMap Key（src/config/index.ts → AMAP_KEY）\n已为您展示门店列表视图'
    return
  }
  try {
    await loadAMap()
    const status = await checkAmap()
    if (status === 'ready') {
      amapStatus.value = 'ready'
      initMap()
    } else {
      amapStatus.value = 'error'
      fallbackHint.value = '地图加载失败，已为您展示列表视图'
    }
  } catch (e) {
    amapStatus.value = 'error'
    fallbackHint.value = '地图加载失败，已为您展示列表视图'
  }
  // #endif
  // #ifndef H5
  amapStatus.value = 'no-key'
  fallbackHint.value = '小程序 / App 端请配置原生地图组件\n当前展示门店列表视图'
  // #endif
})

// #ifdef H5
function initMap() {
  // 异步等 DOM 挂载完成
  setTimeout(() => {
    // @ts-ignore
    if (!window.AMap) return
    const center = currentStores.value[0]
      ? [currentStores.value[0].lng, currentStores.value[0].lat]
      : [114.05, 22.5]
    // @ts-ignore
    const map = new AMap.Map('amap-container', { zoom: 11, center, viewMode: '2D' })
    currentStores.value.forEach(s => {
      // @ts-ignore
      const marker = new AMap.Marker({
        position: [s.lng, s.lat],
        title: s.name,
        content: `<div style="background:#FF6A00;color:#fff;padding:4px 10px;border-radius:14px;font-size:12px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);">📍 ${s.name}</div>`
      })
      marker.on('click', () => goStore(s.id))
      map.add(marker)
    })
  }, 100)
}
// #endif

function onSearch() { /* trigger computed */ }
function onCitySelect(city: string) { currentCity.value = city; cityVisible.value = false }
function goStore(id: number) { uni.navigateTo({ url: `/pages/store/detail?id=${id}` }) }
function goBack() { uni.navigateBack() }
</script>

<style lang="scss" scoped>
.map-page {
  display: flex; flex-direction: column;
  height: 100vh; background: $bg;
}
.map-header {
  display: flex; align-items: center; gap: 16rpx;
  padding: 20rpx 24rpx;
  background: #fff;
  border-bottom: 1rpx solid $line;
  &__back {
    width: 60rpx; height: 60rpx;
    display: flex; align-items: center; justify-content: center;
    font-size: 50rpx;
  }
  &__search {
    flex: 1; display: flex; align-items: center; gap: 10rpx;
    background: $bg; border-radius: $r-pill;
    padding: 0 20rpx;
    height: 60rpx;
  }
  &__input { flex: 1; font-size: 26rpx; color: $ink; height: 100%; }
  .search-icon { font-size: 24rpx; }
  &__clear { font-size: 22rpx; color: $ink-3; padding: 0 8rpx; }
  &__city {
    display: flex; align-items: center; gap: 4rpx;
    font-size: 26rpx; color: $ink; font-weight: 600;
    .city-arrow { font-size: 22rpx; color: $ink-3; }
  }
}

.map-area {
  flex: 1; position: relative; min-height: 0;
}
.amap-container { width: 100%; height: 100%; }
.amap-fallback {
  width: 100%; height: 100%;
  background:
    linear-gradient(135deg, #EAF2FF 0%, #F8FBFF 50%, #FFF3EA 100%);
  padding: 24rpx;
  overflow-y: auto;
  &__title {
    display: block; font-size: 36rpx; font-weight: 700; color: $ink;
    margin-bottom: 8rpx;
  }
  &__sub {
    display: block; font-size: 22rpx; color: $ink-3;
    margin-bottom: 24rpx; white-space: pre-line;
  }
  &__list {
    background: #fff; border-radius: $r-md; padding: 8rpx 0;
    box-shadow: $shadow-sm;
  }
  &__row {
    display: flex; align-items: center; gap: 16rpx;
    padding: 22rpx 20rpx;
    border-bottom: 1rpx solid $line;
    &:last-child { border-bottom: none; }
  }
  &__pin { font-size: 36rpx; }
  &__info { flex: 1; }
  &__name { font-size: 28rpx; color: $ink; font-weight: 600; }
  &__addr { font-size: 22rpx; color: $ink-3; margin-top: 4rpx; }
  &__arrow { font-size: 32rpx; color: $ink-4; }
}

.map-side {
  background: #fff;
  border-top: 1rpx solid $line;
  height: 45vh;
  display: flex; flex-direction: column;
  &__tabs {
    display: flex; gap: 24rpx;
    padding: 18rpx 24rpx;
    border-bottom: 1rpx solid $line;
  }
  &__tab {
    font-size: 26rpx; color: $ink-3;
    padding: 8rpx 4rpx;
    border-bottom: 3rpx solid transparent;
    &.active { color: $brand; border-color: $brand; font-weight: 600; }
  }
  &__head {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16rpx 24rpx;
    font-size: 24rpx; color: $ink-2;
  }
  &__sort { color: $brand; }
  &__list { flex: 1; padding: 0 24rpx 16rpx; }
}

.store-card {
  padding: 24rpx 0;
  border-bottom: 1rpx solid $line;
  &__top { display: flex; align-items: center; justify-content: space-between; }
  &__name { font-size: 30rpx; color: $ink; font-weight: 600; }
  &__rating { color: $warning; font-size: 24rpx; font-weight: 600; }
  &__addr { font-size: 24rpx; color: $ink-3; margin: 8rpx 0; }
  &__meta {
    display: flex; align-items: center; gap: 12rpx;
    font-size: 22rpx; color: $ink-3;
  }
  &__hours { color: $ink-3; }
  &__dist { margin-left: auto; color: $brand; font-weight: 600; }
}
</style>
