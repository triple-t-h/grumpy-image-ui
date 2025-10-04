import { ReactiveControllerHost } from 'lit'

// Generic base store class
export abstract class BaseStore<T> {
  protected state: T
  private hosts: Set<ReactiveControllerHost> = new Set()

  constructor(initialState: T) {
    this.state = initialState
  }

  addHost(host: ReactiveControllerHost) {
    this.hosts.add(host)
  }

  removeHost(host: ReactiveControllerHost) {
    this.hosts.delete(host)
  }

  protected updateState(newState: Partial<T>) {
    this.state = { ...this.state, ...newState }
    // log.debug(`${this.constructor.name} state updated:`, this.state)
    // Notify all connected hosts to re-render
    this.hosts.forEach(host => {
      host.requestUpdate()
    })
  }

  getState(): T {
    return { ...this.state }
  }

  // Abstract methods that child stores must implement
  abstract reset(): void
}
