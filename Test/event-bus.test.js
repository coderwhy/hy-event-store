const test = require("node:test")
const assert = require("node:assert/strict")

const { HYEventBus } = require("../src")

test("on and emit deliver every payload", () => {
  const bus = new HYEventBus()
  const calls = []

  bus.on("update", (...payload) => calls.push(payload))
  bus.emit("update", "name", 42)

  assert.deepEqual(calls, [["name", 42]])
})

test("once does not skip the next handler", () => {
  const bus = new HYEventBus()
  const calls = []

  bus.once("update", () => calls.push("once"))
  bus.on("update", () => calls.push("always"))

  bus.emit("update")
  bus.emit("update")

  assert.deepEqual(calls, ["once", "always", "always"])
})

test("off is safe for missing events and removes matching handlers", () => {
  const bus = new HYEventBus()
  const callback = () => {}
  let survivorCalls = 0
  const survivor = () => survivorCalls++

  assert.equal(bus.off("missing", callback), bus)
  bus.on("update", callback)
  bus.on("update", survivor)
  assert.equal(bus.hasEvent("update"), true)
  bus.off("update", callback)
  bus.emit("update")
  assert.equal(survivorCalls, 1)
  bus.off("update", survivor)
  assert.equal(bus.hasEvent("update"), false)
})

test("clear removes every registered event", () => {
  const bus = new HYEventBus()

  bus.on("one", () => {})
  bus.on("two", () => {})
  assert.equal(bus.clear(), bus)
  assert.equal(bus.hasEvent("one"), false)
  assert.equal(bus.hasEvent("two"), false)
})
