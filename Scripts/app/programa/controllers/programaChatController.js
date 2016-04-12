angular
    .module('incluso.programa.chatcontroller', ['ngSanitize'])
    .controller('programaChatController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$anchorScroll',
        '$modal',
        'SignalRFactory',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal, SignalRFactory) {
            $scope.$emit('ShowPreloader');
            var _pageLoaded = true;
            $scope.validateConnection(initController, offlineCallback);

            function offlineCallback() {
                $timeout(function () {
                    $location.path("/Offline");
                }, 1000);
            }

            function initController() {
                console.log("*************  CHAT  *****************");
                _timeout = $timeout;
                _httpFactory = $http;
                $rootScope.showFooter = false;
                $rootScope.showFooterRocks = false;
                $rootScope.showStage1Footer = false;
                $rootScope.showStage2Footer = false;
                $rootScope.showStage3Footer = false;

                var currentUser = JSON.parse(localStorage.getItem('CurrentUser'));
                var _startedActivityCabinaDeSoporte = JSON.parse(localStorage.getItem("startedActivityCabinaDeSoporte/" + currentUser.userId));
                var userCurrentStage = localStorage.getItem("currentStage");
                var messagesToRead = userCurrentStage * 2;
                $scope.senderId = currentUser.userId;
                $scope.currentMessage = "";
                $scope.setToolbar($location.$$path, "Cabina de Soporte");

                $scope.isDisabled = true;
                var _usercourse = JSON.parse(localStorage.getItem('usercourse'));

                if ($routeParams.moodleid) {
                    var activityIdentifier = parseInt($routeParams.moodleid); //Call this View with a moodleid parameter
                    getContentResources(activityIdentifier);
                    var treeActivity = getActivityByActivity_identifier(activityIdentifier, _usercourse);  //Get activity object
                    console.log("Activity / Coursemodule Id / Status : " + activityIdentifier + "/" + treeActivity.coursemoduleid + "/" + treeActivity.status);

                    $scope.resetActivityBlockedStatus(); //Copies last version of activity blocked status into model variable

                    if (!$rootScope.activityBlocked[activityIdentifier].disabled && treeActivity.status === 0) { //disabled = false for Cabina de Soporte in Stage 1.
                        $scope.isDisabled = false;  //Button "CONTINUAR" will be available.
                    }
                }

                //Get Messages From Server.
                moodleFactory.Services.GetUserChat(currentUser.userId, currentUser.token, getUserRefreshChatCallback, errorCallback, true);

                if ($location.hash() == 'top') {
                    $scope.scrollToTop('anchor-bottom'); // VERY Important: setting anchor hash value for first time to allow scroll to bottom
                    $anchorScroll();
                }

                $(".typing-section textarea").keypress(function () {
                    $(".typing-section textarea").focus();
                });

                function getUserRefreshChatCallback() {
                    $timeout(function () {
                        $scope.$emit('HidePreloader'); //hide preloader
                        $scope.messages = JSON.parse(localStorage.getItem('userChat')); //Get all messages posted.

                        localStorage.setItem("chatRead/" + localStorage.getItem("userId"), "true");   //Turn-off Chat warning popup.

                        if ($location.hash() == 'top') {
                            $scope.scrollToTop('anchor-bottom'); // VERY Important: setting anchor hash value for first time to allow scroll to bottom
                            $anchorScroll();
                        }
                    }, 100);
                }

                $scope.goToCloseScreen = function () {

                    var finishCabinaSoporte = localStorage.getItem("finishCabinaSoporte/" + currentUser.userId);
                    var zone = '/ZonaDeVuelo';

                    if (userCurrentStage == 2) {
                        zone = '/ZonaDeNavegacion';
                    }

                    if (userCurrentStage == 3) {
                        zone = '/ZonaDeAterrizaje';
                    }

                    if (!finishCabinaSoporte) {
                        console.log("_startedActivityCabinaDeSoporte = " + _startedActivityCabinaDeSoporte);
                        if (_startedActivityCabinaDeSoporte) {
                            var currentActivity = _getActivityByCourseModuleId(_startedActivityCabinaDeSoporte.coursemoduleid, _usercourse);

                            if (!currentActivity.status) {//The activity has not been finished.
                                console.log("...Finishing Cabina de Soporte");
                                localStorage.removeItem("startedActivityCabinaDeSoporte/" + currentUser.userId);
                                _setLocalStorageItem("finishCabinaSoporte/" + currentUser.userId, _startedActivityCabinaDeSoporte.activity_identifier);
                                $location.path(zone + '/CabinaDeSoporte/' + _startedActivityCabinaDeSoporte.activity_identifier);
                            }
                        }
                    } else {
                        console.log("ELSE");
                        $location.path(zone + '/CabinaDeSoporte/' + finishCabinaSoporte);
                    }
                };

                function errorCallback() { }
            }


            function getContentResources(activityIdentifierId) {
                drupalFactory.Services.GetContent(activityIdentifierId, function (data, key) {
                    _loadedResources = true;
                    $scope.setToolbar($location.$$path, data.node.tool_bar_title);
                    $scope.title = data.node.chat_title;
                    $scope.welcome = data.node.chat_welcome;
                    $scope.description = data.node.chat_instructions;
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
        }
    ]);
