const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config');
const { withMetroConfig } = require('react-native-monorepo-config');

const root = path.resolve(__dirname, '..');

const config = withMetroConfig(getDefaultConfig(__dirname), {
  root,
  dirname: __dirname,
});

// The root package.json has a `name`, so react-native-monorepo-config treats
// the monorepo root as a workspace package and adds `<root>/node_modules/<peer>`
// to the blockList. With yarn's default hoisting, peer deps like react-native
// live exactly there, so they become unresolvable. Drop those patterns.
const rootNmPrefix = path.join(root, 'node_modules');
if (config.resolver && config.resolver.blockList instanceof RegExp) {
  const patterns = config.resolver.blockList.source
    .replace(/^\(|\)\$$/g, '')
    .split('|');
  const kept = patterns.filter((p) => {
    const decoded = p
      .replace(/\\x2d/g, '-')
      .replace(/\\([./])/g, '$1')
      .replace(/^\^/, '');
    return !decoded.startsWith(rootNmPrefix);
  });
  config.resolver.blockList = kept.length
    ? new RegExp(`(${kept.join('|')})$`)
    : undefined;
}

module.exports = config;
