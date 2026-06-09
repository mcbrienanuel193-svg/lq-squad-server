# 狼群 L.Q 战术小队 Squad 官网静态版

这是一个可直接上传部署的静态官网，不依赖后端

## 文件说明

- `index.html`: 页面结构和展示文案
- `styles.css`: 页面样式、桌面端和移动端适配
- `script.js`: 移动端菜单、导航高亮、复制群号、申请信息生成
- `assets/lq-avatar.png`: 服务器头像和 favicon

页面已包含首屏入场、滚动显现、按钮点击波纹、移动端菜单滑动、卡片悬停和招募面板扫描动效 系统开启“减少动态效果”时会自动降低动画

## 上线方式

把整个 `lq-server-site` 文件夹上传到服务器网站根目录即可 也可以只上传文件夹内的内容到 Nginx、宝塔、Apache 或对象存储静态站点

## 需要替换的信息

打开 `script.js`，把开头的配置改成真实信息：

```js
const config = {
  qq: "907522575",
  qqLink: "https://qm.qq.com/q/JWGSe4YnGm",
  serverIp: "狼群服务器",
};
```

页面里的公告、赞助名单、分队介绍都在 `index.html`，可以直接按真实服务器资料修改
