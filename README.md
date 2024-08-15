# inplace-copy

## Description
`rollup-plugin-vue-trace-reactive` automatically inserts debug triggers for Vue computed, watch, etc.

Trace AST automatically adds { onTrigger } to the computed , watch, and watchEffect functions.
This makes it easy to check for excessive unintended Effects.

Following features,

* Auto add debug code in dev server.
* Customize logging stream. (for example use terminal stdout)


## Install

```
npm install rollup-plugin-vue-trace-reactive @rollup/plugin-inject
```

## Usage

add following to `vite.config.ts`.

```typescript
import inject from '@rollup/plugin-inject';
import { traceReactive } from 'rollup-plugin-vue-trace-reactive'

export default defineConfig({
  plugins: [
    vue(),
    traceReactive(), // insert this after vue()
    inject({
      handleReactiveTrigger: ['rollup-plugin-vue-trace-reactive', 'handleReactiveTrigger']
    }),  // insert this too.
  ],
})
```

add following to `env.d`.

``` typescript
/// <reference types="rollup-plugin-vue-trace-reactive/client" />
```

add following to `main.ts`

``` typescript
document.addEventListener('trace-reactive-trigger', e => {
  console.log(e)
})
```

## typeof `TracedReactiveTriggerEvent`

``` typescript
export type TracedReactiveTriggerEvent = {
  event: DebuggerEvent  // vue's DebuggerEvent
  filepath: string  // watch / computed is defind in here
  line: number  // .. and line number
  watcherType: string  // watch or computed or watchEffect
  watcherBind: string | undefined  // bounded variable name if computed
}
```

## Example
Write this to `main.ts`

``` typescript
document.addEventListener('trace-reactive-trigger', e => {
  const place = e.detail.filepath.split('/').pop()! + ':' + e.detail.line
  const callee = e.detail.watcherType + e.detail.watcherBind ?? ""
  const action = e.detail.event.key + "." + e.detail.event.type
  const [newValue, oldValue] = [e.detail.event.newValue, e.detail.event.oldValue]
  const message = (() => {
    if (oldValue !== undefined && newValue !== undefined) {
      // Of course, comparing with stringify is not perfect
      const isSame = JSON.stringify(oldValue) === JSON.stringify(newValue)
      return isSame ? "same value!" : "modified"
    } else {
      return '-'
    }
  })();
  console.log(`${place}\t${callee}\t${action}\tsame:${message}`)
})
```

Shows triggered effect in console.
`filename / line number / method / data / newValue == oldValue`

``` typescript
ChildView.vue:45	watch.			date.set	same:ok
ChildView.vue:60	watch.			date.set	same:ok
ChildView.vue:90	watchEffect.	date.set	same:ok
ChildView.vue:120	computed.c4_5	date.set	same:ok
ChildView.vue:45	watch.			date.set	same:ok
ChildView.vue:48	watch.			date.set	same:ok
ChildView.vue:60	watch.			date.set	same:ok
ChildView.vue:90	watchEffect.	date.set	same:ok
ChildView.vue:120	computed.c4_5	date.set	same:ok
```

## Licence

[MIT](https://github.com/tcnksm/tool/blob/master/LICENCE)

## Author

[iridge-mu](https://github.com/mu-iridge)
