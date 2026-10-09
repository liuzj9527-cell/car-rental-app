<template>
  <view class="sell">
<!--    <view class="sell-nav">
      <view class="sell-nav__back" @click="goBack">‹</view>
      <text class="sell-nav__title">我要卖车</text>
      <view class="sell-nav__back"></view>
    </view> -->

    <!-- 卖点 -->
    <view class="sell-hero">
      <view class="sell-hero__bg"></view>
      <view class="sell-hero__title">高价卖车 上门评估</view>
      <view class="sell-hero__sub">最快 30 分钟出价 · 当天成交 · 透明无套路</view>
      <view class="sell-hero__stats">
        <view class="sell-hero__stat"><text class="num">2000+</text><text class="lbl">日均成交</text></view>
        <view class="sell-hero__stat"><text class="num">¥3.2万</text><text class="lbl">平均溢价</text></view>
        <view class="sell-hero__stat"><text class="num">98.6%</text><text class="lbl">客户满意</text></view>
      </view>
    </view>

    <!-- 表单 -->
    <view class="form">
      <view class="form__title"><text class="bar"></text>车辆基本信息</view>

      <view class="form-item">
        <text class="form-item__label">所在城市</text>
        <view class="form-item__val" @click="cityVisible = true">
          <text :class="{ placeholder: !form.city }">{{ form.city || '请选择城市' }}</text>
          <text class="form-item__arrow">›</text>
        </view>
      </view>

      <view class="form-item">
        <text class="form-item__label">品牌</text>
        <input v-model="form.brand" class="form-item__input" placeholder="如：宝马" />
      </view>

      <view class="form-item">
        <text class="form-item__label">车型</text>
        <input v-model="form.model" class="form-item__input" placeholder="如：3系 325Li" />
      </view>

      <view class="form-item">
        <text class="form-item__label">上牌年份</text>
        <picker mode="selector" :range="years" @change="(e: any) => form.year = Number(years[e.detail.value])">
          <view class="form-item__val">
            <text :class="{ placeholder: !form.year }">{{ form.year || '请选择' }}</text>
            <text class="form-item__arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-item__label">行驶里程</text>
        <input v-model.number="form.mileage" class="form-item__input" type="number" placeholder="单位：公里" />
      </view>

      <view class="form-item">
        <text class="form-item__label">期望售价</text>
        <input v-model.number="form.expectPrice" class="form-item__input" type="number" placeholder="单位：元" />
      </view>
    </view>

    <view class="form">
      <view class="form__title"><text class="bar"></text>联系人信息</view>
      <view class="form-item">
        <text class="form-item__label">姓名</text>
        <input v-model="form.name" class="form-item__input" placeholder="请输入您的姓名" />
      </view>
      <view class="form-item">
        <text class="form-item__label">手机号</text>
        <input v-model="form.phone" class="form-item__input" type="number" maxlength="11" placeholder="请输入手机号" />
      </view>
      <view class="form-item form-item--col">
        <text class="form-item__label">车辆描述</text>
        <textarea v-model="form.description" class="form-item__textarea" placeholder="请描述车辆状况（保养记录、维修情况、亮点等）" :maxlength="200" />
      </view>

      <view class="form-item form-item--col">
        <text class="form-item__label">车辆照片</text>
        <view class="upload-grid">
          <view v-for="(img, i) in form.images" :key="i" class="upload-item">
            <image :src="img" mode="aspectFill" class="upload-item__img" @click="previewImg(i)" />
            <view class="upload-item__del" @click="form.images.splice(i, 1)">✕</view>
          </view>
          <view v-if="form.images.length < 9" class="upload-item upload-item--add" @click="onPickImage">
            <text class="upload-item__plus">+</text>
            <text class="upload-item__hint">{{ form.images.length }}/9</text>
          </view>
        </view>
        <text class="form-item__tip">建议上传 4-9 张照片（外观、内饰、仪表盘、发动机舱等）</text>
      </view>
    </view>

    <!-- VIP 福利 -->
    <view class="vip-tip">
      <text class="vip-tip__emoji">👑</text>
      <view class="vip-tip__body">
        <view class="vip-tip__title">VIP 卖车加价 ¥3000</view>
        <view class="vip-tip__sub">开通 VIP 享专属卖家顾问 + 优先匹配买家</view>
      </view>
    </view>

    <view class="sell-footer">
      <view class="sell-footer__btn btn-primary" @click="onSubmit">免费评估 · 立即提交</view>
    </view>

    <city-picker v-model:visible="cityVisible" :selected="form.city" @select="(c: string) => form.city = c" />
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { sellApi, genSellId } from '@/api'
import CityPicker from '@/components/city-picker.vue'
import type { SellRequest } from '@/types'

const cityVisible = ref(false)

const years = Array.from({ length: 12 }, (_, i) => 2026 - i)

const form = reactive<SellRequest>({
  id: '', name: '', phone: '', city: '', brand: '', model: '', year: 0,
  mileage: 0, expectPrice: 0, description: '', images: [],
  quotePrice: 0, status: 'submitted', storeId: 0,
  appointTime: '', createdAt: '', remark: ''
})

function onPickImage() {
  // #ifdef H5
  uni.chooseImage({
    count: 9 - form.images.length,
    success: (res) => form.images.push(...res.tempFilePaths)
  })
  // #endif
  // #ifndef H5
  // 小程序 / App 同样支持 chooseImage
  uni.chooseImage({
    count: 9 - form.images.length,
    success: (res) => form.images.push(...res.tempFilePaths)
  })
  // #endif
}

function previewImg(i: number) {
  uni.previewImage({ urls: form.images, current: form.images[i] })
}

function onSubmit() {
  if (!form.city || !form.brand || !form.model || !form.year || !form.mileage || !form.expectPrice) {
    uni.showToast({ title: '请完整填写车辆信息', icon: 'none' })
    return
  }
  if (!form.name || !form.phone || form.phone.length !== 11) {
    uni.showToast({ title: '请填写正确的手机号', icon: 'none' })
    return
  }
  uni.showModal({
    title: '提交成功',
    content: '客服将在 30 分钟内联系您安排免费上门评估',
    showCancel: false,
    success: () => {
      const req: SellRequest = {
        ...form,
        id: genSellId(),
        status: 'submitted',
        storeId: 1,
        appointTime: '',
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        remark: ''
      }
      sellApi.create(req)
      uni.redirectTo({ url: '/pages/sell/list' })
    }
  })
}

function goBack() { uni.navigateBack() }
</script>

<style lang="scss" scoped>
.sell { min-height: 100vh; background: $bg; padding-bottom: 140rpx; }

.sell-nav {
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

.sell-hero {
  position: relative;
  margin: $gap-md;
  padding: 36rpx $gap-md;
  background: linear-gradient(135deg, $brand, $brand-deep);
  color: #fff;
  border-radius: $r-md;
  overflow: hidden;
  &__bg {
    position: absolute; top: -60rpx; right: -60rpx;
    width: 240rpx; height: 240rpx; border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.25), transparent 70%);
  }
  &__title { font-size: 38rpx; font-weight: 700; }
  &__sub { font-size: 24rpx; opacity: 0.9; margin-top: 8rpx; }
  &__stats {
    display: grid; grid-template-columns: repeat(3, 1fr);
    margin-top: 28rpx;
    background: rgba(255, 255, 255, 0.15);
    border-radius: $r-sm;
    padding: 16rpx 0;
  }
  &__stat {
    text-align: center;
    .num { display: block; font-size: 32rpx; font-weight: 700; }
    .lbl { display: block; font-size: 20rpx; opacity: 0.85; margin-top: 4rpx; }
  }
}

.form {
  background: #fff;
  border-radius: $r-md;
  margin: 0 $gap-md $gap-md;
  padding: $gap-md 0;
  box-shadow: $shadow-sm;
  &__title {
    display: flex; align-items: center;
    font-size: 28rpx; font-weight: 600; color: $ink;
    padding: 0 $gap-md 16rpx;
    .bar {
      display: inline-block; width: 6rpx; height: 26rpx;
      background: $brand; border-radius: 3rpx; margin-right: 12rpx;
    }
  }
}
.form-item {
  display: flex; align-items: center; gap: 16rpx;
  padding: 22rpx $gap-md;
  border-bottom: 1rpx solid $line;
  &:last-child { border-bottom: none; }
  &__label { font-size: 28rpx; color: $ink-2; min-width: 160rpx; }
  &__input { flex: 1; font-size: 28rpx; color: $ink; }
  &__val {
    flex: 1; display: flex; align-items: center; justify-content: space-between;
    font-size: 28rpx; color: $ink;
    .placeholder { color: $ink-3; }
  }
  &__arrow { color: $ink-4; font-size: 30rpx; }
  &--col {
    flex-direction: column; align-items: stretch;
    .form-item__label { margin-bottom: 12rpx; }
  }
  &__textarea {
    width: 100%;
    height: 160rpx;
    background: $bg;
    border-radius: $r-sm;
    padding: 16rpx;
    font-size: 26rpx;
    box-sizing: border-box;
  }
  &__tip { font-size: 22rpx; color: $ink-3; margin-top: 12rpx; }
}

.upload-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 16rpx; margin-top: 12rpx;
}
.upload-item {
  position: relative;
  aspect-ratio: 1; border-radius: $r-sm;
  overflow: hidden;
  background: $bg;
  &__img { width: 100%; height: 100%; }
  &__del {
    position: absolute; top: 4rpx; right: 4rpx;
    width: 36rpx; height: 36rpx;
    background: rgba(0, 0, 0, 0.6); color: #fff;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 22rpx;
  }
  &--add {
    border: 2rpx dashed $line;
    background: $bg;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 6rpx;
  }
  &__plus { font-size: 50rpx; color: $ink-3; }
  &__hint { font-size: 20rpx; color: $ink-3; }
}

.vip-tip {
  display: flex; align-items: center; gap: 16rpx;
  margin: 0 $gap-md $gap-md;
  padding: 20rpx $gap-md;
  background: linear-gradient(135deg, #1F1D1A, #3A342B);
  color: #fff;
  border-radius: $r-md;
  &__emoji { font-size: 40rpx; }
  &__body { flex: 1; }
  &__title { color: $gold; font-size: 26rpx; font-weight: 600; }
  &__sub { color: rgba(255, 255, 255, 0.6); font-size: 22rpx; margin-top: 4rpx; }
}

.sell-footer {
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
