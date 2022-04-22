class HYEventBus {
  constructor() {
    this.eventBus = {}
  }

  on(eventName, eventCallback, thisArg) {
    if (typeof eventName !== "string") {
      throw new TypeError("the event name must be string type")
    }

    if (typeof eventCallback !== "function") {
      throw new TypeError("the event callback must be function type")
    }
    
    const handlers = this.eventBus[eventName]
    if (!handlers) {
      this.eventBus[eventName] = [{ eventCallback, thisArg }]
      return
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
    handlers.forEach(handler => {
      handler.eventCallback.apply(handler.thisArg, payload)
    })
    return this
  }

  off(eventName, eventCallback) {
    if (typeof eventName !== "string") {
      throw new TypeError("the event name must be a string type")
    }
    if (typeof eventCallback !== "function") {
      throw new TypeError("the event callback must be a function type")
    }
    const handlers = this.eventBus[eventName] //拿到事件回调数组
    handlers.forEach((handler, index) => {
      if (handler.eventCallback == eventCallback) handlers.splice(index, 1) //删除函数
    })
    if (handlers.length === 0) {
      delete this.eventBus[eventName]
    }
  }
}

module.exports = HYEventBus
