// Node's native realpath cannot traverse the restricted Windows runner's ancestors.
// Use Node's JS resolver only for this runner; this does not suppress build checks.
const fs = require('node:fs');
fs.realpathSync.native = fs.realpathSync;
fs.realpath.native = fs.realpath;
fs.promises.realpath = async (path, options) => fs.realpathSync(path, options);
// Serialize directory creation to avoid EPERM races in the Windows sandbox.
fs.mkdir = function (path, options, callback) {
  if (typeof options === 'function') { callback = options; options = undefined; }
  try { const result = fs.mkdirSync(path, options); queueMicrotask(() => callback(null, result)); }
  catch (error) { queueMicrotask(() => callback(error)); }
};
fs.promises.mkdir = async (path, options) => fs.mkdirSync(path, options);
