<template>
  <view class="ol">
    <view class="ol-tabs">
      <view v-for="t in tabs" :key="t.value" :class="['ol-tab', { active: activeTab === t.value }]" @click="activeTab = t.value">
        <text>{{ t.label }}</text>
        <text v-if="t.count" class="ol-tab__count">{{ t.count }}</text>
      </view>
    </view>

    <view v-if="!filteredOrders.length" class="empty">
      <text class="empty-icon">📋</text>
      暂无相关订单
      <view class="empty__cta" @click="goBook">立即租车</view>
    </view>

    <view v-else>
      <view v-for="o in filteredOrders" :key="o.id" class="order-card" @click="goDetail(o.id)">
        <view class="order-card__top">
          <text class="order-card__id">订单号 {{ o.id }}</text>
          <text class="order-card__status" :class="`is-${o.status}`">{{ ORDER_STATUS_TEXT[o.status] }}</text>
        </view>
        <view class="order-card__car">
          <car-image :src="o.vehicleImage" :brand="o.vehicleName" height="160rpx" radius="12rpx" />
          <view class="order-card__info">
            <view class="order-card__name">{{ o.vehicleName }}</view>
            <view class="order-card__plate">{{ o.plateNo }}</view>
            <view class="order-card__time">{{ o.startDate }} → {{ o.endDate }}</view>
            <view class="order-card__days">共 {{ o.days }} 天</view>
          </view>
        </view>
        <view class="order-card__bottom">
          <view class="order-card__amount">
            <text class="num">¥{{ o.amount }}</text>
            <text class="deposit">+ 押金 ¥{{ o.deposit }}</text>
          </view>
          <view class="order-card__actions">
            <view v-if="o.status === 'pending'" class="mini-btn mini-btn--ghost" @click.stop="cancel(o)">取消</view>
            <view v-if="o.status === 'active'" class="mini-btn" @click.stop="returnCar(o)">还车</view>
            <view v-if="o.status === 'paid'" class="mini-btn" @click.stop="goDetail(o.id)">联系门店</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow, onLoad } from '@dcloudio/uni-app'
import CarImage from '@/components/car-image.vue'
import { orderApi, vehicleApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { ORDER_STATUS_TEXT, type Order } from '@/types'

const userStore = useUserStore()
const activeTab = ref('all')
const orders = ref<Order[]>([])

const tabs = computed(() => [
  { label: '全部', value: 'all', count: orders.value.length },
  { label: '待支付', value: 'pending', count: orders.value.filter(o => o.status === 'pending').length },
  { label: '租赁中', value: 'active', count: orders.value.filter(o => o.status === 'active').length },
  { label: '已完成', value: 'returned', count: orders.value.filter(o => o.status === 'returned').length }
])

const filteredOrders = computed(() =>
  activeTab.value === 'all' ? orders.value : orders.value.filter(o => o.status === activeTab.value)
)

function load() {
  const phone = userStore.user?.phone || '13800138000'
  orders.value = orderApi.listByPhone(phone)
}

onShow(load)
onLoad((q: any) => { if (q.status) activeTab.value = q.status })

function goDetail(id: string) { uni.navigateTo({ url: `/pages/order/detail?id=${id}` }) }
function goBook() { uni.switchTab({ url: '/pages/vehicle/list' }) }

function cancel(o: Order) {
  uni.showModal({
    title: '取消订单', content: '取消后押金将全额退回',
    success: (res) => {
      if (res.confirm) {
        orderApi.update(o.id, { status: 'cancelled' })
        vehicleApi.setStatus(o.vehicleId, 'available')
        uni.showToast({ title: '已取消', icon: 'success' })
        load()
      }
    }
  })
}

function returnCar(o: Order) {
  uni.showModal({
    title: '确认还车', content: `还车后押金 ¥${o.deposit} 将原路退回`,
    success: (res) => {
      if (res.confirm) {
        orderApi.update(o.id, { status: 'returned' })
        vehicleApi.setStatus(o.vehicleId, 'available')
        uni.showToast({ title: '还车成功', icon: 'success' })
        load()
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.ol { min-height: 100vh; background: $bg; padding-bottom: 40rpx; }

.ol-tabs {
  display: flex;
  background: #fff;
  position: sticky; top: 0; z-index: 50;
  box-shadow: 0 1rpx 0 $line;
}
.ol-tab {
  flex: 1; text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx; color: $ink-2;
  position: relative;
  display: flex; align-items: center; justify-content: center; gap: 6rpx;
  &.active {
    color: $brand; font-weight: 600;
    &::after {
      content: ''; position: absolute;
      left: 50%; transform: translateX(-50%); bottom: 0;
      width: 48rpx; height: 6rpx;
      background: $brand; border-radius: 3rpx;
    }
  }
  &__count {
    background: $danger; color: #fff;
    font-size: 18rpx;
    padding: 1rpx 8rpx;
    border-radius: 8rpx;
  }
}

.order-card {
  background: #fff;
  margin: $gap-md;
  border-radius: $r-md;
  padding: $gap-md;
  box-shadow: $shadow-sm;
  &__top { display: flex; justify-content: space-between; align-items: center; }
  &__id { font-size: 22rpx; color: $ink-3; }
  &__status {
    font-size: 24rpx; font-weight: 600;
    &.is-pending { color: $warning; }
    &.is-paid { color: #1A62D6; }
    &.is-active { color: $success; }
    &.is-returned { color: $ink-3; }
    &.is-cancelled { color: $ink-4; }
  }
  &__car {
    display: flex; gap: 16rpx;
    margin: 20rpx 0;
  }
  &__info { flex: 1; min-width: 0; }
  &__name { font-size: 30rpx; font-weight: 600; color: $ink; }
  &__plate { font-size: 22rpx; color: $ink-3; margin-top: 4rpx; }
  &__time { font-size: 22rpx; color: $ink-2; margin-top: 8rpx; }
  &__days { font-size: 20rpx; color: $brand; font-weight: 600; margin-top: 4rpx; }
  &__bottom {
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 16rpx;
    border-top: 1rpx dashed $line;
  }
  &__amount {
    .num { font-size: 36rpx; color: $danger; font-weight: 700; font-family: 'DIN Alternate', sans-serif; }
    .deposit { font-size: 22rpx; color: $ink-3; margin-left: 8rpx; }
  }
  &__actions { display: flex; gap: 12rpx; }
}
.mini-btn {
  padding: 10rpx 28rpx;
  background: linear-gradient(135deg, $brand, $brand-deep);
  color: #fff;
  border-radius: $r-pill;
  font-size: 24rpx; font-weight: 600;
  &--ghost {
    background: #fff; color: $ink-2;
    border: 1rpx solid $line;
  }
}
</style>
