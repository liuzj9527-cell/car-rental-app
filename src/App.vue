<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app'

onLaunch(() => {
  // 应用启动：可在此做登录态校验、埋点初始化、远程配置拉取
})
onShow(() => {})
</script>

<style lang="scss">
/* ============================================================
   全局公共样式（ukit 层）
   ============================================================ */
page {
  background-color: $bg;
  font-size: 28rpx;
  color: $ink;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
}

view, text, image, scroll-view, swiper { box-sizing: border-box; }

/* ---------- 布局工具类 ---------- */
.flex { display: flex; align-items: center; }
.flex-col { display: flex; flex-direction: column; }
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-center { display: flex; align-items: center; justify-content: center; }
.flex-wrap { flex-wrap: wrap; }
.flex-1 { flex: 1; min-width: 0; }
.ellipsis { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ellipsis-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

/* ---------- 卡片 ---------- */
.card {
  background: $card;
  border-radius: $r-md;
  margin: $gap-md;
  overflow: hidden;
  box-shadow: $shadow-sm;
}
.card--flat { box-shadow: none; border: 1rpx solid $line; }
.card-body { padding: $gap-md; }

/* ---------- 区块标题 ---------- */
.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $gap-md $gap-md 0;
  font-size: 32rpx;
  font-weight: 600;
  color: $ink;
  letter-spacing: 0.5rpx;

  .bar {
    display: inline-block;
    width: 6rpx;
    height: 30rpx;
    background: linear-gradient(180deg, $brand, $brand-deep);
    border-radius: 3rpx;
    margin-right: 14rpx;
  }
  .more { font-size: 24rpx; font-weight: 400; color: $ink-3; }
}

/* ---------- 价格 ---------- */
.price {
  color: $brand;
  font-weight: 700;
  font-family: 'DIN Alternate', -apple-system, sans-serif;
}
.price--unit { font-size: 22rpx; font-weight: 500; margin-left: 2rpx; }
.price--old {
  color: $ink-4;
  font-size: 22rpx;
  font-weight: 400;
  text-decoration: line-through;
  margin-left: 10rpx;
}

/* ---------- 标签 ---------- */
.tag {
  display: inline-block;
  padding: 4rpx 14rpx;
  border-radius: $r-xs;
  font-size: 20rpx;
  line-height: 1.6;
  background: $brand-soft;
  color: $brand-deep;
  border: 1rpx solid $brand-line;
}
.tag--gray { background: #F2F3F5; color: $ink-2; border-color: transparent; }
.tag--green { background: #E8F8EC; color: #00891F; border-color: transparent; }
.tag--blue { background: #EAF2FF; color: #1A62D6; border-color: transparent; }

/* ---------- 按钮 ---------- */
.btn-primary {
  background: linear-gradient(135deg, $brand, $brand-deep);
  color: #fff;
  border-radius: $r-pill;
  text-align: center;
  padding: 24rpx 0;
  font-size: 30rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
  box-shadow: 0 8rpx 20rpx rgba(255, 106, 0, 0.28);

  &--disabled { opacity: 0.45; box-shadow: none; }
  &--plain {
    background: #fff;
    color: $brand;
    border: 2rpx solid $brand;
    box-shadow: none;
  }
}
.btn-ghost {
  background: #fff;
  color: $ink-2;
  border: 1rpx solid $line;
  border-radius: $r-pill;
  text-align: center;
  padding: 22rpx 0;
  font-size: 28rpx;
}

/* ---------- VIP 卡（黑金） ---------- */
.vip-card {
  background: linear-gradient(135deg, $vip-bg, $vip-bg-2);
  border-radius: $r-lg;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: -80rpx;
    right: -80rpx;
    width: 260rpx;
    height: 260rpx;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(212, 175, 106, 0.35), transparent 70%);
  }
  .vip-title { color: $gold; font-weight: 700; letter-spacing: 1rpx; }
  .vip-sub { color: rgba(255, 255, 255, 0.6); font-size: 22rpx; }
}

/* ---------- 空态 ---------- */
.empty {
  padding: 120rpx 0;
  text-align: center;
  color: $ink-3;
  font-size: 26rpx;

  .empty-icon { font-size: 88rpx; display: block; margin-bottom: 20rpx; opacity: 0.5; }
}

/* ---------- 分割 ---------- */
.divider { height: 1rpx; background: $line; }
</style>
