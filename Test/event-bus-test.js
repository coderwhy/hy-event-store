const { HYEventBus } = require('../src')

const eventBus = new HYEventBus()

const whyCallback1 = (...payload) => {
  console.log("whyCallback1:", payload)
}

const whyCallback2 = (...payload) => {
  console.log("whyCallback1:", payload)
}

const lileiCallback1 = (...payload) => {
  console.log("lileiCallback1:", payload)
}

const symbolCallback1 = (...payload) => {
  console.log("symbolCallback1:", payload)
}

const s1 = Symbol('symbol1')

eventBus.on("why", whyCallback1)
eventBus.on("why", whyCallback2)
eventBus.on('lilei', lileiCallback1)
eventBus.on(s1, whyCallback1)
eventBus.once("why", (...payload) => {
  console.log("why once:", payload)
})

setTimeout(() => {
  eventBus.emit("why", "abc", "cba", "nba")
  eventBus.emit("lilei", "abc", "cba", "nba")
  eventBus.emit(s1, 111, 222, 333)
}, 1000);

setTimeout(() => {
  eventBus.off("why", whyCallback1)
  eventBus.off("lilei", lileiCallback1)
  eventBus.off(s1, whyCallback1)
}, 2000);

setTimeout(() => {
  eventBus.emit("why")
  eventBus.emit("lilei")
  eventBus.emit(s1)
}, 3000);
