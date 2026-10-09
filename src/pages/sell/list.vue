<template>
  <view class="sl">
    <view class="sl-nav">
      <view class="sl-nav__back" @click="goBack">‹</view>
      <text class="sl-nav__title">我的卖车</text>
      <view class="sl-nav__add" @click="go('/pages/sale/sell')">+ 新申请</view>
    </view>

    <view v-if="!list.length" class="empty">
      <text class="empty-icon">🚗</text>
      暂无卖车记录
      <view class="empty__cta" @click="go('/pages/sale/sell')">立即卖车</view>
    </view>

    <view v-else>
      <view v-for="item in list" :key="item.id" class="card-item">
        <view class="card-item__top">
          <text class="card-item__id">订单号 {{ item.id }}</text>
          <text class="card-item__status" :class="`is-${item.status}`">{{ statusText(item.status) }}</text>
        </view>
        <view class="card-item__car">
          <text class="brand">{{ item.brand }} {{ item.model }}</text>
          <text class="meta">{{ item.year }}款 · {{ (item.mileage / 10000).toFixed(1) }}万公里 · {{ item.city }}</text>
        </view>
        <view class="card-item__price-row">
          <view>
            <text class="lbl">期望售价</text>
            <text class="val">¥{{ formatMoney(item.expectPrice) }}</text>
          </view>
          <view v-if="item.quotePrice">
            <text class="lbl">平台评估价</text>
            <text class="val brand">¥{{ formatMoney(item.quotePrice) }}</text>
          </view>
        </view>
        <view class="card-item__footer">
          <text class="time">提交于 {{ item.createdAt }}</text>
          <view v-if="item.status === 'quoted'" class="card-item__cta" @click="accept(item)">接受报价</view>
          <view v-else-if="item.status === 'submitted' || item.status === 'evaluating'" class="card-item__cta card-item__cta--ghost" @click="cancel(item)">取消申请</view>
        </view>
        <!-- 进度条 -->
        <view class="progress">
          <view class="progress__line" :style="{ width: progressWidth(item.status) + '%' }"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { sellApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { SELL_STATUS_TEXT, type SellRequest, type SellStatus } from '@/types'

const userStore = useUserStore()
const list = ref<SellRequest[]>([])

const PROGRESS: Record<SellStatus, number> = {
  submitted: 16,
  evaluating: 35,
  quoted: 55,
  appointed: 75,
  deal: 100,
  rejected: 100,
  cancelled: 100
}

function reload() {
  if (!userStore.user?.phone) return
  list.value = sellApi.listByPhone(userStore.user.phone)
}

onShow(reload)

const statusText = (s: SellStatus) => SELL_STATUS_TEXT[s]
const progressWidth = (s: SellStatus) => PROGRESS[s]
function formatMoney(n: number) { return n.toLocaleString('zh-CN') }

function accept(item: SellRequest) {
  uni.showModal({
    title: '确认接受报价',
    content: `平台评估价 ¥${formatMoney(item.quotePrice)}，确认后将为您预约到店`,
    success: ({ confirm }) => {
      if (!confirm) return
      sellApi.update(item.id, { status: 'appointed', appointTime: '明天 10:00' })
      reload()
      uni.showToast({ title: '已预约，请准时到店', icon: 'success' })
    }
  })
}

function cancel(item: SellRequest) {
  uni.showModal({
    title: '取消申请',
    content: '确定要取消该卖车申请吗？',
    success: ({ confirm }) => {
      if (!confirm) return
      sellApi.update(item.id, { status: 'cancelled' })
      reload()
    }
  })
}

function go(url: string) { uni.navigateTo({ url }) }
function goBack() { uni.navigateBack() }
</script>

<style lang="scss" scoped>
.sl { min-height: 100vh; background: $bg; }

.sl-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20rpx 24rpx;
  background: #fff;
  &__back {
    width: 60rpx; height: 60rpx;
    display: flex; align-items: center; justify-content: center;
    font-size: 50rpx;
  }
  &__title { font-size: 32rpx; font-weight: 600; }
  &__add { font-size: 26rpx; color: $brand; padding: 8rpx 16rpx; }
}

.empty {
  padding: 200rpx 0 0;
  text-align: center; color: $ink-3;
  &__icon { font-size: 100rpx; display: block; margin-bottom: 24rpx; opacity: 0.5; }
  &__cta {
    display: inline-block; margin-top: 32rpx;
    padding: 20rpx 60rpx;
    background: linear-gradient(135deg, $brand, $brand-deep);
    color: #fff; font-size: 28rpx; font-weight: 600;
    border-radius: $r-pill;
    box-shadow: 0 8rpx 20rpx rgba(255, 106, 0, 0.3);
  }
}

.card-item {
  background: #fff;
  border-radius: $r-md;
  margin: $gap-md;
  padding: $gap-md;
  box-shadow: $shadow-sm;
  position: relative;
  &__top { display: flex; justify-content: space-between; align-items: center; }
  &__id { font-size: 22rpx; color: $ink-3; }
  &__status {
    font-size: 22rpx; font-weight: 600;
    padding: 4rpx 16rpx;
    border-radius: $r-xs;
    &.is-submitted { background: #FFF3EA; color: $brand-deep; }
    &.is-evaluating { background: #EAF2FF; color: #1A62D6; }
    &.is-quoted { background: #E8F8EC; color: $success; }
    &.is-appointed { background: #FFF3EA; color: $warning; }
    &.is-deal { background: #E8F8EC; color: $success; }
    &.is-rejected, &.is-cancelled { background: $bg; color: $ink-3; }
  }
  &__car {
    margin: 20rpx 0;
    .brand { font-size: 30rpx; font-weight: 600; color: $ink; display: block; }
    .meta { font-size: 22rpx; color: $ink-3; margin-top: 6rpx; display: block; }
  }
  &__price-row {
    display: flex; justify-content: space-between;
    background: $bg;
    border-radius: $r-sm;
    padding: 18rpx 20rpx;
    .lbl { font-size: 22rpx; color: $ink-3; display: block; }
    .val { font-size: 28rpx; font-weight: 600; color: $ink; display: block; margin-top: 4rpx;
      &.brand { color: $brand; font-family: 'DIN Alternate', sans-serif; }
    }
  }
  &__footer {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 20rpx;
    .time { font-size: 22rpx; color: $ink-3; }
  }
  &__cta {
    padding: 12rpx 28rpx;
    background: linear-gradient(135deg, $brand, $brand-deep);
    color: #fff;
    border-radius: $r-pill;
    font-size: 24rpx; font-weight: 600;
    &--ghost {
      background: #fff;
      color: $ink-2;
      border: 1rpx solid $line;
    }
  }
}

.progress {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 6rpx;
  background: $line;
  border-radius: 3rpx;
  overflow: hidden;
  &__line {
    height: 100%;
    background: linear-gradient(90deg, $brand, $brand-deep);
    transition: width 0.3s;
  }
}
</style>
