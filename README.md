# 子钰流水账

一个无需安装依赖的静态旅行随笔网站。默认冬季粉色 RGB(246,234,243)，右上角 ☀️ 切换到夏季墨绿色，❄️ 切回冬季。浏览器会记住选择。

## 在 VS Code 里编辑

用 VS Code 打开整个 website 文件夹。需要 Node.js 18 或以上版本。

- 首页开场文字：`content/home-intro.txt`。
- 文章正文：`content/<slug>/journal.txt`（第一行是标题，之后空行分段）。
- 游记标题、地点、封面、排序与照片：`content/journals.json`。
- 样式：`src/style.css`；交互：`src/app.js`。
- 生成网站：`npm run build`。
- 本地预览：`npm run dev`，打开 http://127.0.0.1:4173 。

`rank` 为喜爱序号，从 0 开始，越小越靠前；未标号及 identical 均使用 `null`，属于同一最后档。同档顺序只由 JSON 中的次序决定，并不表示更细的偏好。

新增游记时复制一条 JSON 配置，使用唯一 slug，在对应文件夹放置正文和图片，再构建。照片路径相对于 content 文件夹。标题在 journal.txt 与 JSON 中保持一致。

所有正文原样保留（仅按空行排版）；55 张原始照片已导出为 WebP，移除嵌入的 EXIF 等元数据。原素材文件夹没有更改。欧洲游记已加入新提供的 14 张照片，使用南法海岸作封面。

## 发布到 GitHub Pages

把这个 website 文件夹作为独立仓库推送到 GitHub。仓库 Settings → Pages → Source 选择 GitHub Actions。自带工作流在 main 分支有更新时生成并部署网站，无需 Ruby 或 Jekyll。

公开仓库和网站会公开这里的全部游记及导出照片。

## 初次导入脚本

`scripts/import-journals.py` 仅用于从上一级的现有十个素材文件夹重新导入，需要 Pillow。通常直接编辑 content 后构建即可。重新导入会覆盖 content 中的正文和照片配置，请保留自己的编辑。

内容和照片版权归作者及相应摄影者所有。未设置允许第三方复用的许可证。



## 照片位置与排版

每篇游记的 `photoLayout` 配置所有照片的位置。`paragraph` 从正文第一段算起（1 开始），`photos` 是该篇照片列表中的序号（1 开始）。`anchor` 可选，表示在该段的这句话前插入；`end: true` 则放到该段末尾。`layout` 可选 `left`、`right`（文字环绕）或 `pair`（并排小图）。每张照片在正文中只出现一次，点击仍可查看大图；没有独立的文末相册。构建时会检查照片数量及文字锚点。

例如：

```json
{"paragraph": 3, "photos": [1], "layout": "left", "anchor": "玻璃海是极美的"}
```

修改位置只改配置，不用改动正文。

## 首页字体和摘句

`homeQuote` 是首页显示的原文摘句，必须是对应正文中的连续原句；构建会校验。

Windows 优先使用本机的 SimSun（宋体），通过 local 字体引用，不上传系统字体文件；其他系统按本机宋体类字体回退。标题使用常规字重，关闭浏览器模拟加粗。样式和脚本 URL 会根据文件内容自动生成版本标记，避免更新后仍显示旧样式。
