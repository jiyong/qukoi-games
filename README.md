# game.qukoi.com 游戏厅

纯静态的 HTML5 小游戏合集。首页 `index.html` 读取 `games.json` 渲染游戏卡片，`games.json` 和缩略图由 `tools/build.js` 扫描 `games/` 目录生成。

线上地址：https://game.qukoi.com/
仓库：`git@codeup.aliyun.com:tup/qu/game-qukoi-com.git`（分支 `main`）

## 目录结构

```
index.html            首页（自适应，手机/平板/桌面）
portal.js             读取 games.json 渲染卡片、搜索
games.json            游戏清单（生成文件，不要手改）
thumbs/               缩略图（生成文件）
games/<id>/           每个游戏一个目录，入口必须是 index.html
games/<id>/game.json  可选，覆盖首页上的标题、描述、标签
tools/build.js        生成 games.json 和缩略图
deploy/deploy.sh      服务器上的发布脚本
deploy/nginx/         nginx server 配置
```

当前收录：华容道 `huarongdao`、空战英豪 `kongzhanyinghao`、消消乐 `xiaoxiaole`、打地鼠 `dadishu`、芽芽保卫战 `yayabaoweizhan`。`zhiwujiangshidazhan` 只有 README，没有 `index.html`，构建时会跳过。

## 新增一个游戏

1. 新建目录 `games/<id>/`，`<id>` 用小写拼音或英文，会出现在网址里。
2. 入口文件为 `games/<id>/index.html`。资源一律用相对路径，不要写 `/js/...` 这类根路径，否则部署到 `games/<id>/` 下会失效。
3. 可选：添加 `games/<id>/game.json`：

   ```json
   { "title": "芽芽保卫战", "desc": "一句话介绍", "tags": ["塔防", "策略"], "order": 0 }
   ```

   | 字段 | 说明 |
   |------|------|
   | `title` | 卡片标题，不填则取 `<title>` |
   | `desc` | 卡片描述，不填则取 `<meta name="description">` |
   | `tags` | 标签数组，参与首页搜索 |
   | `order` | 排序权重，越大越靠前；相同时按更新日期倒序 |
   | `thumb` | 自定义缩略图，相对游戏目录，例如 `"cover.jpg"`；填了就不再自动截图 |

4. 运行构建命令（见下节），再提交推送。

## 更新命令

在本地（macOS，需安装 Google Chrome 和 Node.js 18+）项目根目录执行：

```bash
node --test games/            # 运行各游戏的单元测试（*.test.js）
node tools/build.js           # 生成 games.json，只给新游戏或有改动的游戏重新截图
node tools/build.js --force   # 强制重新截取全部缩略图
node tools/build.js --no-shots  # 只更新 games.json，不截图
```

截图规则：游戏目录里任何文件比现有缩略图新，就会重新截图。截图用 Chrome 无头模式 1280×800 打开游戏首屏，再用 `sips` 压缩成最长边 720px 的 JPG 放到 `thumbs/<id>.jpg`。Chrome 不在默认位置时，用 `CHROME_PATH=/path/to/chrome node tools/build.js` 指定。

本地预览：

```bash
python3 -m http.server 8766   # 浏览器打开 http://localhost:8766/
```

提交并推送：

```bash
git add games/<id> games.json thumbs/<id>.jpg
git commit -m "feat: add <id> game"
git push
```

## 发布到服务器

首次部署：

1. 给服务器配置这个 codeup 仓库的 SSH 读权限（部署密钥）。
2. 把 `deploy/nginx/game.qukoi.com.conf` 复制到 `/etc/nginx/conf.d/`，把 `ssl_certificate` 和 `ssl_certificate_key` 改成实际证书路径。
3. 把 `deploy/deploy.sh` 放到服务器上执行，然后 `nginx -t && nginx -s reload`。

之后每次更新，推送后在服务器上执行：

```bash
bash deploy.sh
```

`deploy.sh` 把仓库拉到 `/opt/game-qukoi-com`，再用 rsync 只同步 `index.html`、`portal.js`、`games.json`、`thumbs/`、`games/` 到网站根目录 `/var/www/game.qukoi.com`。`tools/`、`deploy/` 不会公开。路径可通过环境变量 `SRC`、`WEB_ROOT`、`BRANCH` 覆盖。

nginx 对 html、js、css、json 设置为每次访问都向服务器确认更新，所以发布后用户刷新即可看到新版本，不需要改文件名。

## 页脚备案

页脚备案号 `京ICP备2026064856号-1` 写在 `index.html` 中，链接到 https://beian.miit.gov.cn/ ，修改首页时不要删除。
