const test = require("node:test")
const assert = require("node:assert/strict")

const { HYEventStore } = require("../src")

test("constructor validates options, state, and actions", () => {
  assert.throws(() => new HYEventStore(), /options must be object/)
  assert.throws(() => new HYEventStore({}), /state must be object/)
  assert.throws(
    () => new HYEventStore({ state: {}, actions: "load" }),
    /actions must be object/
  )
  assert.throws(
    () => new HYEventStore({ state: {}, actions: { load: true } }),
    /value of actions must be a function/
  )
})

test("onState receives initial and changed values until removed", () => {
  const store = new HYEventStore({ state: { count: 0 } })
  const values = []
  const callback = value => values.push(value)

  store.onState("count", callback)
  store.setState("count", 1)
  store.setState("count", 1)
  store.offState("count", callback)
  store.setState("count", 2)

  assert.deepEqual(values, [0, 1])
})

test("onStates reports the initial snapshot and changed key until removed", () => {
  const store = new HYEventStore({ state: { name: "why", age: 18 } })
  const values = []
  const callback = value => values.push(value)

  store.onStates(["name", "age"], callback)
  store.setState("age", 19)
  store.offStates(["name", "age"], callback)
  store.setState("name", "coderwhy")

  assert.deepEqual(values, [
    { name: "why", age: 18 },
    { age: 19 }
  ])
})

test("dispatch returns synchronous action results", () => {
  const store = new HYEventStore({
    state: { count: 1 },
    actions: {
      increment(state, amount) {
        state.count += amount
        return state.count
      }
    }
  })

  assert.equal(store.dispatch("increment", 2), 3)
})

test("dispatch returns asynchronous action results", async () => {
  const store = new HYEventStore({
    state: { status: "idle" },
    actions: {
      async load(state) {
        await Promise.resolve()
        state.status = "ready"
        return state.status
      }
    }
  })

  assert.equal(await store.dispatch("load"), "ready")
})

test("state subscriptions validate keys and callback inputs", () => {
  const store = new HYEventStore({ state: { count: 0 } })
  const callback = () => {}

  assert.throws(() => store.onState("missing", callback), /does not contain/)
  assert.throws(() => store.onState("count", "callback"), /callback/)
  assert.throws(() => store.onStates("count", callback), /keys must be array/)
  assert.throws(() => store.onStates(["count"], "callback"), /callback/)
  assert.throws(() => store.onStates(["missing"], callback), /does not contain/)
  assert.throws(() => store.offState("missing", callback), /does not contain/)
  assert.throws(() => store.offStates("count", callback), /keys must be array/)
  assert.throws(() => store.offStates(["count"], "callback"), /callback/)
  assert.throws(() => store.offStates(["missing"], callback), /does not contain/)
  assert.throws(() => store.setState("missing", 1), /does not contain/)
})

test("multi-state subscriptions validate every key before changing listeners", () => {
  const store = new HYEventStore({ state: { count: 0, status: "idle" } })
  const values = []
  const callback = value => values.push(value)

  assert.throws(
    () => store.onStates(["count", "missing"], callback),
    /does not contain/
  )
  store.setState("count", 1)
  assert.deepEqual(values, [])

  store.onStates(["count", "status"], callback)
  values.length = 0
  assert.throws(
    () => store.offStates(["count", "missing"], callback),
    /does not contain/
  )
  store.setState("count", 2)
  assert.deepEqual(values, [{ count: 2 }])
})

test("dispatch validates action names and missing actions", () => {
  const store = new HYEventStore({ state: {} })

  assert.throws(() => store.dispatch(42), /action name must be string/)
  assert.throws(() => store.dispatch("missing"), /action name does not exist/)
})
