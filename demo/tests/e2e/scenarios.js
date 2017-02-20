/* global describe, it, browser, beforeAll, element, by, expect */

function getUserName() {
  return element(by.css('opentok-textchat .welcome')).getAttribute('innerHTML').then((innerHTML) => {
    const match = innerHTML.match(/Welcome. Your name is (\w+\d+). To change it use/);
    expect(match.length).toBe(2);
    return match[1];
  });
}

let currentWindow = 0;
function switchWindow() {
  return browser.getAllWindowHandles().then((handles) => {
    currentWindow = currentWindow === 0 ? 1 : 0;
    return browser.switchTo().window(handles[currentWindow]);
  });
}

function checkMessageReceived(from, body) {
  const chatMessage = element(by.css('#otTextChatMessages .message'));
  browser.wait(() => chatMessage.isPresent(), 10000);
  expect(chatMessage.element(by.css('.messageText .from'))
    .getAttribute('innerHTML')).toEqual(from);
  expect(chatMessage.element(by.css('.messageText .time'))
    .getAttribute('innerHTML')).toEqual('a few seconds ago');
  expect(chatMessage.element(by.css('.messageText .body'))
    .getAttribute('innerHTML')).toEqual(body);
  // Image has loaded
  browser.wait(() => chatMessage.element(by.css('img')).getAttribute('naturalWidth')
  .then(naturalWidth => naturalWidth > 0), 10000);
}

describe('demo', () => {
  beforeAll(() => {
    browser.get('http://localhost:8080/');
    browser.wait(() => element(by.css('opentok-textchat')).isPresent(), 10000);
  });

  it('should display the welcome message with a name', () => {
    const welcomeMessage = element(by.css('opentok-textchat .welcome'));
    expect(welcomeMessage.isDisplayed()).toBe(true);
    expect(welcomeMessage.getAttribute('innerHTML')).toContain('Welcome. Your name is');
  });

  describe('browser2 sends a message', () => {
    let browser2Name;
    beforeAll(() => {
      browser.driver.executeScript('window.open("http://localhost:8080/");');
      // Wait for subscriber to load so that we get user images
      browser.wait(() => element(by.css('ot-subscriber:not(.OT_loading)')).isPresent());
      switchWindow();
      browser.wait(() => element(by.css('opentok-textchat')).isPresent(), 10000);

      getUserName().then((userName) => {
        expect(userName).toBeDefined();
        browser2Name = userName;
      });

      element(by.css('opentok-textchat form input')).sendKeys('hello world');
      element(by.css('opentok-textchat form')).submit();
    });

    it('browser2 gets the message', () => {
      checkMessageReceived(browser2Name, 'hello world');
    });

    describe('browser1', () => {
      beforeAll(() => {
        switchWindow();
      });

      it('gets the message', () => {
        checkMessageReceived(browser2Name, 'hello world');
      });
    });
  });
});
