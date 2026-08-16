class HYEventBus {
  constructor() {
    this.eventBus = Object.create(null)
  }

  on(eventName, eventCallback, thisArg) {
    if (typeof eventName !== "string") {
      throw new TypeError("the event name must be string type")
    }

    if (typeof eventCallback !== "function") {
      throw new TypeError("the event callback must be function type")
    }
    
    let handlers = this.eventBus[eventName]
    if (!handlers) {
      handlers = []
      this.eventBus[eventName] = handlers
    }

    handlers.push({
      eventCallback,
      thisArg
    })
    return this
  }

  once(eventName, eventCallback, thisArg) {
    if (typeof eventName !== "string") {
      throw new TypeError("the event name must be string type")
    }

    if (typeof eventCallback !== "function") {
      throw new TypeError("the event callback must be function type")
    }
    
    const tempCallback = (...payload) => {
      this.off(eventName, tempCallback)
      eventCallback.apply(thisArg, payload)
    }

    return this.on(eventName, tempCallback, thisArg)
  }

  emit(eventName, ...payload) {
    if (typeof eventName !== "string") {
      throw new TypeError("the event name must be string type")
    }

    const handlers = this.eventBus[eventName] || []
    // Use a snapshot so handlers can safely remove themselves while emitting.
    handlers.slice().forEach(handler => {
      handler.eventCallback.apply(handler.thisArg, payload)
    })
    return this
  }

  off(eventName, eventCallback) {
    if (typeof eventName !== "string") {
      throw new TypeError("the event name must be string type")
    }

    if (typeof eventCallback !== "function") {
      throw new TypeError("the event callback must be function type")
    }

    const handlers = this.eventBus[eventName]
    if (!handlers) {
      return this
    }

    this.eventBus[eventName] = handlers.filter(handler => {
      return handler.eventCallback !== eventCallback
    })

    if (this.eventBus[eventName].length === 0) {
      delete this.eventBus[eventName]
    }
    return this
  }

  clear() {
    this.eventBus = Object.create(null)
    return this
  }

  hasEvent(eventName) {
    if (typeof eventName !== "string") {
      throw new TypeError("the event name must be string type")
    }

    const handlers = this.eventBus[eventName]
    return Boolean(handlers && handlers.length)
  }
}

module.exports = HYEventBus
