<template>
  <view class="search-page">
    <!-- 顶部搜索栏 -->
    <view class="search-header">
      <view class="back-btn" @click="goBack">‹</view>
      <view class="search-input-wrap">
        <text class="icon">🔍</text>
        <input
          v-model="keyword"
          class="search-input"
          :focus="autoFocus"
          placeholder="搜索 品牌 / 车系 / 关键词"
          confirm-type="search"
          @confirm="onSearch"
          @input="onInput"
        />
        <text v-if="keyword" class="clear-btn" @click="clearKeyword">×</text>
      </view>
      <view class="cancel-btn" @click="goBack">取消</view>
    </view>

    <!-- 搜索结果模式 -->
    <view v-if="mode === 'result'" class="result-wrap">
      <view class="filter-bar">
        <view
          v-for="f in filters"
          :key="f.key"
          class="filter-item"
          :class="{ active: sortKey === f.key }"
          @click="onSort(f.key)"
        >
          <text>{{ f.label }}</text>
          <text v-if="f.key === 'price'" class="arrow">
            {{ sortKey === 'price' && sortOrder === 'asc' ? '↑' : sortKey === 'price' ? '↓' : '⇅' }}
          </text>
        </view>
      </view>

      <view v-if="loading" class="state-tip">加载中…</view>
      <view v-else-if="!results.length" class="state-tip">
        <view class="empty-icon">🔍</view>
        <view>暂无相关车辆，换个关键词试试</view>
      </view>
      <view v-else class="result-list">
        <view
          v-for="item in results"
          :key="item.id"
          class="result-card"
          @click="goDetail(item)"
        >
          <view class="result-cover">
            <car-image :src="item.images[0]" :brand="item.brand" height="180rpx" radius="12" />
          </view>
          <view class="result-info">
            <view class="result-title">{{ item.title }}</view>
            <view class="result-meta">
              <text>{{ item.carAge }}年</text>
              <text class="dot">·</text>
              <text>{{ formatMileage(item.mileage) }}</text>
              <text class="dot">·</text>
              <text>{{ item.city }}</text>
            </view>
            <view class="result-price">
              <text class="price-num">¥{{ formatWan(item.price) }}</text>
              <text class="price-original">¥{{ formatWan(item.originalPrice) }}</text>
            </view>
            <view class="result-tag">
              月供 ¥{{ item.monthlyPayment }}/月
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 默认模式：历史 + 热门 + 猜你想搜 -->
    <view v-else class="suggest-wrap">
      <!-- 搜索建议 -->
      <view v-if="suggestions.length" class="suggest-section">
        <view class="suggest-title">猜你想搜</view>
        <view class="suggest-list">
          <view
            v-for="(s, i) in suggestions"
            :key="i"
            class="suggest-item"
            @click="quickSearch(s)"
          >
            <text class="s-icon">🔍</text>
            <text class="s-text">{{ s }}</text>
          </view>
        </view>
      </view>

      <!-- 历史搜索 -->
      <view v-if="history.length" class="suggest-section">
        <view class="suggest-title">
          <text>历史搜索</text>
          <text class="clear-history" @click="clearHistory">清空</text>
        </view>
        <view class="tag-list">
          <view
            v-for="(h, i) in history"
            :key="i"
            class="tag"
            @click="quickSearch(h)"
          >{{ h }}</view>
        </view>
      </view>

      <!-- 热门搜索 -->
      <view class="suggest-section">
        <view class="suggest-title">热门搜索</view>
        <view class="tag-list">
          <view
            v-for="(h, i) in hotList"
            :key="i"
            class="tag hot-tag"
            :class="{ top3: i < 3 }"
            @click="quickSearch(h)"
          >
            <text v-if="i < 3" class="rank">{{ i + 1 }}</text>
            {{ h }}
          </view>
        </view>
      </view>

      <!-- 推荐品牌 -->
      <view class="suggest-section">
        <view class="suggest-title">推荐品牌</view>
        <view class="brand-grid">
          <view
            v-for="b in brandList"
            :key="b"
            class="brand-item"
            @click="quickSearch(b)"
          >
            <view class="brand-logo">{{ b.slice(0, 1) }}</view>
            <text>{{ b }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { saleApi } from '@/api'
import { formatWan, formatMileage } from '@/utils/format'
import type { SaleCar } from '@/types'

const currentCity = ref('深圳')

const keyword = ref('')
const autoFocus = ref(true)
const mode = ref<'suggest' | 'result'>('suggest')
const loading = ref(false)

const results = ref<SaleCar[]>([])
const sortKey = ref<'default' | 'price' | 'year' | 'mileage'>('default')
const sortOrder = ref<'asc' | 'desc'>('asc')

const filters = [
  { key: 'default', label: '综合' },
  { key: 'price', label: '价格' },
  { key: 'year', label: '车龄' },
  { key: 'mileage', label: '里程' },
]

const HISTORY_KEY = 'search_history'
const MAX_HISTORY = 10
const history = ref<string[]>([])

const hotList = [
  '大众朗逸', '本田雅阁', '丰田凯美瑞', '奔驰C级', '宝马3系',
  '奥迪A4L', '比亚迪汉', '特斯拉Model 3', '日产轩逸', '大众帕萨特',
]

const brandList = ['大众', '丰田', '本田', '奥迪', '宝马', '奔驰', '比亚迪', '特斯拉', '日产', '福特', '别克', '现代']

const suggestions = ref<string[]>([])

const SUGGEST_DICT = [
  '大众朗逸 2020款', '本田雅阁 混动', '丰田凯美瑞 2.5L',
  '奔驰C260L', '宝马3系 320', '奥迪A4L 时尚动感',
  '比亚迪汉 EV', '特斯拉Model 3', '日产轩逸经典',
  '5万以下', '10万左右', '20-30万', '新能源',
]

onMounted(() => {
  loadHistory()
  suggestions.value = SUGGEST_DICT.slice(0, 6).map(s => `${currentCity.value} ${s}`)
})

onShow(() => {
  loadHistory()
})

function loadHistory() {
  try {
    const raw = uni.getStorageSync(HISTORY_KEY)
    history.value = Array.isArray(raw) ? raw : []
  } catch {
    history.value = []
  }
}

function saveHistory(kw: string) {
  if (!kw.trim()) return
  const list = history.value.filter(h => h !== kw)
  list.unshift(kw)
  history.value = list.slice(0, MAX_HISTORY)
  uni.setStorageSync(HISTORY_KEY, history.value)
}

function clearHistory() {
  uni.showModal({
    title: '提示',
    content: '确定清空历史搜索？',
    success: ({ confirm }) => {
      if (confirm) {
        history.value = []
        uni.removeStorageSync(HISTORY_KEY)
      }
    },
  })
}

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function onInput() {
  if (mode.value === 'result' && !keyword.value) {
    mode.value = 'suggest'
  }
}

function clearKeyword() {
  keyword.value = ''
}

function quickSearch(kw: string) {
  keyword.value = kw
  doSearch(kw)
}

function onSearch() {
  doSearch(keyword.value)
}

async function doSearch(kw: string) {
  const k = kw.trim()
  if (!k) return
  saveHistory(k)
  mode.value = 'result'
  loading.value = true
  await new Promise(r => setTimeout(r, 200))
  let list = saleApi.list({ keyword: k })
  if (sortKey.value !== 'default') {
    list = sortList(list, sortKey.value, sortOrder.value)
  }
  results.value = list
  loading.value = false
}

function sortList(arr: SaleCar[], key: typeof sortKey.value, order: typeof sortOrder.value) {
  const dir = order === 'asc' ? 1 : -1
  return [...arr].sort((a, b) => {
    let av = 0, bv = 0
    if (key === 'price') { av = a.price; bv = b.price }
    else if (key === 'year') { av = a.carAge; bv = b.carAge }
    else if (key === 'mileage') { av = a.mileage; bv = b.mileage }
    return (av - bv) * dir
  })
}

function onSort(key: typeof sortKey.value) {
  if (key === 'default') {
    sortKey.value = 'default'
  } else if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = key === 'price' ? 'asc' : 'desc'
  }
  if (mode.value === 'result') {
    results.value = sortList(results.value, sortKey.value, sortOrder.value)
  }
}

function goDetail(item: SaleCar) {
  uni.navigateTo({ url: `/pages/sale/detail?id=${item.id}` })
}
</script>

<style lang="scss" scoped>
$brand: #FF6A00;
$ink-1: #1A1D23;
$ink-2: #4A5060;
$ink-3: #8A9099;
$ink-4: #C0C5CC;
$bg-page: #F4F5F7;
$divider: #EEF0F3;
$bg: #F4F5F7;

.search-page {
  min-height: 100vh;
  background: $bg-page;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 32rpx;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1rpx solid $divider;

  .back-btn {
    width: 56rpx;
    height: 56rpx;
    line-height: 48rpx;
    text-align: center;
    font-size: 48rpx;
    color: $ink-1;
    font-weight: 300;
  }

  .search-input-wrap {
    flex: 1;
    height: 72rpx;
    background: $bg-page;
    border-radius: 36rpx;
    display: flex;
    align-items: center;
    padding: 0 24rpx;
    gap: 12rpx;

    .icon { font-size: 28rpx; opacity: 0.6; }

    .search-input {
      flex: 1;
      font-size: 28rpx;
      color: $ink-1;
      background: transparent;
    }

    .clear-btn {
      width: 36rpx;
      height: 36rpx;
      line-height: 32rpx;
      text-align: center;
      background: $ink-4;
      color: #fff;
      border-radius: 50%;
      font-size: 28rpx;
    }
  }

  .cancel-btn {
    font-size: 28rpx;
    color: $ink-1;
    padding: 8rpx 0;
  }
}

.filter-bar {
  display: flex;
  background: #fff;
  border-bottom: 1rpx solid $divider;
  position: sticky;
  top: 112rpx;
  z-index: 9;

  .filter-item {
    flex: 1;
    padding: 24rpx 0;
    text-align: center;
    font-size: 26rpx;
    color: $ink-2;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6rpx;

    &.active {
      color: $brand;
      font-weight: 600;
    }

    .arrow { font-size: 22rpx; }
  }
}

.state-tip {
  padding: 120rpx 0;
  text-align: center;
  color: $ink-3;
  font-size: 26rpx;

  .empty-icon { font-size: 80rpx; opacity: 0.4; margin-bottom: 24rpx; }
}

.result-list {
  padding: 24rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.result-card {
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);

  .result-cover {
    width: 200rpx;
    flex-shrink: 0;
    border-radius: 12rpx;
    overflow: hidden;
  }

  .result-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; min-width: 0; }

  .result-title {
    font-size: 30rpx;
    font-weight: 600;
    color: $ink-1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .result-meta {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 24rpx;
    color: $ink-3;
    margin-top: 8rpx;

    .dot { opacity: 0.4; }
  }

  .result-price {
    display: flex;
    align-items: baseline;
    gap: 12rpx;
    margin-top: 12rpx;

    .price-num { font-size: 34rpx; font-weight: 700; color: $brand; }
    .price-original { font-size: 22rpx; color: $ink-4; text-decoration: line-through; }
  }

  .result-tag {
    display: inline-block;
    padding: 4rpx 14rpx;
    background: rgba(255, 106, 0, 0.1);
    color: $brand;
    font-size: 22rpx;
    border-radius: 16rpx;
    margin-top: 8rpx;
    align-self: flex-start;
  }
}

.suggest-wrap {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.suggest-section {
  .suggest-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 26rpx;
    color: $ink-1;
    font-weight: 600;
    margin-bottom: 20rpx;

    .clear-history {
      font-size: 24rpx;
      color: $ink-3;
      font-weight: 400;
    }
  }
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;

  .tag {
    padding: 12rpx 24rpx;
    background: #fff;
    border-radius: 32rpx;
    font-size: 24rpx;
    color: $ink-2;
    border: 1rpx solid $divider;

    &.top3 {
      color: $brand;
      border-color: rgba(255, 106, 0, 0.3);
      background: rgba(255, 106, 0, 0.04);
    }

    .rank {
      display: inline-block;
      width: 28rpx;
      height: 28rpx;
      line-height: 28rpx;
      text-align: center;
      background: $brand;
      color: #fff;
      border-radius: 50%;
      font-size: 20rpx;
      margin-right: 8rpx;
    }
  }
}

.suggest-list {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;

  .suggest-item {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 24rpx;
    border-bottom: 1rpx solid $divider;
    font-size: 28rpx;
    color: $ink-1;

    &:last-child { border-bottom: none; }

    .s-icon { font-size: 24rpx; opacity: 0.5; }
    .s-text { flex: 1; }
  }
}

.brand-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;

  .brand-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
    padding: 24rpx 0;
    background: #fff;
    border-radius: 12rpx;
    font-size: 24rpx;
    color: $ink-2;

    .brand-logo {
      width: 72rpx;
      height: 72rpx;
      line-height: 72rpx;
      text-align: center;
      background: linear-gradient(135deg, #FFD9B8, #FF6A00);
      color: #fff;
      font-weight: 700;
      font-size: 30rpx;
      border-radius: 50%;
    }
  }
}
</style>
