import { ReactiveControllerHost } from 'lit'
import { StoreController } from './store-controller'

// Store factory function type
export type StoreFactory<T, C extends StoreController<T, any>> = (host: ReactiveControllerHost) => C
