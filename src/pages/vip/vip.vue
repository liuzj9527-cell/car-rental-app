<template>
  <view class="vip">
    <!-- 顶部 -->
    <view class="vip-hero">
      <view class="vip-hero__bg"></view>
      <view class="vip-hero__nav" :style="{ paddingTop: statusBarHeight + 'px' }">
        <view class="vip-hero__back" @click="goBack">‹</view>
        <text class="vip-hero__nav-title">驭驰 VIP 会员</text>
        <view class="vip-hero__back"></view>
      </view>

      <view class="vip-card">
        <view class="vip-card__top">
          <view>
            <view class="vip-card__name">
              <text class="vip-card__name-text">{{ userStore.vipInfo ? VIP_LEVEL_TEXT[userStore.vipInfo.level] : '普通用户' }}</text>
              <text v-if="userStore.vipInfo && userStore.vipInfo.level !== 'none'" class="vip-card__expire">至 {{ userStore.vipInfo.expire }}</text>
            </view>
            <view class="vip-card__no">NO. {{ userStore.vipInfo?.points || 0 }} 积分</view>
          </view>
          <view class="vip-card__crown">👑</view>
        </view>
        <view class="vip-card__quote">「 驭驰承诺：交易失败 100% 必赔 」</view>
      </view>
    </view>

    <!-- 核心权益 -->
    <view class="benefit-card">
      <view class="benefit-card__title">
        <text class="bar"></text>8 大 VIP 专属权益
      </view>
      <view class="benefit-grid">
        <view v-for="b in benefits" :key="b.title" class="benefit-item">
          <text class="benefit-item__icon">{{ b.icon }}</text>
          <view class="benefit-item__title">{{ b.title }}</view>
          <view class="benefit-item__desc">{{ b.desc }}</view>
        </view>
      </view>
    </view>

    <!-- 方案选择 -->
    <view class="plans-card">
      <view class="benefit-card__title"><text class="bar"></text>选择您的会员方案</view>
      <view class="plan-list">
        <view
          v-for="p in plans"
          :key="p.level"
          class="plan"
          :class="['plan--' + p.level, { active: selectedLevel === p.level }]"
          @click="selectedLevel = p.level"
        >
          <view class="plan__head">
            <view class="plan__name">
              <text class="plan__crown">👑</text>
              {{ p.name }}
            </view>
            <view v-if="p.tag" class="plan__tag">{{ p.tag }}</view>
          </view>
          <view class="plan__price">
            <text class="plan__price-cur">¥</text>
            <text class="plan__price-num">{{ p.price }}</text>
            <text class="plan__price-period">/{{ p.months === 12 ? '年' : p.months + '月' }}</text>
          </view>
          <view class="plan__old">原价 ¥{{ p.originalPrice }}</view>
          <view class="plan__benefits">
            <view v-for="b in p.benefits" :key="b" class="plan__benefit">✓ {{ b }}</view>
          </view>
          <view v-if="selectedLevel === p.level" class="plan__check">✓</view>
        </view>
      </view>

      <view class="agreement">
        <text class="agreement__check" :class="{ on: agreed }" @click="agreed = !agreed">✓</text>
        <text class="agreement__txt">我已阅读并同意 <text class="brand">《驭驰 VIP 服务协议》</text></text>
      </view>

      <view class="vip-footer">
        <view class="vip-footer__btn btn-primary" @click="onBuy">立即开通</view>
      </view>
    </view>

    <!-- 顾问 + 客服 -->
    <view class="consultant">
      <view class="consultant__title">您的专属顾问</view>
      <view class="consultant__box">
        <image class="consultant__avatar" :src="userStore.vipInfo?.consultantAvatar || defaultAvatar" mode="aspectFill" />
        <view class="consultant__info">
          <view class="consultant__name">{{ userStore.vipInfo?.consultantName || '王雨欣（高级顾问）' }}</view>
          <view class="consultant__sub">10 年二手车从业经验 · 已服务 2000+ 客户</view>
          <view class="consultant__phone">{{ userStore.vipInfo?.consultantPhone || '400-888-6688' }}</view>
        </view>
        <view class="consultant__btn" @click="callConsultant">联系顾问</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { vipApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { VIP_LEVEL_TEXT } from '@/types'

const userStore = useUserStore()
const statusBarHeight = ref(20)
const selectedLevel = ref<'gold' | 'platinum' | 'diamond'>('gold')
const agreed = ref(false)

const benefits = ref(vipApi.benefits())
const plans = ref(vipApi.plans())
const defaultAvatar = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'

onLoad(() => {
  try { statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 20 } catch { /* ignore */ }
})

function goBack() { uni.navigateBack() }

function onBuy() {
  if (!agreed.value) {
    uni.showToast({ title: '请先勾选服务协议', icon: 'none' })
    return
  }
  const plan = plans.value.find(p => p.level === selectedLevel.value)!
  uni.showModal({
    title: '确认开通',
    content: `开通 ${plan.name}，支付 ¥${plan.price}`,
    success: ({ confirm }) => {
      if (!confirm) return
      userStore.buyVip(selectedLevel.value)
      uni.showToast({ title: '开通成功！', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 1200)
    }
  })
}

function callConsultant() {
  uni.makePhoneCall({ phoneNumber: userStore.vipInfo?.consultantPhone || '400-888-6688' })
}
</script>

<style lang="scss" scoped>
.vip { min-height: 100vh; background: $bg; padding-bottom: 60rpx; }

/* 顶部 hero */
.vip-hero {
  position: relative;
  padding: 0 24rpx;
  background: linear-gradient(180deg, #1F1D1A 0%, #3A342B 60%, $bg 100%);
  overflow: hidden;
}
.vip-hero__bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(circle at 90% 10%, rgba(212, 175, 106, 0.35), transparent 40%),
    radial-gradient(circle at 10% 30%, rgba(255, 138, 61, 0.18), transparent 40%);
  pointer-events: none;
}
.vip-hero__nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 0 0;
  height: calc(44px + env(safe-area-inset-top));
  color: #fff;
}
.vip-hero__back {
  width: 60rpx; height: 60rpx;
  display: flex; align-items: center; justify-content: center;
  font-size: 50rpx; color: #fff;
}
.vip-hero__nav-title { font-size: 32rpx; font-weight: 600; color: #fff; }

.vip-card {
  position: relative;
  margin: 40rpx 0 80rpx;
  padding: 32rpx;
  background: linear-gradient(135deg, #2C2925 0%, #1F1D1A 100%);
  border-radius: 24rpx;
  border: 1rpx solid rgba(212, 175, 106, 0.4);
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.4);
  &::before {
    content: '';
    position: absolute; top: -40rpx; right: -40rpx;
    width: 200rpx; height: 200rpx; border-radius: 50%;
    background: radial-gradient(circle, rgba(212, 175, 106, 0.3), transparent 70%);
  }
  &__top { display: flex; align-items: center; justify-content: space-between; }
  &__name { display: flex; align-items: center; gap: 12rpx; }
  &__name-text { color: $gold; font-size: 36rpx; font-weight: 700; }
  &__expire { color: rgba(255, 255, 255, 0.5); font-size: 22rpx; }
  &__no { color: rgba(255, 255, 255, 0.4); font-size: 22rpx; margin-top: 8rpx; }
  &__crown { font-size: 64rpx; }
  &__quote { color: rgba(255, 255, 255, 0.6); font-size: 22rpx; margin-top: 24rpx; font-style: italic; }
}

/* 权益 */
.benefit-card {
  background: #fff;
  border-radius: $r-md;
  margin: 0 $gap-md $gap-md;
  padding: $gap-md;
  box-shadow: $shadow-sm;
  &__title {
    display: flex; align-items: center;
    font-size: 30rpx; font-weight: 600; color: $ink;
    margin-bottom: 24rpx;
    .bar {
      display: inline-block; width: 6rpx; height: 28rpx;
      background: $brand; border-radius: 3rpx; margin-right: 12rpx;
    }
  }
}
.benefit-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 20rpx 12rpx;
}
.benefit-item {
  display: flex; flex-direction: column; align-items: center; gap: 6rpx;
  text-align: center;
  &__icon { font-size: 56rpx; }
  &__title { font-size: 24rpx; font-weight: 600; color: $ink; }
  &__desc { font-size: 20rpx; color: $ink-3; line-height: 1.4; }
}

/* 方案 */
.plans-card {
  background: #fff;
  border-radius: $r-md;
  margin: 0 $gap-md $gap-md;
  padding: $gap-md;
  box-shadow: $shadow-sm;
}
.plan-list { display: flex; flex-direction: column; gap: 20rpx; }
.plan {
  position: relative;
  padding: 28rpx;
  border-radius: $r-md;
  border: 2rpx solid $line;
  background: #fff;
  &.active { border-color: $brand; box-shadow: 0 0 0 4rpx $brand-soft; }
  &--gold.active { border-color: $gold; box-shadow: 0 0 0 4rpx rgba(212, 175, 106, 0.18); }
  &--platinum.active { border-color: #BFC7D4; box-shadow: 0 0 0 4rpx rgba(191, 199, 212, 0.25); }
  &--diamond.active { border-color: #A685FF; box-shadow: 0 0 0 4rpx rgba(166, 133, 255, 0.22); }
  &__head { display: flex; align-items: center; justify-content: space-between; }
  &__name { font-size: 30rpx; font-weight: 700; color: $ink; }
  &__crown { font-size: 32rpx; margin-right: 8rpx; }
  &__tag {
    background: $brand-soft; color: $brand-deep;
    padding: 4rpx 16rpx; border-radius: $r-xs;
    font-size: 20rpx; font-weight: 600;
  }
  &--platinum .plan__tag { background: #EFF1F5; color: #5C6373; }
  &--diamond .plan__tag { background: #F1ECFF; color: #6B45D1; }
  &__price {
    margin: 12rpx 0 4rpx;
    display: flex; align-items: baseline; gap: 4rpx;
  }
  &__price-cur { font-size: 26rpx; color: $danger; font-weight: 600; }
  &__price-num { font-size: 56rpx; color: $danger; font-weight: 700; font-family: 'DIN Alternate', sans-serif; }
  &__price-period { font-size: 22rpx; color: $ink-3; margin-left: 4rpx; }
  &__old { font-size: 22rpx; color: $ink-4; text-decoration: line-through; }
  &__benefits {
    margin-top: 16rpx; padding-top: 16rpx;
    border-top: 1rpx dashed $line;
    display: grid; grid-template-columns: 1fr 1fr; gap: 8rpx 16rpx;
  }
  &__benefit { font-size: 22rpx; color: $ink-2; }
  &__check {
    position: absolute; top: 24rpx; right: 24rpx;
    width: 36rpx; height: 36rpx; border-radius: 50%;
    background: $brand; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 24rpx;
  }
}

/* 协议 */
.agreement {
  display: flex; align-items: center; gap: 12rpx;
  margin-top: 24rpx;
  font-size: 24rpx; color: $ink-2;
  &__check {
    width: 32rpx; height: 32rpx;
    border: 2rpx solid $line;
    border-radius: 6rpx;
    color: transparent;
    font-size: 22rpx;
    display: flex; align-items: center; justify-content: center;
    &.on { background: $brand; border-color: $brand; color: #fff; }
  }
  .brand { color: $brand; }
}
.vip-footer { margin-top: 32rpx; }
.vip-footer__btn {
  width: 100%; text-align: center; padding: 26rpx 0;
  font-size: 30rpx; font-weight: 600; color: #fff;
  border-radius: $r-pill;
  background: linear-gradient(135deg, $gold, $gold-deep);
  box-shadow: 0 8rpx 20rpx rgba(212, 175, 106, 0.3);
}

/* 顾问 */
.consultant {
  background: #fff;
  margin: 0 $gap-md;
  padding: $gap-md;
  border-radius: $r-md;
  box-shadow: $shadow-sm;
  &__title {
    font-size: 28rpx; font-weight: 600; color: $ink;
    margin-bottom: 20rpx;
  }
  &__box {
    display: flex; align-items: center; gap: 20rpx;
  }
  &__avatar {
    width: 110rpx; height: 110rpx;
    border-radius: 50%;
    background: $brand-soft;
  }
  &__info { flex: 1; min-width: 0; }
  &__name { font-size: 28rpx; font-weight: 600; color: $ink; }
  &__sub { font-size: 22rpx; color: $ink-3; margin: 4rpx 0; }
  &__phone { font-size: 24rpx; color: $brand; font-weight: 600; }
  &__btn {
    padding: 12rpx 24rpx;
    background: $brand-soft; color: $brand-deep;
    border-radius: $r-pill; font-size: 24rpx;
    border: 1rpx solid $brand;
  }
}
</style>
