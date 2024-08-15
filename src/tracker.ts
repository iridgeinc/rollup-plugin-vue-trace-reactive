import type { DebuggerEvent } from 'vue'
import type { TracedReactiveTriggerEvent } from '../client'

function triggerPlace(e: Error) {
  const regex = /\.onTrigger.*?\((?<url>.*?:(?<line>\d+?):(?<column>\d+?))\)/
  const match = e.stack!.match(regex)
  const url = new URL(match?.groups?.url ?? "/unknown")
  return {
    filepath: url.pathname,
    line: Number(match?.groups?.line ?? 0),
    column: Number(match?.groups?.col ?? 0),
  }
}

export const handleReactiveTrigger = (type: string, varname: string, e: DebuggerEvent, ee: Error) => {
  const { filepath, line } = triggerPlace(ee)
  const ev: TracedReactiveTriggerEvent = {
    event: e,
    filepath,
    line,
    watcherType: type,
    watcherBind: varname,
  }
  const event = new CustomEvent('trace-reactive-trigger', { detail: ev })
  document.dispatchEvent(event)
}
