import { ReactiveController, ReactiveControllerHost } from 'lit'
import { BaseStore } from './base-store'

// Generic reactive controller for stores
export class StoreController<T, S extends BaseStore<T> = BaseStore<T>> implements ReactiveController {
  private host: ReactiveControllerHost
  private store: S

  constructor(host: ReactiveControllerHost, store: S) {
    this.host = host
    this.store = store
    this.host.addController(this)
  }

  hostConnected() {
    this.store.addHost(this.host)
  }

  hostDisconnected() {
    this.store.removeHost(this.host)
  }

  getState(): T {
    return this.store.getState()
  }

  protected getStore(): S {
    return this.store
  }
}
