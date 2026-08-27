# hy-event-store

[![npm version](https://img.shields.io/npm/v/hy-event-store.svg)](https://www.npmjs.com/package/hy-event-store)
[![CI](https://github.com/coderwhy/hy-event-store/actions/workflows/ci.yml/badge.svg)](https://github.com/coderwhy/hy-event-store/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[English](README.md) · **简体中文**

<code>hy-event-store</code> 是一个零运行时依赖的事件总线与浅层全局状态管理库。它不绑定框架，可用于支持 CommonJS 包的 JavaScript 工程，包括常见的 Vue、React 和小程序构建流程。

## 特性

- 零运行时依赖
- 支持回调上下文、一次性监听和显式清理的事件总线
- 支持单个和多个状态键订阅的共享状态
- <code>dispatch</code> 原样返回同步结果或 Promise
- Node.js 18、20、22、24、26 的自动化测试与 CI

## 安装

~~~bash
npm install hy-event-store
~~~

当前包提供 CommonJS 入口，并内置第一方 TypeScript 声明：

~~~js
const { HYEventBus, HYEventStore } = require("hy-event-store")
~~~

TypeScript 用户无需改变运行时 API，即可补充事件和状态类型：

~~~ts
const bus = new HYEventBus<{ ready: []; signedIn: [user: { name: string }] }>()
bus.on("signedIn", user => console.log(user.name))

const store = new HYEventStore({
  state: { count: 0 },
  actions: {
    increment(state, amount: number) {
      state.count += amount
      return state.count
    }
  }
})
~~~

### 小程序项目接入

当前发布包使用 CommonJS。在微信开发者工具中，请启用**使用 npm 模块**，
执行**构建 npm**，然后使用包名导入：

~~~js
const { HYEventStore } = require("hy-event-store")
~~~

不要直接导入 `src/event-store.js` 或 `store/hy-event-store.js` 这类路径。
这些路径指向源码文件，并不是构建后的小程序模块入口。如果使用其他构建
工具，请配置它从 `node_modules` 解析 CommonJS 包，并保持使用包名导入。

## 快速开始

### 事件总线

~~~js
const { HYEventBus } = require("hy-event-store")

const bus = new HYEventBus()

function handleSignedIn(user) {
  console.log(user.name)
}

bus.on("signed-in", handleSignedIn)
bus.emit("signed-in", { name: "Ada" })
bus.off("signed-in", handleSignedIn)
~~~

使用 <code>once</code> 注册只处理一次的事件：

~~~js
bus.once("ready", () => {
  console.log("只会执行一次")
})
~~~

若回调需要组件或页面实例作为 <code>this</code>，请传入第三个参数：

~~~js
const page = {
  title: "个人资料",
  render(user) {
    console.log(this.title, user.name)
  }
}

bus.on("user-updated", page.render, page)
bus.emit("user-updated", { name: "Ada" })
bus.off("user-updated", page.render)
~~~

### 共享状态

~~~js
const { HYEventStore } = require("hy-event-store")

const store = new HYEventStore({
  state: {
    count: 0,
    status: "idle"
  },
  actions: {
    increment(state, amount = 1) {
      state.count += amount
      return state.count
    },
    async load(state, request) {
      state.status = "loading"
      const result = await request()
      state.status = "ready"
      return result
    }
  }
})

function renderCount(count) {
  console.log("当前计数：", count)
}

store.onState("count", renderCount)
store.setState("count", 1)
store.offState("count", renderCount)

const count = store.dispatch("increment", 2)

async function loadData() {
  return store.dispatch("load", () => fetch("/api/data").then(res => res.json()))
}
~~~

<code>onState</code> 会先立即以当前值调用一次回调，之后在对应状态键变更时再次调用。

使用 <code>onStates</code> 订阅多个状态键：

~~~js
function renderProfile(change) {
  console.log(change)
}

store.onStates(["count", "status"], renderProfile)
// 首次回调：{ count: 0, status: "idle" }
// 后续 setState("count", 1) 后：{ count: 1 }

store.offStates(["count", "status"], renderProfile)
~~~

## API 说明

### <code>HYEventBus</code>

| 方法 | 作用 | 返回值 |
| --- | --- | --- |
| <code>on(eventName, callback, thisArg?)</code> | 注册监听器。 | 事件总线实例 |
| <code>once(eventName, callback, thisArg?)</code> | 注册仅在第一次触发时执行的监听器。 | 事件总线实例 |
| <code>emit(eventName, ...payload)</code> | 通知某个事件的全部监听器。 | 事件总线实例 |
| <code>off(eventName, callback)</code> | 移除通过 <code>on</code> 或 <code>once</code> 注册的回调；事件不存在时也可安全调用。 | 事件总线实例 |
| <code>clear()</code> | 清除全部事件的监听器。 | 事件总线实例 |
| <code>hasEvent(eventName)</code> | 判断事件是否至少有一个监听器。 | 布尔值 |

事件名称必须为字符串。事件触发时会使用稳定的监听器快照，因此一次性监听器自行移除时不会跳过下一个监听器。

### <code>HYEventStore</code>

创建 Store 时必须提供 <code>state</code> 对象，<code>actions</code> 为可选对象。每个 action 都必须是函数，且第一个参数为 <code>state</code>。

| 方法 | 作用 |
| --- | --- |
| <code>onState(key, callback)</code> | 订阅一个已声明的状态键，并立即收到当前值。 |
| <code>offState(key, callback)</code> | 取消单状态订阅。 |
| <code>onStates(keys, callback)</code> | 订阅多个已声明状态键，并立即收到初始快照；后续回调只包含变化的键。 |
| <code>offStates(keys, callback)</code> | 取消多状态订阅。 |
| <code>setState(key, value)</code> | 更新已声明的状态键。 |
| <code>dispatch(actionName, ...args)</code> | 运行 action，并原样返回它的结果，包括 Promise。 |

## 使用注意事项

- 所有需要监听的状态键必须在初始 <code>state</code> 对象中声明。更新未知键会抛出错误，避免产生不可观察的状态。
- Store 是**浅层**监听：替换 <code>state.profile</code> 会触发监听；直接修改 <code>state.profile.name</code> 不会触发。
- 使用严格相等判断；赋值相同值不会触发更新。
- 请保留稳定的回调引用，并在组件或页面销毁时调用 <code>off</code>、<code>offState</code> 或 <code>offStates</code>，避免页面切换后重复监听。
- 小程序中如需在回调内使用页面 <code>this</code>，注册时传入页面实例作为 <code>thisArg</code>，并在页面清理生命周期中取消同一个回调。

## 兼容性

发布包为 CommonJS，且没有运行时依赖。CI 在 Node.js 18 至 26 上验证。浏览器和小程序项目应通过各自的 npm 包构建或打包流程使用本包。

原生 ESM 导出、只读状态选择器与 <code>onStates</code> 的完整快照模式属于后续设计项，详见[路线图](ROADMAP.md)。

## 开发

~~~bash
npm ci
npm test
npm run test:coverage
npm pack --dry-run
~~~

## 贡献与安全

- 提交 PR 前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。
- 安全问题请按照 [SECURITY.md](SECURITY.md) 私下报告。
- 后续计划请查看 [ROADMAP.md](ROADMAP.md)。

## 许可证

[MIT](LICENSE) © coderwhy
