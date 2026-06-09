# 狼群 L.Q 战术小队 Squad 官网静态版

这是一个可直接上传部署的静态官网，不依赖后端

## 文件说明

- `index.html`: 页面结构和展示文案
- `styles.css`: 页面样式、桌面端和移动端适配
- `script.js`: 读取 `content.json`、移动端菜单、导航高亮、申请信息生成
- `content.json`: 官网可编辑内容，包括基础信息、公告和赞助名单
- `admin.html`: 备用独立后台页面
- `admin.js`: 首页内置后台、读取、编辑、导出和发布逻辑
- `assets/lq-avatar.png`: 服务器头像和 favicon

页面已包含首屏入场、滚动显现、按钮点击波纹、移动端菜单滑动、卡片悬停和招募面板扫描动效 系统开启“减少动态效果”时会自动降低动画

## 上线方式

把整个 `lq-server-site` 文件夹上传到服务器网站根目录即可 也可以只上传文件夹内的内容到 Nginx、宝塔、Apache 或对象存储静态站点

## 后台编辑方式

上传到 GitHub Pages 后，后台已经集成在首页

打开官网后，点击导航里的 `后台`，或者页脚的 `管理登录`，会在当前页面弹出登录窗口

如果还没有绑定域名，官网地址是：

```text
https://mcbrienanuel193-svg.github.io/lq-squad-server/
```

后台可以修改基础信息、公告内容和赞助名单 发布时需要输入 GitHub Token，Token 只在浏览器里使用，不要写进任何文件

后台带有登录页和申请记录页 当前申请记录保存在浏览器本机，用于免费静态站的轻量记录 如果要让所有玩家跨设备提交后都自动进入后台，需要额外接入表单服务、数据库或服务器接口

## GitHub Token 权限

建议创建 fine-grained personal access token，只选择这个仓库，并给 `Contents` 设置 `Read and write` 权限
