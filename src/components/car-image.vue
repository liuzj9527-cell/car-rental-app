<template>
  <view class="ci" :style="{ height, borderRadius: radius }">
    <image
      v-if="!failed && src"
      class="ci__img"
      :src="src"
      mode="aspectFill"
      @error="failed = true"
    />
    <view v-else class="ci__fb">
      <text class="ci__fb-logo">驭驰</text>
      <text class="ci__fb-brand">{{ brand || '严选车源' }}</text>
    </view>
    <slot />
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

/**
 * 车辆图片组件
 * 真实图片加载失败时自动降级为品牌占位图，避免出现破图（生产环境必备）
 */
const props = withDefaults(defineProps<{
  src?: string
  brand?: string
  height?: string
  radius?: string
}>(), {
  src: '',
  brand: '',
  height: '100%',
  radius: '0'
})

const failed = ref(false)
watch(() => props.src, () => { failed.value = false })
</script>

<style lang="scss" scoped>
.ci {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #eceff3;
}
.ci__img { width: 100%; height: 100%; display: block; }
.ci__fb {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f2f4f7, #e4e8ee);
}
.ci__fb-logo {
  font-size: 34rpx;
  font-weight: 800;
  color: #c2c8d1;
  letter-spacing: 6rpx;
}
.ci__fb-brand {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #b0b7c0;
}
</style>
