<template>
  <view class="empty">
    <text class="empty-icon">{{ icon }}</text>
    <text class="empty-text">{{ text }}</text>
    <slot />
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  text?: string
}>(), {
  icon: '📭',
  text: '暂无数据'
})
</script>

<style lang="scss" scoped>
.empty {
  padding: 140rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.empty-icon { font-size: 96rpx; opacity: 0.45; }
.empty-text { margin-top: 20rpx; font-size: 26rpx; color: $ink-3; }
</style>
