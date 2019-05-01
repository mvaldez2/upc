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
    '$stateParams',
    '$timeout',

    function ($scope, $ionicModal, $ionicScrollDelegate, $sce, pageService, $firebaseObject,
      $firebaseAuth, $firebaseArray, $window, $state, $ionicHistory, $ionicPopup,
      $stateParams, $timeout) {


      $scope.ready = true;


      var ref = firebase.database().ref();

      // ---------------- Get calendar  ------------------------
      var calRef = ref.child("calendar");
      var cal = $firebaseArray(calRef);

      var eventsRef = ref.child("events");
      $scope.events = $firebaseArray(eventsRef);
      $scope.cal = $firebaseArray(calRef);
      var mycalRef = ref.child("mycalendar");
      $scope.mycal = $firebaseArray(mycalRef);


      // -------- get google users -----------------
      var gUsersRef = ref.child("googleUsers");
      $scope.googleUsers = $firebaseArray(gUsersRef);

      // -------- sort events ---------------------
      $scope.sortDate = function (event) {
        var date = new Date(event.start.dateTime);
        return -date;
      };

      $scope.sortDateAscending = function (event) {
        var date = new Date(event.start.dateTime);
        return date;
      };

      $scope.upcomingEvents = function (event) {
        var date = new Date();
        var eventDate = new Date(event.start.dateTime);
        eventDate.setHours(eventDate.getHours() + 1)
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
          $scope.signedIn = true
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
          $scope.signedIn = false
        }
      });

      $scope.signInAlert = function () {
        var alertPopup = $ionicPopup.show({
          title: 'You need to sign in',
          template: 'To see your profile sign in'
        });
        $timeout(function () {
          alertPopup.close();
        }, 500);
      }

      $scope.profSettings = function () {

        if ($scope.signedIn) {
          $state.go("profileSettings");
        } else {
          console.log("Tried seeing profile without being logged in!!");
          $scope.signInAlert();
        }


      }

      var ref = firebase.database().ref();

      var gUserRef = ref.child("googleUsers"); //get users
      $scope.googleUsers = $firebaseArray(gUserRef);

      //----------------Back Buttons -------------------------
      $scope.pageBackButton = function () {
        $state.go("dashboard");
      }

      $scope.eventBackButton = function () {
        $state.go("calendar");
      }

      $scope.adminBackButton = function () {
        $state.go("eventSettings");
      }

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





    }
  ]);
});
