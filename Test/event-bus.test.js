const test = require("node:test")
const assert = require("node:assert/strict")

const { HYEventBus } = require("../src")

test("on and emit deliver every payload with the configured context", () => {
  const bus = new HYEventBus()
  const calls = []
  const context = { name: "context" }

  assert.equal(bus.on("update", function(...payload) {
    calls.push([this, ...payload])
  }, context), bus)
  assert.equal(bus.emit("update", "name", 42), bus)

  assert.deepEqual(calls, [[context, "name", 42]])
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

test("off cancels a once listener by its original callback", () => {
  const bus = new HYEventBus()
  let calls = 0
  const callback = () => {
    calls += 1
  }

  bus.once("update", callback)
  bus.off("update", callback)
  bus.emit("update")

  assert.equal(calls, 0)
  assert.equal(bus.hasEvent("update"), false)
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

test("event names cannot collide with object prototype properties", () => {
  const bus = new HYEventBus()
  const calls = []

  for (const eventName of ["constructor", "toString", "__proto__"]) {
    bus.on(eventName, () => calls.push(eventName))
    bus.emit(eventName)
  }

  assert.deepEqual(calls, ["constructor", "toString", "__proto__"])
})

test("public methods validate event names and callbacks", () => {
  const bus = new HYEventBus()
  const invalidName = 42
  const invalidCallback = "callback"

  assert.throws(() => bus.on(invalidName, () => {}), /event name/)
  assert.throws(() => bus.on("event", invalidCallback), /event callback/)
  assert.throws(() => bus.once(invalidName, () => {}), /event name/)
  assert.throws(() => bus.once("event", invalidCallback), /event callback/)
  assert.throws(() => bus.emit(invalidName), /event name/)
  assert.throws(() => bus.off(invalidName, () => {}), /event name/)
  assert.throws(() => bus.off("event", invalidCallback), /event callback/)
  assert.throws(() => bus.hasEvent(invalidName), /event name/)
})
