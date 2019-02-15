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
    'GAPI',
    function ($scope, $ionicModal, $ionicScrollDelegate, $sce, pageService, $firebaseObject,
      $firebaseAuth, $firebaseArray, $window, $state, $ionicHistory, $ionicPopup, Calendar, Youtube, GAPI) {

      $scope.ready = true;
      var ref = firebase.database().ref();

      // ---------------- Get calendar  ------------------------
      var calRef = ref.child("calendar/events");
      var cal = $firebaseArray(calRef);
      console.log(cal);
      $scope.cal = $firebaseArray(calRef);
      var mycalRef = ref.child("myCalendar/events");
      var mycal = $firebaseArray(mycalRef);
      $scope.mycal = $firebaseArray(mycalRef);


      // -------- get google users -----------------
      var gUserRef = ref.child("googleUsers");
      var googleUsers = $firebaseArray(gUserRef);
      $scope.googleUsers = $firebaseArray(gUserRef);

      // ------- formats calendar dates -----------
      $scope.dateFormat2 = function(place){
        var eventRef = firebase.database().ref('calendar/events/' + place.$id);
        eventRef.on('value', function(snapshot) {
          $scope.dateTime = snapshot.val().start.dateTime
          $scope.start =  snapshot.val().start.date
          $scope.end =  snapshot.val().end.date
        });
        var date = new Date($scope.dateTime);
        var dayOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',  hour: 'numeric', minute: 'numeric' };
        var finalDate = date.toLocaleDateString("en-US", dayOptions);
        if (finalDate == 'Invalid Date'){
          date = new Date($scope.start);
          var end = new Date($scope.end);
          var dayOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
          console.log("date: "+date);
          var startDate = date.toLocaleDateString("en-US", dayOptions);
          var endDate = end.toLocaleDateString("en-US", dayOptions);
          finalDate = startDate +" - " + endDate;

        }
        return finalDate;

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
            default:
                return false;
        }
      }

      $scope.signOff = function () {
        $firebaseAuth().$signOut()

        .then(function() {
           console.log('Signout Succesfull')
           $state.go("signIn")

        }, function(error) {
           console.log('Signout Failed')
        });
      }

      //might be used for reload after submitting of something
      $scope.reloadRoute = function() {
        $window.location.reload();
      }



      $ionicModal.fromTemplateUrl('app/templates/page.html', {
        scope: $scope
      }).then(function (modal) {
        $scope.modal = modal;
      });

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

      GAPI.init().then(function() {
      }, function(){ console.log('Something went wrong yes?'); });







    }
  ]);
});
