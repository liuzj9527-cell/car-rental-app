<template>
  <view class="cp">
    <view class="cp-nav">
      <view class="cp-nav__back" @click="goBack">‹</view>
      <text class="cp-nav__title">发布评价</text>
      <view class="cp-nav__back"></view>
    </view>

    <view class="cp-rate">
      <text class="cp-rate__lbl">评分</text>
      <view class="cp-rate__stars">
        <text v-for="i in 5" :key="i" class="cp-rate__star" :class="{ on: rating >= i }" @click="rating = i">★</text>
      </view>
      <text class="cp-rate__txt">{{ ratingText }}</text>
    </view>

    <view class="cp-form">
      <textarea
        v-model="content"
        class="cp-form__textarea"
        placeholder="说说您的真实用车感受，帮助其他买家参考"
        :maxlength="500"
      />
      <text class="cp-form__count">{{ content.length }}/500</text>

      <view class="cp-form__imgs">
        <view v-for="(img, i) in images" :key="i" class="cp-form__img">
          <image :src="img" mode="aspectFill" class="cp-form__img-pic" @click="previewImg(i)" />
          <view class="cp-form__img-del" @click="images.splice(i, 1)">✕</view>
        </view>
        <view v-if="images.length < 9" class="cp-form__img cp-form__img--add" @click="onPickImage">
          <text class="plus">+</text>
          <text class="hint">添加图片</text>
        </view>
      </view>

      <view v-if="target" class="cp-form__target">
        <text class="lbl">评价车辆</text>
        <text class="val">{{ target.title || target.brand + ' ' + target.model }}</text>
      </view>
    </view>

    <!-- VIP 选项 -->
    <view class="vip-switch" @click="anonymous = !anonymous">
      <text class="vip-switch__emoji">{{ anonymous ? '🕶️' : '👤' }}</text>
      <view class="vip-switch__body">
        <view class="vip-switch__title">匿名发布</view>
        <view class="vip-switch__sub">{{ anonymous ? '您的头像和昵称将隐藏' : '将以您的 VIP 身份展示，更受信任' }}</view>
      </view>
      <view class="vip-switch__check" :class="{ on: anonymous }"></view>
    </view>

    <view class="cp-footer">
      <view class="cp-footer__btn btn-primary" @click="onSubmit">发布</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { commentApi, saleApi, genCommentId } from '@/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const rating = ref(5)
const content = ref('')
const images = ref<string[]>([])
const anonymous = ref(false)
const saleId = ref(0)

const target = computed(() => saleId.value ? saleApi.detail(saleId.value) : null)

const RATING_TEXT = ['', '非常差', '不满意', '一般', '满意', '非常满意']
const ratingText = computed(() => RATING_TEXT[rating.value])

onLoad((q: any) => {
  if (q.saleId) saleId.value = Number(q.saleId)
})

function onPickImage() {
  uni.chooseImage({
    count: 9 - images.value.length,
    success: (res) => images.value.push(...res.tempFilePaths)
  })
}

function previewImg(i: number) {
  uni.previewImage({ urls: images.value, current: images.value[i] })
}

function onSubmit() {
  if (!content.value.trim()) {
    uni.showToast({ title: '请输入评价内容', icon: 'none' })
    return
  }
  if (!saleId.value) {
    uni.showToast({ title: '评价对象不存在', icon: 'none' })
    return
  }
  commentApi.add({
    id: genCommentId(),
    targetType: 'sale',
    targetId: saleId.value,
    userName: anonymous.value ? '匿名用户' : (userStore.user?.nickname || '驭驰用户'),
    userAvatar: anonymous.value ? '' : (userStore.user?.avatar || ''),
    vipLevel: anonymous.value ? 'none' : (userStore.vipInfo?.level || 'none'),
    rating: rating.value,
    content: content.value.trim(),
    images: images.value,
    video: '',
    likes: 0,
    liked: false,
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    reply: ''
  })
  uni.showToast({ title: '发布成功', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 1000)
}

function goBack() { uni.navigateBack() }
</script>

<style lang="scss" scoped>
.cp { min-height: 100vh; background: $bg; padding-bottom: 140rpx; }

.cp-nav {
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

.cp-rate {
  background: #fff;
  padding: 36rpx $gap-md;
  display: flex; align-items: center; gap: 24rpx;
  margin-bottom: $gap-md;
  &__lbl { font-size: 28rpx; color: $ink-2; }
  &__stars { display: flex; gap: 12rpx; }
  &__star {
    font-size: 56rpx; color: $line;
    transition: all 0.2s;
    &.on { color: $warning; }
  }
  &__txt { font-size: 24rpx; color: $brand; margin-left: auto; }
}

.cp-form {
  background: #fff;
  margin: 0 $gap-md $gap-md;
  padding: $gap-md;
  border-radius: $r-md;
  box-shadow: $shadow-sm;
  &__textarea {
    width: 100%;
    height: 240rpx;
    font-size: 28rpx;
    line-height: 1.6;
    color: $ink;
  }
  &__count {
    text-align: right; font-size: 22rpx; color: $ink-3; display: block;
  }
  &__imgs {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 16rpx; margin-top: 24rpx;
  }
  &__img {
    position: relative;
    aspect-ratio: 1;
    border-radius: $r-sm;
    overflow: hidden;
    background: $bg;
    &--add {
      border: 2rpx dashed $line;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 6rpx;
    }
  }
  &__img-pic { width: 100%; height: 100%; }
  &__img-del {
    position: absolute; top: 4rpx; right: 4rpx;
    width: 36rpx; height: 36rpx;
    background: rgba(0, 0, 0, 0.6); color: #fff;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 22rpx;
  }
  .plus { font-size: 50rpx; color: $ink-3; }
  .hint { font-size: 22rpx; color: $ink-3; }

  &__target {
    margin-top: 24rpx;
    padding: 18rpx;
    background: $bg;
    border-radius: $r-sm;
    display: flex; align-items: center; gap: 12rpx;
    .lbl { font-size: 24rpx; color: $ink-3; }
    .val { font-size: 24rpx; color: $ink; font-weight: 500; }
  }
}

.vip-switch {
  display: flex; align-items: center; gap: 16rpx;
  margin: 0 $gap-md $gap-md;
  padding: 20rpx $gap-md;
  background: #fff;
  border-radius: $r-md;
  box-shadow: $shadow-sm;
  &__emoji { font-size: 40rpx; }
  &__body { flex: 1; }
  &__title { font-size: 28rpx; color: $ink; font-weight: 600; }
  &__sub { font-size: 22rpx; color: $ink-3; margin-top: 4rpx; }
  &__check {
    width: 44rpx; height: 26rpx;
    background: $line;
    border-radius: 13rpx;
    position: relative;
    transition: all 0.2s;
    &::after {
      content: '';
      position: absolute; top: 3rpx; left: 3rpx;
      width: 20rpx; height: 20rpx;
      background: #fff;
      border-radius: 50%;
      transition: all 0.2s;
    }
    &.on {
      background: $brand;
      &::after { left: 21rpx; }
    }
  }
}

.cp-footer {
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
