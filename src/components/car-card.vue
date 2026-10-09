<template>
  <view class="vc" @click="go">
    <view class="vc__img">
      <car-image :src="vehicle.images[0]" :brand="vehicle.brand" height="100%" />
      <view class="vc__status" :class="`vc__status--${vehicle.status}`">{{ statusText }}</view>
      <view class="vc__rating">★ {{ vehicle.rating }}</view>
    </view>

    <view class="vc__info">
      <view class="vc__name">{{ vehicle.brand }} {{ vehicle.model }}</view>
      <view class="vc__meta">
        <text>{{ vehicle.year }}款</text>
        <text class="dot">·</text>
        <text>{{ vehicle.seats }}座</text>
        <text class="dot">·</text>
        <text>{{ vehicle.gearbox }}</text>
        <text class="dot">·</text>
        <text>{{ vehicle.energy }}</text>
      </view>
      <view class="vc__tags">
        <text v-for="t in vehicle.tags.slice(0, 2)" :key="t" class="tag vc__tag">{{ t }}</text>
      </view>
      <view class="vc__bottom">
        <view class="vc__price">
          <text class="vc__price-num price">{{ vehicle.pricePerDay }}</text>
          <text class="price price--unit">元/天</text>
        </view>
        <view class="vc__orders">已租 {{ vehicle.orders }} 次</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CarImage from '@/components/car-image.vue'
import type { Vehicle } from '@/types'

/** 租赁车辆卡片 */
const props = defineProps<{ vehicle: Vehicle }>()

const STATUS_TEXT: Record<string, string> = {
  available: '可租', rented: '已租出', maintenance: '维保中', offline: '已下线'
}
const statusText = computed(() => STATUS_TEXT[props.vehicle.status] ?? '')

function go() {
  uni.navigateTo({ url: `/pages/vehicle/detail?id=${props.vehicle.id}` })
}
</script>

<style lang="scss" scoped>
.vc {
  display: flex;
  background: #fff;
  border-radius: $r-md;
  margin: 0 $gap-md $gap-md;
  overflow: hidden;
  box-shadow: $shadow-sm;
}
.vc__img { position: relative; width: 280rpx; height: 210rpx; flex-shrink: 0; }
.vc__status {
  position: absolute; left: 0; top: 16rpx;
  padding: 4rpx 16rpx;
  font-size: 20rpx; color: #fff;
  border-radius: 0 $r-xs $r-xs 0;
  &--available { background: #00B42A; }
  &--rented { background: #8A9099; }
  &--maintenance { background: $warning; }
  &--offline { background: $ink-3; }
}
.vc__rating {
  position: absolute; right: 10rpx; bottom: 10rpx;
  padding: 2rpx 12rpx;
  background: rgba(0, 0, 0, 0.5);
  color: #FFD466; font-size: 20rpx; border-radius: $r-xs;
}
.vc__info { flex: 1; min-width: 0; padding: 20rpx; display: flex; flex-direction: column; }
.vc__name { font-size: 30rpx; font-weight: 600; color: $ink; }
.vc__meta { font-size: 22rpx; color: $ink-3; margin-top: 10rpx; .dot { margin: 0 8rpx; } }
.vc__tags { display: flex; flex-wrap: wrap; margin-top: 12rpx; }
.vc__tag { margin: 0 8rpx 8rpx 0; }
.vc__bottom {
  margin-top: auto;
  display: flex; align-items: baseline; justify-content: space-between;
}
.vc__price { display: flex; align-items: baseline; }
.vc__price-num { font-size: 38rpx; }
.vc__orders { font-size: 20rpx; color: $ink-3; }
</style>
