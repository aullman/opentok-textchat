const config = {
  directConnect: true,
  specs: ['e2e/scenarios.js'],
};

switch (process.env.BROWSER) {
  case 'chrome':
  default:
    config.capabilities = {
      browserName: 'chrome',
      chromeOptions: {
        args: ['auto-select-desktop-capture-source="Entire screen"',
          'use-fake-device-for-media-stream',
          'use-fake-ui-for-media-stream', 'disable-popup-blocking'],
        binary: process.env.BROWSERBIN,
      },
    };
}

exports.config = config;
