# hy-event-store

[![npm version](https://img.shields.io/npm/v/hy-event-store.svg)](https://www.npmjs.com/package/hy-event-store)
[![npm downloads](https://img.shields.io/npm/dm/hy-event-store.svg)](https://www.npmjs.com/package/hy-event-store)
[![CI](https://github.com/coderwhy/hy-event-store/actions/workflows/ci.yml/badge.svg)](https://github.com/coderwhy/hy-event-store/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A small, zero-dependency event bus and global state store for Vue, React,
Mini Programs, and vanilla JavaScript.

一个基于事件的全局状态管理工具，可以在Vue、React、小程序等任何地方使用。

## Why this project

在项目中找到一个更加方便快捷的数据共享方案：

- 同一套 API 可以用于不同前端框架和小程序；
- 核心包零运行时依赖，便于审查和集成；
- 欢迎通过 Issue 和 Pull Request 改进正确性、兼容性与文档。

## Install

安装 npm 依赖：

```shell
npm install hy-event-store
```

## Event bus / 事件总线

```js
const { HYEventBus } = require('hy-event-store')

const eventBus = new HYEventBus()

const whyCallback1 = (...payload) => {
  console.log("whyCallback1:", payload)
}

const whyCallback2 = (...payload) => {
  console.log("whyCallback2:", payload)
}

const lileiCallback1 = (...payload) => {
  console.log("lileiCallback1:", payload)
}

eventBus.on("why", whyCallback1)
eventBus.on("why", whyCallback2)
eventBus.on('lilei', lileiCallback1)
eventBus.once("why", (...payload) => {
  console.log("why once:", payload)
})

setTimeout(() => {
  eventBus.emit("why", "abc", "cba", "nba")
  eventBus.emit("lilei", "abc", "cba", "nba")
}, 1000);

setTimeout(() => {
  eventBus.off("why", whyCallback1)
  eventBus.off("lilei", lileiCallback1)
}, 2000);

setTimeout(() => {
  eventBus.emit("why")
  eventBus.emit("lilei")
}, 3000);
```

The event bus also provides `once`, `off`, `clear`, and `hasEvent`.

## Shared state / 数据共享

```js
const { HYEventStore } = require("hy-event-store")
const axios = require('axios')

const eventStore = new HYEventStore({
  state: {
    name: "why",
    friends: ["abc", "cba", "nba"],
    banners: [],
    recommends: []
  },
  actions: {
    async getHomeMultidata(ctx) {
      const res = await axios.get("https://example.com/home/multidata")
      const banner = res.data.data.banner
      const recommend = res.data.data.recommend
      // 赋值
      ctx.banners = banner
      ctx.recommends = recommend
      return { banner, recommend }
    }
  }
})

// 数据监听
eventStore.onState("name", (value) => {
  console.log("监听name:", value)
})

eventStore.onState("friends", (value) => {
  console.log("监听friends:", value)
})

eventStore.onState("banners", (value) => {
  console.log("监听banners:", value)
})

eventStore.onState("recommends", (value) => {
  console.log("监听recommends", value)
})

// 数据变化
setTimeout(() => {
  eventStore.setState("name", "lilei")
  eventStore.setState("friends", ["kobe", "james"])
}, 1000);

eventStore.dispatch("getHomeMultidata")
```

`dispatch` returns the action's result, so asynchronous actions can be awaited:

```js
const result = await eventStore.dispatch("getHomeMultidata")
```

State keys must be declared in the initial `state` object. Calling `setState`
with an unknown key throws an error instead of creating an unobservable value.

## Maintenance and security

- Run the regression suite with `npm test`.
- Run the source coverage report with `npm run test:coverage`.
- See [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a pull request.
- Report suspected vulnerabilities through [`SECURITY.md`](SECURITY.md), not a public issue.
- Released under the [MIT License](LICENSE).
