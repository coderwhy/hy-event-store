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
