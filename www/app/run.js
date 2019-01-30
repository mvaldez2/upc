define([
  'app'
], function (app) {
  'use strict';
  // the run blocks
  app.run([
    '$ionicPlatform',
    function ($ionicPlatform) {
      $ionicPlatform.ready(function() {
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

  app.config(function() {
    var config = {
      apiKey: "AIzaSyBeXrlBrm8mZIV9KRrCXXOT90BfJ_drxRQ",
      authDomain: "upc-app.firebaseapp.com",
      databaseURL: "https://upc-app.firebaseio.com",
      storageBucket: "upc-app.appspot.com",
    
    };
    firebase.initializeApp(config);
});


});
