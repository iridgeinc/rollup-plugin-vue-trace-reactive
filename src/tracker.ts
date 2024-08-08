import type { DebuggerEvent } from 'vue'

function triggerPlace(e: Error) {
  // console.log(e)
  const regex = /ReactiveEffect\.onTrigger.*?\((?<url>.*?:(?<line>\d+?):(?<column>\d+?))\)/
  const match = e.stack!.match(regex)
  const url = new URL(match?.groups?.url ?? "/unknown")
  return {
    filepath: url.pathname.split('/').pop(),
    line: match?.groups?.line ?? 0,
    column: match?.groups?.col ?? 0,
  }
}

export const handleReactiveTrigger = (type: string, varname: string, e: DebuggerEvent, ee: Error) => {
  const { filepath, line } = triggerPlace(ee)
  const place = filepath + ':' + line
  const callee = type + (varname !== undefined ? "." + varname : "")
  const action = e.key + "." + e.type
  const message = (() => {
    if (e.oldValue !== undefined && e.newValue !== undefined) {
      const isSame = JSON.stringify(e.oldValue) === JSON.stringify(e.newValue)
      return isSame ? "ok" : "same value!"
    } else {
      return '-'
    }
  })();
  console.log(`${place}\t${callee}\t${action}\tsame:${message}`)
}
