<template>
  <view v-if="vehicle" class="oc">
    <!-- 车辆 -->
    <view class="oc-car">
      <car-image :src="vehicle.images[0]" :brand="vehicle.brand" height="180rpx" radius="12rpx" />
      <view class="oc-car__info">
        <view class="oc-car__name">{{ vehicle.brand }} {{ vehicle.model }}</view>
        <view class="oc-car__plate">{{ vehicle.plateNo }} · {{ vehicle.type }}</view>
        <view class="oc-car__price">
          <text class="price">¥{{ vehicle.pricePerDay }}</text>
          <text class="price--unit">/天</text>
        </view>
      </view>
    </view>

    <!-- 时间 -->
    <view class="block">
      <view class="block__title"><text class="bar"></text>取还车时间</view>
      <view class="time-row">
        <view class="time-item" @click="pickDate('start')">
          <text class="time-item__lbl">取车</text>
          <text class="time-item__val">{{ form.startDate || '请选择' }}</text>
        </view>
        <view class="time-arrow">→</view>
        <view class="time-item" @click="pickDate('end')">
          <text class="time-item__lbl">还车</text>
          <text class="time-item__val">{{ form.endDate || '请选择' }}</text>
        </view>
      </view>
      <view v-if="days > 0" class="time-summary">租期 <text class="brand">{{ days }}</text> 天 · 日租金 ¥{{ vehicle.pricePerDay }}</view>
    </view>

    <!-- 门店 -->
    <view class="block">
      <view class="block__title"><text class="bar"></text>取车门店</view>
      <view v-for="s in stores" :key="s.id" class="store-row" :class="{ active: form.storeId === s.id }" @click="form.storeId = s.id">
        <view class="store-row__radio" :class="{ checked: form.storeId === s.id }"></view>
        <view class="store-row__info">
          <view class="store-row__name">{{ s.name }}</view>
          <view class="store-row__addr">{{ s.address }}</view>
        </view>
      </view>
    </view>

    <!-- 优惠券 -->
    <view class="block block--row" @click="showCoupon = true">
      <text>优惠券</text>
      <text :class="selectedCoupon ? 'brand' : 'ink-3'">
        {{ selectedCoupon ? `已减 ¥${selectedCoupon.amount}` : usableCoupons.length ? `${usableCoupons.length} 张可用` : '暂无可用' }}
        <text class="arrow">›</text>
      </text>
    </view>

    <!-- 费用 -->
    <view class="block">
      <view class="block__title"><text class="bar"></text>费用明细</view>
      <view class="row"><text>租车（{{ days }}天 × ¥{{ vehicle.pricePerDay }}）</text><text>¥{{ rentFee }}</text></view>
      <view class="row"><text>基础服务费</text><text>¥{{ serviceFee }}</text></view>
      <view v-if="selectedCoupon" class="row"><text>优惠券抵扣</text><text class="brand">-¥{{ selectedCoupon.amount }}</text></view>
      <view class="row"><text>车辆押金（还车后退还）</text><text>¥{{ vehicle.deposit }}</text></view>
      <view class="row row--total"><text>应付金额</text><text class="price price--xl">¥{{ totalAmount }}</text></view>
    </view>

    <!-- 备注 -->
    <view class="block">
      <view class="block__title"><text class="bar"></text>订单备注</view>
      <textarea v-model="form.remark" class="remark" placeholder="选填：如需要儿童座椅等" />
    </view>

    <view class="oc-footer">
      <view class="oc-footer__total">
        <view class="price price--xl">¥{{ totalAmount }}</view>
        <text class="oc-footer__sub">押金 ¥{{ vehicle.deposit }} 还车后原路退回</text>
      </view>
      <view :class="['oc-footer__btn', 'btn-primary', { 'btn-primary--disabled': days <= 0 }]" @click="submit">提交订单</view>
    </view>

    <!-- 优惠券弹层 -->
    <view v-if="showCoupon" class="popup-mask" @click="showCoupon = false">
      <view class="popup" @click.stop>
        <view class="popup__title">选择优惠券</view>
        <scroll-view scroll-y class="popup__list">
          <view v-for="c in usableCoupons" :key="c.id" class="coupon-row" @click="chooseCoupon(c)">
            <view class="coupon-row__amount">
              <text class="num">¥{{ c.amount }}</text>
              <text class="cond">满 {{ c.minAmount }} 可用</text>
            </view>
            <view class="coupon-row__info">
              <view class="title">{{ c.title }}</view>
              <view class="expire">{{ c.expire }} 到期</view>
            </view>
            <view :class="['radio', { checked: selectedCoupon?.id === c.id }]"></view>
          </view>
          <view v-if="!usableCoupons.length" class="coupon-empty">暂无可用优惠券</view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import CarImage from '@/components/car-image.vue'
import { vehicleApi, storeApi, orderApi, couponApi, genOrderId } from '@/api'
import { useUserStore } from '@/stores/user'
import type { Vehicle, Coupon } from '@/types'
import { diffDays } from '@/utils/format'

const userStore = useUserStore()
const vehicle = ref<Vehicle | null>(null)
const stores = ref(storeApi.list())
const coupons = ref(couponApi.list())
const showCoupon = ref(false)
const selectedCoupon = ref<Coupon | null>(null)

const form = reactive({ startDate: '', endDate: '', storeId: 1, remark: '' })

onLoad((q: any) => {
  const id = Number(q?.id)
  vehicle.value = vehicleApi.detail(id) || null
  if (vehicle.value) form.storeId = vehicle.value.storeId
})

const days = computed(() => (form.startDate && form.endDate ? diffDays(form.startDate, form.endDate) : 0))
const rentFee = computed(() => (vehicle.value?.pricePerDay || 0) * days.value)
const serviceFee = computed(() => (days.value > 0 ? 20 : 0))
const usableCoupons = computed(() => coupons.value.filter(c => !c.used && rentFee.value >= c.minAmount))
const totalAmount = computed(() => Math.max(0, rentFee.value + serviceFee.value - (selectedCoupon.value?.amount || 0)))

function pickDate(field: 'start' | 'end') {
  uni.showModal({
    title: field === 'start' ? '选择取车时间' : '选择还车时间',
    editable: true,
    placeholderText: '格式：2025-09-15 10:00',
    success: (res) => {
      if (res.confirm && res.content) {
        if (field === 'start') form.startDate = res.content
        else form.endDate = res.content
        if (selectedCoupon.value && rentFee.value < selectedCoupon.value.minAmount) selectedCoupon.value = null
      }
    }
  })
}

function chooseCoupon(c: Coupon) {
  selectedCoupon.value = selectedCoupon.value?.id === c.id ? null : c
  showCoupon.value = false
}

function submit() {
  if (days.value <= 0) { uni.showToast({ title: '请先选择取还车时间', icon: 'none' }); return }
  if (!userStore.isLogin) { uni.navigateTo({ url: '/pages/login/login' }); return }
  const v = vehicle.value!
  uni.showModal({
    title: '确认支付',
    content: `应付 ¥${totalAmount.value} + 押金 ¥${v.deposit}（还车后原路退回）`,
    confirmText: '立即支付',
    success: (res) => {
      if (!res.confirm) return
      orderApi.create({
        id: genOrderId(),
        customerName: userStore.user!.name,
        customerPhone: userStore.user!.phone,
        vehicleId: v.id,
        plateNo: v.plateNo,
        vehicleName: `${v.brand} ${v.model}`,
        vehicleImage: v.images[0] || v.image,
        storeId: form.storeId,
        startDate: form.startDate, endDate: form.endDate,
        days: days.value, amount: totalAmount.value, deposit: v.deposit,
        couponId: selectedCoupon.value?.id || 0, status: 'paid',
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
        remark: form.remark
      })
      if (selectedCoupon.value) couponApi.use(selectedCoupon.value.id)
      vehicleApi.setStatus(v.id, 'rented')
      uni.showToast({ title: '支付成功', icon: 'success' })
      setTimeout(() => uni.redirectTo({ url: `/pages/order/detail?id=${orderApi.listByPhone(userStore.user!.phone)[0].id}` }), 800)
    }
  })
}
</script>

<style lang="scss" scoped>
.oc { min-height: 100vh; background: $bg; padding-bottom: 140rpx; }

.oc-car {
  background: #fff; margin: $gap-md;
  padding: $gap-md;
  display: flex; gap: 16rpx;
  border-radius: $r-md;
  box-shadow: $shadow-sm;
  &__info { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
  &__name { font-size: 30rpx; font-weight: 600; color: $ink; }
  &__plate { font-size: 22rpx; color: $ink-3; margin: 4rpx 0; }
  &__price .price { font-size: 32rpx; }
}

.block {
  background: #fff;
  margin: 0 $gap-md $gap-md;
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
  &--row {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 28rpx; color: $ink;
  }
}

.time-row { display: flex; align-items: center; gap: 16rpx; }
.time-item {
  flex: 1; background: $bg;
  border-radius: $r-sm;
  padding: 18rpx;
  display: flex; flex-direction: column; gap: 6rpx;
  border: 2rpx solid transparent;
  &__lbl { font-size: 22rpx; color: $ink-3; }
  &__val { font-size: 26rpx; color: $ink; font-weight: 600; }
}
.time-arrow { color: $ink-3; font-size: 32rpx; }
.time-summary {
  margin-top: 16rpx; font-size: 24rpx; color: $ink-2;
  .brand { color: $brand; font-weight: 700; font-size: 28rpx; margin: 0 4rpx; }
}

.store-row {
  display: flex; align-items: center; gap: 16rpx;
  padding: 18rpx 0;
  border-bottom: 1rpx solid $line;
  &:last-child { border-bottom: none; }
  &__radio {
    width: 36rpx; height: 36rpx;
    border-radius: 50%;
    border: 2rpx solid $line;
    flex-shrink: 0;
    position: relative;
    &.checked { border: 10rpx solid $brand; box-sizing: border-box; }
  }
  &__info { flex: 1; min-width: 0; }
  &__name { font-size: 28rpx; color: $ink; font-weight: 500; }
  &__addr { font-size: 22rpx; color: $ink-3; margin-top: 4rpx; }
}

.row {
  display: flex; justify-content: space-between;
  padding: 14rpx 0;
  font-size: 26rpx; color: $ink-2;
  &--total {
    border-top: 1rpx dashed $line; margin-top: 8rpx; padding-top: 20rpx;
    text { font-size: 28rpx; color: $ink; font-weight: 600; }
    .price--xl { font-size: 40rpx; }
  }
}

.brand { color: $brand; }
.ink-3 { color: $ink-3; }
.arrow { margin-left: 8rpx; }

.remark {
  width: 100%; height: 140rpx;
  background: $bg;
  border-radius: $r-sm;
  padding: 16rpx;
  font-size: 26rpx;
  box-sizing: border-box;
}

.oc-footer {
  position: fixed; left: 0; right: 0; bottom: 0;
  background: #fff;
  display: flex; align-items: center; justify-content: space-between;
  padding: 16rpx 24rpx;
  box-shadow: 0 -2rpx 12rpx rgba(20, 24, 32, 0.06);
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  &__total { display: flex; flex-direction: column; }
  &__sub { font-size: 20rpx; color: $ink-3; }
  &__btn {
    padding: 24rpx 60rpx;
    font-size: 30rpx; font-weight: 600;
    border-radius: $r-pill;
  }
}

.popup-mask {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: flex-end;
}
.popup {
  width: 100%; max-height: 70vh;
  background: #fff;
  border-radius: $r-lg $r-lg 0 0;
  padding: 28rpx $gap-md $gap-md;
  display: flex; flex-direction: column;
  &__title {
    font-size: 30rpx; font-weight: 600; color: $ink;
    text-align: center; margin-bottom: 24rpx;
  }
  &__list { flex: 1; }
}
.coupon-row {
  display: flex; align-items: center; gap: 16rpx;
  padding: 22rpx 20rpx;
  background: $brand-soft;
  border-radius: $r-sm;
  margin-bottom: 16rpx;
  &__amount {
    background: #fff;
    padding: 18rpx 22rpx;
    border-radius: $r-sm;
    text-align: center;
    .num { font-size: 36rpx; color: $danger; font-weight: 700; display: block; font-family: 'DIN Alternate', sans-serif; }
    .cond { font-size: 20rpx; color: $ink-3; display: block; margin-top: 4rpx; }
  }
  &__info { flex: 1; min-width: 0; }
  .title { font-size: 26rpx; color: $ink; font-weight: 600; }
  .expire { font-size: 22rpx; color: $ink-3; margin-top: 4rpx; }
}
.radio {
  width: 36rpx; height: 36rpx;
  border-radius: 50%; border: 2rpx solid $line;
  box-sizing: border-box;
  &.checked { border: 10rpx solid $brand; }
}
.coupon-empty { text-align: center; color: $ink-3; padding: 80rpx 0; }
</style>
