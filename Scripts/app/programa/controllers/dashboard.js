angular
   .module('incluso.programa.dashboard', ['ngSanitize'])
   .controller('programaDashboardController', [
       '$q',
       '$scope',
       '$location',
       '$routeParams',
       '$timeout',
       '$rootScope',
       '$http',
       '$modal',
       '$interval',
       '$route',
       function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal, $interval, $route) {
           $rootScope.dontShowRobot = false;
           var _loadedResources = false;
           var _pageLoaded = false;

           _httpFactory = $http;
           _timeout = $timeout;
           $scope.Math = window.Math;

           if (!$rootScope.loading) {
               $scope.$emit('ShowPreloader'); //show preloader
           }

           $scope.profileImage = "";
           $scope.UserAtleaderboardImage = "";

           var activity_identifier = "0000";
           var currentUserProfile = getCurrentUserProfile();

           var getContentResourcesInterval = $interval(function () {

               if (_loadedDrupalResourcesWithErrors) {
                   $interval.cancel(getContentResourcesInterval);
                   $scope.$emit('HidePreloader');
                   localStorage.setItem("offlineConnection", "offline");
                   $timeout(function () {
                       $location.path('/');
                   }, 1000);
               }

               if (_loadedDrupalResources) {
                   $interval.cancel(getContentResourcesInterval);
                   getContentResources(activity_identifier);
               }
           }, 1000);

           if (!_getItem("userId") && !_getItem("CurrentUser")) {
               $location.path('/');
               return "";
           }

           if (_tutorial) {
               $timeout(function () {
                   $location.path('/ProgramaDashboard');
                   $route.reload();
               }, 2000);
               _tutorial = false;
           }

           $scope.stageProgress = 0;

           $scope.user = moodleFactory.Services.GetCacheJson("CurrentUser");  //load current user from local storage
           if ($scope.user) {
               var imageProfLead = [{ 'path': "assets/avatar", 'name': "leaderboard_" + $scope.user.userId + ".png", 'downloadLink': $scope.user.profileimageurlsmall.replace("f2", "f1") }];
               saveLeaderboardImage(imageProfLead);

           }

           if ($scope.user.retoMultipleAvatar) {
               $scope.profileImage = $scope.user.retoMultipleAvatar;
               $scope.user.base64Image = $scope.user.retoMultipleAvatar;
           } else if ($scope.user.base64Image) {
               $scope.profileImage = $scope.user.base64Image;
               if ($scope.user.LeaderboardUserbase64Image) {
                   $scope.LeaderboardUserprofileImage = $scope.user.LeaderboardUserbase64Image;
               }
           } else {
               console.log("it does not exists");
               //Download profile Images
               $scope.profileImage = "assets/avatar/default.png";
               var imageProf = [{ 'path': "assets/avatar", 'name': "avatar_" + $scope.user.userId + ".png", 'downloadLink': $scope.user.profileimageurl }];
               saveLocalImages(imageProf);
           };

           if ($scope.user.haspicture != "1") {
               $location.path('/Tutorial');
           }

           var profileData = moodleFactory.Services.GetCacheJson("Perfil/" + $scope.user.id); //profile is only used to get updated stars & rank.
           if (profileData && profileData.stars) {
               //the first time the user logs in to the application, the stars come from CurrentUser (authentication service)
               //the entire application updates profile.stars.  The cached version of stars should be read from profile (if it exists)
               //Update "CurrentUser" properties: "rank" & "stars", to be in sync with "Perfil/nnn".
               //WARNING: Within "CurrentUser", the "stars" property value is a string: "stars" : "350",
               //         but within "Perfil/nnn", the "stars" property value is an integer: "stars" : 350.
               $scope.user.rank = profileData.rank;
               $scope.user.stars = parseInt(profileData.stars, 10); //Saved as an integer.

               _setLocalStorageJsonItem("CurrentUser", $scope.user);  //Finally, update "CurrentUser" in LS.
           }

           $scope.resetActivityBlockedStatus();//Copies last version of activity blocked status into model variable
           $scope.setToolbar($location.$$path, "Misión Incluso"); //set global toolbar properties

           $rootScope.showFooter = true;
           $rootScope.showFooterRocks = true;
           $rootScope.showStage1Footer = false;
           $rootScope.showStage2Footer = false;
           $rootScope.showStage3Footer = false;
           var currentUserID = localStorage.getItem("userId");

           try {//Get stage from local storage

               if (moodleFactory.Services.GetCacheObject("stage")) {
                   $scope.stage = JSON.parse(moodleFactory.Services.GetCacheObject("stage"));
               } else {
                   $scope.stage = {};
               }
           }
           catch (e) {
               $scope.$emit('scrollTop');
           }

           $(".navbar").removeClass("etapa-uno");
           getDataAsync();

           $scope.logout = function () {
               logout($http, $scope, $location);
           };

           function getCurrentUserProfile() {

               var leaderboard = JSON.parse(localStorage.getItem("leaderboard"));
               var currentUserProfileTemp = null;

               if (leaderboard) {
                   for (var i = 0; i < leaderboard.length; i++) {
                       var topuser = leaderboard[i];

                       if (topuser.userId == Number(_getItem("userId"))) {
                           currentUserProfileTemp = topuser;
                           break;
                       }
                   }
               }

               return currentUserProfileTemp;
           }

           $scope.navigateToStage = function () {
               //Check if first time with course
               if ($scope.usercourse.firsttime) { // 1 (true) : it is first time; 0 : it is not firsttime
                   $scope.openModal();
                   //Update firsttime value
                   $scope.updateProgramFirstTime();
               }

               //Update current stage
               var stage = _getItem("currentStage");
               if (stage) {
                   $scope.currentStage = stage;
               } else {
                   $scope.currentStage = getCurrentStage();
               }

               //redirect user to stage 1 dashboard after closing modal
               var zone = '/ZonaDeVuelo/Dashboard/';
               var activityId = 1001;
               //Depend of section is the zone to redirect
               if ($scope.currentStage == 2) {
                   zone = '/ZonaDeNavegacion/Dashboard/';
                   activityId = 2001;
               }
               if ($scope.currentStage == 3) {
                   zone = '/ZonaDeAterrizaje/Dashboard/';
                   activityId = 3101;
               }

               $scope.navigateTo(zone + $scope.currentStage + '/0', false, activityId);
           };

           //Updates firsttime flag for program in model, localstorage and server
           $scope.updateProgramFirstTime = function () {
               //Update model
               $scope.usercourse.firsttime = 0;
               //Update local storage
               var userCourse = moodleFactory.Services.GetCacheJson("usercourse");
               if (userCourse != {}) {
                   userCourse.firsttime = 0;
                   _setLocalStorageJsonItem("usercourse", userCourse);
               }
               //Update back-end
               var dataModel = {
                   firstTime: $scope.usercourse.firsttime,
                   courseId: $scope.usercourse.courseid
               };

               moodleFactory.Services.PutAsyncFirstTimeInfo(_getItem("userId"), dataModel, function () {
               }, function (obj) {
                   //-
                   $scope.$emit('HidePreloader');

                   if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                       $timeout(function () {
                           $location.path('/Offline'); //This behavior could change
                       }, 1000);
                   } else {//Another kind of Error happened
                       $timeout(function () {
                           $location.path('/Offline');
                       }, 1000);
                   }
                   //-
               });
           };

           $scope.playVideo = function (videoAddress, videoName) {
               playVideo(videoAddress, videoName);
           };

           //Loads UserCourse data from server
           function getDataAsync() {

               $timeout(function () {
                   $scope.validateConnection(function () {
                       //Get the 'usercourse' object
                       moodleFactory.Services.GetAsyncUserCourse(_getItem("userId"), getDataAsyncCallback, errorCallback, null, true);
                   }, function () {
                       $scope.usercourse = JSON.parse(localStorage.getItem("usercourse"));
                       $scope.course = JSON.parse(localStorage.getItem("course"));
                       $scope.currentStage = getCurrentStage();
                       _setLocalStorageItem("currentStage", $scope.currentStage);
                       var leaderboard = JSON.parse(localStorage.getItem("leaderboard"));
                       for (var lb = 0; lb < leaderboard.length; lb++) {

                           //getImageOrDefault("assets/avatar/avatar_" + _getItem("userId") + ".png", leaderboard[lb].profileimageurl, function (niceImageUrl) {
                           //    leaderboard[lb].profileimageurl = niceImageUrl;
                           //});

                           if (leaderboard[lb].userId === parseInt(currentUserID, 10)) {
                               leaderboard[lb].stars = $scope.user.stars;
                               leaderboard[lb].profileimageurl = $scope.profileImage;
                           }

                       }

                       $scope.course.leaderboard = leaderboard;

                       _pageLoaded = true;
                       $timeout(function () {
                           if (_loadedResources && _pageLoaded && !$rootScope.loaderForLogin) {
                               $scope.$emit('HidePreloader');
                           }
                       }, 3000);

                   });

               }, 1000);
           }

           /* params:
  images - array of objects { path, name, downloadLink }
*/
           function saveLocalImages(images) {
               _forceUpdateConnectionStatus(function () {
                   cordova.exec(function (data) {
                       if (data.files[0] && data.files[0].imageB64) {
                           $scope.profileImage = 'data:image/png;base64,' + data.files[0].imageB64;
                           $scope.user.base64Image = 'data:image/png;base64,' + data.files[0].imageB64;
                           localStorage.setItem("CurrentUser", JSON.stringify($scope.user));
                       };
                   }, function () { }, "CallToAndroid", "downloadPictures", [JSON.stringify(images)]);
               }, function () { });

           }

           function saveLeaderboardImage(images) {
               _forceUpdateConnectionStatus(function () {
                   cordova.exec(function (data) {
                       if (data.files[0] && data.files[0].imageB64) {
                           $scope.LeaderboardUserprofileImage = 'data:image/png;base64,' + data.files[0].imageB64;
                           $scope.user.LeaderboardUserbase64Image = 'data:image/png;base64,' + data.files[0].imageB64;
                           localStorage.setItem("CurrentUserAtLeaderBoard", JSON.stringify($scope.user));
                       };
                   }, function () { }, "CallToAndroid", "downloadPictures", [JSON.stringify(images)]);
               }, function () { });
           }

           //Callback function for UserCourse call
           function getDataAsyncCallback() {
               //Load UserCourse structure into model
               $scope.usercourse = JSON.parse(localStorage.getItem("usercourse"));
               getUserStarsByPoints();
               getUserLikes();
               getUserChat();
               //Load Course from server
               moodleFactory.Services.GetAsyncCourse($scope.usercourse.courseid, function () {
                   $scope.course = JSON.parse(localStorage.getItem("course"));
                   $scope.currentStage = getCurrentStage();
                   _setLocalStorageItem("currentStage", $scope.currentStage);

                   moodleFactory.Services.GetAsyncLeaderboard($scope.usercourse.courseid, $scope.user.token, function () {
                       $scope.incLoadedItem(); //11
                       $scope.course.leaderboard = JSON.parse(localStorage.getItem("leaderboard"));
                       currentUserProfile = getCurrentUserProfile();

                       var profile = JSON.parse(localStorage.getItem("Perfil/" + localStorage.getItem("userId")));

                       if (profile) {
                           profileCallback();
                       } else {
                           moodleFactory.Services.GetAsyncProfile(_getItem("userId"), $scope.user.token, profileCallback, errorCallback, true);
                       }

                       function profileCallback() {
                           $scope.incLoadedItem(); //14
                           var profile = JSON.parse(localStorage.getItem("Perfil/" + localStorage.getItem("userId")));

                           moodleFactory.Services.GetAsyncAvatar($scope.user.userId, $scope.user.token, function () {
                               $scope.incLoadedItem(); //16
                           }, errorCallback, true);

                           _pageLoaded = true;
                           if (_loadedResources && _pageLoaded && !$rootScope.loaderForLogin) {
                               $timeout(function () {
                                   $scope.$emit('HidePreloader');
                               }, 1000);
                           }

                           if (!profile.termsAndConditions) {
                               $scope.openTermsModal();
                               $scope.navigateTo('TermsOfUse');
                           }

                           $scope.user.firstname = profile.firstname;
                           $scope.user.rank = profile.rank;
                           $scope.user.stars = parseInt(profile.stars, 10); //Saved as an integer.

                           _setLocalStorageJsonItem("CurrentUser", $scope.user);  //Finally, update "CurrentUser" in LS.

                           for (var lb = 0; lb < $scope.course.leaderboard.length; lb++) {

                               if ($scope.course.leaderboard[lb].userId === parseInt(currentUserID, 10)) { //If I AM within the Leaderboard...                                    
                                   var imageProfLeaderboard = [{ 'path': "assets/avatar", 'name': "leaderboard_" + $scope.user.userId + ".png", 'downloadLink': $scope.user.profileimageurlsmall.replace("f2", "f1") }];
                                   if ($scope.LeaderboardUserprofileImage) {
                                       $scope.LeaderboardUserprofileImage = $scope.user.LeaderboardUserbase64Image;
                                       $scope.course.leaderboard[lb].profileimageurl = $scope.LeaderboardUserprofileImage; // Take the leaderboard image from the updated profileImage.                                 
                                   }
                                   profile.rank = $scope.course.leaderboard[lb].rank;  //Take the rank from Leaderboard,
                                   profile.stars = parseInt($scope.course.leaderboard[lb].stars, 10);
                                   $scope.user.rank = $scope.course.leaderboard[lb].rank;  //Update rank in template,
                                   $scope.user.stars = $scope.course.leaderboard[lb].stars;  //Update stars in template,                                   
                                   _setLocalStorageJsonItem("Perfil/" + _getItem("userId"), profile);  //Update rank in Perfil/nnn in LS,
                                   _setLocalStorageJsonItem("CurrentUser", $scope.user);  //Update rank in CurrentUser in LS.
                                   break;
                               }
                           }
                       }

                   }, errorCallback, true);
               }, errorCallback);

               calculateTotalProgress();
           }


           function calculateTotalProgress() {
               var currentStage = _getItem("currentStage");
               if (!currentStage) {
                   currentStage = getCurrentStage();
               }
               currentStage = currentStage - 1;
               var usercourses = $scope.usercourse;

               var stageProgressBuffer = 0;
               var stageTotalActivities = 0; //Attainment of user in the current Stage
               var stageChallengesCount = usercourses.stages[currentStage].challenges.length;

               var i, j, k;
               for (i = 0; i < stageChallengesCount; i++) {
                   var challenge = usercourses.stages[currentStage].challenges[i];
                   var challengeActivitiesCount = challenge.activities.length;
                   for (j = 0; j < challengeActivitiesCount; j++) {
                       var activity = challenge.activities[j];
                       stageProgressBuffer += activity.status;
                       stageTotalActivities++;
                   }
               }

               $scope.stageProgress = Math.floor((stageProgressBuffer / stageTotalActivities) * 100);
           }

           function errorCallback(obj) {

               //-
               if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                   progressBar.set(0); //For Login Preloader
                   localStorage.setItem("offlineConnection", "timeout");  //For login can know what happened
                   console.log("TIMEOUT DETECTED...");
               }
               //-

               if (localStorage.getItem("course") == null) {
                   $scope.$emit('HidePreloader');
                   localStorage.setItem("offlineConnection", "offline");
                   $location.path('/');
               } else if (localStorage.getItem("leaderboard") == null) {
                   $scope.$emit('HidePreloader');
                   localStorage.setItem("offlineConnection", "offline");
                   $location.path('/');
               } else if (localStorage.getItem("Perfil/" + localStorage.getItem("userId")) == null) {
                   $scope.$emit('HidePreloader');
                   localStorage.setItem("offlineConnection", "offline");
                   $location.path('/');
               } else if (localStorage.getItem("offlineConnection") == "timeout") {
                   $scope.$emit('HidePreloader');
                   $location.path('/');
               }

               _pageLoaded = true;

               if (_loadedResources && _pageLoaded) {
                   $scope.$emit('HidePreloader')
               }

               $scope.$emit('scrollTop'); //- scroll
           }

           function getCurrentStage() {
               var currentStage = 1;
               var userCourse = moodleFactory.Services.GetCacheJson("usercourse");
               for (var i = 0; i < userCourse.stages.length; i++) {
                   var uc = userCourse.stages[i];
                   _setLocalStorageJsonItem("stage", uc);
                   $scope.stage = uc;

                   if (uc.status === 0) {
                       break;
                   }

                   currentStage++;
               }

               if (currentStage == userCourse.stages.length) {
                   currentStage--;
               }
               return currentStage;
           }

           function getUserStarsByPoints() {

               moodleFactory.Services.GetAsyncStars($scope.user.id, $scope.user.token, function (dataStars) {
                   $scope.incLoadedItem(); //12
                   if (dataStars.length > 0) {
                       localStorage.setItem("userStars", JSON.stringify(dataStars));
                   }
               }, function (obj) {
                   $scope.activitiesCompleted = [];
                   errorCallback(obj);
               }, true);
           }

           function getUserChat() {
               moodleFactory.Services.GetUserChat($scope.user.userId, $scope.user.token, function () {

                   var messages = localStorage.getItem('userChat/' + $scope.user.userId); //Get all messages posted.

                   if (messages) {
                       messages = JSON.parse(messages);
                   } else {
                       messages = [];
                   }

                   var numMessages = localStorage.getItem('numMessages/' + $scope.user.userId); //Previous count of Messages

                   if (numMessages === null) {
                       numMessages = 0;
                       _setLocalStorageItem("numMessages/" + $scope.user.userId, numMessages);
                   } else {

                       numMessages = parseInt(numMessages, 10);

                       if (messages.length > numMessages) {//The Couch Posted Something...
                           _setLocalStorageItem('chatRead/' + $scope.user.userId, "false"); //Turn on Chat Bubble
                           _setLocalStorageItem('numMessages/' + $scope.user.userId, messages.length);  //Update count of Messages
                       }
                   }

               }, errorCallback, true);
           }

           function getUserLikes() {
               moodleFactory.Services.CountLikesByUser($scope.usercourse.courseid, $scope.user.token, function (data) {
                   $scope.incLoadedItem(); //13

                   var currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
                   if (currentUser) {
                       moodleFactory.Services.GetProfileCatalogs(currentUser.token, function (data) {
                           $scope.incLoadedItem(); //15
                           //getProfilePoints(currentUser);
                           var userCourse = JSON.parse(localStorage.getItem('usercourse'));

                           moodleFactory.Services.GetProfilePoints(currentUser.userId, userCourse.courseid, currentUser.token, function (data) {

                           }, errorCallback, true);

                       }, errorCallback, true);
                   }

               }, errorCallback, true);
           }

           //Open Welcome Message modal
           $scope.openModal = function (size) {
               var modalInstance = $modal.open({
                   animation: $scope.animationsEnabled,
                   templateUrl: 'programWelcome.html',
                   controller: 'WelcomeAboard',
                   size: size,
                   windowClass: 'user-help-modal dashboard-programa'
               });
           };

           function getContentResources(activityIdentifierId) {

               drupalFactory.Services.GetContent(activityIdentifierId, function (data, key) {
                   _loadedResources = true;
                   $scope.contentResources = data.node;
                   if (_loadedResources && _pageLoaded) {
                       $scope.$emit('HidePreloader');
                   }

               }, function (obj) {
                   _loadedResources = true;
                   if (_loadedResources && _pageLoaded) {
                       $scope.$emit('HidePreloader');
                   }
                   //-
                   $scope.$emit('HidePreloader');

                   if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                       $timeout(function () {
                           $location.path('/Offline'); //This behavior could change
                       }, 1000);
                   } else {//Another kind of Error happened
                       $timeout(function () {
                           $location.path('/Offline');
                       }, 1000);
                   }
                   //-
               }, false);

           }

           $scope.openTermsModal = function (size) {
               var modalInstance = $modal.open({
                   animation: $scope.animationsEnabled,
                   templateUrl: 'changeOfTerms.html',
                   controller: function ($scope, $modalInstance) {
                       drupalFactory.Services.GetContent('TermsAndConditions', function (data, key) {
                           $scope.termsContent = data.node;
                       }, function () {
                       }, false);
                       $scope.cancel = function () {
                           $modalInstance.dismiss('cancel');
                       };
                   },
                   size: size,
                   windowClass: 'user-help-modal dashboard-programa'
               });
           };

       }])
   .controller('videoCollapsiblePanelController', function ($scope) {
       $scope.isCollapsed = false;
   })
   .controller('WelcomeAboard', function ($scope, $modalInstance) {//To show Inclubot from CONTINUAR MISION button
       drupalFactory.Services.GetContent("robot-inclubot", function (data, key) {

           if (data.node != null) {
               $scope.title = data.node.titulo;
               $scope.message = data.node.mensaje;
           }
       }, function () { }, false);

       $scope.cancel = function () {
           $scope.$emit('ShowPreloader');
           $modalInstance.dismiss('cancel');
       };
   });