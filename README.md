# 狼群 L.Q 战术小队 Squad 官网静态版

这是一个可直接上传部署的静态官网，不依赖后端

## 文件说明

- `index.html`: 页面结构和展示文案
- `styles.css`: 页面样式、桌面端和移动端适配
- `script.js`: 读取 `content.json`、移动端菜单、导航高亮、当前对局展示、申请信息生成
- `content.json`: 官网可编辑内容，包括基础信息、当前对局、公告和赞助名单
- `rules.html`: 服务器规则独立页面，规则分类从 `content.json` 的 `rules` 字段读取
- `join.html`: Squad Wiki 进服入口，点击后跳转到对应服务器页面
- `admin.html`: 备用独立后台页面
- `admin.js`: 首页内置后台、读取、编辑、导出和发布逻辑
- `assets/lq-avatar.png`: 服务器头像和 favicon
- `workers/squad-wiki-join-worker.js`: 可部署到 Cloudflare Workers 的进服代理
- `public-status.json`: 当前对局公开状态，前端会优先读取这个文件
- `tools/update_public_status.js`: 从 Squad Wiki 公开服务器列表生成 `public-status.json`
- `.github/workflows/update-public-status.yml`: GitHub Actions 定时更新当前对局

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

后台可以修改基础信息、当前对局、公告内容和赞助名单 发布时需要输入 GitHub Token，Token 只在浏览器里使用，不要写进任何文件

当前对局里的“一键进服”按钮现在会自动跳转到 Squad Wiki 对应服务器页面，并带上 `serverID` 和 `serverName` 参数。玩家在 Squad Wiki 页面内使用一键加入。

已经识别到的狼群服务器信息：

```text
Session ID: 9c93a53f7ac94858a09dfa326cbd7bb2
Squad Wiki: https://www.squad.wiki/#servers
服务器名: 【L.Q】狼群#1 =萌新通宵侵攻= 龟壳服务器-免费击杀提示 诚招OP 带队送积分 真实列表人数 kook:50717753 QQ群:907522575 欢迎游玩
```

## 当前对局自动更新

当前版本默认使用第二种方案：从 Squad Wiki 公开服务器列表读取狼群服务器，再生成同目录的 `public-status.json`。前端读取同源文件，不会遇到 GitHub Pages 跨域限制，也不会暴露 RCON 密码。

上传到 GitHub 后，到仓库的 `Actions` 页面打开工作流权限，然后手动运行一次 `Update public Squad status`。之后 GitHub 会每 5 分钟自动检查一次；只有地图、人数、队列等内容变化时才会提交更新。

如果你以后有 Cloudflare Worker 或自己的 HTTPS 状态接口，可以把接口地址填到后台的“RCON 状态接口地址”或 `content.json` 的 `match.statusProxyUrl`，前端会优先读这个接口，失败后再读 `public-status.json`。

## 可选 RCON 状态接口

本仓库已提供一个可运行的 RCON 状态服务：

```powershell
$env:RCON_HOST="202.189.10.12"
$env:RCON_PORT="42008"
$env:RCON_PASSWORD="你的RCON密码"
$env:STATUS_HTTP_HOST="127.0.0.1"
$env:STATUS_HTTP_PORT="8787"
python .\tools\rcon_status_server.py
```

本地预览时，可以临时把 `content.json` 里的 `match.statusProxyUrl` 改成：

```json
"statusProxyUrl": "http://127.0.0.1:8787/status"
```

公开上线到 GitHub Pages 时，不要使用 `127.0.0.1`。玩家浏览器访问 `127.0.0.1` 只会访问玩家自己的电脑，而且 GitHub Pages 是 HTTPS 页面，也不能稳定读取普通 HTTP 接口。需要把这个状态服务部署到你的服务器上，并把 `statusProxyUrl` 改成公开 HTTPS 地址。RCON 密码只放在服务器环境变量里，不要写进前端文件。

接口返回 JSON 即可，前端会兼容常见字段名，例如：

```json
{
  "ok": true,
  "server": {
    "serverName": "【L.Q】狼群#1",
    "map": "Gorodok_Invasion_v2",
    "gameMode": "Invasion",
    "playerCount": 99,
    "maxPlayers": 98,
    "queueCount": 4,
    "source": "RCON"
  }
}
```

如果接口直接返回 `{ "map": "...", "mode": "...", "players": 99, "queue": 4 }` 这类扁平结构，前端也会尽量识别。前端会每 60 秒刷新一次。

当前对局里的 `reserveUrl` 用于“购买预留位”按钮，当前已设置为 `https://www.fyfaka.com/shop/langqunzsxd`。前端会优先在站内弹窗嵌入购买页，弹窗里保留“新窗口打开”作为备用入口。

后台带有登录页和申请记录页 当前申请记录保存在浏览器本机，用于免费静态站的轻量记录 如果要让所有玩家跨设备提交后都自动进入后台，需要额外接入表单服务、数据库或服务器接口

## GitHub Token 权限

建议创建 fine-grained personal access token，只选择这个仓库，并给 `Contents` 设置 `Read and write` 权限
