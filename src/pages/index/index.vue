<template>
  <view class="home">
    <!-- 顶部自定义导航 -->
    <view class="home-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="home-nav__city" @click="goCity">
        <text class="city-name">{{ currentCity || '深圳' }}</text>
        <text class="city-arrow">▾</text>
      </view>
      <view class="home-nav__search" @click="goSearch">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">搜索车型 / 品牌 / 城市</text>
      </view>
      <view class="home-nav__msg" @click="goMsg">
        <text class="msg-icon">🔔</text>
        <view class="msg-dot"></view>
      </view>
    </view>

    <!-- 头部渐变背景（banner 通用） -->
    <view class="home-hero">
      <view class="home-hero__mask"></view>

      <!-- 4 大金刚区 -->
      <view class="quick-grid">
        <view class="quick-item" @click="goTab('/pages/vehicle/list')">
          <view class="quick-icon" style="background: linear-gradient(135deg, #FF8A3D, #FF6A00);">🚗</view>
          <text class="quick-label">短租自驾</text>
          <text class="quick-sub">¥99 起</text>
        </view>
        <view class="quick-item" @click="goTab('/pages/sale/list')">
          <view class="quick-icon" style="background: linear-gradient(135deg, #4F8AFF, #1A62D6);">🛒</view>
          <text class="quick-label">二手车</text>
          <text class="quick-sub">分期 1 成</text>
        </view>
        <view class="quick-item" @click="go('/pages/sale/sell')">
          <view class="quick-icon" style="background: linear-gradient(135deg, #00C896, #00891F);">💰</view>
          <text class="quick-label">卖车</text>
          <text class="quick-sub">高价收车</text>
        </view>
        <view class="quick-item" @click="goVip()">
          <view class="quick-icon vip-icon">👑</view>
          <text class="quick-label">VIP 会员</text>
          <text class="quick-sub">免费保修</text>
        </view>
      </view>

      <!-- 通知条 -->
      <view class="notice">
        <text class="notice-icon">📣</text>
        <text class="notice-text ellipsis">驭驰车服全国直营 · 20+ 城市 200+ 门店随时为您服务</text>
        <text class="notice-more">详情 ›</text>
      </view>
    </view>

    <!-- 主内容 -->
    <view class="home-body">
      <!-- 业务矩阵卡片 -->
      <view class="biz-card">
        <view class="biz-card__item" @click="goinstallment()">
          <text class="biz-emoji">💳</text>
          <view>
            <view class="biz-title">分期购车</view>
            <view class="biz-sub">低首付 / 月供低</view>
          </view>
          <text class="biz-arrow">›</text>
        </view>
        <view class="biz-card__item" @click="goCity()">
          <text class="biz-emoji">📍</text>
          <view>
            <view class="biz-title">附近门店</view>
            <view class="biz-sub">200+ 直营网点</view>
          </view>
          <text class="biz-arrow">›</text>
        </view>
        <view class="biz-card__item" @click="goCoupon()">
          <text class="biz-emoji">🎟️</text>
          <view>
            <view class="biz-title">优惠券</view>
            <view class="biz-sub">领券省钱</view>
          </view>
          <text class="biz-arrow">›</text>
        </view>
        <view class="biz-card__item" @click="gosellList()">
          <text class="biz-emoji">📋</text>
          <view>
            <view class="biz-title">卖车订单</view>
            <view class="biz-sub">查看进度</view>
          </view>
          <text class="biz-arrow">›</text>
        </view>
      </view>

      <!-- VIP 入口 -->
      <view v-if="!userStore.isVip" class="vip-banner" @click="goVip()">
        <view class="vip-banner__left">
          <text class="vip-crown">👑</text>
          <view>
            <view class="vip-banner__title">开通驭驰 VIP</view>
            <view class="vip-banner__sub">免费保修 · 专业顾问 · 交易必赔</view>
          </view>
        </view>
        <view class="vip-banner__cta">立即开通</view>
      </view>

      <!-- 推荐二手车 -->
      <view class="section">
        <view class="section-title">
          <view><text class="bar"></text>精选二手车</view>
          <text class="more" @click="goTab('/pages/sale/list')">查看更多 ›</text>
        </view>
        <scroll-view scroll-x class="sale-scroll" :show-scrollbar="false">
          <view class="sale-scroll__item" v-for="car in hotSales" :key="car.id" @click="goSaleDetail(car.id)">
            <car-image :src="car.images[0]" :brand="car.brand" height="220rpx" radius="16rpx" />
            <view class="sale-scroll__title ellipsis">{{ car.title }}</view>
            <view class="sale-scroll__price">
              <text class="price">{{ formatWan(car.price) }}</text>
              <text class="price--unit">万</text>
            </view>
            <view class="sale-scroll__meta">
              <text>{{ car.carAge }}年</text>
              <text class="dot">·</text>
              <text>{{ (car.mileage / 10000).toFixed(1) }}万公里</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 城市列表 -->
      <view class="section">
        <view class="section-title">
          <view><text class="bar"></text>热门城市</view>
          <text class="more" @click="goCity()">门店地图 ›</text>
        </view>
        <view class="city-grid">
          <view v-for="c in hotCities" :key="c.name" class="city-chip" @click="onCity(c.name)">
            <text>{{ c.name }}</text>
            <text class="city-chip__num">{{ getStoreCount(c.name) }}店</text>
          </view>
        </view>
      </view>

      <!-- 推荐租车 -->
      <view class="section">
        <view class="section-title">
          <view><text class="bar"></text>附近可租</view>
          <text class="more" @click="goTab('/pages/vehicle/list')">查看更多 ›</text>
        </view>
        <view class="vehicle-list">
          <car-card v-for="v in recommendRent" :key="v.id" :vehicle="v" />
        </view>
      </view>

      <view class="footer-tip">— 驭驰车服 让出行更简单 —</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CarImage from '@/components/car-image.vue'
import CarCard from '@/components/car-card.vue'
import { saleApi, storeApi, vehicleApi, cityApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { formatWan } from '@/utils/format'

const userStore = useUserStore()
const currentCity = ref('深圳')
const statusBarHeight = ref(20)

onShow(() => {
  try {
    const sys = uni.getSystemInfoSync()
    statusBarHeight.value = sys.statusBarHeight || 20
  } catch { /* ignore */ }
})

const hotSales = computed(() => saleApi.list({ sort: 'newest' }).slice(0, 6))
const recommendRent = computed(() => vehicleApi.list({ city: currentCity.value }).slice(0, 3))
const hotCities = computed(() => cityApi.hot().slice(0, 12))

function getStoreCount(name: string) {
  return storeApi.list(name).length
}

function onCity(name: string) {
  currentCity.value = name
  uni.switchTab({ url: '/pages/vehicle/list' })
}

function goTab(url: string) { uni.switchTab({ url }) }
function go(url: string) { uni.switchTab({ url }) }
function goSaleDetail(id: number) { uni.navigateTo({ url: `/pages/sale/detail?id=${id}` }) }

function goCity() {
  uni.navigateTo({ url: '/pages/store/map' })
}
function goinstallment() {
  uni.navigateTo({ url: '/pages/installment/calc' })
}

function goCoupon() {
  uni.navigateTo({ url: '/pages/coupon/coupon' })
}
function gosellList() {
  uni.navigateTo({ url: '/pages/sell/list' })
}

function goVip() {
  uni.navigateTo({ url: '/pages/vip/vip' })
}
function goSearch() {
  uni.switchTab({ url: '/pages/sale/list?focusSearch=1' })
}
function goMsg() {
  uni.showToast({ title: '暂无新消息', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.home { min-height: 100vh; background: $bg; padding-bottom: 40rpx; }

/* 顶部导航 */
.home-nav {
  position: fixed; left: 0; right: 0; top: 0; z-index: 100;
  display: flex; align-items: center; gap: 20rpx;
  padding: 0 24rpx 16rpx;
  background: linear-gradient(180deg, rgba(255, 106, 0, 0.08), transparent);
}
.home-nav__city {
  display: flex; align-items: center; gap: 4rpx;
  color: $ink; font-size: 28rpx; font-weight: 600;
  padding: 12rpx 14rpx;
  .city-arrow { font-size: 22rpx; color: $ink-2; }
}
.home-nav__search {
  flex: 1;
  background: #fff;
  border-radius: $r-pill;
  height: 64rpx;
  display: flex; align-items: center; gap: 10rpx;
  padding: 0 24rpx;
  box-shadow: $shadow-sm;
  .search-icon { font-size: 24rpx; }
  .search-placeholder { font-size: 26rpx; color: $ink-3; }
}
.home-nav__msg {
  position: relative; padding: 12rpx;
  .msg-icon { font-size: 36rpx; }
  .msg-dot {
    position: absolute; top: 8rpx; right: 8rpx;
    width: 14rpx; height: 14rpx; border-radius: 50%;
    background: $danger; border: 2rpx solid #fff;
  }
}

/* 头部 */
.home-hero {
  position: relative;
  padding: 100rpx 24rpx 24rpx;
  background: linear-gradient(180deg, #FFEDD3 0%, #FFF8F1 60%, $bg 100%);
}
.home-hero__mask {
  position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 0%, rgba(255, 138, 61, 0.25), transparent 50%);
  pointer-events: none;
}

.quick-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  background: #fff;
  border-radius: $r-md;
  padding: 32rpx 0;
  box-shadow: $shadow-md;
  position: relative;
}
.quick-item {
  display: flex; flex-direction: column; align-items: center; gap: 12rpx;
}
.quick-icon {
  width: 92rpx; height: 92rpx; border-radius: 24rpx;
  display: flex; align-items: center; justify-content: center;
  font-size: 48rpx; color: #fff;
  box-shadow: 0 6rpx 16rpx rgba(255, 106, 0, 0.25);
}
.vip-icon { background: linear-gradient(135deg, #2A2620, #D4AF6A); box-shadow: 0 6rpx 16rpx rgba(212, 175, 106, 0.4); }
.quick-label { font-size: 26rpx; color: $ink; font-weight: 500; }
.quick-sub { font-size: 20rpx; color: $ink-3; }

.notice {
  margin-top: 24rpx;
  display: flex; align-items: center; gap: 10rpx;
  padding: 16rpx 20rpx;
  background: rgba(255, 255, 255, 0.7);
  border-radius: $r-sm;
  font-size: 24rpx; color: $ink-2;
  .notice-icon { font-size: 26rpx; }
  .notice-text { flex: 1; }
  .notice-more { font-size: 22rpx; color: $brand; }
}

.home-body { padding-top: 24rpx; }

/* 业务矩阵 */
.biz-card {
  background: #fff;
  border-radius: $r-md;
  margin: 0 $gap-md $gap-md;
  display: grid; grid-template-columns: repeat(2, 1fr);
  overflow: hidden;
  box-shadow: $shadow-sm;
}
.biz-card__item {
  display: flex; align-items: center; gap: 16rpx;
  padding: 28rpx 24rpx;
  border-right: 1rpx solid $line;
  border-bottom: 1rpx solid $line;
  &:nth-child(2n) { border-right: none; }
  &:nth-last-child(-n+2) { border-bottom: none; }
}
.biz-emoji { font-size: 40rpx; }
.biz-title { font-size: 28rpx; color: $ink; font-weight: 600; }
.biz-sub { font-size: 22rpx; color: $ink-3; margin-top: 4rpx; }
.biz-arrow { margin-left: auto; color: $ink-4; font-size: 32rpx; }

/* VIP 横幅 */
.vip-banner {
  margin: 0 $gap-md $gap-md;
  background: linear-gradient(135deg, #1F1D1A, #3A342B);
  border-radius: $r-md;
  padding: 28rpx 24rpx;
  display: flex; align-items: center; justify-content: space-between;
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(31, 29, 26, 0.25);
}
.vip-banner__left { display: flex; align-items: center; gap: 16rpx; }
.vip-crown { font-size: 44rpx; }
.vip-banner__title { color: $gold; font-size: 28rpx; font-weight: 600; }
.vip-banner__sub { color: rgba(255, 255, 255, 0.6); font-size: 22rpx; margin-top: 4rpx; }
.vip-banner__cta {
  background: linear-gradient(135deg, $gold, $gold-deep);
  color: #1F1D1A;
  font-size: 24rpx; font-weight: 600;
  padding: 12rpx 24rpx; border-radius: $r-pill;
}

/* section 通用 */
.section {
  background: #fff;
  border-radius: $r-md;
  margin: 0 $gap-md $gap-md;
  padding-bottom: 24rpx;
  box-shadow: $shadow-sm;
}

/* 二手车横滑 */
.sale-scroll {
  white-space: nowrap;
  padding: 16rpx 24rpx 0;
}
.sale-scroll__item {
  display: inline-block;
  width: 300rpx; vertical-align: top;
  margin-right: 20rpx;
  background: #fff;
  &:last-child { margin-right: 0; }
}
.sale-scroll__title {
  font-size: 26rpx; color: $ink; font-weight: 500;
  margin-top: 12rpx;
}
.sale-scroll__price { margin-top: 8rpx; }
.sale-scroll__price .price { font-size: 34rpx; }
.sale-scroll__meta { font-size: 20rpx; color: $ink-3; margin-top: 4rpx; .dot { margin: 0 6rpx; } }

/* 城市网格 */
.city-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 16rpx; padding: 16rpx 24rpx 0;
}
.city-chip {
  background: $brand-soft; color: $brand-deep;
  border-radius: $r-sm;
  padding: 18rpx 0; text-align: center;
  font-size: 24rpx;
  display: flex; flex-direction: column; align-items: center; gap: 4rpx;
}
.city-chip__num { font-size: 18rpx; opacity: 0.7; }

/* 租车列表 */
.vehicle-list { padding-top: 8rpx; }

.footer-tip {
  text-align: center; font-size: 22rpx; color: $ink-4;
  padding: 40rpx 0 0;
}
</style>
