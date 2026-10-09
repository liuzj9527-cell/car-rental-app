<template>
  <view class="sc" @click="go">
    <view class="sc__img">
      <car-image :src="car.images[0]" :brand="car.brand" height="100%" />
      <view class="sc__badge" v-if="car.tags[0]">{{ car.tags[0] }}</view>
      <view class="sc__count">🔥 {{ car.views }}人看过</view>
    </view>

    <view class="sc__info">
      <view class="sc__title ellipsis-2">{{ car.title }}</view>
      <view class="sc__meta">
        <text>{{ car.firstRegister }}上牌</text>
        <text class="dot">·</text>
        <text>{{ (car.mileage / 10000).toFixed(1) }}万公里</text>
        <text class="dot">·</text>
        <text>{{ car.city }}</text>
      </view>
      <view class="sc__tags">
        <text v-for="t in car.tags" :key="t" class="tag sc__tag">{{ t }}</text>
      </view>
      <view class="sc__bottom">
        <view class="sc__price">
          <text class="sc__price-num price">{{ (car.price / 10000).toFixed(1) }}</text>
          <text class="sc__price-unit price price--unit">万</text>
          <text class="price--old">{{ (car.originalPrice / 10000).toFixed(1) }}万</text>
        </view>
        <view class="sc__monthly">
          月供 <text class="sc__monthly-num">{{ car.monthlyPayment }}</text> 元
        </view>
      </view>
      <view class="sc__score">
        <text class="sc__score-tag">车况 {{ car.inspectScore }} 分</text>
        <text class="sc__score-txt">首付 {{ (car.downPayment / 10000).toFixed(1) }}万起</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import CarImage from '@/components/car-image.vue'
import type { SaleCar } from '@/types'

/** 二手车车源卡片（列表 / 推荐位复用） */
const props = defineProps<{ car: SaleCar }>()

function go() {
  uni.navigateTo({ url: `/pages/sale/detail?id=${props.car.id}` })
}
</script>

<style lang="scss" scoped>
.sc {
  display: flex;
  background: #fff;
  border-radius: $r-md;
  margin: 0 $gap-md $gap-md;
  overflow: hidden;
  box-shadow: $shadow-sm;
}
.sc__img {
  position: relative;
  width: 260rpx;
  height: 200rpx;
  flex-shrink: 0;
}
.sc__badge {
  position: absolute;
  left: 0; top: 16rpx;
  padding: 4rpx 14rpx;
  background: linear-gradient(135deg, $brand, $brand-deep);
  color: #fff;
  font-size: 20rpx;
  border-radius: 0 $r-xs $r-xs 0;
}
.sc__count {
  position: absolute;
  left: 10rpx; bottom: 10rpx;
  padding: 2rpx 10rpx;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 18rpx;
  border-radius: $r-xs;
}
.sc__info {
  flex: 1;
  min-width: 0;
  padding: 18rpx 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.sc__title { font-size: 28rpx; font-weight: 600; color: $ink; line-height: 1.35; }
.sc__meta { font-size: 22rpx; color: $ink-3; margin-top: 8rpx; .dot { margin: 0 8rpx; } }
.sc__tags { display: flex; flex-wrap: wrap; margin-top: 10rpx; }
.sc__tag { margin: 0 8rpx 8rpx 0; }
.sc__bottom {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 6rpx;
}
.sc__price { display: flex; align-items: baseline; }
.sc__price-num { font-size: 36rpx; }
.sc__price-unit { font-size: 22rpx; }
.sc__monthly { font-size: 22rpx; color: $ink-2; }
.sc__monthly-num { color: $brand; font-weight: 700; font-size: 26rpx; }
.sc__score {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 8rpx;
}
.sc__score-tag {
  font-size: 20rpx; color: #00891F;
  background: #E8F8EC; padding: 2rpx 12rpx; border-radius: $r-xs;
}
.sc__score-txt { font-size: 20rpx; color: $ink-3; }
</style>
