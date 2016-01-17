angular
    .module('incluso.programa.dashboard', [])
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

            var _loadedResources = false;
            var _pageLoaded = false;

            _httpFactory = $http;
            _timeout = $timeout;
            $scope.Math = window.Math;
            $scope.$emit('ShowPreloader'); //show preloader

            var activity_identifier = "0000";
            
            
            var getContentResourcesInterval = $interval(function() {
                if(_loadedDrupalResources) {
                    $interval.cancel(getContentResourcesInterval);
                    getContentResources(activity_identifier);
                }
            }, 1000);

            if (!_getItem("userId")) {
                $location.path('/');
                return "";
            }

            if (_tutorial) {
                setTimeout(function(){ 
                    $location.path('/ProgramaDashboard');
                    $route.reload();
                }, 2000);
                _tutorial = false;
            }

            $scope.stageProgress = 0;

            $scope.user = moodleFactory.Services.GetCacheJson("CurrentUser");//load current user from local storage
            $scope.user.profileimageurl = $scope.user.profileimageurl + "?rnd=" + new Date().getTime();
            $scope.profile = moodleFactory.Services.GetCacheJson("Perfil/" + $scope.user.id); //profile is not used in this page, it is only used for stars.

            if ($scope.profile && $scope.profile.stars) {console.log("Yeah!!");
                //the first time the user logs in to the application, the stars come from CurrentUser (authentication service)
                //the entire application updates profile.stars.  The cached version of stars should be read from profile (if it exists)
                //Update "CurrentUser" properties: "rank" & "stars", to be in sync with "Perfil/nnn".
                //WARNING: Within "CurrentUser", the "stars" property value is a string: "stars" : "350",
                //         but within "Perfil/nnn", the "stars" property value is an integer: "stars" : 350.
                $scope.user.rank = $scope.profile.rank;
                $scope.user.stars = $scope.profile.stars; //Saved as an integer.

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
                }, function () {
                });
            };

            $scope.playVideo = function (videoAddress, videoName) {
                playVideo(videoAddress, videoName);
            };

            //Loads UserCourse data from server
            function getDataAsync() {
                
                $timeout(function () {
                    $scope.validateConnection(function () {
                        moodleFactory.Services.GetAsyncUserCourse(_getItem("userId"), getDataAsyncCallback, errorCallback);
                    }, function () {
                        
                        $scope.usercourse = JSON.parse(localStorage.getItem("usercourse"));
                        $scope.course = JSON.parse(localStorage.getItem("course"));
                        $scope.currentStage = getCurrentStage();                    
                        _setLocalStorageItem("currentStage", $scope.currentStage);
                        
                        getImageOrDefault("assets/avatar/avatar_" + _getItem("userId") + ".png", $scope.user.profileimageurl, function(niceImageUrl) {
                            $scope.user.profileimageurl = niceImageUrl;
                        });

                        var leaderboard = JSON.parse(localStorage.getItem("leaderboard"));
                        for(var lb = 0; lb < leaderboard.length; lb++) {
                            getImageOrDefault("assets/avatar/avatar_" + _getItem("userId") + ".png", leaderboard[lb].profileimageurl, function(niceImageUrl) { 
                                leaderboard[lb].profileimageurl = niceImageUrl;
                            });
                        }

                        $scope.course.leaderboard = leaderboard;
                        
                        _pageLoaded = true;
                        if (_loadedResources && _pageLoaded) {
                            $scope.$emit('HidePreloader')
                        }

                        if (!$scope.profile.termsAndConditions) {
                            $scope.openTermsModal();
                            $scope.navigateTo('TermsOfUse');
                        }

                    });
                    
                }, 1000);
            }

            //Callback function for UserCourse call
            function getDataAsyncCallback() {
                //Load UserCourse structure into model
                $scope.usercourse = JSON.parse(localStorage.getItem("usercourse"));
                getUserNotifications($scope.usercourse.courseid);
                //Load Course from server
                moodleFactory.Services.GetAsyncCourse($scope.usercourse.courseid, function () {
                    $scope.course = JSON.parse(localStorage.getItem("course"));                    
                    $scope.currentStage = getCurrentStage();                    
                    _setLocalStorageItem("currentStage", $scope.currentStage);

                    moodleFactory.Services.GetAsyncLeaderboard($scope.usercourse.courseid, $scope.user.token, function () {
                        $scope.course.leaderboard = JSON.parse(localStorage.getItem("leaderboard"));
                        
                        var images = [];
                        for(var i = 0; i < $scope.course.leaderboard.length; i++) {
                            var topuser = $scope.course.leaderboard[i];
                            
                            images[i] = { 
                                'path': "assets/avatar",
                                'name': "avatar_" + topuser.userId + ".png",
                                'downloadLink': topuser.profileimageurl
                            };
                        }
                        
                        saveLocalImages(images);

                        moodleFactory.Services.GetAsyncProfile(_getItem("userId"), $scope.user.token, function () {

                            $scope.profile = JSON.parse(localStorage.getItem("Perfil/" + localStorage.getItem("userId")));
                            
                            saveLocalImages([{ 
                                'path': "assets/avatar",
                                'name': "avatar_" + $scope.profile.id + ".png",
                                'downloadLink': $scope.profile.profileimageurl
                            }]);

                            _pageLoaded = true;
                            if (_loadedResources && _pageLoaded) {
                                $scope.$emit('HidePreloader')
                            }

                            if (!$scope.profile.termsAndConditions) {
                                $scope.openTermsModal();
                                $scope.navigateTo('TermsOfUse');
                            }

                            for(var lb = 0; lb < $scope.course.leaderboard.length; lb++) {

                                if ($scope.course.leaderboard[lb].userId === parseInt(currentUserID, 10)) {//If I AM within the Leaderboard...
                                    $scope.profile.rank = $scope.course.leaderboard[lb].rank;  //Take the rank from Leaderboard,
                                    $scope.user.rank = $scope.course.leaderboard[lb].rank;  //Update rank in template,

                                    _setLocalStorageJsonItem("Perfil/" + currentUserID, $scope.profile);  //Update rank in Perfil/nnn in LS,
                                    _setLocalStorageJsonItem("CurrentUser", $scope.user);  //Update rank in CurrentUser in LS.
                                }
                            }

                            $scope.profile.stars = parseInt($scope.profile.stars, 10);
                            _setLocalStorageJsonItem("Perfil/" + $scope.user.id,  $scope.profile);
                            $scope.profile = null;   //profile is not used in this page, it is only used for stars

                        }, function () {
                        }, true);
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

            function errorCallback(data) {
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

            function getUserNotifications(courseid) {
                var courseId = courseid;
                var userId = _getItem("userId");
                moodleFactory.Services.GetUserNotification(userId, courseId, $scope.user.token, function () {
                    getUserChat();
                }, errorCallback, true);
            }

            function getUserChat(callback) {
                moodleFactory.Services.GetUserChat(_getItem("userId"), $scope.user.token, function () {
                    if (callback) callback();
                    var chat = JSON.parse(localStorage.getItem('userChat'));
                    var userId = localStorage.getItem("userId");
                    var messagesFlow = [];
                    var messagesInterchange = 0;
                    var messagesToRead = _getItem("currentStage") * 2;

                    var chatAmount = _.countBy(chat, function (messages) {
                        messagesFlow.push(messages.messagesenderid != userId);
                        return messages.messagesenderid != userId;
                    });

                    _.each(messagesFlow, function (m, i) {
                        if (i > 0 && m && m != messagesFlow[i - 1]) {
                            messagesInterchange++;
                        }
                    });

                    if (chatAmount.true != localStorage.getItem('chatAmountRead')) {
                        _setLocalStorageItem('chatRead', "false");
                    }

                    _setLocalStorageItem('chatAmountRead', chatAmount.true);

                    getUserStarsByPoints();
                    getUserLikes();

                }, errorCallback, false);
            }

            function getUserLikes() {
                moodleFactory.Services.CountLikesByUser($scope.usercourse.courseid,  $scope.user.token, function (data) {
                },function(){},true);
            }
            
            function getUserStarsByPoints() {

                moodleFactory.Services.GetAsyncStars($scope.user.id, $scope.user.token, function (dataStars) {
                    if (dataStars.length > 0) {
                        localStorage.setItem("userStars", JSON.stringify(dataStars));
                    }
                }, function () {
                    $scope.activitiesCompleted = [];
                }, true);
            }

            //Open Welcome Message modal
            $scope.openModal = function (size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'programWelcome.html',
                    controller: function ($scope, $modalInstance) {
                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    },
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

                }, function () {
                    _loadedResources = true;
                    if (_loadedResources && _pageLoaded) {
                        $scope.$emit('HidePreloader');
                    }
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
    });
