import type { TroveAPI } from './index'

declare global {
  interface Window {
    trove: TroveAPI
  }
}
