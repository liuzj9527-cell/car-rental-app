<template>
  <view v-if="car" class="detail">
    <!-- 自定义头 -->
    <view class="detail-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="detail-nav__btn" @click="goBack">‹</view>
      <view class="detail-nav__title">车辆详情</view>
      <view class="detail-nav__btn" @click="toggleFav">{{ favorited ? '★' : '☆' }}</view>
    </view>

    <!-- 头图轮播 -->
    <swiper class="gallery" :indicator-dots="true" indicator-color="rgba(255,255,255,0.4)" indicator-active-color="#FF6A00" :autoplay="false">
      <swiper-item v-for="(img, i) in car.images" :key="i" @click="previewImage(i)">
        <car-image :src="img" :brand="car.brand" height="100%" radius="0" />
        <view class="gallery__counter">{{ i + 1 }}/{{ car.images.length }}</view>
      </swiper-item>
    </swiper>

    <!-- 标题 + 价格 -->
    <view class="price-card">
      <view class="price-card__row">
        <view>
          <text class="price price--xl">{{ formatWan(car.price) }}</text>
          <text class="price price--unit">万</text>
          <text class="price price--old">新车 {{ formatWan(car.originalPrice) }} 万</text>
        </view>
        <view class="save-price">省 {{ ((car.originalPrice - car.price) / 10000).toFixed(2) }} 万</view>
      </view>
      <view class="price-card__title">{{ car.title }}</view>
      <view class="price-card__meta">
        <text>{{ car.firstRegister }} 上牌</text>
        <text class="dot">·</text>
        <text>{{ car.carAge }} 年车龄</text>
        <text class="dot">·</text>
        <text>{{ (car.mileage / 10000).toFixed(2) }} 万公里</text>
        <text class="dot">·</text>
        <text>{{ car.city }}</text>
      </view>
      <view class="price-card__tags">
        <text v-for="t in car.tags" :key="t" class="tag">{{ t }}</text>
        <text v-if="car.video" class="tag tag--green">🎬 验车视频</text>
      </view>
    </view>

    <!-- 分期试算 -->
    <view class="block">
      <view class="block__title">
        <text class="bar"></text>分期方案 <text class="block__sub">月供低至 <text class="price">¥{{ car.monthlyPayment }}</text></text>
      </view>
      <view class="installments">
        <view v-for="p in car.installments" :key="p.months" class="inst-row">
          <view class="inst-row__main">
            <view class="inst-row__months">{{ p.months }}期</view>
            <view class="inst-row__rate">年化 {{ p.rate }}%</view>
          </view>
          <view class="inst-row__detail">
            <view>首付 <text class="ink-bold">¥{{ (p.downPayment / 10000).toFixed(2) }}万</text></view>
            <view>月供 <text class="price">¥{{ p.monthlyPayment }}</text></view>
            <view>总利息 <text class="ink-2">¥{{ p.totalInterest }}</text></view>
          </view>
          <view class="inst-row__cta" @click="goInstallment(p.months)">计算</view>
        </view>
      </view>
    </view>

    <!-- 车辆档案 -->
    <view class="block">
      <view class="block__title"><text class="bar"></text>车辆档案</view>
      <view class="spec-grid">
        <view class="spec-item"><text class="spec-label">品牌</text><text class="spec-val">{{ car.brand }}</text></view>
        <view class="spec-item"><text class="spec-label">车系</text><text class="spec-val">{{ car.series }}</text></view>
        <view class="spec-item"><text class="spec-label">车型</text><text class="spec-val">{{ car.type }}</text></view>
        <view class="spec-item"><text class="spec-label">能源</text><text class="spec-val">{{ car.energy }}</text></view>
        <view class="spec-item"><text class="spec-label">排量</text><text class="spec-val">{{ car.displacement }}</text></view>
        <view class="spec-item"><text class="spec-label">变速箱</text><text class="spec-val">{{ car.gearbox }}</text></view>
        <view class="spec-item"><text class="spec-label">颜色</text><text class="spec-val">{{ car.color }}</text></view>
        <view class="spec-item"><text class="spec-label">过户次数</text><text class="spec-val">{{ car.ownerCount }}次</text></view>
      </view>
    </view>

    <!-- 视频 -->
    <view v-if="car.video" class="block">
      <view class="block__title"><text class="bar"></text>实车视频</view>
      <view class="video-wrap">
        <video :src="car.video" controls :show-play-btn="true" object-fit="cover" class="video" />
      </view>
    </view>

    <!-- 视频列表（推荐视频） -->
    <view v-if="videoList.length" class="block">
      <view class="block__title"><text class="bar"></text>相关视频</view>
      <scroll-view scroll-x class="video-scroll" :show-scrollbar="false">
        <view v-for="(v, i) in videoList" :key="i" class="video-card" @click="openVideo(v)">
          <car-image :src="v.cover" :brand="v.title" height="180rpx" radius="12rpx" />
          <view class="video-card__play">▶</view>
          <view class="video-card__title ellipsis">{{ v.title }}</view>
        </view>
      </scroll-view>
    </view>

    <!-- 检测报告 -->
    <view class="block">
      <view class="block__title">
        <text class="bar"></text>检测报告
        <text class="block__score">{{ car.inspectScore }} <text class="block__score-unit">分</text></text>
      </view>
      <view class="report-summary">
        <text class="report-summary__num">{{ car.inspectScore }}</text>
        <view class="report-summary__bar"><view class="report-summary__fill" :style="{ width: car.inspectScore + '%' }"></view></view>
        <text class="report-summary__txt">综合车况优于 {{ Math.min(99, car.inspectScore + 5) }}% 同龄车辆</text>
      </view>
      <view class="report-list">
        <view v-for="it in car.inspectReport" :key="it.key" class="report-item">
          <view class="report-item__label">
            <text v-if="it.pass" class="ok">✓</text>
            <text v-else class="warn">!</text>
            {{ it.label }}
          </view>
          <text class="report-item__val">{{ it.result }}</text>
        </view>
      </view>
    </view>

    <!-- 评论区 -->
    <view class="block">
      <view class="block__title">
        <text class="bar"></text>车主评论
        <text class="block__sub">({{ comments.length }})</text>
      </view>
      <view v-if="!comments.length" class="empty" style="padding: 60rpx 0;">
        <text class="empty-icon">💬</text>暂无评论，来抢沙发吧
      </view>
      <comment-item v-for="c in comments" :key="c.id" :comment="c" @like="onLike" />
      <view v-if="comments.length" class="more-link" @click="goComments">查看全部评论 ›</view>
    </view>

    <!-- 推荐车辆 -->
    <view class="block">
      <view class="block__title"><text class="bar"></text>看了又看</view>
      <view class="recommend">
        <view v-for="r in recommend" :key="r.id" class="recommend-item" @click="reload(r.id)">
          <car-image :src="r.images[0]" :brand="r.brand" height="180rpx" radius="12rpx" />
          <view class="recommend-item__title ellipsis">{{ r.title }}</view>
          <view class="recommend-item__price">
            <text class="price">{{ formatWan(r.price) }}</text>
            <text class="price--unit">万</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部固定操作 -->
    <view class="footer">
      <view class="footer__icon" @click="callPhone">
        <text class="footer__emoji">📞</text>
        <text>咨询</text>
      </view>
      <view class="footer__icon" @click="go('/pages/comment/publish?saleId=' + car.id)">
        <text class="footer__emoji">✍️</text>
        <text>写评价</text>
      </view>
      <view class="footer__main btn-ghost" @click="goInstallment(36)">分期试算</view>
      <view class="footer__main btn-primary" @click="onBuyNow">立即购买</view>
    </view>
  </view>
  <view v-else class="empty"><text class="empty-icon">🚗</text>车辆不存在或已下架</view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import CarImage from '@/components/car-image.vue'
import CommentItem from '@/components/comment-item.vue'
import { saleApi, commentApi } from '@/api'

const statusBarHeight = ref(20)
const carId = ref(0)
const favorited = ref(false)

const car = computed(() => saleApi.detail(carId.value))
const comments = computed(() => commentApi.list('sale', carId.value))
const recommend = computed(() => saleApi.recommend(carId.value, 4))

/** 推荐视频 */
const videoList = computed(() => {
  if (!car.value) return []
  return [
    { cover: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=70', title: `${car.value.brand} 实车详解` },
    { cover: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=400&q=70', title: `${car.value.series} 试驾体验` },
    { cover: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=400&q=70', title: '驭驰检测流程揭秘' }
  ]
})

onLoad((q: any) => {
  carId.value = Number(q.id)
  try { statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 20 } catch { /* ignore */ }
})

onShareAppMessage(() => ({
  title: car.value?.title || '驭驰二手车',
  path: `/pages/sale/detail?id=${carId.value}`
}))

function previewImage(i: number) {
  if (!car.value) return
  uni.previewImage({ urls: car.value.images, current: car.value.images[i] })
}
function openVideo(v: { cover: string; title: string }) {
  uni.showToast({ title: `正在播放：${v.title}`, icon: 'none' })
}
function toggleFav() {
  favorited.value = !favorited.value
  uni.showToast({ title: favorited.value ? '已收藏' : '已取消收藏', icon: 'none' })
}
function onBuyNow() {
  uni.showModal({
    title: '确认下单',
    content: '客服将在 5 分钟内与您联系，确认看车时间',
    success: ({ confirm }) => {
      if (confirm) uni.showToast({ title: '已提交，客服将尽快联系', icon: 'success' })
    }
  })
}
function onLike(id: number) {
  const c = commentApi.toggleLike(id)
  uni.showToast({ title: c?.liked ? '已点赞' : '取消点赞', icon: 'none' })
}
function goInstallment(months: number) {
  uni.navigateTo({ url: `/pages/installment/calc?id=${carId.value}&months=${months}` })
}
function goComments() { uni.navigateTo({ url: `/pages/comment/publish?saleId=${carId.value}` }) }
function callPhone() { uni.makePhoneCall({ phoneNumber: '400-888-6688' }) }
function reload(id: number) { carId.value = id; uni.pageScrollTo({ scrollTop: 0 }) }
function goBack() { uni.navigateBack() }
function go(url: string) { uni.navigateTo({ url }) }
const formatWan = (n: number) => (n / 10000).toFixed(2)
</script>

<style lang="scss" scoped>
.detail { min-height: 100vh; background: $bg; padding-bottom: 140rpx; }

.detail-nav {
  position: fixed; left: 0; right: 0; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16rpx;
  height: calc(44px + env(safe-area-inset-top));
  color: #fff;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.45), transparent);
  &__btn {
    width: 60rpx; height: 60rpx;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 40rpx;
  }
  &__title { font-size: 30rpx; font-weight: 600; }
}

/* 画廊 */
.gallery { width: 100%; height: 540rpx; position: relative; background: $ink; }
.gallery__counter {
  position: absolute; right: 24rpx; bottom: 24rpx;
  padding: 6rpx 18rpx;
  background: rgba(0, 0, 0, 0.6);
  color: #fff; font-size: 22rpx; border-radius: $r-xs;
}

/* 价格卡 */
.price-card {
  background: #fff;
  margin: -40rpx $gap-md $gap-md;
  border-radius: $r-md;
  padding: $gap-md;
  position: relative; z-index: 2;
  box-shadow: $shadow-md;
  &__row { display: flex; align-items: baseline; justify-content: space-between; }
  &__title { font-size: 32rpx; font-weight: 600; color: $ink; margin-top: 12rpx; }
  &__meta { font-size: 22rpx; color: $ink-3; margin-top: 12rpx; .dot { margin: 0 6rpx; } }
  &__tags { display: flex; flex-wrap: wrap; margin-top: 14rpx; gap: 8rpx; }
}
.price--xl { font-size: 48rpx; }
.save-price {
  background: $brand-soft; color: $brand-deep;
  padding: 6rpx 16rpx; font-size: 22rpx;
  border-radius: $r-xs;
}

/* 通用 block */
.block {
  background: #fff;
  border-radius: $r-md;
  margin: 0 $gap-md $gap-md;
  padding: $gap-md $gap-md $gap-md;
  box-shadow: $shadow-sm;
  &__title {
    display: flex; align-items: center;
    font-size: 30rpx; font-weight: 600; color: $ink;
    margin-bottom: 20rpx;
    .bar {
      display: inline-block; width: 6rpx; height: 28rpx;
      background: $brand; border-radius: 3rpx;
      margin-right: 12rpx;
    }
    .block__sub { font-weight: 400; font-size: 24rpx; color: $ink-3; margin-left: 12rpx; }
    .block__score { margin-left: auto; font-size: 36rpx; color: $brand; }
    .block__score-unit { font-size: 22rpx; }
  }
}

/* 分期 */
.installments { display: flex; flex-direction: column; gap: 16rpx; }
.inst-row {
  display: flex; align-items: center; gap: 16rpx;
  padding: 16rpx;
  background: $brand-soft;
  border-radius: $r-sm;
  &__main { text-align: center; min-width: 110rpx; }
  &__months { font-size: 30rpx; font-weight: 700; color: $brand-deep; }
  &__rate { font-size: 20rpx; color: $ink-3; }
  &__detail {
    flex: 1; display: flex; flex-direction: column; gap: 4rpx;
    font-size: 22rpx; color: $ink-2;
    .ink-bold { color: $ink; font-weight: 600; }
  }
  &__cta {
    padding: 10rpx 22rpx;
    background: #fff; color: $brand-deep;
    border: 1rpx solid $brand;
    border-radius: $r-pill; font-size: 22rpx;
  }
}

/* 规格 */
.spec-grid {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 1rpx;
  background: $line;
  border-radius: $r-sm;
  overflow: hidden;
}
.spec-item {
  background: #fff;
  padding: 22rpx 18rpx;
  display: flex; align-items: center; justify-content: space-between;
}
.spec-label { font-size: 24rpx; color: $ink-3; }
.spec-val { font-size: 26rpx; color: $ink; font-weight: 500; }

/* 视频 */
.video-wrap {
  width: 100%; height: 400rpx;
  background: $ink;
  border-radius: $r-sm; overflow: hidden;
}
.video { width: 100%; height: 100%; }
.video-scroll { white-space: nowrap; padding-bottom: 8rpx; }
.video-card {
  display: inline-block; width: 280rpx; margin-right: 16rpx;
  vertical-align: top; position: relative;
  &:last-child { margin-right: 0; }
  &__play {
    position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
    width: 80rpx; height: 80rpx; border-radius: 50%;
    background: rgba(0, 0, 0, 0.5); color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 32rpx;
  }
  &__title {
    margin-top: 8rpx; font-size: 24rpx; color: $ink;
    width: 280rpx;
  }
}

/* 检测报告 */
.report-summary {
  display: flex; align-items: center; gap: 16rpx;
  padding: 20rpx;
  background: linear-gradient(135deg, #FFF3EA, #FFE6D1);
  border-radius: $r-sm;
  margin-bottom: 16rpx;
  &__num { font-size: 48rpx; color: $brand; font-weight: 700; }
  &__bar {
    flex: 1; height: 12rpx; background: rgba(255, 255, 255, 0.6);
    border-radius: 6rpx; overflow: hidden;
  }
  &__fill { height: 100%; background: linear-gradient(90deg, $brand, $brand-deep); }
  &__txt { font-size: 22rpx; color: $ink-2; }
}
.report-list { display: flex; flex-direction: column; gap: 4rpx; }
.report-item {
  display: flex; justify-content: space-between;
  padding: 18rpx 0; border-bottom: 1rpx dashed $line;
  font-size: 24rpx; color: $ink-2;
  &:last-child { border-bottom: none; }
  &__label {
    .ok { color: $success; font-weight: 700; margin-right: 10rpx; }
    .warn { color: $warning; font-weight: 700; margin-right: 10rpx; }
  }
  &__val { color: $ink; }
}

/* 推荐 */
.recommend {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}
.recommend-item {
  &__title { font-size: 24rpx; color: $ink; margin-top: 8rpx; }
  &__price { margin-top: 4rpx; .price { font-size: 28rpx; } }
}

/* 底部操作 */
.footer {
  position: fixed; left: 0; right: 0; bottom: 0;
  display: flex; align-items: center; gap: 16rpx;
  padding: 16rpx 24rpx;
  background: #fff;
  box-shadow: 0 -2rpx 12rpx rgba(20, 24, 32, 0.06);
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  z-index: 50;
  &__icon {
    display: flex; flex-direction: column; align-items: center; gap: 4rpx;
    font-size: 20rpx; color: $ink-2; min-width: 80rpx;
  }
  &__emoji { font-size: 36rpx; }
  &__main {
    flex: 1; text-align: center; padding: 22rpx 0;
    font-size: 28rpx; font-weight: 600;
    border-radius: $r-pill;
  }
}
</style>
