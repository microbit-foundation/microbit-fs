// ============================
// extend existing types
// ============================

// ============================
// Rollup plugins without types
// ============================
type RollupPluginImpl<O extends object = object> = import('rollup').PluginImpl<
  O
>;

declare module 'rollup-plugin-sourcemaps' {
  const plugin: RollupPluginImpl;
  export default plugin;
}

declare module 'rollup-plugin-babel' {
  export interface Options {
    presets?: string | (string | object)[][];
    sourceType?: string;
    ignore?: RegExp[];
  }
  const plugin: RollupPluginImpl<Options>;
  export default plugin;
}
declare module 'rollup-plugin-babel-minify' {
  export interface Options {}
  const plugin: RollupPluginImpl<Options>;
  export default plugin;
}

// =====================∫
// missing library types
// =====================

// ts-jest types require 'babel__core'
declare module 'babel__core' {
  interface TransformOptions {}
}
