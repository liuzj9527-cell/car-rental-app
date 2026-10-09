# 驭驰租车 · 客户端 App（uni-app 多端）

基于 **uni-app + Vue3 + TypeScript + Pinia + uni-ui + Vite** 的租车客户端，一套代码编译到 **H5 / 微信小程序 / Android / iOS App**。

## 功能清单

| 模块 | 功能 |
| --- | --- |
| 首页 | 轮播Banner、城市切换、车型分类入口、热门车型、附近门店 |
| 选车 | 关键词搜索、车型分类、价格区间筛选、价格排序、可租/已租状态 |
| 车辆详情 | 车辆参数、评分、标签、取车门店、服务保障、联系门店 |
| 下单 | 取还车时间选择、门店选择、优惠券选择、费用明细自动计算、模拟支付 |
| 订单 | 状态Tab（待取车/租赁中/已完成）、取消订单、还车、订单详情 |
| 我的 | 登录态、积分/优惠券/余额/订单资产、驾驶证认证、会员横幅 |
| 登录 | 手机号 + 验证码登录、协议勾选、倒计时防重发 |
| 优惠券 | 可用/已使用分类、去使用引导 |

## 演示说明

- 未登录也可浏览下单（演示订单挂在演示账号下）；下单需登录
- 登录：任意 `1` 开头 11 位手机号 + 验证码 `123456`
- 「我的 → 设置 → 重置演示数据」可恢复初始状态

## 快速启动（H5）

```bash
# 1. 安装依赖（Node.js >= 18）
npm install

# 2. 启动 H5 开发服务器（默认 http://localhost:5173）
npm run dev:h5

# 3. 构建 H5 生产包（输出 dist/build/h5）
npm run build:h5
```

## 编译到微信小程序

```bash
# 开发模式（输出 dist/dev/mp-weixin，用微信开发者工具打开该目录）
npm run dev:mp-weixin

# 生产构建（输出 dist/build/mp-weixin）
npm run build:mp-weixin
```

> 微信开发者工具需开启「服务端口」，并在设置中关闭 ES6 转 ES5（项目已配置）。
> 需在 `src/manifest.json` 的 `mp-weixin.appid` 中填入你的小程序 AppID。

## 编译到 App

```bash
npm run dev:app     # 配合 HBuilderX 真机调试
npm run build:app   # 生成 App 资源（配合 HBuilderX 云打包）
```

> App 打包需要 HBuilderX：将本工程导入 HBuilderX → 发行 → 原生App-云打包。

## 也可以直接用 HBuilderX 打开

本工程为标准 uni-app Vue3 工程结构，也可用 **HBuilderX 导入项目后直接运行**（HBuilderX 自带编译器，无需 npm）。

## 目录结构（主流分层规范）

```
car-rental-app/
├── src/
│   ├── api/             # 接口层：index.ts 数据服务（uni storage 持久化）
│   ├── components/      # 业务组件：car-card 车辆卡片
│   ├── pages/           # 页面（与 pages.json 注册对应）
│   │   ├── index/       # 首页
│   │   ├── vehicle/     # 选车列表 / 车辆详情
│   │   ├── order/       # 下单 / 订单列表 / 订单详情
│   │   ├── user/        # 我的
│   │   ├── login/       # 登录
│   │   └── coupon/      # 优惠券
│   ├── stores/          # Pinia 状态（user 模块，setup 风格）
│   ├── types/           # TS 类型定义
│   ├── utils/           # 工具：request.ts 请求封装、storage.ts 跨端存储、format.ts
│   ├── App.vue          # 全局样式 + 生命周期
│   ├── main.ts          # 入口（createSSRApp + Pinia）
│   ├── manifest.json    # 应用配置（appid / 权限 / 多端配置）
│   ├── pages.json       # 页面路由 + tabBar + easycom
│   └── uni.scss         # 全局 scss 变量
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 数据说明

当前使用 **uni storage 本地 Mock 数据**（`src/api/index.ts`），跨端统一。
接入真实后端：将 `src/utils/request.ts` 中 `USE_MOCK` 改为 `false` 并配置 `BASE_URL`，再把 `api/index.ts` 中的方法改为 `http()` 调用即可，页面层零改动。
