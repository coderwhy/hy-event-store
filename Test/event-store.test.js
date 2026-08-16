const test = require("node:test")
const assert = require("node:assert/strict")

const { HYEventStore } = require("../src")

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
