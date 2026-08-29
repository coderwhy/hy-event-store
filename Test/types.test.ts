import { HYEventBus, HYEventStore } from ".."

type AppEvents = {
  ready: []
  signedIn: [user: { id: string; name: string }]
}

const bus = new HYEventBus<AppEvents>()

bus.on("signedIn", user => {
  user.id.toUpperCase()
  user.name.toUpperCase()
})
bus.emit("ready")
bus.emit("signedIn", { id: "1", name: "coderwhy" })

// @ts-expect-error An event payload must match its declared event tuple.
bus.emit("signedIn", "coderwhy")

const store = new HYEventStore({
  state: {
    count: 0,
    status: "idle" as "idle" | "ready"
  },
  actions: {
    increment(state, amount: number) {
      state.count += amount
      return state.count
    },
    async load(state, label: string) {
      state.status = "ready"
      return `${label}:${state.status}`
    }
  }
})

store.onState("count", count => {
  count.toFixed()
})

store.onStates(["count", "status"], change => {
  change.count?.toFixed()
  change.status?.toUpperCase()
})

store.setState("count", 1)
store.setState("status", "ready")
const currentCount: number = store.getState("count")
const currentStatus: "idle" | "ready" = store.getState("status")

const nextCount: number = store.dispatch("increment", 2)
const loaded: Promise<string> = store.dispatch("load", "home")

// @ts-expect-error State keys must exist in the declared state object.
store.setState("missing", 1)
// @ts-expect-error getState only accepts declared state keys.
store.getState("missing")
// @ts-expect-error State values must match their declared key type.
store.setState("count", "1")
// @ts-expect-error Action arguments are inferred from the action signature.
store.dispatch("increment", "2")
