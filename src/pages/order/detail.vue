<template>
  <view v-if="order" class="od">
    <view class="od-status" :class="`is-${order.status}`">
      <view class="od-status__main">{{ ORDER_STATUS_TEXT[order.status] }}</view>
      <view class="od-status__sub">{{ statusTip }}</view>
      <view class="od-status__deco">🚗</view>
    </view>

    <view class="od-card">
      <car-image :src="order.vehicleImage" :brand="order.vehicleName" height="200rpx" radius="12rpx" />
      <view class="od-card__info">
        <view class="od-card__name">{{ order.vehicleName }}</view>
        <view class="od-card__plate">{{ order.plateNo }}</view>
      </view>
    </view>

    <view class="block">
      <view class="block__title"><text class="bar"></text>订单信息</view>
      <view class="row"><text class="lbl">订单编号</text><text class="val">{{ order.id }}</text></view>
      <view class="row"><text class="lbl">下单时间</text><text class="val">{{ order.createdAt }}</text></view>
      <view class="row"><text class="lbl">取车时间</text><text class="val">{{ order.startDate }}</text></view>
      <view class="row"><text class="lbl">还车时间</text><text class="val">{{ order.endDate }}</text></view>
      <view class="row"><text class="lbl">取车门店</text><text class="val">{{ storeName }}</text></view>
      <view v-if="order.remark" class="row"><text class="lbl">订单备注</text><text class="val">{{ order.remark }}</text></view>
    </view>

    <view class="block">
      <view class="block__title"><text class="bar"></text>费用明细</view>
      <view class="row"><text class="lbl">租金（{{ order.days }}天）</text><text class="val">¥{{ order.amount }}</text></view>
      <view class="row"><text class="lbl">押金（还车后退还）</text><text class="val">¥{{ order.deposit }}</text></view>
      <view class="row row--total"><text class="lbl">实付</text><text class="val price price--xl">¥{{ order.amount }}</text></view>
    </view>

    <view class="od-actions">
      <view v-if="order.status === 'pending'" class="btn-ghost" @click="cancel">取消订单</view>
      <view v-if="order.status === 'paid'" class="btn-primary" @click="contactStore">📞 联系门店</view>
      <view v-if="order.status === 'active'" class="btn-primary" @click="returnCar">确认还车</view>
      <view v-if="order.status === 'pending'" class="btn-primary" @click="payNow">立即支付 ¥{{ order.amount }}</view>
      <view class="btn-ghost" @click="callService">📞 联系客服</view>
    </view>
  </view>
  <view v-else class="empty"><text class="empty-icon">📋</text>订单不存在</view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import CarImage from '@/components/car-image.vue'
import { orderApi, storeApi } from '@/api'
import { ORDER_STATUS_TEXT, type Order } from '@/types'

const order = ref<Order | null>(null)

const STATUS_TIP: Record<string, string> = {
  pending: '请尽快完成支付，超时订单将自动取消',
  paid: '请按时到店取车，携带本人驾驶证',
  active: '用车愉快！还车后押金将原路退回',
  returned: '订单已完成，期待您下次光临',
  cancelled: '订单已取消，押金已退回'
}

const statusTip = computed(() => order.value ? STATUS_TIP[order.value.status] || '' : '')
const storeName = computed(() => storeApi.list().find(s => s.id === order.value?.storeId)?.name || '-')

onLoad((q: any) => {
  const phone = '13800138000'
  const list = orderApi.listByPhone(phone)
  order.value = list.find(o => o.id === q.id) || null
})

function payNow() { uni.showToast({ title: '跳转支付（演示）', icon: 'none' }) }
function cancel() {
  uni.showModal({
    title: '取消订单', content: '确定取消吗？',
    success: (res) => {
      if (res.confirm && order.value) {
        orderApi.update(order.value.id, { status: 'cancelled' })
        uni.showToast({ title: '已取消', icon: 'success' })
        setTimeout(() => uni.navigateBack(), 800)
      }
    }
  })
}
function returnCar() {
  uni.showModal({
    title: '确认还车', content: '确定已到店还车吗？',
    success: (res) => {
      if (res.confirm && order.value) {
        orderApi.update(order.value.id, { status: 'returned' })
        uni.showToast({ title: '还车成功', icon: 'success' })
        setTimeout(() => uni.navigateBack(), 800)
      }
    }
  })
}
function contactStore() { uni.showToast({ title: '已通知门店为您备车', icon: 'success' }) }
function callService() { uni.makePhoneCall({ phoneNumber: '400-888-6688' }) }
</script>

<style lang="scss" scoped>
.od { min-height: 100vh; background: $bg; padding-bottom: 80rpx; }

.od-status {
  position: relative;
  padding: 48rpx $gap-md 80rpx;
  color: #fff;
  background: linear-gradient(135deg, #FF8A3D, $brand-deep);
  overflow: hidden;
  &__main { font-size: 48rpx; font-weight: 700; }
  &__sub { font-size: 26rpx; opacity: 0.9; margin-top: 8rpx; }
  &__deco {
    position: absolute; right: 20rpx; top: 50%;
    transform: translateY(-50%);
    font-size: 180rpx;
    opacity: 0.15;
  }
  &.is-paid { background: linear-gradient(135deg, #4F8AFF, #1A62D6); }
  &.is-active { background: linear-gradient(135deg, #00C896, #00891F); }
  &.is-returned, &.is-cancelled { background: linear-gradient(135deg, #8A9099, #5C6373); }
}

.od-card {
  background: #fff;
  margin: -50rpx $gap-md $gap-md;
  border-radius: $r-md;
  padding: $gap-md;
  display: flex; gap: 16rpx;
  box-shadow: $shadow-md;
  position: relative; z-index: 2;
  &__info { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
  &__name { font-size: 32rpx; font-weight: 600; color: $ink; }
  &__plate { font-size: 22rpx; color: $ink-3; margin-top: 8rpx; }
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
    margin-bottom: 16rpx;
    .bar {
      display: inline-block; width: 6rpx; height: 26rpx;
      background: $brand; border-radius: 3rpx; margin-right: 12rpx;
    }
  }
}
.row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid $line;
  &:last-child { border-bottom: none; }
  .lbl { font-size: 26rpx; color: $ink-3; }
  .val { font-size: 26rpx; color: $ink; max-width: 60%; text-align: right; }
  &--total {
    border-top: 1rpx dashed $line; margin-top: 8rpx; padding-top: 20rpx;
    .lbl { font-size: 28rpx; color: $ink; font-weight: 600; }
  }
}

.od-actions {
  padding: 24rpx $gap-md;
  display: flex; flex-direction: column; gap: 16rpx;
}
</style>
