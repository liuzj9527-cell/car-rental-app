<template>
  <view v-if="store" class="sd">
    <view class="sd-hero">
      <view class="sd-hero__bg"></view>
      <view class="sd-hero__nav" :style="{ paddingTop: statusBarHeight + 'px' }">
        <view class="sd-hero__back" @click="goBack">‹</view>
        <text class="sd-hero__title">门店详情</text>
        <view class="sd-hero__back"></view>
      </view>
      <view class="sd-hero__name">{{ store.name }}</view>
      <view class="sd-hero__rating">★ {{ store.rating }} · {{ store.businessHours }}</view>
    </view>

    <view class="block">
      <view class="row">
        <text class="row__label">📍 地址</text>
        <text class="row__val flex-1 ellipsis">{{ store.address }}</text>
        <view class="row__btn" @click="onCopy">复制</view>
      </view>
      <view class="row">
        <text class="row__label">📞 电话</text>
        <text class="row__val">{{ store.phone }}</text>
        <view class="row__btn row__btn--brand" @click="callPhone">拨打</view>
      </view>
      <view class="row">
        <text class="row__label">🏬 业务</text>
        <text class="row__val">
          <text v-if="store.type === 'rent'">租车门店</text>
          <text v-else-if="store.type === 'sale'">二手车门店</text>
          <text v-else>租售一体店</text>
        </text>
      </view>
      <view class="row">
        <text class="row__label">👨‍💼 店长</text>
        <text class="row__val">{{ store.manager }}</text>
      </view>
      <view class="row">
        <text class="row__label">📅 开业</text>
        <text class="row__val">{{ store.openDate }}</text>
      </view>
    </view>

    <!-- 数据统计 -->
    <view class="block">
      <view class="block__title"><text class="bar"></text>门店数据</view>
      <view class="stat-row">
        <view class="stat">
          <text class="stat__num">{{ store.vehicleCount }}</text>
          <text class="stat__label">在租车辆</text>
        </view>
        <view class="stat">
          <text class="stat__num">{{ store.saleCarCount }}</text>
          <text class="stat__label">二手车源</text>
        </view>
        <view class="stat">
          <text class="stat__num">{{ Math.floor(store.vehicleCount * 4.6) }}</text>
          <text class="stat__label">本月订单</text>
        </view>
        <view class="stat">
          <text class="stat__num">★ {{ store.rating }}</text>
          <text class="stat__label">综合评分</text>
        </view>
      </view>
    </view>

    <!-- 门店图片 -->
    <view v-if="store.images.length" class="block">
      <view class="block__title"><text class="bar"></text>门店实景</view>
      <scroll-view scroll-x class="img-scroll" :show-scrollbar="false">
        <image
          v-for="(img, i) in store.images"
          :key="i"
          :src="img"
          class="img-scroll__item"
          mode="aspectFill"
          @click="previewImg(i)"
        />
      </scroll-view>
    </view>

    <!-- 店内车辆 -->
    <view v-if="storeCars.length" class="block">
      <view class="block__title"><text class="bar"></text>本店在售车源</view>
      <sale-car-card v-for="c in storeCars" :key="c.id" :car="c" />
    </view>

    <!-- 操作按钮 -->
    <view class="sd-footer">
      <view class="sd-footer__btn btn-ghost" @click="callPhone">电话咨询</view>
      <view class="sd-footer__btn btn-primary" @click="onNavigate">到店导航</view>
    </view>
  </view>
  <view v-else class="empty"><text class="empty-icon">🏬</text>门店不存在</view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import SaleCarCard from '@/components/sale-car-card.vue'
import { storeApi, saleApi } from '@/api'

const storeId = ref(0)
const statusBarHeight = ref(20)
const store = computed(() => storeApi.detail(storeId.value))
const storeCars = computed(() => saleApi.list({}).filter(c => c.storeId === storeId.value).slice(0, 4))

onLoad((q: any) => {
  storeId.value = Number(q.id)
  try { statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 20 } catch { /* ignore */ }
})

function previewImg(i: number) {
  if (!store.value) return
  uni.previewImage({ urls: store.value.images, current: store.value.images[i] })
}
function callPhone() {
  if (store.value) uni.makePhoneCall({ phoneNumber: store.value.phone })
}
function onCopy() {
  if (!store.value) return
  uni.setClipboardData({ data: store.value.address })
  uni.showToast({ title: '已复制', icon: 'success' })
}
function onNavigate() {
  if (!store.value) return
  // #ifdef H5
  // 优先用 AMap 跳转
  // @ts-ignore
  if (window.AMap) {
    // @ts-ignore
    AMap.plugin('AMap.Driving', () => {
      uni.showToast({ title: '正在规划路线...', icon: 'none' })
    })
    return
  }
  // #endif
  // 兜底：调起系统地图（H5 用 web 跳转；小程序用 wx.openLocation；App 用 uni.openLocation）
  const { lng, lat, name, address } = store.value!
  // #ifdef MP-WEIXIN
  // @ts-ignore
  wx.openLocation({ longitude: lng, latitude: lat, name, address, scale: 16 })
  // #endif
  // #ifdef APP-PLUS
  uni.openLocation({ longitude: lng, latitude: lat, name, address, scale: 16 })
  // #endif
  // #ifdef H5
  uni.showModal({
    title: '门店位置',
    content: `${address}\n经纬度：${lng}, ${lat}`,
    showCancel: false
  })
  // #endif
}

function goBack() { uni.navigateBack() }
</script>

<style lang="scss" scoped>
.sd { min-height: 100vh; background: $bg; padding-bottom: 140rpx; }

.sd-hero {
  position: relative;
  padding: 0 24rpx 32rpx;
  background: linear-gradient(135deg, #FF8A3D, $brand-deep);
  color: #fff;
  overflow: hidden;
}
.sd-hero__bg {
  position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.18), transparent 50%);
  pointer-events: none;
}
.sd-hero__nav {
  display: flex; align-items: center; justify-content: space-between;
  height: calc(44px + env(safe-area-inset-top));
}
.sd-hero__back {
  width: 60rpx; height: 60rpx;
  display: flex; align-items: center; justify-content: center;
  font-size: 50rpx;
}
.sd-hero__title { font-size: 32rpx; font-weight: 600; }
.sd-hero__name { font-size: 44rpx; font-weight: 700; margin-top: 24rpx; }
.sd-hero__rating { font-size: 24rpx; opacity: 0.9; margin-top: 8rpx; }

.block {
  background: #fff;
  border-radius: $r-md;
  margin: $gap-md;
  padding: $gap-md;
  box-shadow: $shadow-sm;
  &__title {
    display: flex; align-items: center;
    font-size: 28rpx; font-weight: 600; color: $ink;
    margin-bottom: 16rpx;
    .bar {
      display: inline-block; width: 6rpx; height: 26rpx;
      background: $brand; border-radius: 3rpx; margin-right: 12rpx;
    }
  }
}

.row {
  display: flex; align-items: center; gap: 16rpx;
  padding: 18rpx 0;
  border-bottom: 1rpx solid $line;
  &:last-child { border-bottom: none; }
  &__label { font-size: 26rpx; color: $ink-3; min-width: 130rpx; }
  &__val { font-size: 26rpx; color: $ink; flex: 1; }
  &__btn {
    padding: 8rpx 20rpx;
    background: $bg; color: $ink-2;
    border-radius: $r-pill; font-size: 22rpx;
    &--brand {
      background: $brand-soft; color: $brand-deep;
      border: 1rpx solid $brand-line;
    }
  }
}

.stat-row {
  display: grid; grid-template-columns: repeat(4, 1fr);
  text-align: center;
}
.stat {
  display: flex; flex-direction: column; gap: 6rpx;
  padding: 12rpx 0;
  &__num { font-size: 32rpx; font-weight: 700; color: $brand; }
  &__label { font-size: 22rpx; color: $ink-3; }
}

.img-scroll { white-space: nowrap; }
.img-scroll__item {
  display: inline-block;
  width: 360rpx; height: 240rpx;
  border-radius: $r-sm;
  margin-right: 16rpx;
  background: $bg;
}

.sd-footer {
  position: fixed; left: 0; right: 0; bottom: 0;
  display: flex; gap: 16rpx;
  padding: 16rpx 24rpx;
  background: #fff;
  box-shadow: 0 -2rpx 12rpx rgba(20, 24, 32, 0.06);
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  z-index: 50;
  &__btn {
    flex: 1; text-align: center; padding: 24rpx 0;
    font-size: 28rpx; font-weight: 600;
    border-radius: $r-pill;
  }
}
</style>
