<template>
  <view v-if="car" class="ic">
    <!-- 顶部 -->
    <view class="ic-nav">
      <view class="ic-nav__back" @click="goBack">‹</view>
      <text class="ic-nav__title">分期购车</text>
      <view class="ic-nav__back"></view>
    </view>

    <!-- 车辆信息 -->
    <view class="car-card">
      <car-image :src="car.images[0]" :brand="car.brand" height="180rpx" radius="12rpx" />
      <view class="car-card__info">
        <view class="car-card__title">{{ car.title }}</view>
        <view class="car-card__meta">
          <text>{{ car.firstRegister }}</text>
          <text class="dot">·</text>
          <text>{{ (car.mileage / 10000).toFixed(1) }} 万公里</text>
          <text class="dot">·</text>
          <text>{{ car.city }}</text>
        </view>
        <view class="car-card__price">
          售价 <text class="price">{{ formatWan(car.price) }}</text>
          <text class="price--unit">万</text>
        </view>
      </view>
    </view>

    <!-- 试算器 -->
    <view class="calc">
      <view class="calc__title">
        <text class="bar"></text>分期试算
        <text class="calc__sub">（仅供参考，最终以签约为准）</text>
      </view>

      <!-- 首付比例 -->
      <view class="calc-row">
        <text class="calc-label">首付比例</text>
        <text class="calc-val">{{ downRatio * 100 }}%</text>
      </view>
      <slider :min="10" :max="80" :step="5" :value="downRatio * 100" activeColor="#FF6A00" block-size="20" @change="onRatioChange" />
      <view class="calc-tags">
        <view
          v-for="r in [0.1, 0.2, 0.3, 0.5]"
          :key="r"
          :class="['calc-tag', { active: downRatio === r }]"
          @click="downRatio = r"
        >{{ r * 100 }}%</view>
      </view>

      <!-- 期数 -->
      <view class="calc-row">
        <text class="calc-label">还款期数</text>
        <text class="calc-val">{{ months }} 期</text>
      </view>
      <view class="calc-tags">
        <view v-for="m in [12, 24, 36, 48, 60]" :key="m" :class="['calc-tag', { active: months === m }]" @click="months = m">{{ m }}期</view>
      </view>

      <!-- 利率（默认 5.8%，可微调） -->
      <view class="calc-row">
        <text class="calc-label">年化利率</text>
        <text class="calc-val">{{ rate }}%</text>
      </view>
      <slider :min="3" :max="12" :step="0.1" :value="rate" activeColor="#FF6A00" block-size="20" @change="onRateChange" />
    </view>

    <!-- 结果 -->
    <view class="result">
      <view class="result__item">
        <text class="result__label">首付金额</text>
        <text class="result__val">¥{{ formatMoney(downPayment) }}</text>
      </view>
      <view class="result__item">
        <text class="result__label">贷款金额</text>
        <text class="result__val">¥{{ formatMoney(loanAmount) }}</text>
      </view>
      <view class="result__item highlight">
        <text class="result__label">每月月供</text>
        <text class="result__val price">¥{{ formatMoney(monthlyPay) }}</text>
      </view>
      <view class="result__item">
        <text class="result__label">总利息</text>
        <text class="result__val">¥{{ formatMoney(totalInterest) }}</text>
      </view>
      <view class="result__item">
        <text class="result__label">总还款</text>
        <text class="result__val">¥{{ formatMoney(downPayment + totalPay) }}</text>
      </view>
      <view class="result__item">
        <text class="result__label">比全款多花</text>
        <text class="result__val">¥{{ formatMoney(totalInterest) }}</text>
      </view>
    </view>

    <!-- 还款明细 -->
    <view class="block">
      <view class="block__title">
        <text class="bar"></text>还款明细
        <text class="block__sub">共 {{ months }} 期</text>
      </view>
      <view class="repay-list">
        <view class="repay-row repay-row--head">
          <text class="repay-row__cell" style="width: 80rpx">期次</text>
          <text class="repay-row__cell" style="flex: 1">应还日期</text>
          <text class="repay-row__cell" style="width: 180rpx; text-align: right">月供</text>
        </view>
        <view v-for="r in repayList" :key="r.no" class="repay-row">
          <text class="repay-row__cell" style="width: 80rpx">第{{ r.no }}期</text>
          <text class="repay-row__cell" style="flex: 1">{{ r.date }}</text>
          <text class="repay-row__cell" style="width: 180rpx; text-align: right; color: #FF6A00">¥{{ formatMoney(monthlyPay) }}</text>
        </view>
      </view>
    </view>

    <!-- VIP 福利 -->
    <view class="vip-tip">
      <text class="vip-tip__emoji">👑</text>
      <view class="vip-tip__body">
        <view class="vip-tip__title">VIP 会员专享：免手续费 + 首期延后 30 天</view>
        <view class="vip-tip__sub">立即开通可节省 ¥{{ Math.floor(monthlyPay * 0.03 * months) }}</view>
      </view>
      <view class="vip-tip__cta" @click="go('/pages/vip/vip')">开通</view>
    </view>

    <view class="ic-footer">
      <view class="ic-footer__btn btn-primary" @click="onApply">立即申请分期</view>
    </view>
  </view>
  <view v-else class="empty"><text class="empty-icon">💳</text>车辆不存在</view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import CarImage from '@/components/car-image.vue'
import { saleApi } from '@/api'
import { calcInstallment } from '@/utils/format'

const carId = ref(0)
const car = computed(() => saleApi.detail(carId.value))
const downRatio = ref(0.3)
const months = ref(36)
const rate = ref(5.8)

const downPayment = computed(() => Math.round(car.value!.price * downRatio.value))
const calc = computed(() => calcInstallment(car.value!.price - downPayment.value, rate.value, months.value))
const loanAmount = computed(() => car.value!.price - downPayment.value)
const monthlyPay = computed(() => calc.value.monthly)
const totalInterest = computed(() => calc.value.interest)
const totalPay = computed(() => calc.value.total)

const repayList = computed(() => {
  const arr: { no: number; date: string }[] = []
  const d = new Date()
  for (let i = 1; i <= months.value; i++) {
    const nd = new Date(d.getFullYear(), d.getMonth() + i, d.getDate())
    arr.push({
      no: i,
      date: `${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, '0')}-${String(nd.getDate()).padStart(2, '0')}`
    })
  }
  return arr
})

onLoad((q: any) => {
  carId.value = Number(q.id)
  if (q.months) months.value = Number(q.months)
})

function onRatioChange(e: any) { downRatio.value = e.detail.value / 100 }
function onRateChange(e: any) { rate.value = e.detail.value }
function onApply() {
  uni.showModal({
    title: '分期申请已提交',
    content: `首付 ¥${formatMoney(downPayment.value)}，月供 ¥${formatMoney(monthlyPay.value)} × ${months.value} 期\n客服将在 30 分钟内联系您`,
    showCancel: false
  })
}
function goBack() { uni.navigateBack() }
function go(url: string) { uni.navigateTo({ url }) }

function formatWan(n: number) { return (n / 10000).toFixed(2) }
function formatMoney(n: number) { return n.toLocaleString('zh-CN') }
</script>

<style lang="scss" scoped>
.ic { min-height: 100vh; background: $bg; padding-bottom: 140rpx; }

.ic-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20rpx 24rpx;
  background: #fff;
  &__back {
    width: 60rpx; height: 60rpx;
    display: flex; align-items: center; justify-content: center;
    font-size: 50rpx;
  }
  &__title { font-size: 32rpx; font-weight: 600; }
}

.car-card {
  background: #fff; margin: 0 $gap-md $gap-md;
  padding: $gap-md;
  display: flex; gap: 20rpx;
  border-radius: $r-md;
  box-shadow: $shadow-sm;
  &__info { flex: 1; min-width: 0; }
  &__title { font-size: 28rpx; font-weight: 600; color: $ink; }
  &__meta { font-size: 22rpx; color: $ink-3; margin: 8rpx 0; .dot { margin: 0 6rpx; } }
  &__price { font-size: 24rpx; color: $ink-2; .price { font-size: 32rpx; } }
}

.calc {
  background: #fff; margin: 0 $gap-md $gap-md;
  padding: $gap-md;
  border-radius: $r-md;
  box-shadow: $shadow-sm;
  &__title {
    display: flex; align-items: center; gap: 8rpx;
    font-size: 28rpx; font-weight: 600; color: $ink;
    margin-bottom: 20rpx;
    .bar {
      display: inline-block; width: 6rpx; height: 26rpx;
      background: $brand; border-radius: 3rpx; margin-right: 8rpx;
    }
  }
  &__sub { font-weight: 400; font-size: 22rpx; color: $ink-3; }
}
.calc-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20rpx 0 12rpx;
}
.calc-label { font-size: 28rpx; color: $ink-2; }
.calc-val { font-size: 32rpx; font-weight: 700; color: $brand; }
.calc-tags {
  display: flex; flex-wrap: wrap; gap: 12rpx;
  margin: 12rpx 0 24rpx;
}
.calc-tag {
  padding: 12rpx 28rpx;
  background: $bg; color: $ink-2;
  border-radius: $r-pill;
  font-size: 24rpx;
  &.active {
    background: $brand-soft; color: $brand-deep;
    border: 1rpx solid $brand;
    font-weight: 600;
  }
}

.result {
  background: linear-gradient(135deg, #FFF3EA, #FFE6D1);
  border-radius: $r-md;
  margin: 0 $gap-md $gap-md;
  padding: $gap-md;
  &__item {
    display: flex; justify-content: space-between;
    padding: 14rpx 0;
    font-size: 26rpx;
    &.highlight {
      border-top: 1rpx dashed $brand-line;
      border-bottom: 1rpx dashed $brand-line;
      margin: 8rpx 0;
      padding: 20rpx 0;
      .result__label { font-size: 30rpx; font-weight: 600; color: $ink; }
      .result__val { font-size: 44rpx; font-weight: 700; font-family: 'DIN Alternate', sans-serif; }
    }
  }
  &__label { color: $ink-2; }
  &__val { color: $ink; font-weight: 600; }
}

.block {
  background: #fff;
  border-radius: $r-md;
  margin: 0 $gap-md $gap-md;
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
    .block__sub { font-weight: 400; font-size: 22rpx; color: $ink-3; margin-left: 8rpx; }
  }
}

.repay-list { max-height: 480rpx; overflow-y: auto; }
.repay-row {
  display: flex; align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid $line;
  font-size: 24rpx; color: $ink-2;
  &--head {
    background: $bg; color: $ink-3; font-size: 22rpx;
    border-radius: $r-xs;
  }
}

.vip-tip {
  display: flex; align-items: center; gap: 16rpx;
  margin: 0 $gap-md $gap-md;
  padding: 20rpx $gap-md;
  background: linear-gradient(135deg, #1F1D1A, #3A342B);
  color: #fff;
  border-radius: $r-md;
  &__emoji { font-size: 40rpx; }
  &__body { flex: 1; }
  &__title { color: $gold; font-size: 26rpx; font-weight: 600; }
  &__sub { color: rgba(255, 255, 255, 0.6); font-size: 22rpx; margin-top: 4rpx; }
  &__cta {
    padding: 10rpx 24rpx;
    background: $gold; color: #1F1D1A;
    border-radius: $r-pill;
    font-size: 24rpx; font-weight: 600;
  }
}

.ic-footer {
  position: fixed; left: 0; right: 0; bottom: 0;
  padding: 16rpx 24rpx;
  background: #fff;
  box-shadow: 0 -2rpx 12rpx rgba(20, 24, 32, 0.06);
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  &__btn {
    width: 100%; text-align: center; padding: 26rpx 0;
    font-size: 30rpx; font-weight: 600;
    border-radius: $r-pill;
  }
}
</style>
