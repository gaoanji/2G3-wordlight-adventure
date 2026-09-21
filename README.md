# 词光奇境大冒险（中二G3 EOY版）

《词光奇境大冒险》是一款为中二 G3 学生设计的华文词语复习闯关游戏。学生将与熊猫小侠和水獭灵灵一起探索词光奇境，完成不同类型的词语挑战、收集徽章与星星，并最终唤醒词光宝珠。

## 本版词语与题型

覆盖2026年EOY词语表的53个词：单元四22个、单元五21个、单元六10个。每个词保留拼音、中英文解释，并使用审核稿中的四个句子，分别用于学习卡、拼音关、语境关和综合关。

- 藏书阁：翻看全部53张学习卡。
- 拼音小达人：拼音加句子，三选一。
- 词义解码师：解释选词，三选一。
- 语境应用家：句子选词，三选一。
- 词语侦探：错别字二选一，或拼音／词义正误判断。
- 词语闯关王：每局拼音、词义、语境题各两题，顺序随机。

答题关每局6题。选项由原游戏规则随机产生，词语选择题包含至少一个与答案字数相同的干扰词。除侦探关外，第一次答错后可再试一次；侦探关只作答一次。朗读句子时，空格读作“什么”。

拼音、词义、语境关需覆盖全部53个词且累计正确率达到70%才能获徽章；侦探和综合关需完成至少4局且累计正确率达到70%。保留原有星星、奖励、地图和通关效果。

## 替换方法

1. 先复制原游戏完整文件夹，作为独立的2G3版本。
2. 用本次提供的 `index.html`、`leaderboard.js` 和 `README.md` 覆盖副本根目录中的同名文件。
3. 保留原有图片、音乐、样式和其余JavaScript文件，路径不变。
4. 将整个2G3副本发布到独立网站地址。单独打开或上传本次的index文件不能代替完整游戏文件夹。

本版已更新题库、年级、数量提示及2G3独立排行榜连接，未重新打包原素材。为保留1G2学生的原进度，建议使用独立仓库和独立网站域名；同一网站地址或同域名下的不同路径可能共用浏览器记录。

## 游戏特色

- 词语学习卡、拼音、词义、语境与综合挑战
- 关卡解锁、地图探索和角色移动动画
- 徽章、星星和最终词光宝珠奖励
- 学生排行榜与个人最佳成绩记录
- Google Spreadsheet 学习数据同步
- 电脑与手机浏览器均可使用

## 文件说明

- `index.html`：游戏主页及主要功能
- `assets/`：图片、音乐、音效、徽章和角色素材
- `adventure.css`、`scenes.css` 等：页面样式
- `sentences.js`：本版不再加载此文件；2G3各关句子已内嵌在 `index.html`，原文件可保留。
- `scenes.js`：游戏场景、徽章与地图功能
- `user-ui.js`：用户资料与设置功能
- `music.js`：背景音乐控制
- `effects.js`：按钮及徽章音效
- `leaderboard.js`：排行榜及数据同步
- `apps-script/Code.gs`：Google Spreadsheet 后台代码备份
- `.nojekyll`：确保 GitHub Pages 正确读取网站文件

## GitHub Pages 发布

1. 把本项目中的所有文件和文件夹上传到 GitHub 仓库的 `main` branch。
2. 确保 `index.html` 与 `assets` 文件夹并列放在仓库最外层。
3. 打开仓库的 **Settings → Pages**。
4. 在 **Build and deployment** 中选择 **Deploy from a branch**。
5. 选择 `main` branch 和 `/ (root)`，然后保存。

不要在仓库最外层额外套一层总文件夹，否则网页可能无法找到图片、音乐和其他素材。

## 数据连接

游戏通过 Google Apps Script 连接 Google Spreadsheet，记录学生的姓名、班级、完成关卡、准确率、用时、成绩、徽章和星星。

本版 `leaderboard.js` 已使用2G3专用部署，成绩提交与排行榜读取均连接以下地址：

```
https://script.google.com/macros/s/AKfycbxu1LNp_AdqEuQPkjLyTx7Cts1R52Ez7SVn38Uk2Z2ko-_hovtK5D0_aRKOO247j70Y/exec
```

排行榜待上传队列、学生云端ID及未完成翻卡缓存使用2G3独立名称，不会读取1G2的待上传记录。游戏本机进度仍建议通过独立网站域名隔离。

后台使用本次提供的2G3版 `Code.gs`（53词）。在2G3的新Google表格中打开「扩展程序 → Apps Script」，选择 `setup` 运行并授权，自动创建5个记录及报表工作表。无需修改1G2后台。

2026-09-21连接检查：接口可访问，返回 `course: "2G3"`、`wordCount: 53`，但 `configured: false`，表示尚未设置数据表。运行 `setup` 后重新打开部署网址，应返回 `configured: true`。此时再打开游戏，翻看一张卡并等待同步，核对表格及排行榜。尚未进行真实成绩写入测试。

以后更换部署地址时，修改 `leaderboard.js` 开头的 `ENDPOINT`，并更新 `index.html` 中该脚本的版本参数以刷新缓存。

## 最终宝物素材

以下文件应放在 `assets/` 文件夹中：

- `wordlight-orb.png`：词光宝珠
- `panda-celebrate.png`：庆祝的熊猫小侠
- `otter-celebrate.png`：庆祝的水獭灵灵

## Copyright and Use

Game design and educational content © 2026 **Miss Gao Anji, Bedok Green Secondary School**.

This resource was created for educational use. Please seek permission from the creator before copying, modifying, republishing or redistributing the game or its educational content.

Third-party fonts, music, software libraries and AI-assisted assets remain subject to their respective terms of use.

## 制作信息

- 设计与教学内容：**Miss Gao Anji**
- 学校：**Bedok Green Secondary School**
- 用途：华文教学与课堂学习

