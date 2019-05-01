define([
  'app'
], function (app) {
  'use strict';
  // additional config-blocks
  // app.config([
  //   function () {
  //   }
  // ]);
  app.config(function($ionicConfigProvider) {

    // note that you can also chain configs
    $ionicConfigProvider.navBar.alignTitle('center');
  });

  app.config(function () {
    var config = {
      apiKey: "AIzaSyBeXrlBrm8mZIV9KRrCXXOT90BfJ_drxRQ",
      authDomain: "upc-app.firebaseapp.com",
      databaseURL: "https://upc-app.firebaseio.com",
      storageBucket: "upc-app.appspot.com",
      client_id: "188526661745-b4m67m1md52qebfo5kfn00aqh8r58sn1.apps.googleusercontent.com",

    };
    firebase.initializeApp(config);
  });

  app.config(function ($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([

      'self',
      'app/templates/**',
      'app/templates/menu/**',
      'C:/Users/miguel24valdez/Documents/upc/www/app/templates/menu/**',
      ' http://localhost:8100/app/templates/menu/**']);
  });

});
