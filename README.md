# hy-event-store

[![npm version](https://img.shields.io/npm/v/hy-event-store.svg)](https://www.npmjs.com/package/hy-event-store)
[![npm downloads](https://img.shields.io/npm/dm/hy-event-store.svg)](https://www.npmjs.com/package/hy-event-store)
[![CI](https://github.com/coderwhy/hy-event-store/actions/workflows/ci.yml/badge.svg)](https://github.com/coderwhy/hy-event-store/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**English** · [简体中文](README.zh-CN.md)

<code>hy-event-store</code> is a small, zero-dependency event bus and shallow
global state store for JavaScript applications. It is framework-agnostic and
works where CommonJS packages are supported, including typical Vue, React, and
Mini Program build workflows.

## Highlights

- Zero runtime dependencies
- Event listeners with explicit context, one-time listeners, and cleanup APIs
- Shared state with single-key and multi-key subscriptions
- Synchronous and asynchronous action results returned from <code>dispatch</code>
- Regression tests and CI on Node.js 18, 20, 22, 24, and 26

## Installation

~~~bash
npm install hy-event-store
~~~

The package exposes a CommonJS entry point and ships first-party TypeScript
declarations:

~~~js
const { HYEventBus, HYEventStore } = require("hy-event-store")
~~~

TypeScript users can add event and state types without changing the runtime API:

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

### Mini Program projects

The package currently uses CommonJS. In WeChat DevTools, enable **Use npm
modules**, run **Build npm**, and then import the package by its package name:

~~~js
const { HYEventStore } = require("hy-event-store")
~~~

Do not import `src/event-store.js` or a path such as `store/hy-event-store.js`.
Those paths refer to source files and are not the built Mini Program module
entry. If you use another bundler, configure it to resolve CommonJS packages
from `node_modules` and keep the same package-name import.

## Quick start

### Event bus

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

Use <code>once</code> for an event that should be handled once:

~~~js
bus.once("ready", () => {
  console.log("Runs once")
})
~~~

Pass a third argument when a callback needs a component or page as <code>this</code>:

~~~js
const page = {
  title: "Profile",
  render(user) {
    console.log(this.title, user.name)
  }
}

bus.on("user-updated", page.render, page)
bus.emit("user-updated", { name: "Ada" })
bus.off("user-updated", page.render)
~~~

### Shared state

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
  console.log("count:", count)
}

store.onState("count", renderCount)
store.setState("count", 1)
store.offState("count", renderCount)

const count = store.dispatch("increment", 2)

async function loadData() {
  return store.dispatch("load", () => fetch("/api/data").then(res => res.json()))
}
~~~

<code>onState</code> invokes its callback immediately with the current value,
then again when that key changes.

Read one declared value without subscribing to updates:

~~~js
const status = store.getState("status")
~~~

<code>getState</code> does not notify listeners and throws for an undeclared key.
It returns the current value as-is; it is not a deep clone or deep read-only
snapshot.

Subscribe to several keys with <code>onStates</code>:

~~~js
function renderProfile(change) {
  console.log(change)
}

store.onStates(["count", "status"], renderProfile)
// Initial callback: { count: 0, status: "idle" }
// Later callback after setState("count", 1): { count: 1 }

store.offStates(["count", "status"], renderProfile)
~~~

## API reference

### <code>HYEventBus</code>

| Method | Description | Returns |
| --- | --- | --- |
| <code>on(eventName, callback, thisArg?)</code> | Register a listener. | The event bus |
| <code>once(eventName, callback, thisArg?)</code> | Register a listener removed before its first callback runs. | The event bus |
| <code>emit(eventName, ...payload)</code> | Notify every listener for an event. | The event bus |
| <code>off(eventName, callback)</code> | Remove registrations for the callback passed to <code>on</code> or <code>once</code>. It is safe when the event has no listeners. | The event bus |
| <code>clear()</code> | Remove listeners for every event. | The event bus |
| <code>hasEvent(eventName)</code> | Check whether an event has at least one listener. | Boolean |

Event names must be strings. Listener execution uses a stable snapshot, so a
one-time listener removing itself does not skip the next listener.

### <code>HYEventStore</code>

Create a store with a required <code>state</code> object and an optional
<code>actions</code> object. Every action must be a function and receives
<code>state</code> as its first argument.

| Method | Description |
| --- | --- |
| <code>onState(key, callback)</code> | Subscribe to one declared state key and immediately receive its current value. |
| <code>offState(key, callback)</code> | Remove a one-key subscription. |
| <code>onStates(keys, callback)</code> | Subscribe to several declared keys and immediately receive their initial snapshot. Later callbacks contain changed keys only. |
| <code>offStates(keys, callback)</code> | Remove a multi-key subscription. |
| <code>setState(key, value)</code> | Update a declared state key. |
| <code>getState(key)</code> | Read one declared state value without subscribing. |
| <code>dispatch(actionName, ...args)</code> | Run an action and return its value unchanged, including a Promise. |

## Usage notes

- Declare every observable key in the initial <code>state</code> object.
  Updating an unknown key throws instead of creating an unobservable value.
- State observation is **shallow**. Replacing <code>state.profile</code>
  triggers its listener; mutating <code>state.profile.name</code> directly does
  not.
- Assigning the same value with strict equality does not emit an update.
- Keep a stable callback reference and call <code>off</code>,
  <code>offState</code>, or <code>offStates</code> when a page or component is
  destroyed. This prevents duplicate listeners after component switches.
- For Mini Program pages, pass the page as <code>thisArg</code> when
  registering a method, and unregister the same method during the page cleanup
  lifecycle.

## Compatibility

The distributed package is CommonJS and has no runtime dependencies. CI
validates the package on Node.js 18 through 26. Browser and Mini Program
projects should use their normal npm-package build or bundling workflow.

Native ESM exports, a read-only state selector, and an opt-in full snapshot
mode for <code>onStates</code> are planned design improvements; see the
[roadmap](ROADMAP.md).

## Development

~~~bash
npm ci
npm test
npm run test:coverage
npm pack --dry-run
~~~

## Contributing and security

- Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.
- Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).
- Browse planned work in [ROADMAP.md](ROADMAP.md).

## License

[MIT](LICENSE) © coderwhy
