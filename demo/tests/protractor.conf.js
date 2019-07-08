const firefox = require('selenium-webdriver/firefox'); // eslint-disable-line import/no-extraneous-dependencies

const config = {
  specs: ['e2e/scenarios.js'],
  framework: 'jasmine',
  multiCapabilities: [{
    browserName: 'chrome',
    chromeOptions: {
      args: ['auto-select-desktop-capture-source="Entire screen"',
        'use-fake-device-for-media-stream',
        'use-fake-ui-for-media-stream', 'disable-popup-blocking'],
    },
    maxInstances: 1,
  }],
};

if (process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
  const firefoxProfile = new firefox.Profile();
  firefoxProfile.setPreference('media.navigator.permission.disabled', true);
  firefoxProfile.setPreference('media.navigator.streams.fake', true);
  firefoxProfile.setPreference('media.getusermedia.screensharing.allowed_domains',
    'localhost,adam.local');

  config.multiCapabilities.push({
    browserName: 'firefox',
    marionette: true,
    firefox_profile: firefoxProfile,
    maxInstances: 1,
  });

  config.sauceUser = process.env.SAUCE_USERNAME;
  config.sauceKey = process.env.SAUCE_ACCESS_KEY;
} else {
  config.seleniumAddress = 'http://localhost:4444/wd/hub';
}

exports.config = config;
