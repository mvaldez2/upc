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
      $scope.data = $firebaseArray(ref);


      // ----------------- authentication for google calendar ------------------
      $scope.authenticate = function() {
        return gapi.auth2.getAuthInstance()
            .signIn({scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar"})
            .then(function() { console.log("Sign-in successful"); },
                  function(err) { console.error("Error signing in", err); });
      }
      $scope.loadClient = function() {
        return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/calendar/v3/rest")
            .then(function() { console.log("GAPI client loaded for API"); },
                  function(err) { console.error("Error loading GAPI client for API", err); });
      }


      // ----------- Get calendar and add to database ------------------------
      var calRef = ref.child("calendar/events");
      var cal = $firebaseArray(calRef);
      $scope.cal = $firebaseArray(calRef);
      var mycalRef = ref.child("myCalendar/events");
      var mycal = $firebaseArray(mycalRef);
      $scope.mycal = $firebaseArray(mycalRef);

      var today = new Date();
      var day = today.getDate() + 1;
      var month = today.getMonth() + 1;
      if (day < 10) {
        day = '0' + day;
      }
      if (month < 10) {
        month = '0' + month;
      }
      var db = firebase.database();

      //---------------get most recent events ---------

      $scope.sync = function() {
        $scope.calendarEvents =  gapi.client.calendar.events.list({
          "calendarId": "upc@valpo.edu",
          "maxResults": 20,
          "orderBy": "startTime",
          "singleEvents": true,
          "timeMin": "2019-"+month.toString()+"-"+day.toString()+"T00:00:00+10:00"})
        .then(function(response) {
          console.log("Response", response);
          $scope.upcEvents = response.result.items;
          console.log( $scope.upcEvents)
          db.ref().child('calendar').set({
            events: $scope.upcEvents
          });
        }, function(err) { console.error("Execute error", err); });


      }


      gapi.load("client:auth2", function() {
        gapi.auth2.init({client_id: '188526661745-1qvjgbd02e62kjg1it4tj05p14rveb21.apps.googleusercontent.com'});
      });

      GAPI.init().then(function() {
      }, function(){ console.log('Something went wrong yes?'); });


      // ----------------Login and get calendar info ---------------------------
      var gUserRef = ref.child("googleUsers");
      var googleUsers = $firebaseArray(gUserRef);
      $scope.googleUsers = $firebaseArray(gUserRef);

      
      $scope.login2 = function() {
        $scope.loadClient();
        gapi.auth2.getAuthInstance().signIn({scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar"})
            .then(function() {
              console.log("Sign-in successful");
              firebase.auth().onAuthStateChanged(function(user) {
                var googleUser = gapi.auth2.getAuthInstance().currentUser.get()
                $scope.isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get()
                var googleProfile = googleUser.getBasicProfile()
                $scope.googleProfile = googleUser.getBasicProfile()
                firebase.database().ref().child("googleUsers").orderByChild("email")
                  .equalTo(googleProfile.getEmail()).on("value", function(snapshot) {
                  if (snapshot.exists()) {
                    console.log("exists");
                    console.log(googleProfile.getName());
                    console.log(googleProfile.getId());
                    console.log(googleProfile);
                    console.log($scope.isSignedIn);

                  }else{ //if not create new user
                    console.log("doesn't exist");
                    gUserRef.child(googleProfile.getId()).set({
                    name: googleProfile.getName(),
                    email: googleProfile.getEmail(),
                    photoUrl: googleProfile.getImageUrl(),
                    uid: googleProfile.getId(),
                    admin: false,}, onComplete);
                  }
                });
            });
          }).then(function(){
            firebase.auth().onAuthStateChanged(function(user) {
              var googleUser = gapi.auth2.getAuthInstance().currentUser.get();
              var googleProfile = googleUser.getBasicProfile();
              var userId = googleUser.getId();
              console.log(userId);

              var userEventRef = ref.child("googleUsers/"+ userId+ "/events");
              var userEvents = $firebaseArray(userEventRef);
              $scope.gUserEvents = $firebaseArray(ref.child('googleUsers/'+ userId+ '/events'));
              console.log(  $scope.gUserEvents);


            });


            $scope.sync();
            $state.go("dashboard");
          });

    }



      //events database


      var onComplete = function(error) {
        if (error) {
            console.log('Failed');
        } else {
            console.log('Completed');
        }
      };






      $scope.signOff = function () {
        $firebaseAuth().$signOut()

        .then(function() {
           console.log('Signout Succesfull')
           $state.go("signIn")

        }, function(error) {
           console.log('Signout Failed')
        });
      }



      //disable back button
      /*$ionicHistory.nextViewOptions({
        disableBack: true,
        disableAnimate: false,
        historyRoot: true,
        cache: false

      });*/



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



    console.log(  $scope.userEvents);


    }
  ]);
});

 //names database
      /*var namesRef = ref.child("names");
      var names = $firebaseArray(namesRef);
      $scope.words = $firebaseArray(ref.child('names'));

      $scope.submit = function(first_name, last_name) {
        names.$add({
         first_name: first_name,
         last_name: last_name
        }).then(function(ref) {
          var id = ref.key;
          console.log("added record with id " + id);
          names.$indexFor(id); // returns location in the array
        });
      }

      $scope.show = function(){
        names.$loaded()
          .then(function(){
            angular.forEach(names, function(name) {
              console.log(name);

          })
        });
      } */
