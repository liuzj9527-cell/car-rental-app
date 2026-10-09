<template>
  <view class="user">
    <!-- 头部 -->
    <view class="user-hero">
      <view class="user-hero__bg"></view>
      <view class="user-hero__top" :style="{ paddingTop: statusBarHeight + 'px' }">
        <view class="user-hero__setting" @click="onMenu('settings')">⚙️</view>
        <view class="user-hero__msg" @click="onMenu('service')">💬</view>
      </view>

      <view class="user-hero__main" @click="goLogin">
        <image v-if="userStore.user?.avatar" :src="userStore.user.avatar" class="user-hero__avatar" mode="aspectFill" />
        <view v-else class="user-hero__avatar user-hero__avatar--default">👤</view>
        <view class="user-hero__info">
          <view class="user-hero__name">
            {{ userStore.isLogin ? userStore.user!.name : '点击登录' }}
            <text v-if="userStore.isVip" class="user-hero__vip">👑 {{ VIP_LEVEL_TEXT[userStore.vipInfo.level] }}</text>
          </view>
          <view class="user-hero__sub">
            <text v-if="userStore.isLogin">📱 {{ maskPhone(userStore.user!.phone) }}</text>
            <text v-else>登录后享受更多权益</text>
          </view>
        </view>
        <text v-if="!userStore.isLogin" class="user-hero__arrow">›</text>
      </view>
    </view>

    <!-- VIP 卡 -->
    <view v-if="userStore.isVip" class="vip-card">
      <view class="vip-card__top">
        <view>
          <view class="vip-card__level">👑 {{ VIP_LEVEL_TEXT[userStore.vipInfo.level] }}</view>
          <view class="vip-card__expire">有效期至 {{ userStore.vipInfo.expire }}</view>
        </view>
        <view class="vip-card__no">NO. {{ userStore.vipInfo.points }} 积分</view>
      </view>
      <view class="vip-card__benefits">
        <view class="vip-card__benefit">
          <text class="num">{{ userStore.vipInfo.freeWarrantyTotal - userStore.vipInfo.freeWarrantyUsed }}</text>
          <text class="lbl">剩余保修</text>
        </view>
        <view class="vip-card__benefit">
          <text class="num">¥{{ (userStore.vipInfo.compensateAmount / 10000).toFixed(1) }}万</text>
          <text class="lbl">交易必赔</text>
        </view>
        <view class="vip-card__benefit">
          <text class="num">✓</text>
          <text class="lbl">专属顾问</text>
        </view>
      </view>
    </view>
    <view v-else class="vip-cta" @click="go('/pages/vip/vip')">
      <view class="vip-cta__body">
        <text class="vip-cta__crown">👑</text>
        <view>
          <view class="vip-cta__title">开通驭驰 VIP 会员</view>
          <view class="vip-cta__sub">免费保修 · 交易必赔 · 专属顾问</view>
        </view>
      </view>
      <view class="vip-cta__btn">立即开通</view>
    </view>

    <!-- 资产栏 -->
    <view class="asset-bar">
      <view class="asset">
        <text class="asset-num">{{ userStore.user?.points || 0 }}</text>
        <text class="asset-label">积分</text>
      </view>
      <view class="asset" @click="go('/pages/coupon/coupon')">
        <text class="asset-num">{{ usableCoupons }}</text>
        <text class="asset-label">优惠券</text>
      </view>
      <view class="asset">
        <text class="asset-num">¥0</text>
        <text class="asset-label">余额</text>
      </view>
      <view class="asset" @click="go('/pages/order/list')">
        <text class="asset-num">{{ orderStats.all }}</text>
        <text class="asset-label">订单</text>
      </view>
    </view>

    <!-- 我的订单 -->
    <view class="order-block">
      <view class="order-block__head">
        <text class="title">我的订单</text>
        <text class="more" @click="go('/pages/order/list')">查看全部 ›</text>
      </view>
      <view class="order-block__grid">
        <view class="order-tab" v-for="t in orderTabs" :key="t.key" @click="go('/pages/order/list?status=' + t.key)">
          <view class="order-tab__icon-wrap">
            <text class="order-tab__icon">{{ t.icon }}</text>
            <view v-if="orderStats[t.key] > 0" class="order-tab__badge">{{ orderStats[t.key] }}</view>
          </view>
          <text class="order-tab__label">{{ t.label }}</text>
        </view>
      </view>
    </view>

    <!-- 业务矩阵 -->
    <view class="biz-grid">
      <view class="biz-item" @click="go('/pages/sell/list')">
        <text class="biz-item__icon">📋</text>
        <view>
          <view class="biz-item__title">卖车订单</view>
          <view class="biz-item__sub">查看卖车进度</view>
        </view>
      </view>
      <view class="biz-item" @click="go('/pages/installment/calc')">
        <text class="biz-item__icon">💳</text>
        <view>
          <view class="biz-item__title">分期购车</view>
          <view class="biz-item__sub">月供试算</view>
        </view>
      </view>
      <view class="biz-item" @click="go('/pages/store/map')">
        <text class="biz-item__icon">📍</text>
        <view>
          <view class="biz-item__title">附近门店</view>
          <view class="biz-item__sub">200+ 网点</view>
        </view>
      </view>
      <view class="biz-item" @click="go('/pages/vip/vip')">
        <text class="biz-item__icon">👑</text>
        <view>
          <view class="biz-item__title">VIP 中心</view>
          <view class="biz-item__sub">会员权益</view>
        </view>
      </view>
    </view>

    <!-- 工具菜单 -->
    <view class="menu">
      <view v-for="m in menus" :key="m.label" class="menu-item" @click="onMenu(m.action)">
        <text class="menu-item__icon">{{ m.icon }}</text>
        <text class="menu-item__label">{{ m.label }}</text>
        <text v-if="m.badge" class="menu-item__badge">{{ m.badge }}</text>
        <text class="menu-item__arrow">›</text>
      </view>
    </view>

    <view class="footer-tip">驭驰车服 v2.0 · 让出行更简单</view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { orderApi, couponApi, resetDB } from '@/api'
import { maskPhone } from '@/utils/format'
import { VIP_LEVEL_TEXT } from '@/types'

const userStore = useUserStore()
const statusBarHeight = ref(20)
const myOrders = ref(orderApi.listByPhone('13800138000'))
const coupons = ref(couponApi.list())

const orderTabs = [
  { key: 'pending', icon: '💳', label: '待支付' },
  { key: 'paid', icon: '🔑', label: '待取车' },
  { key: 'active', icon: '🚗', label: '租赁中' },
  { key: 'returned', icon: '✅', label: '已完成' }
]

const orderStats = computed(() => {
  const all = myOrders.value
  return {
    all: all.length,
    pending: all.filter(o => o.status === 'pending').length,
    paid: all.filter(o => o.status === 'paid').length,
    active: all.filter(o => o.status === 'active').length,
    returned: all.filter(o => o.status === 'returned').length
  }
})

const usableCoupons = computed(() => coupons.value.filter(c => !c.used).length)

const menus = [
  { icon: '🪪', label: '驾驶证认证', action: 'license', badge: '已认证' },
  { icon: '🏪', label: '我的门店', action: 'stores' },
  { icon: '❤️', label: '我的收藏', action: 'fav' },
  { icon: '📞', label: '联系客服', action: 'service' },
  { icon: '⚙️', label: '账号设置', action: 'settings' },
  { icon: '🔄', label: '重置演示数据', action: 'reset' }
]

onShow(() => {
  try { statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 20 } catch { /* ignore */ }
  myOrders.value = orderApi.listByPhone(userStore.user?.phone || '13800138000')
  coupons.value = couponApi.list()
})

function goLogin() {
  if (!userStore.isLogin) uni.navigateTo({ url: '/pages/login/login' })
}

function onMenu(action: string) {
  switch (action) {
    case 'settings': uni.showToast({ title: '设置开发中', icon: 'none' }); break
    case 'service': uni.makePhoneCall({ phoneNumber: '400-888-6688' }); break
    case 'license': uni.showToast({ title: '驾驶证已认证', icon: 'success' }); break
    case 'stores': uni.navigateTo({ url: '/pages/store/map' }); break
    case 'fav': uni.showToast({ title: '收藏功能开发中', icon: 'none' }); break
    case 'reset':
      uni.showModal({
        title: '重置演示数据',
        content: '将清空所有本地数据并恢复初始演示状态',
        success: (res) => {
          if (res.confirm) {
            resetDB()
            userStore.resetVip()
            uni.showToast({ title: '已重置', icon: 'success' })
            setTimeout(() => uni.reLaunch({ url: '/pages/index/index' }), 800)
          }
        }
      })
      break
  }
}

function go(url: string) { uni.navigateTo({ url }) }
</script>

<style lang="scss" scoped>
.user { min-height: 100vh; background: $bg; padding-bottom: 60rpx; }

/* 头部 */
.user-hero {
  position: relative;
  padding: 0 24rpx 80rpx;
  background: linear-gradient(135deg, #FF8A3D, $brand-deep);
  color: #fff;
  overflow: hidden;
  &__bg {
    position: absolute; inset: 0;
    background:
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.18), transparent 50%),
      radial-gradient(circle at 10% 80%, rgba(255, 138, 61, 0.4), transparent 60%);
  }
  &__top {
    display: flex; justify-content: flex-end; gap: 24rpx;
    height: calc(44px + env(safe-area-inset-top));
    align-items: center;
  }
  &__setting, &__msg { font-size: 36rpx; padding: 8rpx; }
  &__main {
    display: flex; align-items: center; gap: 24rpx;
    padding: 16rpx 0;
  }
  &__avatar {
    width: 120rpx; height: 120rpx;
    border-radius: 50%;
    border: 4rpx solid rgba(255, 255, 255, 0.4);
    &--default {
      background: rgba(255, 255, 255, 0.25);
      display: flex; align-items: center; justify-content: center;
      font-size: 56rpx;
    }
  }
  &__info { flex: 1; min-width: 0; }
  &__name {
    font-size: 36rpx; font-weight: 700;
    display: flex; align-items: center; gap: 12rpx;
    flex-wrap: wrap;
  }
  &__vip {
    background: $gold; color: #1F1D1A;
    font-size: 20rpx; font-weight: 600;
    padding: 4rpx 14rpx;
    border-radius: $r-pill;
  }
  &__sub { font-size: 24rpx; opacity: 0.9; margin-top: 8rpx; }
  &__arrow { font-size: 50rpx; opacity: 0.7; }
}

/* VIP 卡 */
.vip-card {
  margin: -60rpx $gap-md $gap-md;
  background: linear-gradient(135deg, #2C2925, #1F1D1A);
  border-radius: $r-md;
  padding: 28rpx;
  color: #fff;
  box-shadow: $shadow-md;
  border: 1rpx solid rgba(212, 175, 106, 0.4);
  position: relative; z-index: 2;
  &__top { display: flex; justify-content: space-between; align-items: flex-start; }
  &__level { color: $gold; font-size: 30rpx; font-weight: 700; }
  &__expire { color: rgba(255, 255, 255, 0.6); font-size: 22rpx; margin-top: 6rpx; }
  &__no { color: rgba(255, 255, 255, 0.4); font-size: 22rpx; }
  &__benefits {
    display: grid; grid-template-columns: repeat(3, 1fr);
    margin-top: 24rpx;
    padding-top: 24rpx;
    border-top: 1rpx solid rgba(255, 255, 255, 0.1);
  }
  &__benefit {
    text-align: center;
    .num { display: block; color: $gold; font-size: 32rpx; font-weight: 700; }
    .lbl { display: block; color: rgba(255, 255, 255, 0.6); font-size: 22rpx; margin-top: 4rpx; }
  }
}

.vip-cta {
  display: flex; align-items: center; justify-content: space-between;
  margin: -60rpx $gap-md $gap-md;
  padding: 24rpx 28rpx;
  background: linear-gradient(135deg, #2C2925, #1F1D1A);
  border-radius: $r-md;
  color: #fff;
  box-shadow: $shadow-md;
  position: relative; z-index: 2;
  &__body { display: flex; align-items: center; gap: 16rpx; }
  &__crown { font-size: 44rpx; }
  &__title { color: $gold; font-size: 28rpx; font-weight: 700; }
  &__sub { color: rgba(255, 255, 255, 0.6); font-size: 22rpx; margin-top: 4rpx; }
  &__btn {
    background: linear-gradient(135deg, $gold, $gold-deep);
    color: #1F1D1A;
    padding: 12rpx 24rpx;
    border-radius: $r-pill;
    font-size: 24rpx; font-weight: 600;
  }
}

/* 资产栏 */
.asset-bar {
  background: #fff;
  margin: 0 $gap-md $gap-md;
  border-radius: $r-md;
  padding: 28rpx 0;
  display: flex;
  box-shadow: $shadow-sm;
}
.asset {
  flex: 1;
  display: flex; flex-direction: column;
  align-items: center; gap: 6rpx;
  border-right: 1rpx solid $line;
  &:last-child { border-right: none; }
  &-num { font-size: 34rpx; font-weight: 700; color: $ink; font-family: 'DIN Alternate', sans-serif; }
  &-label { font-size: 22rpx; color: $ink-3; }
}

/* 我的订单 */
.order-block {
  background: #fff;
  border-radius: $r-md;
  margin: 0 $gap-md $gap-md;
  padding: $gap-md;
  box-shadow: $shadow-sm;
  &__head {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 20rpx;
    .title { font-size: 28rpx; font-weight: 600; color: $ink; }
    .more { font-size: 24rpx; color: $ink-3; }
  }
  &__grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 16rpx;
  }
}
.order-tab {
  display: flex; flex-direction: column; align-items: center; gap: 10rpx;
  padding: 16rpx 0;
  &__icon-wrap {
    position: relative;
    width: 64rpx; height: 64rpx;
    display: flex; align-items: center; justify-content: center;
  }
  &__icon { font-size: 44rpx; }
  &__badge {
    position: absolute; top: -6rpx; right: -10rpx;
    background: $danger; color: #fff;
    font-size: 20rpx; font-weight: 600;
    padding: 2rpx 10rpx;
    border-radius: 12rpx;
    min-width: 32rpx; text-align: center;
  }
  &__label { font-size: 22rpx; color: $ink-2; }
}

/* 业务矩阵 */
.biz-grid {
  background: #fff;
  border-radius: $r-md;
  margin: 0 $gap-md $gap-md;
  padding: $gap-md;
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 1rpx;
  background: $line;
  overflow: hidden;
  box-shadow: $shadow-sm;
}
.biz-item {
  background: #fff;
  display: flex; align-items: center; gap: 16rpx;
  padding: 24rpx;
  &__icon {
    font-size: 44rpx;
    width: 80rpx; height: 80rpx;
    background: $brand-soft; color: $brand-deep;
    border-radius: 20rpx;
    display: flex; align-items: center; justify-content: center;
  }
  &__title { font-size: 28rpx; color: $ink; font-weight: 600; }
  &__sub { font-size: 22rpx; color: $ink-3; margin-top: 4rpx; }
}

/* 工具菜单 */
.menu {
  background: #fff;
  border-radius: $r-md;
  margin: 0 $gap-md $gap-md;
  overflow: hidden;
  box-shadow: $shadow-sm;
}
.menu-item {
  display: flex; align-items: center; gap: 20rpx;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid $line;
  &:last-child { border-bottom: none; }
  &__icon { font-size: 36rpx; width: 44rpx; text-align: center; }
  &__label { flex: 1; font-size: 28rpx; color: $ink; }
  &__badge {
    background: $brand-soft; color: $brand-deep;
    padding: 4rpx 14rpx;
    border-radius: $r-xs;
    font-size: 22rpx;
  }
  &__arrow { color: $ink-4; font-size: 32rpx; }
}

.footer-tip {
  text-align: center; font-size: 22rpx; color: $ink-4;
  padding: 40rpx 0 0;
}
</style>
