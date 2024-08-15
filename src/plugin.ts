import { createFilter as createFilter } from '@rollup/pluginutils';
import { walk } from 'estree-walker';
import MagicString from 'magic-string';

const isDevelopment = process.env.NODE_ENV === 'development';
type Node = any

interface PluginOptions {
  include?: string | string[];
  exclude?: string | string[];
}

function getName(node: Node) {
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'ThisExpression') return 'this';
  if (node.type === 'Super') return 'super';
  return null;
}

function flatten(node: Node) {
  const parts = [];
  while (node.type === 'MemberExpression') {
    if (node.computed) return null;

    parts.unshift(node.property.name);
    node = node.object;
  }
  const name = getName(node);
  if (!name) return null;
  parts.unshift(name);
  return parts.join('.');
}

const genTrackFunction = (type: string, varname: string) =>
  `(e) => { try { handleReactiveTrigger("${type}", "${varname}", e, new Error()) } catch {} }`

const rewriteTriger = (paramIndex: number, ms: MagicString, args: any, trigger: string) => {
  if (args.length === paramIndex) {
    ms.appendRight(args[paramIndex - 1].end, `, { onTrigger: ${trigger}}`);
  } else if (args.length > paramIndex) {
    if (args[paramIndex].type === 'ObjectExpression') {
      const existingProp = args[paramIndex].properties.find(
        (prop: any) =>
          prop.type === 'Property' &&
            prop.key.type === 'Identifier' &&
            prop.key.name === 'onTrigger'
      );
      if (existingProp) {
        // ms.overwrite(
        //   existingProp.value.start,
        //   existingProp.value.end,
        //   trigger
        // );
      } else {
        ms.appendRight(
          args[paramIndex].end - 1,
          `, onTrigger: ${trigger}`
        )
      }
    }
  }
}


export function traceReactive(options: PluginOptions = {}) {
  const UNCHANGED = null
  
  const { include = ['**/*.js', '**/*.ts', '**/*.vue'], exclude = 'node_modules/**' } = options;
  const filter = createFilter(include, exclude);
  
  return {
    name: 'rollup-plugin-vue-reactive',
    transform(code: string, id: string) {
      if (!filter(id)) return UNCHANGED;
      if (!isDevelopment) return UNCHANGED;
      
      let ast
      try {
        // @ts-ignore
        ast = this.parse(code)
      } catch (err) {
        return UNCHANGED;
      }
      const magicString = new MagicString(code);

      walk(ast, {
        enter(node: any, parent: any) {
          if (node.type !== 'CallExpression') return
          const name = flatten(node.callee)
          if (name !== 'watch' && name !== 'computed' && name !== 'watchEffect') return
          const argsEnd = node.arguments[node.arguments.length - 1].end;
          if (argsEnd === undefined) return
          // console.log(`inject tracking to ${name} in ${id} at ${argsEnd}`)
          const args = node.arguments;
          if (name === 'watch'){
            const trigger = genTrackFunction(name, '')
            rewriteTriger(2, magicString, args, trigger)
          } else if (name === 'watchEffect') {
            const trigger = genTrackFunction(name, '')
            rewriteTriger(1, magicString, args, trigger)
          } else if (name === 'computed') {
            const varname = parent.id?.name ?? parent.key?.name
            const trigger = genTrackFunction(name, varname)
            rewriteTriger(1, magicString, args, trigger)
          }
        }
      });
      
      return {
        code: magicString.toString(),
        map: magicString.generateMap({ hires: true }),
      };            
    }
  }
}
