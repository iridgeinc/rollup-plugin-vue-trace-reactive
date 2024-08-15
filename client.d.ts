import type { DebuggerEvent } from 'vue'

export type TracedReactiveTriggerEvent = {
  event: DebuggerEvent
  filepath: string
  line: number
  watcherType: string
  watcherBind: string | undefined
}

declare global {
  interface DocumentEventMap {
    'trace-reactive-trigger': CustomEvent<TracedReactiveTriggerEvent>
  }
}

