<template>
  <view v-if="vehicle" class="vd">
    <!-- 头图 -->
    <view class="vd-hero">
      <swiper class="gallery" :indicator-dots="true" indicator-color="rgba(255,255,255,0.4)" indicator-active-color="#FF6A00" :autoplay="false">
        <swiper-item v-for="(img, i) in galleryImgs" :key="i" @click="preview(i)">
          <car-image :src="img" :brand="vehicle.brand" height="100%" radius="0" />
        </swiper-item>
      </swiper>
      <view class="vd-hero__back" @click="goBack">‹</view>
      <view class="vd-hero__count">{{ galleryImgs.length }} 张图</view>
    </view>

    <!-- 基本信息 -->
    <view class="block">
      <view class="vd-title">{{ vehicle.brand }} {{ vehicle.model }}</view>
      <view class="vd-meta">
        <text>★ {{ vehicle.rating }}</text>
        <text class="dot">·</text>
        <text>已租 {{ vehicle.orders }} 次</text>
        <text class="dot">·</text>
        <text>{{ vehicle.year }}款</text>
      </view>
      <view class="vd-tags">
        <text v-for="t in vehicle.tags" :key="t" class="tag">{{ t }}</text>
      </view>
      <view class="vd-price">
        <view>
          <text class="price price--xl">¥{{ vehicle.pricePerDay }}</text>
          <text class="price price--unit">/天</text>
        </view>
        <text class="deposit">押金 ¥{{ vehicle.deposit }}</text>
      </view>
    </view>

    <!-- 参数 -->
    <view class="block">
      <view class="block__title"><text class="bar"></text>车辆参数</view>
      <view class="spec-grid">
        <view class="spec"><text class="lbl">座位</text><text class="val">{{ vehicle.seats }}座</text></view>
        <view class="spec"><text class="lbl">变速箱</text><text class="val">{{ vehicle.gearbox }}</text></view>
        <view class="spec"><text class="lbl">年款</text><text class="val">{{ vehicle.year }}款</text></view>
        <view class="spec"><text class="lbl">里程</text><text class="val">{{ (vehicle.mileage / 10000).toFixed(1) }}万km</text></view>
        <view class="spec"><text class="lbl">颜色</text><text class="val">{{ vehicle.color }}</text></view>
        <view class="spec"><text class="lbl">能源</text><text class="val">{{ vehicle.energy }}</text></view>
      </view>
    </view>

    <!-- 取车门店 -->
    <view v-if="store" class="block" @click="goStore(store.id)">
      <view class="block__title"><text class="bar"></text>取车门店</view>
      <view class="store-row">
        <view class="store-row__icon">📍</view>
        <view class="store-row__info">
          <view class="store-row__name">{{ store.name }}</view>
          <view class="store-row__addr">{{ store.address }}</view>
          <view class="store-row__hours">🕐 {{ store.businessHours }}</view>
        </view>
        <view class="store-row__dist">{{ store.distance }}</view>
      </view>
    </view>

    <!-- 服务保障 -->
    <view class="block">
      <view class="block__title"><text class="bar"></text>服务保障</view>
      <view class="service-grid">
        <view class="service" v-for="s in services" :key="s">
          <text class="service__icon">✓</text>
          <text>{{ s }}</text>
        </view>
      </view>
    </view>

    <!-- 底部 -->
    <view class="vd-footer">
      <view class="vd-footer__icon" @click="callStore">
        <text class="emoji">📞</text>
        <text>联系门店</text>
      </view>
      <view class="vd-footer__icon" @click="onFav">
        <text class="emoji">{{ favorited ? '❤️' : '🤍' }}</text>
        <text>收藏</text>
      </view>
      <view class="vd-footer__main btn-primary" @click="goBook">立即预订</view>
    </view>
  </view>
  <view v-else class="empty"><text class="empty-icon">🚗</text>车辆不存在</view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import CarImage from '@/components/car-image.vue'
import { vehicleApi, storeApi } from '@/api'
import type { Vehicle, StorePoint } from '@/types'

const vehicle = ref<Vehicle | null>(null)
const store = ref<StorePoint | null>(null)
const favorited = ref(false)
const services = ['全险保障', '24小时救援', '免费送车', '异地还车', '免押金(信用)', '正规合同']

const galleryImgs = computed(() => {
  if (!vehicle.value) return []
  return vehicle.value.images.length ? vehicle.value.images : [vehicle.value.image]
})

onLoad((q: any) => {
  const id = Number(q.id)
  vehicle.value = vehicleApi.detail(id) || null
  if (vehicle.value) {
    store.value = storeApi.list().find(s => s.id === vehicle.value!.storeId) || null
  }
})

onShareAppMessage(() => ({
  title: `${vehicle.value?.brand} ${vehicle.value?.model} · ¥${vehicle.value?.pricePerDay}/天`,
  path: `/pages/vehicle/detail?id=${vehicle.value?.id}`
}))

function goBack() { uni.navigateBack() }
function callStore() { if (store.value) uni.makePhoneCall({ phoneNumber: store.value.phone }) }
function goStore(id: number) { uni.navigateTo({ url: `/pages/store/detail?id=${id}` }) }
function goBook() { if (!vehicle.value) return; uni.navigateTo({ url: `/pages/order/create?id=${vehicle.value.id}` }) }
function onFav() {
  favorited.value = !favorited.value
  uni.showToast({ title: favorited.value ? '已收藏' : '已取消', icon: 'none' })
}
function preview(i: number) { uni.previewImage({ urls: galleryImgs.value, current: galleryImgs.value[i] }) }
</script>

<style lang="scss" scoped>
.vd { min-height: 100vh; background: $bg; padding-bottom: 140rpx; }

.vd-hero {
  position: relative;
  width: 100%; height: 540rpx;
  background: $ink;
}
.gallery { width: 100%; height: 100%; }
.vd-hero__back {
  position: absolute; left: 24rpx; top: 60rpx;
  width: 60rpx; height: 60rpx;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 44rpx;
}
.vd-hero__count {
  position: absolute; right: 24rpx; bottom: 24rpx;
  padding: 6rpx 18rpx;
  background: rgba(0, 0, 0, 0.6);
  color: #fff; font-size: 22rpx;
  border-radius: $r-xs;
}

.block {
  background: #fff;
  margin: $gap-md;
  border-radius: $r-md;
  padding: $gap-md;
  box-shadow: $shadow-sm;
  &__title {
    display: flex; align-items: center;
    font-size: 28rpx; font-weight: 600; color: $ink;
    margin-bottom: 20rpx;
    .bar {
      display: inline-block; width: 6rpx; height: 26rpx;
      background: $brand; border-radius: 3rpx; margin-right: 12rpx;
    }
  }
}

.vd-title { font-size: 36rpx; font-weight: 700; color: $ink; }
.vd-meta {
  margin-top: 10rpx; font-size: 24rpx; color: $ink-3;
  .dot { margin: 0 6rpx; }
  text:first-child { color: $warning; font-weight: 600; }
}
.vd-tags { display: flex; flex-wrap: wrap; gap: 8rpx; margin-top: 16rpx; }
.vd-price {
  display: flex; align-items: baseline; justify-content: space-between;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx dashed $line;
}
.price--xl { font-size: 44rpx; }
.deposit { font-size: 24rpx; color: $ink-3; }

.spec-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 1rpx;
  background: $line;
  border-radius: $r-sm;
  overflow: hidden;
}
.spec {
  background: #fff;
  padding: 22rpx 18rpx;
  display: flex; flex-direction: column; gap: 6rpx;
  .lbl { font-size: 22rpx; color: $ink-3; }
  .val { font-size: 28rpx; color: $ink; font-weight: 500; }
}

.store-row {
  display: flex; align-items: center; gap: 16rpx;
  &__icon {
    font-size: 48rpx;
    width: 80rpx; height: 80rpx;
    background: $brand-soft; color: $brand-deep;
    border-radius: 20rpx;
    display: flex; align-items: center; justify-content: center;
  }
  &__info { flex: 1; min-width: 0; }
  &__name { font-size: 28rpx; color: $ink; font-weight: 600; }
  &__addr { font-size: 22rpx; color: $ink-3; margin: 4rpx 0; }
  &__hours { font-size: 22rpx; color: $ink-3; }
  &__dist { color: $brand; font-size: 26rpx; font-weight: 600; }
}

.service-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}
.service {
  background: $bg;
  padding: 18rpx;
  border-radius: $r-sm;
  font-size: 24rpx; color: $ink-2;
  display: flex; align-items: center; gap: 6rpx;
  &__icon {
    width: 32rpx; height: 32rpx;
    background: $success; color: #fff;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 22rpx;
  }
}

.vd-footer {
  position: fixed; left: 0; right: 0; bottom: 0;
  display: flex; align-items: center; gap: 16rpx;
  padding: 16rpx 24rpx;
  background: #fff;
  box-shadow: 0 -2rpx 12rpx rgba(20, 24, 32, 0.06);
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  z-index: 50;
  &__icon {
    display: flex; flex-direction: column; align-items: center; gap: 4rpx;
    font-size: 20rpx; color: $ink-2; min-width: 80rpx;
    .emoji { font-size: 36rpx; }
  }
  &__main {
    flex: 1; text-align: center; padding: 24rpx 0;
    font-size: 30rpx; font-weight: 600;
    border-radius: $r-pill;
  }
}
</style>
