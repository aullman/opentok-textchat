/* global localStorage OT */

const angular = require('angular');
require('angular-moment');
require('angular-sanitize');
require('highlight.js');
require('ng-embed');

class Message {
  constructor(from, date, body) {
    this.from = from;
    this.date = date;
    this.body = body;
  }
}

const getNameFromConnection = (connection) => {
  let id = connection.creationTime.toString();
  id = id.substring(id.length - 6, id.length - 1);
  return `Guest${id}`;
};

angular.module('opentok-textchat', ['opentok', 'angularMoment', 'ngEmbed'])
  .directive('opentokTextchat', ['OTSession', 'moment', function otTextChat(OTSession) {
    return {
      restrict: 'E',
      template: '<div id="otTextChat">' +
        '<div id="otTextChatMessages">' +
        '<div class="welcome">Welcome. Your name is {{name}}. ' +
        'To change it use "/name [name]"</div>' +
        '<div class="message" ng-repeat="message in messages">' +
          '<img ng-src="{{getImageData(message.from)}}" ng-if="getImageData(message.from)">' +
          '<div class="messageText">' +
          '<span class="from">{{getName(message.from)}}</span> ' +
          '<span class="time" am-time-ago="message.date | amFromUnix"></span>' +
          '<div class="body" ng-bind-html="message.body | embed"></div>' +
        '</div></div></div>' +
        '<form>' +
        '<input type="text" id="body" autocomplete="off"></input>' +
        '</form>' +
        '</div>',

      link: function link(scope, element) {
        scope.messages = [];
        const connections = [];
        OTSession.session.on('signal:message', (event) => {
          const messageData = JSON.parse(event.data);
          const message = new Message(event.from, messageData.date, messageData.body);
          scope.messages.push(message);
          scope.$apply();
          const lastMessage = element[0].querySelector('.message:last-child');
          lastMessage.scrollIntoView();
        });

        const sendName = (toConnection) => {
          OTSession.session.signal({
            to: toConnection,
            type: 'name',
            data: scope.name,
          });
        };
        OTSession.session.on('connectionCreated', (event) => {
          connections.push(event.connection);
          sendName(event.connection);
        });

        const updateName = (pName) => {
          scope.name = pName;
          localStorage.setItem('otTextChatName', scope.name);
          connections.forEach(connection => sendName(connection));
        };

        const sendForm = element.find('form');
        const inputText = element.find('input');
        sendForm.on('submit', () => {
          const body = inputText.val();
          const nameRegexp = /\/name (\w+)/;
          if (body.match(nameRegexp)) {
            // We're setting the name
            updateName(body.match(nameRegexp)[1]);
          } else {
            OTSession.session.signal({
              type: 'message',
              data: JSON.stringify({
                body,
                date: new Date().getTime() / 1000,
              }),
            });
          }
          inputText.val('');
          return false;
        });

        const namesByConnectionId = {};
        const imagesByConnectionId = {};
        scope.name = localStorage.getItem('otTextChatName');
        if (!scope.name) {
          if (OTSession.session.isConnected()) {
            scope.name = getNameFromConnection(OTSession.session.connection);
          } else {
            OTSession.session.on('sessionConnected', () => {
              scope.name = getNameFromConnection(OTSession.session.connection);
            });
          }
        }

        scope.getName = (from) => {
          if (!namesByConnectionId[from.connectionId]) {
            namesByConnectionId[from.connectionId] = getNameFromConnection(from);
          }
          return namesByConnectionId[from.connectionId];
        };

        scope.getImageData = (from) => {
          if (!imagesByConnectionId[from.connectionId]) {
            const ps = OT.subscribers.find(
              sub => sub.stream.connection.connectionId === from.connectionId) ||
              OT.publishers.find(pub => pub.stream.connection.connectionId === from.connectionId);
            if (ps) {
              imagesByConnectionId[from.connectionId] =
                `data:image/png;base64,${ps.getImgData()}`;
            }
          }
          return imagesByConnectionId[from.connectionId];
        };

        OTSession.session.on('signal:name', (event) => {
          namesByConnectionId[event.from.connectionId] = event.data;
          scope.$apply();
        });
      },
    };
  }]);
