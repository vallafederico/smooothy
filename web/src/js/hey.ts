interface EventMap<T = any> {
  [key: string]: ((data: T) => void)[]
}

class SimpleEmitter<T extends Record<string, any>> {
  private events: EventMap<T[keyof T]>

  constructor() {
    this.events = {}
  }

  /**
   * Register an event handler for a given event.
   * @param {string} event - The name of the event.
   * @param {Function} handler - The callback function to handle the event.
   */
  on(event: string, handler: Function): void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(handler as (data: any) => void)

    // (*) TODO: make events unbindable with symol
    // (*) TODO: make this return the off function
    // return () => this.off(event, handler)
  }

  /**
   * Unregister an event handler for a given event.
   * @param {string} event - The name of the event.
   * @param {Function} handler - The callback function to remove.
   */
  off(event: string, handler: Function): void {
    if (!this.events[event]) return

    this.events[event] = this.events[event].filter(h => h !== handler)
  }

  /**
   * Emit an event, calling all registered handlers.
   * @param {string} event - The name of the event.
   * @param {*} data - The data to pass to the event handlers.
   */
  emit(event: string, data: any): void {
    if (!this.events[event]) return

    this.events[event].forEach(handler => handler(data))
  }
}

interface StateObject {
  [key: string]: any
}

class State {
  /**
   * @type {SimpleEmitter}
   * @static
   * @private
   */
  private static emitter: SimpleEmitter<StateObject> =
    new SimpleEmitter<StateObject>()

  /**
   * @type {Object}
   * @static
   * @private
   */
  private static state: StateObject = {}

  /**
   * Create a proxy for an object to enable nested reactivity.
   * @param {Object} obj - The object to create a proxy for.
   * @returns {Proxy} - The proxied object.
   * @private
   */
  private static createProxy(obj: object): any {
    return new Proxy(obj, {
      set: function (
        target: object,
        property: string | symbol,
        value: any,
        receiver: any
      ): boolean {
        State.emitter.emit(property.toString(), value)
        return Reflect.set(target, property, value, receiver)
      },
    })
  }

  /**
   * @type {Proxy}
   * @static
   * @private
   */
  private static proxy = new Proxy(State.state, {
    set: function (
      target: StateObject,
      property: string | symbol,
      value: any,
      receiver: any
    ): boolean {
      if (typeof value === "object" && value !== null) {
        value = State.createProxy(value)
      }
      State.emitter.emit(property.toString(), value)
      return Reflect.set(target, property, value, receiver)
    },
  })

  static getProxy(): any {
    return this.proxy
  }

  /**
   * Register an event handler for a given event.
   * @param {string} event - The name of the event.
   * @param {Function} handler - The callback function to handle the event.
   */
  static on(event: string, handler: Function): void {
    this.emitter.on(event, handler)
  }

  /**
   * Unregister an event handler for a given event.
   * @param {string} event - The name of the event.
   * @param {Function} handler - The callback function to remove.
   */
  static off(event: string, handler: Function): void {
    this.emitter.off(event, handler)
  }
}

interface ProxyHandler<T extends object> {
  get(target: T, property: string | symbol): any
  set(target: T, property: string | symbol, value: any, receiver: any): boolean
}

const proxyHandler: ProxyHandler<ReturnType<typeof State.getProxy>> = {
  /**
   * Proxy handler to intercept property access.
   * @param {Object} target - The target object.
   * @param {string|symbol} property - The name of the property to get.
   * @returns {*} - The value of the property.
   */
  get(target: any, property: string | symbol): any {
    if (property in State) {
      return (State[property as keyof typeof State] as Function).bind(State)
    }
    return target[property]
  },

  /**
   * Proxy handler to intercept property setting.
   * @param {Object} target - The target object.
   * @param {string|symbol} property - The name of the property to set.
   * @param {*} value - The new value of the property.
   * @param {Object} receiver - The proxy or object that initially received the request.
   * @returns {boolean} - True if the property was set successfully, false otherwise.
   */
  set(
    target: any,
    property: string | symbol,
    value: any,
    receiver: any
  ): boolean {
    return Reflect.set(State.getProxy(), property, value, receiver)
  },
}

const _hey = new Proxy(State.getProxy(), proxyHandler)
export default _hey
export const hey = _hey

// Allow typing the state structure
type StateSchema = {
  user: {
    name: string
    email: string
    age: number
  }
  settings: {
    theme: "light" | "dark"
    notifications: boolean
  }
  // etc...
}
