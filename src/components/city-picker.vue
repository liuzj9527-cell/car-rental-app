<template>
  <view v-if="visible" class="cp">
    <view class="cp__mask" @click="close" />
    <view class="cp__panel">
      <view class="cp__head">
        <text class="cp__title">选择城市</text>
        <text class="cp__close" @click="close">✕</text>
      </view>

      <view class="cp__search">
        <text class="cp__search-icon">🔍</text>
        <input
          v-model="keyword"
          class="cp__search-input"
          type="text"
          placeholder="输入城市名 / 拼音首字母，如 SZ"
          placeholder-class="cp__ph"
          confirm-type="search"
        />
        <text v-if="keyword" class="cp__clear" @click="keyword = ''">✕</text>
      </view>

      <scroll-view scroll-y class="cp__body">
        <template v-if="!keyword">
          <view class="cp__label">热门城市</view>
          <view class="cp__grid">
            <view
              v-for="c in hotCities"
              :key="c.name"
              class="cp__chip"
              :class="{ active: c.name === modelValue }"
              @click="pick(c.name)"
            >{{ c.name }}</view>
          </view>
        </template>

        <view class="cp__label">{{ keyword ? `搜索到 ${list.length} 个城市` : '全部城市' }}</view>
        <view class="cp__list">
          <view v-for="c in list" :key="c.name" class="cp__row" @click="pick(c.name)">
            <text class="cp__row-name">{{ c.name }}</text>
            <text class="cp__row-letter">{{ c.letter }}</text>
          </view>
        </view>

        <view v-if="keyword && list.length === 0" class="cp__none">没有找到相关城市，试试其它关键词</view>
        <view class="cp__safe" />
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { cityApi } from '@/api'
import type { CityItem } from '@/types'

/**
 * 城市选择器（抽屉式）
 * - 支持中文名 / 拼音首字母搜索
 * - 首页、选车筛选、门店地图复用
 */
const props = defineProps<{
  visible: boolean
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'update:modelValue', v: string): void
  (e: 'change', v: string): void
}>()

const keyword = ref('')
const hotCities = computed(() => cityApi.hot())
const list = computed<CityItem[]>(() => cityApi.search(keyword.value))

watch(() => props.visible, v => { if (v) keyword.value = '' })

function close() { emit('update:visible', false) }

function pick(name: string) {
  emit('update:modelValue', name)
  emit('change', name)
  close()
}
</script>

<style lang="scss" scoped>
.cp { position: fixed; inset: 0; z-index: 999; }
.cp__mask { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.45); }
.cp__panel {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 82vh;
  background: #fff;
  border-radius: $r-lg $r-lg 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.24s ease;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.cp__head {
  display: flex; align-items: center; justify-content: center;
  position: relative;
  height: 96rpx;
  border-bottom: 1rpx solid $line;
}
.cp__title { font-size: 32rpx; font-weight: 600; }
.cp__close {
  position: absolute; right: 32rpx; top: 0;
  height: 96rpx; line-height: 96rpx;
  font-size: 32rpx; color: $ink-3;
}
.cp__search {
  display: flex; align-items: center;
  margin: $gap-md;
  height: 76rpx;
  padding: 0 24rpx;
  background: $bg;
  border-radius: $r-pill;
}
.cp__search-icon { font-size: 26rpx; margin-right: 12rpx; }
.cp__search-input { flex: 1; font-size: 28rpx; }
.cp__ph { color: $ink-4; }
.cp__clear { color: $ink-4; font-size: 26rpx; padding: 0 8rpx; }

.cp__body { flex: 1; }
.cp__label {
  padding: $gap-md $gap-md 12rpx;
  font-size: 24rpx;
  color: $ink-3;
}
.cp__grid { display: flex; flex-wrap: wrap; padding: 0 32rpx; }
.cp__chip {
  min-width: 150rpx;
  padding: 18rpx 0;
  margin: 0 16rpx 16rpx 0;
  text-align: center;
  background: $bg;
  border-radius: $r-sm;
  font-size: 26rpx;
  color: $ink-2;
  &.active { background: $brand-soft; color: $brand-deep; font-weight: 600; }
}
.cp__list { padding: 0 32rpx; }
.cp__row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 26rpx 0;
  border-bottom: 1rpx solid $line;
}
.cp__row-name { font-size: 28rpx; color: $ink; }
.cp__row-letter { font-size: 22rpx; color: $ink-4; }
.cp__none { padding: 80rpx 0; text-align: center; color: $ink-3; font-size: 26rpx; }
.cp__safe { height: 40rpx; }
</style>
