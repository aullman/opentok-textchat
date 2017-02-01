/* global config window */

window.$ = window.jQuery = require('jquery');
const angular = require('angular');
require('opentok-angular');

require('../../'); // Real app would use require('opentok-textchat');
require('../../opentok-textchat.css'); // Real app would use require('opentok-textchat/opentok-textchat.css');

angular.module('demo', ['opentok', 'opentok-textchat'])
.controller('DemoCtrl', ['$scope', 'OTSession', ($scope, OTSession) => {
  $scope.connected = false;
  OTSession.init(config.OT_API_KEY, config.OT_SESSION_ID, config.OT_TOKEN, (err) => {
    if (!err) {
      $scope.$apply(() => {
        $scope.connected = true;
      });
    }
  });
  $scope.streams = OTSession.streams;
}]);
