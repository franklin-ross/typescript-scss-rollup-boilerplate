import resolveNodeModules from "rollup-plugin-node-resolve";
import commonjsToEs6 from "rollup-plugin-commonjs";
import extensionMapper from "rollup-plugin-extension-mapper";
import postcss from 'rollup-plugin-postcss';
import cssnano from 'cssnano';
import autoprefixer from 'autoprefixer';

export default {
  entry: "dist/compiled/main.js",
  dest: "dist/bundle.js",
  moduleName: "app",
  format: "iife",
  sourceMap: true,
  plugins: [
    extensionMapper({
      //*.scss files will already have been build to *.css before Rollup gets to them.
      ".scss": ".css"
    }),

    //Locate modules using the Node resolution algorithm, for using third party modules in node_modules
    resolveNodeModules({
      // use "module" field for ES6 module if possible
      module: true,
      // use "jsnext:main" if possible
      // – see https://github.com/rollup/rollup/wiki/jsnext:main
      jsnext: true,
      // some package.json files have a `browser` field which
      // specifies alternative files to load for people bundling
      // for the browser. If that"s you, use this option, otherwise
      // pkg.browser will be ignored
      browser: true,
      // not all files you want to resolve are .js files
      extensions: [ ".js", ".json", ".css" ],
      // whether to prefer built-in modules (e.g. `fs`, `path`) or
      // local ones with the same names
      preferBuiltins: true,  // Default: true
    }),

    //Convert CommonJS modules to ES6, so they can be included in a Rollup bundle
    //For error: "thing" is not exported by module, see: https://github.com/rollup/rollup-plugin-commonjs#custom-named-exports
    commonjsToEs6(),

    //Bundle any css files imported in scripts and apply autoprefixer and a minimiser.
    postcss({
      plugins: [
        autoprefixer(), cssnano()
      ],
      sourceMap: true,
      extract: true
    })
  ]
};