import { ReactiveControllerHost } from 'lit'
import { BaseStore } from './base-store'
import { StoreController } from './store-controller'
import { StoreFactory } from './types'

// Helper function to create singleton stores
export function createSingletonStore<
  T, 
  S extends BaseStore<T>, 
  C extends StoreController<T, S>
>(
  StoreClass: new () => S,
  ControllerClass: new (host: ReactiveControllerHost, store: S) => C
): StoreFactory<T, C> {
  let storeInstance: S | null = null

  return (host: ReactiveControllerHost): C => {
    if (!storeInstance) {
      storeInstance = new StoreClass()
    }
    return new ControllerClass(host, storeInstance)
  }
}
