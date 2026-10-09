<template>
  <view class="login">
    <view class="login-hero">
      <view class="login-hero__bg"></view>
      <view class="login-hero__brand">
        <text class="logo">🚗</text>
        <text class="name">驭驰车服</text>
      </view>
      <view class="login-hero__slogan">让出行 · 更简单</view>
      <view class="login-hero__features">
        <view class="feat"><text>✓</text>租车 · 二手车 · 卖车</view>
        <view class="feat"><text>✓</text>200+ 城市 直营服务</view>
        <view class="feat"><text>✓</text>VIP 会员 专享保障</view>
      </view>
    </view>

    <view class="login-card">
      <view class="login-card__title">手机号登录</view>
      <view class="login-card__sub">未注册的手机号将自动创建账号</view>

      <view class="form-row">
        <text class="form-row__prefix">+86</text>
        <input v-model="phone" type="number" maxlength="11" placeholder="请输入手机号" class="form-row__input" />
      </view>

      <view class="form-row">
        <input v-model="code" type="number" maxlength="6" placeholder="请输入验证码" class="form-row__input" />
        <view :class="['form-row__code', { disabled: counting }]" @click="sendCode">
          {{ counting ? `${seconds}s 后重发` : '获取验证码' }}
        </view>
      </view>

      <view class="agreement" @click="agree = !agree">
        <view :class="['checkbox', { checked: agree }]">✓</view>
        <text>我已阅读并同意 <text class="brand">《用户协议》</text> 和 <text class="brand">《隐私政策》</text></text>
      </view>

      <view class="btn-primary" :class="{ 'btn-primary--disabled': !phone || !code || !agree }" @click="onLogin">登 录</view>

      <view class="login-card__tip">演示验证码：<text class="brand">123456</text></view>

      <view class="quick-fill" @click="quickFill">
        <text>💡 一键填充演示账号</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const phone = ref('')
const code = ref('')
const agree = ref(false)
const counting = ref(false)
const seconds = ref(60)

function quickFill() {
  phone.value = '13800138000'
  code.value = '123456'
  agree.value = true
}

function sendCode() {
  if (counting.value) return
  if (!/^1\d{10}$/.test(phone.value)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  counting.value = true
  seconds.value = 60
  const timer = setInterval(() => {
    seconds.value--
    if (seconds.value <= 0) {
      clearInterval(timer)
      counting.value = false
    }
  }, 1000)
  uni.showToast({ title: '验证码已发送（演示：123456）', icon: 'none' })
}

function onLogin() {
  if (!agree.value) {
    uni.showToast({ title: '请先同意用户协议', icon: 'none' })
    return
  }
  const err = userStore.login(phone.value, code.value)
  if (err) {
    uni.showToast({ title: err, icon: 'none' })
    return
  }
  uni.showToast({ title: '登录成功', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 800)
}
</script>

<style lang="scss" scoped>
.login { min-height: 100vh; background: $bg; }

.login-hero {
  position: relative;
  padding: 100rpx $gap-md 80rpx;
  text-align: center;
  color: #fff;
  background: linear-gradient(135deg, #FF8A3D, $brand-deep);
  overflow: hidden;
  &__bg {
    position: absolute; inset: 0;
    background:
      radial-gradient(circle at 80% 30%, rgba(255, 255, 255, 0.2), transparent 50%),
      radial-gradient(circle at 10% 90%, rgba(255, 138, 61, 0.5), transparent 60%);
  }
  &__brand {
    display: flex; align-items: center; justify-content: center; gap: 16rpx;
    position: relative;
    .logo { font-size: 80rpx; }
    .name { font-size: 56rpx; font-weight: 700; letter-spacing: 4rpx; }
  }
  &__slogan {
    margin-top: 16rpx;
    font-size: 28rpx; opacity: 0.9;
    letter-spacing: 4rpx;
    position: relative;
  }
  &__features {
    margin-top: 48rpx;
    background: rgba(255, 255, 255, 0.15);
    border-radius: $r-md;
    padding: 24rpx;
    display: flex; flex-direction: column; gap: 12rpx;
    position: relative;
  }
}
.feat {
  font-size: 26rpx; opacity: 0.95;
  text-align: left;
  text { color: $gold; margin-right: 8rpx; font-weight: 700; }
}

.login-card {
  background: #fff;
  margin: -40rpx $gap-md $gap-md;
  border-radius: $r-md;
  padding: 48rpx $gap-md $gap-md;
  box-shadow: $shadow-md;
  position: relative; z-index: 2;
  &__title {
    font-size: 36rpx; font-weight: 700; color: $ink;
  }
  &__sub {
    font-size: 24rpx; color: $ink-3; margin-top: 8rpx;
  }
  &__tip {
    text-align: center; font-size: 22rpx; color: $ink-3;
    margin-top: 24rpx;
    .brand { color: $brand; font-weight: 600; }
  }
}

.form-row {
  display: flex; align-items: center; gap: 16rpx;
  background: $bg;
  border-radius: $r-sm;
  padding: 22rpx 24rpx;
  margin-top: 24rpx;
  &__prefix {
    font-size: 28rpx; color: $ink; font-weight: 500;
    padding-right: 16rpx; border-right: 1rpx solid $line;
  }
  &__input { flex: 1; font-size: 28rpx; color: $ink; }
  &__code {
    font-size: 24rpx; color: $brand;
    white-space: nowrap;
    padding: 8rpx 16rpx;
    border-radius: $r-xs;
    border: 1rpx solid $brand;
    &.disabled { color: $ink-3; border-color: $line; }
  }
}

.agreement {
  display: flex; align-items: center; gap: 12rpx;
  font-size: 22rpx; color: $ink-3;
  margin: 28rpx 0;
  .brand { color: $brand; }
}
.checkbox {
  width: 32rpx; height: 32rpx;
  border-radius: 50%;
  border: 2rpx solid $line;
  color: transparent; font-size: 20rpx;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  &.checked { background: $brand; border-color: $brand; color: #fff; }
}

.quick-fill {
  margin-top: 24rpx;
  text-align: center;
  padding: 16rpx;
  background: $brand-soft; color: $brand-deep;
  border-radius: $r-sm;
  font-size: 24rpx;
}
</style>
