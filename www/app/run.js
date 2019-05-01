define([
  'app'
], function (app) {
  'use strict';
  // the run blocks
  app.run([
    '$ionicPlatform',
    '$cordovaCamera',
    function ($ionicPlatform) {
      $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
          // org.apache.cordova.statusbar required
          StatusBar.styleDefault();
        }
      });
    }
  ]);

  

  app.value('GoogleApp', {
    apiKey: 'AIzaSyBeXrlBrm8mZIV9KRrCXXOT90BfJ_drxRQ',
    clientId: '188526661745-b4m67m1md52qebfo5kfn00aqh8r58sn1.apps.googleusercontent.com',
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/calendar',
    ]

  });

  


});
