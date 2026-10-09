<template>
  <view class="vl">
    <!-- 顶部搜索 -->
    <view class="vl-header">
      <view class="city-pick" @click="cityVisible = true">
        <text>{{ currentCity || '全国' }}</text>
        <text class="city-pick__arrow">▾</text>
      </view>
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input v-model="keyword" placeholder="搜索 品牌 / 车型 / 车牌" confirm-type="search" />
      </view>
    </view>

    <!-- 分类标签 -->
    <scroll-view scroll-x class="type-scroll" :show-scrollbar="false">
      <view class="type-list">
        <view v-for="t in types" :key="t" :class="['type-item', { active: activeType === t }]" @click="activeType = t">{{ t }}</view>
      </view>
    </scroll-view>

    <!-- 排序 -->
    <view class="sort-bar">
      <view :class="['sort-item', { active: sortKey === 'default' }]" @click="sortKey = 'default'">智能</view>
      <view :class="['sort-item', { active: sortKey === 'price' }]" @click="cycleSort('price')">价格{{ sortDir === 'asc' ? '↑' : '↓' }}</view>
      <view :class="['sort-item', { active: sortKey === 'rating' }]" @click="sortKey = 'rating'">好评</view>
      <view :class="['sort-item', { active: sortKey === 'newest' }]" @click="sortKey = 'newest'">最新</view>
    </view>

    <!-- 列表 -->
    <view v-if="!filtered.length" class="empty">
      <text class="empty-icon">🔍</text>
      没有找到符合条件的车辆，换个条件试试
    </view>
    <view v-else class="vehicle-list">
      <car-card v-for="v in filtered" :key="v.id" :vehicle="v" />
    </view>

    <city-picker v-model:visible="cityVisible" :selected="currentCity" @select="(c: string) => currentCity = c" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CarCard from '@/components/car-card.vue'
import CityPicker from '@/components/city-picker.vue'
import { vehicleApi } from '@/api'

const types = ['全部', '经济型', '舒适型', 'SUV', '豪华型', '新能源']
const keyword = ref('')
const activeType = ref('全部')
const sortKey = ref<'default' | 'price' | 'rating' | 'newest'>('default')
const sortDir = ref<'asc' | 'desc'>('asc')
const currentCity = ref('')
const cityVisible = ref(false)

const vehicles = ref(vehicleApi.list())

onShow(() => {
  vehicles.value = vehicleApi.list({ city: currentCity.value })
})

function cycleSort(k: 'price') {
  sortKey.value = k
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}

const filtered = computed(() => {
  let list = vehicles.value
  if (activeType.value !== '全部') list = list.filter(v => v.type === activeType.value)
  if (keyword.value) {
    const k = keyword.value.trim().toLowerCase()
    list = list.filter(v => `${v.brand}${v.model}${v.plateNo}`.toLowerCase().includes(k))
  }
  list = [...list].sort((a, b) => {
    if (sortKey.value === 'price') return sortDir.value === 'asc' ? a.pricePerDay - b.pricePerDay : b.pricePerDay - a.pricePerDay
    if (sortKey.value === 'rating') return b.rating - a.rating
    if (sortKey.value === 'newest') return b.year - a.year
    return 0
  })
  return list
})
</script>

<style lang="scss" scoped>
.vl { min-height: 100vh; background: $bg; }

.vl-header {
  display: flex; align-items: center; gap: 16rpx;
  padding: 20rpx 24rpx;
  background: #fff;
  border-bottom: 1rpx solid $line;
  position: sticky; top: 0; z-index: 50;
}
.city-pick {
  display: flex; align-items: center; gap: 4rpx;
  font-size: 28rpx; font-weight: 600; color: $ink;
  &__arrow { font-size: 22rpx; color: $ink-3; }
}
.search-box {
  flex: 1; height: 64rpx;
  background: $bg; border-radius: $r-pill;
  display: flex; align-items: center; gap: 10rpx;
  padding: 0 24rpx;
  .search-icon { font-size: 24rpx; }
  input { flex: 1; font-size: 26rpx; color: $ink; }
}

.type-scroll {
  white-space: nowrap;
  background: #fff;
  border-bottom: 1rpx solid $line;
}
.type-list {
  display: flex; gap: 12rpx; padding: 16rpx 24rpx;
}
.type-item {
  padding: 10rpx 28rpx;
  background: $bg;
  border-radius: $r-pill;
  font-size: 26rpx;
  color: $ink-2;
  flex-shrink: 0;
  &.active {
    background: $brand-soft;
    color: $brand-deep;
    border: 1rpx solid $brand;
    font-weight: 600;
  }
}

.sort-bar {
  display: flex;
  background: #fff;
  padding: 20rpx 0;
  border-bottom: 1rpx solid $line;
}
.sort-item {
  flex: 1; text-align: center;
  font-size: 26rpx; color: $ink-2;
  border-right: 1rpx solid $line;
  &:last-child { border-right: none; }
  &.active { color: $brand; font-weight: 600; }
}

.vehicle-list { padding-top: 8rpx; }
</style>
