<template>
  <view class="cm">
    <view class="cm__head">
      <image class="cm__avatar" :src="comment.userAvatar" mode="aspectFill" />
      <view class="cm__user">
        <view class="cm__name-row">
          <text class="cm__name">{{ comment.userName }}</text>
          <text v-if="comment.vipLevel !== 'none'" class="cm__vip">VIP</text>
        </view>
        <view class="cm__stars">
          <text v-for="i in 5" :key="i" :class="['cm__star', { on: i <= comment.rating }]">★</text>
        </view>
      </view>
      <text class="cm__time">{{ comment.createdAt.slice(0, 10) }}</text>
    </view>

    <view class="cm__content">{{ comment.content }}</view>

    <!-- 图片九宫格：点击可放大 -->
    <view v-if="comment.images.length" class="cm__imgs">
      <view
        v-for="(img, i) in comment.images"
        :key="i"
        class="cm__img-item"
        @click="preview(i)"
      >
        <car-image :src="img" height="100%" />
      </view>
    </view>

    <!-- 视频 -->
    <view v-if="comment.video" class="cm__video">
      <video
        class="cm__video-el"
        :src="comment.video"
        :poster="comment.images[0] || ''"
        object-fit="cover"
        :show-fullscreen-btn="true"
        :enable-progress-gesture="true"
      />
    </view>

    <view v-if="comment.reply" class="cm__reply">
      <text class="cm__reply-label">官方回复</text>
      <text class="cm__reply-text">{{ comment.reply }}</text>
    </view>

    <view class="cm__foot">
      <view class="cm__like" @click="like">
        <text :class="['cm__like-icon', { liked: comment.liked }]">{{ comment.liked ? '❤️' : '🤍' }}</text>
        <text class="cm__like-num">{{ comment.likes }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import CarImage from '@/components/car-image.vue'
import { commentApi } from '@/api'
import type { Comment } from '@/types'

/**
 * 买家评价组件
 * - 支持九宫格图片，点击调用 uni.previewImage 放大查看
 * - 支持视频播放
 * - 支持点赞（本地持久化）
 */
const props = defineProps<{ comment: Comment }>()
const emit = defineEmits<{ (e: 'like', id: number): void }>()

function preview(index: number) {
  uni.previewImage({
    urls: props.comment.images,
    current: index
  })
}

function like() {
  commentApi.toggleLike(props.comment.id)
  emit('like', props.comment.id)
}
</script>

<style lang="scss" scoped>
.cm {
  padding: $gap-md 0;
  border-bottom: 1rpx solid $line;
  &:last-child { border-bottom: none; }
}
.cm__head { display: flex; align-items: center; }
.cm__avatar {
  width: 68rpx; height: 68rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background: $bg;
}
.cm__user { flex: 1; min-width: 0; margin-left: 18rpx; }
.cm__name-row { display: flex; align-items: center; }
.cm__name { font-size: 26rpx; font-weight: 600; color: $ink; }
.cm__vip {
  margin-left: 10rpx;
  padding: 0 10rpx;
  font-size: 18rpx;
  color: $gold-deep;
  background: linear-gradient(135deg, #FFF6E0, #F3E2B8);
  border-radius: 6rpx;
  font-weight: 700;
}
.cm__stars { margin-top: 4rpx; }
.cm__star { font-size: 22rpx; color: #E0E3E8; &.on { color: #FFB100; } }
.cm__time { font-size: 22rpx; color: $ink-4; }

.cm__content {
  margin-top: 16rpx;
  font-size: 27rpx;
  color: $ink-2;
  line-height: 1.65;
}
.cm__imgs {
  display: flex;
  flex-wrap: wrap;
  margin-top: 16rpx;
}
.cm__img-item {
  width: 200rpx;
  height: 200rpx;
  margin: 0 12rpx 12rpx 0;
  border-radius: $r-sm;
  overflow: hidden;
  background: $bg;
}
.cm__video {
  margin-top: 16rpx;
  border-radius: $r-sm;
  overflow: hidden;
}
.cm__video-el { width: 100%; height: 380rpx; }
.cm__reply {
  margin-top: 16rpx;
  padding: 18rpx 20rpx;
  background: $bg;
  border-radius: $r-sm;
}
.cm__reply-label { font-size: 22rpx; color: $brand; font-weight: 600; margin-right: 12rpx; }
.cm__reply-text { font-size: 25rpx; color: $ink-2; }
.cm__foot {
  display: flex; justify-content: flex-end;
  margin-top: 16rpx;
}
.cm__like { display: flex; align-items: center; }
.cm__like-icon { font-size: 26rpx; }
.cm__like-num { font-size: 22rpx; color: $ink-3; margin-left: 8rpx; }
</style>
