# typescript-rollup-boilerplate

A web boilerplate project using Typescript and SCSS, with Rollup for bundling and minifying.

## Design Decisions

### Multistage Compilation over full Rollup pipeline

 Compilation is multistage in that it uses individual compilers like tsc and node-sass for compiling ts and scss source from *src/* into js and css in *dist/compiled*, then uses Rollup for bundling and minifying. Reasons:
 
 * It avoids the watch [issues in typescript projects with no-emit types using Rollup plugins](https://github.com/rollup/rollup-plugin-typescript/issues/28).
 * It provides intermediate artefacts that can eyeballed.
 * I like the granular control it provides over every step of the process.
 * I'll be curious to see whether it slows builds down significantly.

### SCSS over CSSNext

I chose to use SCSS because many editors have syntax support for it. I'd love to use the CSSNext PostCSS plugin, but having good editor tooling wins out.

### Rollup over Browserify et al.

Rollup seems really clean and easy to get going, and also produces [very efficient results through tree-shaking](https://github.com/samccone/The-cost-of-transpiling-es2015-in-2016). I also really like being able to import non-js dependencies and have them included during bundling.

### Mocha and Chai

They're popular, but that's pretty much all.