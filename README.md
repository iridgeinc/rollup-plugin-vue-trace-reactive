# inplace-copy

## Description
`rollup-plugin-vue-trace-reactive` automatically inserts debug triggers for Vue computed, watch, etc.

Trace AST automatically adds { onTrigger } to the computed , watch, and watchEffect functions.
This makes it easy to check for excessive unintended Effects.

Following features,

* Auto add debug code in dev server.
* (currentry) logging to console, if effect triggered.


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

## Example
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
