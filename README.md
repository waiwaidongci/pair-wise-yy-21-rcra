# 电力配网抢修工单系统

面向供电所的配网故障报修、抢修派工、备件领用和停电恢复跟踪平台。

## 故障报修 · 重复来电归并台

`/faults` 页面是值班员的重复来电归并台，规则如下：

- **自动归并**：同一资产、同一故障类型，且来电时刻落在主单首次来电后 30 分钟内（`MERGE_WINDOW_MINUTES`）的后续来电，登记时自动并入原主单；每条记录各自保留来电人与来电时间。
- **派工锁单**：主单已挂抢修工单且工单状态越过 `WAIT_DISPATCH`（`DISPATCH_LOCK_TICKET_STATUS`）即视为已派工，不再接纳重复来电（`MERGE_LOCKED_DISPATCHED`），也不允许作废（`VOID_LOCKED_DISPATCHED`）。
- **作废接续**：主单作废（`POST /api/fault-report/:id/void`）后，按来电顺序接续下一条跟进记录为新主单，其余跟进记录改挂新主单，归并窗口以新主单首次来电重新计时。
- **归并台视图**：`GET /api/fault-report/merge-board` 返回每个在办主单的跟进记录、对应工单、班组与锁定标记；页面可展开来电时间线并看到对应工单。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20104>

后端健康检查：<http://localhost:21104/health>


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Element Plus + Pinia |
| 后端 | Node.js + Express + TypeScript + Prisma |
| 数据库 | MySQL 8.0 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `grid-repair`
- `FRONTEND_PORT`: 前端端口，默认 `20104`
- `BACKEND_PORT`: 后端端口，默认 `21104`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: grid-repair`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-grid-repair}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- FaultType: constants/FaultType、types/FaultType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- TicketStatus: constants/TicketStatus、types/TicketStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- AssetHealthStatus: constants/AssetHealthStatus、types/AssetHealthStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- FaultReportStatus: `frontend/src/constants/FaultReportStatus.ts`、`frontend/src/types/FaultReportStatus.ts`、`backend/src/constants/FaultReportStatus.ts`，被归并服务、store、归并台页面引用。
- 归并规则常量（`MERGE_WINDOW_MINUTES` / `DISPATCH_LOCK_TICKET_STATUS`）：`backend/src/constants/mergeRules.ts` 与 `frontend/src/constants/mergeRules.ts` 双端重复定义，被 FaultReportService、MergeBoardConstructor、FaultReportStore、FaultsPage 共同引用。
- 归并错误码（REPORT_NOT_FOUND / REPORT_ALREADY_VOID / MERGE_LOCKED_DISPATCHED / VOID_LOCKED_DISPATCHED）：前后端 `constants/errorCodes.*` 与 `constants/errorMessages.*` 成对出现，service 抛出、controller 包装、前端 store 映射为中文提示。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
