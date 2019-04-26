define([
  'app',
  'services/page'
], function (app) {
  'use strict';

  app.controller('AppCtrl', [
    '$scope',
    '$ionicModal',
    '$ionicScrollDelegate',
    '$sce',
    'pageService',
    '$firebaseObject',
    '$firebaseAuth',
    '$firebaseArray',
    '$window',
    '$state',
    '$ionicHistory',
    '$ionicPopup',
    'Calendar',
    'Youtube',
    '$stateParams',
    'eventService',

    function ($scope, $ionicModal, $ionicScrollDelegate, $sce, pageService, $firebaseObject,
      $firebaseAuth, $firebaseArray, $window, $state, $ionicHistory, $ionicPopup,
      $stateParams, eventService) {


      $scope.ready = true;


      var ref = firebase.database().ref();

      // ---------------- Get calendar  ------------------------
      var calRef = ref.child("calendar");
      var cal = $firebaseArray(calRef);

      var eventsRef = ref.child("events");
      $scope.events = $firebaseArray(eventsRef);
      console.log(cal);
      $scope.cal = $firebaseArray(calRef);
      var mycalRef = ref.child("mycalendar");
      var mycal = $firebaseArray(mycalRef);
      $scope.mycal = $firebaseArray(mycalRef);


      // -------- get google users -----------------
      var gUsersRef = ref.child("googleUsers");
      var googleUsers = $firebaseArray(gUsersRef);
      $scope.googleUsers = $firebaseArray(gUsersRef);

      $scope.sortDate = function (event) {
        var date = new Date(event.start.dateTime);
        return -date;
      };

      $scope.upcomingEvents = function (event) {
        var date = new Date();
        var eventDate = new Date(event.start.dateTime);
        return eventDate >= date;
      };

      //--------- Count Checked in Events ----------
      var checkEventsRef = ref.child("checkEvents");
      var checkEvents = $firebaseArray(checkEventsRef);
      $scope.checkEvents = $firebaseArray(checkEventsRef);

      $scope.countCEvents = function () {
        var countCEvents = 0;
        var x;
        for (x in $scope.checkEvents) {
          countCEvents = countCEvents + 1;
        }

        return countCEvents;
      }


      // ------- formats calendar dates -----------
      $scope.dateFormat2 = function (place) {
        var eventRef = firebase.database().ref('calendar/' + place.$id);
        eventRef.on('value', function (snapshot) {
          $scope.dateTime = snapshot.val().start.dateTime
          $scope.start = snapshot.val().start.date
          $scope.end = snapshot.val().end.date
        });
        var date = new Date($scope.dateTime);
        var dayOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        var finalDate = date.toLocaleDateString("en-US", dayOptions);
        if (finalDate == 'Invalid Date') {
          date = new Date($scope.start);
          var end = new Date($scope.end);
          var dayOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
          var startDate = date.toLocaleDateString("en-US", dayOptions);
          var endDate = end.toLocaleDateString("en-US", dayOptions);
          finalDate = startDate; // for multiple days: finalDate = startDate + " - " + endDate; This messes with the order of the events

        }
        return finalDate;

      }



      //------------ get current user -------------------
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          // User is signed in
          var profileRef = firebase.database().ref('googleUsers/' + user.uid + '/');
          profileRef.on('value', function (snapshot) {
            //console.log(snapshot.val())
            $scope.name = snapshot.val().name
            $scope.photoUrl = snapshot.val().photoUrl
            $scope.email = snapshot.val().email
            $scope.event = snapshot.val().events
            $scope.admin = snapshot.val().admin
            $scope.owner = snapshot.val().owner
            $scope.checkEvents = snapshot.val().checkEvents
          });
        } else {
          $scope.admin = false
          $scope.owner = false
        }
      });




      //--------- hides tabs on pages --------------
      $scope.shouldHide = function () {
        switch ($state.current.name) {
          case 'profile':
            return true;
          case 'event':
            return true;
          case 'profileSettings':
            return true;
          case 'eventSettings':
            return true;
          case 'about':
            return true;
          case 'perks':
            return true;
          case 'programs':
            return true;
          case 'calendar':
            return true;
          case 'signIn':
            return true;
          case 'checkin':
            return true;
          default:
            return false;
        }
      }



      //might be used for reload after submitting of something
      $scope.reloadRoute = function () {
        $window.location.reload();
      }





      $scope.openModal = function (index) {
        var notEqual = index !== $scope.currentPage;
        if (notEqual) {
          $scope.opening = true;
          $scope.currentPage = index;
        }
        $scope.modal.show().then(function () {
          if (notEqual) {
            $ionicScrollDelegate.$getByHandle('modal').scrollTop();
          }
          $scope.opening = false;
        });
      };

      $scope.trustHtml = function (html) {
        return $sce.trustAsHtml(html);
      };

      $scope.closeModal = function () {
        $scope.modal.hide();
      };

      //disable back button
      /*$ionicHistory.nextViewOptions({
        disableBack: true,
        disableAnimate: false,
        historyRoot: true,
        cache: false

      });*/

      /*GAPI.init().then(function () {
      }, function () { console.log('Something went wrong yes?'); });*/

      // **************** Log In Here **************** //

      var ref = firebase.database().ref();


      var onComplete = function (error) {
        if (error) {
          console.log('Failed');
        } else {
          console.log('Completed');
        }
      };
      // ----------------- authentication for google calendar ------------------
      $scope.authenticate = function () {
        return gapi.auth2.getAuthInstance()
          .signIn({ scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar" })
          .then(function () { console.log("Sign-in successful"); },
            function (err) { console.error("Error signing in", err); });
      }
      $scope.loadClient = function () {
        return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/calendar/v3/rest")
          .then(function () { console.log("GAPI client loaded for API"); },
            function (err) { console.error("Error loading GAPI client for API", err); });
      }


      //todays date for calendar sync
      var today = new Date();
      var day = today.getDate() + 1;
      var month = today.getMonth() + 1;
      var year = today.getFullYear();
      if (day < 10) {
        day = '0' + day;
      }
      if (month < 10) {
        month = '0' + month;
      }

      //---------------syncs calendar ---------
      var db = firebase.database();
      $scope.sync = function () {
        $scope.calendarEvents = gapi.client.calendar.events.list({
          "calendarId": "upc@valpo.edu",
          "maxResults": 30,
          "orderBy": "startTime",
          "singleEvents": true,
          "timeMin": year.toString() + "-" + month.toString() + "-" + day.toString() + "T00:00:00+10:00"
        })
          .then(function (response) {
            console.log("Response", response);
            $scope.upcEvents = response.result.items;
            db.ref().child('calendar').set({
              events: $scope.upcEvents
            });
          }, function (err) { console.error("Execute error", err); });


      }
      $scope.testSync = function () {
        $scope.calendarEvents = gapi.client.calendar.events.list({
          "calendarId": "miguel.valdez@valpo.edu",
          "maxResults": 20,
          "orderBy": "startTime",
          "singleEvents": true,
          "timeMin": year.toString() + "-" + month.toString() + "-" + day.toString() + "T00:00:00+10:00"
        })
          .then(function (response) {
            console.log("Response", response);
            $scope.upcEvents = response.result.items;
            db.ref().child('myCalendar').set({
              events: $scope.upcEvents
            });
          }, function (err) { console.error("Execute error", err); });


      }


      /*gapi.load("client:auth2", function () {
        gapi.auth2.init({ client_id: '188526661745-1qvjgbd02e62kjg1it4tj05p14rveb21.apps.googleusercontent.com' });
      });

      GAPI.init().then(function () {
      }, function () { console.log('Something went wrong yes?'); });*/


      var gUserRef = ref.child("googleUsers"); //get users
      var googleUsers = $firebaseArray(gUserRef);
      $scope.googleUsers = $firebaseArray(gUserRef);



      $ionicHistory.nextViewOptions({
        disableBack: false,
        disableAnimate: false,
        historyRoot: false,
        cache: false

      });

      $scope.pageBackButton = function () {
        $state.go("dashboard");
      }

      $scope.eventBackButton = function () {
        $state.go("calendar");
      }

      $scope.adminBackButton = function () {
        $state.go("eventSettings");
      }


    }
  ]);
});
