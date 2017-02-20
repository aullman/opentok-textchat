const FirefoxProfile = require('selenium-webdriver/firefox').Profile; // eslint-disable-line import/no-extraneous-dependencies

const firefoxProfile = new FirefoxProfile();

const config = {
  specs: ['e2e/scenarios.js'],
  seleniumAddress: 'http://localhost:4444/wd/hub',
  framework: 'jasmine',
};

switch (process.env.BROWSER) {
  case 'firefox':
    // firefoxProfile.setPreference('media.navigator.permission.disabled', true);
    // firefoxProfile.setPreference('media.navigator.streams.fake', true);
    // firefoxProfile.setPreference('media.getusermedia.screensharing.allowed_domains',
    //   'localhost,adam.local');

    config.firefoxPath = process.env.BROWSERBIN;
    config.capabilities = {
      browserName: 'firefox',
      marionette: true,
      // firefox_profile: firefoxProfile,
    };
    break;
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
    break;
}

exports.config = config;
