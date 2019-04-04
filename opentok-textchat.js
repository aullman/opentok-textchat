/* global localStorage OT Blob URL atob */

const angular = require('angular');
require('angular-moment');
require('angular-sanitize');
require('highlight.js');
require('ng-embed');

const reloadImage = `<?xml version="1.0" encoding="utf-8"?>
<!-- Svg Vector Icons : http://www.onlinewebfonts.com/icon -->
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000" xml:space="preserve">
<metadata> Svg Vector Icons : http://www.onlinewebfonts.com/icon </metadata>
<g><path fill="white" stroke="red" d="M885.8,234.7h-20.9H760.7l-63.3-89.1c-14.9-20.6-31.8-36-54.4-36H357.1c-22.6,0-39.3,15.6-53.5,36l-64.3,89.1H114.3C46.6,234.7,10,283.6,10,358.6v396.1c0,75,54.9,135.8,122.5,135.8h735c67.7,0,122.5-60.8,122.5-135.8V358.6C990,283.6,953.4,234.7,885.8,234.7L885.8,234.7z M948.3,754.6c0,51.9-36.2,94.1-80.8,94.1h-735c-44.5,0-80.8-42.2-80.8-94.1V358.6c0-54.6,21-82.2,62.6-82.2h125.1c13.4,0,26-6.4,33.8-17.3l64.7-89.7c7.9-11.4,15.1-18.1,19.2-18.1h285.8c4.5,0,12,6.8,20.4,18.5l63.3,89.1c7.8,11,20.5,17.5,34,17.5h104.3h20.9c20.3,0,35,6,45.2,18.5c11.4,14,17.4,36,17.4,63.7L948.3,754.6L948.3,754.6z"/>
<path fill="white" stroke="red" d="M489.6,303.5c-137.4,0-249.3,111.8-249.3,249.3c0,137.4,111.8,249.3,249.3,249.3c137.4,0,249.3-111.8,249.3-249.3C738.9,415.3,627,303.5,489.6,303.5z M489.6,761.5c-115.1,0-208.7-93.6-208.7-208.7c0-115.1,93.6-208.7,208.7-208.7c115.1,0,208.7,93.6,208.7,208.7C698.3,667.9,604.7,761.5,489.6,761.5z"/>
<path fill="white" stroke="red" d="M489.6,777"/>
<path fill="white" stroke="red" d="M294.5,171.9H131c-5,0-9.1,4.1-9.1,9.1v22.3c0,5,4.1,9.1,9.1,9.1h163.4c5,0,9.1-4.1,9.1-9.1V181C303.6,175.9,299.5,171.9,294.5,171.9L294.5,171.9z"/>
<path fill="white" stroke="red" d="M162,256.8v-74.7c0-5-4.1-9.1-9.1-9.1h-22.3c-5,0-9.1,4.1-9.1,9.1v74.7c0,5,4.1,9.1,9.1,9.1h22.3C157.9,266,162,261.9,162,256.8L162,256.8z"/>
<path fill="white" stroke="red" d="M492.8,389.3c-88.4,0-160.3,71.9-160.3,160.3c0,88.4,71.9,160.3,160.3,160.3c88.4,0,160.3-71.9,160.3-160.3C653.1,461.2,581.2,389.3,492.8,389.3z M492.8,683.8c-74,0-134.2-60.2-134.2-134.2c0-74,60.2-134.2,134.2-134.2c74,0,134.2,60.2,134.2,134.2C627,623.6,566.8,683.8,492.8,683.8z"/>
<path fill="white" stroke="red" d="M826,326.7c20.6,0,37.1,16.9,37.1,38c0,20.6-16.5,37.1-37.1,37.1c-21.1,0-38-16.6-38-37.1C788.1,343.6,804.9,326.7,826,326.7L826,326.7z"/></g>
</svg>`;

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

const createObjectURLFromImgData = (imgData) => {
  const binaryString = atob(imgData);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: 'image/png' });
  const url = URL.createObjectURL(blob);

  return url;
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
          '<div class="imageContainer"  ng-click="updateImage(message.from)" ng-class=' +
          '"{\'myImage\': message.from.connectionId === session.connection.connectionId}">' +
          '<img ng-src="{{getImageData(message.from)}}" ng-if="getImageData(message.from)">' +
          `<div class="reloadOverlay">${reloadImage}</div>` +
          '</div><div class="messageText">' +
          '<span class="from">{{getName(message.from)}}</span> ' +
          '<span class="time" am-time-ago="message.date | amFromUnix"></span>' +
          '<div class="body" ng-bind-html="message.body | embed:{linkTarget:\'_blank\'}"></div>' +
        '</div></div></div>' +
        '<form>' +
        '<input type="text" id="body" autocomplete="off"></input>' +
        '</form>' +
        '</div>',

      link: function link(scope, element) {
        scope.messages = [];
        scope.session = OTSession.session;
        const connections = [];
        OTSession.session.on('signal:message', (event) => {
          const messageData = JSON.parse(event.data);
          const message = new Message(event.from, messageData.date, messageData.body);
          scope.messages.push(message);
          scope.$emit('otTextchatMessage', message);
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
          if (!body) return false;
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

        const getNewImage = (from) => {
          const ps = OT.subscribers.find(
            sub => sub.stream.connection.connectionId === from.connectionId) ||
            OT.publishers.find(pub =>
              pub.stream && pub.stream.connection
                && pub.stream.connection.connectionId === from.connectionId
            );
          if (ps) {
            imagesByConnectionId[from.connectionId] = createObjectURLFromImgData(ps.getImgData());
          }
        };

        scope.getImageData = (from) => {
          if (!imagesByConnectionId[from.connectionId]) {
            getNewImage(from);
          }
          return imagesByConnectionId[from.connectionId];
        };

        scope.updateImage = (from) => {
          if (from.connectionId === OTSession.session.connection.connectionId) {
            OTSession.session.signal({
              type: 'updateImage',
            });
          }
        };

        OTSession.session.on('signal:updateImage', (event) => {
          getNewImage(event.from);
          scope.$apply();
        });

        OTSession.session.on('signal:name', (event) => {
          namesByConnectionId[event.from.connectionId] = event.data;
          scope.$apply();
        });
      },
    };
  }]);
