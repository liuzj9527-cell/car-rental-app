<template>
  <view class="cp">
    <view class="cp-tabs">
      <view :class="['cp-tab', { active: tab === 'usable' }]" @click="tab = 'usable'">
        可使用 <text v-if="usableCount" class="cp-tab__badge">{{ usableCount }}</text>
      </view>
      <view :class="['cp-tab', { active: tab === 'used' }]" @click="tab = 'used'">已使用</view>
      <view :class="['cp-tab', { active: tab === 'expired' }]" @click="tab = 'expired'">已过期</view>
    </view>

    <view v-if="!filtered.length" class="empty">
      <text class="empty-icon">🎫</text>
      暂无{{ tabText }}的优惠券
    </view>

    <view v-else>
      <view v-for="c in filtered" :key="c.id" class="coupon" :class="{ used: c.used || tab === 'expired' }">
        <view class="coupon__left">
          <text class="coupon__currency">¥</text>
          <text class="coupon__amount">{{ c.amount }}</text>
          <text class="coupon__cond">满 {{ c.minAmount }} 可用</text>
        </view>
        <view class="coupon__right">
          <view class="coupon__title">{{ c.title }}</view>
          <view class="coupon__expire">{{ c.expire }} 前有效</view>
          <view class="coupon__scope">
            <text class="tag" :class="scopeClass(c.scope)">{{ scopeText(c.scope) }}</text>
          </view>
          <view v-if="!c.used && tab === 'usable'" class="coupon__use" @click="goUse">立即使用</view>
          <view v-else-if="c.used" class="coupon__use coupon__use--disabled">已使用</view>
          <view v-else class="coupon__use coupon__use--disabled">已过期</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { couponApi } from '@/api'

const tab = ref<'usable' | 'used' | 'expired'>('usable')
const coupons = ref(couponApi.list())

onShow(() => { coupons.value = couponApi.list() })

const TAB_TEXT: Record<string, string> = { usable: '可用', used: '已使用', expired: '已过期' }
const tabText = computed(() => TAB_TEXT[tab.value])
const usableCount = computed(() => coupons.value.filter(c => !c.used && !isExpired(c)).length)

function isExpired(c: { expire: string }) {
  return new Date(c.expire.replace(/\//g, '-')) < new Date()
}

const filtered = computed(() => {
  if (tab.value === 'usable') return coupons.value.filter(c => !c.used && !isExpired(c))
  if (tab.value === 'used') return coupons.value.filter(c => c.used)
  return coupons.value.filter(c => !c.used && isExpired(c))
})

const SCOPE_TEXT: Record<string, string> = {
  all: '通用', rent: '租车', sale: '二手车', installment: '分期'
}
const SCOPE_CLASS: Record<string, string> = {
  all: 'tag--gray', rent: 'tag--blue', sale: 'tag', installment: 'tag--green'
}
function scopeText(s: string) { return SCOPE_TEXT[s] || s }
function scopeClass(s: string) { return SCOPE_CLASS[s] || '' }

function goUse() { uni.switchTab({ url: '/pages/vehicle/list' }) }
</script>

<style lang="scss" scoped>
.cp { min-height: 100vh; background: $bg; padding-bottom: 40rpx; }

.cp-tabs {
  display: flex;
  background: #fff;
  position: sticky; top: 0; z-index: 50;
  box-shadow: 0 1rpx 0 $line;
}
.cp-tab {
  flex: 1; text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx; color: $ink-2;
  position: relative;
  display: flex; align-items: center; justify-content: center; gap: 8rpx;
  &.active {
    color: $brand; font-weight: 600;
    &::after {
      content: ''; position: absolute;
      left: 50%; transform: translateX(-50%); bottom: 0;
      width: 48rpx; height: 6rpx;
      background: $brand; border-radius: 3rpx;
    }
  }
  &__badge {
    background: $danger; color: #fff;
    font-size: 20rpx;
    padding: 2rpx 10rpx;
    border-radius: 10rpx;
  }
}

.coupon {
  display: flex;
  margin: $gap-md;
  border-radius: $r-md;
  overflow: hidden;
  background: #fff;
  box-shadow: $shadow-sm;
  position: relative;
  &::before, &::after {
    content: '';
    position: absolute; left: 240rpx;
    width: 24rpx; height: 24rpx;
    background: $bg;
    border-radius: 50%;
  }
  &::before { top: -12rpx; }
  &::after { bottom: -12rpx; }
  &.used { opacity: 0.55; filter: grayscale(0.8); }
}
.coupon__left {
  width: 240rpx;
  background: linear-gradient(135deg, $brand, $brand-deep);
  color: #fff;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 36rpx 0;
  position: relative;
}
.coupon__currency { font-size: 28rpx; }
.coupon__amount {
  font-size: 72rpx;
  font-weight: 700;
  font-family: 'DIN Alternate', sans-serif;
  line-height: 1;
  margin: 4rpx 0;
}
.coupon__cond { font-size: 20rpx; opacity: 0.9; }

.coupon__right {
  flex: 1; min-width: 0;
  padding: 24rpx;
  display: flex; flex-direction: column; justify-content: space-between;
}
.coupon__title { font-size: 28rpx; font-weight: 600; color: $ink; }
.coupon__expire { font-size: 22rpx; color: $ink-3; margin-top: 6rpx; }
.coupon__scope { margin-top: 12rpx; }
.coupon__use {
  align-self: flex-end;
  margin-top: 12rpx;
  padding: 8rpx 28rpx;
  border: 1rpx solid $brand;
  color: $brand-deep;
  background: $brand-soft;
  border-radius: $r-pill;
  font-size: 22rpx;
  &--disabled {
    color: $ink-4; border-color: $line;
    background: transparent;
  }
}
</style>
