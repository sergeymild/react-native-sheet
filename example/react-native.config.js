const path = require('path');
const pkg = require('../package.json');

module.exports = {
  project: {
    ios: {
      automaticPodsInstallation: true,
    },
  },
  dependencies: {
    [pkg.name]: {
      root: path.join(__dirname, '..'),
      platforms: {
        // Codegen script incorrectly fails without this
        // So we explicitly specify the platforms with empty object
        ios: {},
        // NB: android platform intentionally omitted — defer to the library's
        // own `react-native.config.js` which declares `componentDescriptors`
        // and `cmakeListsPath` for the Fabric ShadowNode override.
      },
    },
  },
};
