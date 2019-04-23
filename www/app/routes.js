define([
  'app',
  // Load Controllers here
  'controllers/app',
  'controllers/signin',
  'controllers/dashboard',
  'controllers/oldControllers/results',
  'controllers/oldControllers/detail',
  'controllers/profile',
  'controllers/event',
  'controllers/profileSettings',
  'controllers/eventSettings',
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
        .state('userEvent', {
          url: '/userEvent/:id',
          controller: 'EventCtrl',
          templateUrl: 'app/templates/details/userEvent.html'
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
        .state('search', {
          url: '/search/:id',
          controller: 'AppCtrl',
          templateUrl: 'app/templates/tabs/search.html'
        })
        .state('settings', {
          url: '/settings/:id',
          controller: 'AppCtrl',
          templateUrl: 'app/templates/tabs/settings/settings.html'
        })
        .state('profileSettings', {
          url: '/settings/profileSettings/:id',
          controller: 'ProfileSettingsCtrl',
          templateUrl: 'app/templates/tabs/settings/profileSettings.html'
        })
        .state('eventSettings', {
          url: '/settings/adminSettings/:id',
          controller: 'EventSettingsCtrl',
          templateUrl: function (){
            if  (document.URL.startsWith('http')) {
              return 'app/templates/tabs/settings/eventSettings.html'
            } else if(ionic.Platform.isIOS() || ionic.Platform.is('android')){
              return 'app/templates/tabs/settings/eventSettings-phone.html'
            }
            return 'app/templates/tabs/settings/eventSettings.html'
          }
        })
        .state('signIn', {
          url: '/signIn',
          controller: 'SigninCtrl',
          templateUrl: 'app/templates/signin.html'
        })
        .state('checkin', {
          url: '/checkin/:id',
          controller: 'AppCtrl',
          templateUrl: 'app/templates/menu/checkin.html'

        }).state('roles', {
          url: '/settings/adminSettings/roles',
          controller: 'EventSettingsCtrl',
          templateUrl: 'app/templates/tabs/settings/roles.html'

        }).state('manageEvents', {
          url: '/settings/adminSettings/manageEvents',
          controller: 'EventSettingsCtrl',
          templateUrl: 'app/templates/tabs/settings/manageEvents.html'

        }).state('editEvent', {
          url: '/settings/adminSettings/editEvent/:id',
          controller: 'EventCtrl',
          templateUrl: 'app/templates/tabs/settings/editEvent.html'

        });
    }
  ]);
});
