# Firefly 部署说明

写完文章后，在项目根目录运行：

```powershell
pnpm run deploy:site
```

脚本会自动完成：

- 构建站点
- 打包 `dist/`
- 上传到 `root@39.102.120.197`
- 覆盖服务器 `/var/www/blog`
- 更新 Nginx 默认站点配置
- 重载 Nginx
- 验证首页、RSS、站点地图

如果已经手动构建过，只想重新上传当前 `dist/`：

```powershell
pnpm run deploy:site -- --skip-build
```

默认部署配置在 `scripts/deploy.js` 顶部：

- 域名：`sentooyi.top`
- 服务器：`39.102.120.197`
- 用户：`root`
- 目录：`/var/www/blog`

后续如果更换服务器或域名，可以改脚本顶部配置，或临时用环境变量覆盖。
