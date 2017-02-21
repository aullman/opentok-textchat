#!/bin/bash

# taken from https://stackoverflow.com/questions/36066695/running-protractor-when-webdriver-manager-start-finishes/39252628#39252628

echo "BROWSERBIN is $BROWSERBIN"
if [[ $BROWSERBIN == *"firefox"* ]]; then
  echo "Updating path to Firefox"
  # Update the path to firefox to make Webdriver use it
  FIREFOX_PATH=`which firefox`
  mv $FIREFOX_PATH $FIREFOX_PATH-bak
  ln -s $FIREFOX_PATH $BROWSERBIN
fi
echo "Firefox is at `which firefox`"
webdriver-manager update
# Start selenium server and trash the verbose error messages from webdriver
webdriver-manager start 2>/dev/null &
# Wait 3 seconds for port 4444 to be listening connections
while ! nc -z 127.0.0.1 4444; do sleep 3; done

./node_modules/.bin/protractor tests/protractor.conf.js
