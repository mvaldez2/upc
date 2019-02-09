define([
  'app',
  // Load Controllers here
  'controllers/app',
  'controllers/dashboard',
  'controllers/oldControllers/results',
  'controllers/oldControllers/detail',
  'controllers/profile',
  'controllers/event',
  'controllers/profileSettings',
  'controllers/oldControllers/page'
], function (app) {
  'use strict';
  // definition of routes
  app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
      // url routes/states
      $urlRouterProvider.otherwise('dashboard');

      $stateProvider
        // app states
        .state('dashboard', {
          url: '/dashboard',
          templateUrl: 'app/templates/dashboard.html',
          controller: 'DashboardCtrl'
        })
        .state('results', {
          url: '/results/:search/:satTrans/:wheelChair/:wheelChairLift',
          controller: 'ResultsCtrl',
          templateUrl: 'app/templates/oldTemplates/results.html'
        })
        .state('detail', {
          url: '/detail/:id',
          controller: 'DetailCtrl',
          templateUrl: 'app/templates/oldTemplates/detail.html'
        })
        .state('profile', {
          url: '/profile/:id',
          controller: 'ProfileCtrl',
          templateUrl: 'app/templates/details/profile.html'
        })
        .state('event', {
          url: '/event/:id',
          controller: 'EventCtrl',
          templateUrl: 'app/templates/details/event.html'
        })
        .state('about', {
          url: '/about/:id',
          controller: 'AppCtrl',
          templateUrl: 'app/templates/menu/about.html'
        })
        .state('perks', {
          url: '/crusaderPerks/:id',
          controller: 'AppCtrl',
          templateUrl: 'app/templates/menu/crusaderPerks.html'
        })
        .state('programs', {
          url: '/programs&events/:id',
          controller: 'AppCtrl',
          templateUrl: 'app/templates/menu/programs&events.html'
        })
        .state('calendar', {
          url: '/UPC_Calendar/:id',
          controller: 'AppCtrl',
          templateUrl: 'app/templates/menu/UPC_Calendar.html'
        })
        .state('people', {
          url: '/people/:id',
          controller: 'AppCtrl',
          templateUrl: 'app/templates/tabs/people.html'
        })
        .state('settings', {
          url: '/settings/:id',
          controller: 'AppCtrl',
          templateUrl: 'app/templates/tabs/settings.html'
        })
        .state('profileSettings', {
          url: '/profileSettings/:id',
          controller: 'ProfileSettingsCtrl',
          templateUrl: 'app/templates/tabs/profileSettings.html'
        });
    }
  ]);
});
