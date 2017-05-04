const posthtml = require('posthtml');
const scriptPathMapper = require('posthtml-plugin-rewrite-paths').default;
const chokidar = require('chokidar');
const parseGlob = require('parse-glob');
const path = require('path');
const fs = require('fs');
const glob = require("glob");

const error = console.log.bind(console, "posthtml error");

const opts = require("nomnom")
  .option('watch', {
      abbr: 'w',
      flag: true,
      default: false,
      help: 'Rebuild output(s) when input(s) change'
   })
   .option('include', {
      abbr: 'i',
      required: true,
      help: 'Input file glob(s). May be specified more than once'
   })
   .option('output', {
      abbr: 'o',
      required: true,
      help: 'The output folder',
   })
   .option('pathMap', {
      abbr: 'm',
      full: 'path-map',
      required: true,
      help: 'Path to a JSON file, or a JSON object, with format { "path": "new-path" }',
   })
   .parse(process.argv);
   //.parse([...process.argv, ..."-i src/**/*.html -o dist/ -m dist/manifest.json --watch".split(" ")]); //Testing
   

if (typeof opts.pathMap !== "string" && typeof opts.pathMap !== "object") {
    throw new Error("path-map option must be a path to a JSON file, or a JSON object.");
  }

const includeBase = parseGlob(opts.include).base;

const parser = posthtml([
  scriptPathMapper({
    search: {
      "script": ["src"],
      "link": ["href"]
    },
    pathMap: opts.pathMap
  })
]);

console.info("posthtml start");

let configWatcher;
const inputWatcher = chokidar.watch(opts.include);
inputWatcher.changeAll = function () {
  const watcher = this;
  glob(opts.include, {}, function(er, inputs) {
    for (var input of inputs) {
      watcher.emit("change", input);
    }
  });
};

let waitForExit = opts.watch ? null : [];
inputWatcher
  .on('add', processFile)
  .on('change', processFile)
  .on('ready', () => {
    if (opts.watch) {
      if (typeof opts.pathMap === "string") {
        configWatcher = chokidar.watch(opts.pathMap);
        configWatcher.on("change", () => inputWatcher.changeAll());
      }
    } else {
      inputWatcher.close();
      if (configWatcher) { configWatcher.close(); }
      Promise.all(waitForExit).then(() => exit(), () => exit());
    }
    waitForExit = null;
  });

function exit(code = 0) {
  console.info("posthtml finish");
  process.exit(code);
}

function processFile(file) {
  const promise = new Promise((resolve, reject) => {
    fs.readFile(file, "utf8", (err, html) => {
      if (err) {
        error("reading file", file, err);
        reject(err);
      } else {
        parser.process(html).then(result => {
          const relative = stripPath(includeBase, file);
          const destination = path.join(opts.output, relative);
          fs.writeFile(destination, result.html, err => {
            if (err) {
              error("writing file", destination, err);
              reject(err);
            } else {
              console.info("posthtml", file, "->", destination);
              resolve(result);
            }
          });
        });
      }
    });
  });
  if (waitForExit != null) {
    waitForExit.push(promise);
  }
  return promise;
}

function stripPath(prefix, filePath) {
  prefix = path.normalize("/" + prefix);
  filePath = path.normalize("/" + filePath);
  if (filePath.lastIndexOf(prefix, 0) === 0) { //starts with
    return filePath.slice(prefix.length);
  }
  return filePath;
}