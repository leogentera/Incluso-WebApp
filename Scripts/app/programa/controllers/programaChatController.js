angular
    .module('incluso.programa.chatcontroller', [])
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
                console.log("********  CHAT  *****************");
                _timeout = $timeout;
                _httpFactory = $http;
                $rootScope.showFooter = false;
                $rootScope.showFooterRocks = false;
                $rootScope.showStage1Footer = false;
                $rootScope.showStage2Footer = false;
                $rootScope.showStage3Footer = false;
                $scope.currentPage = 1;



                _setLocalStorageItem('chatRead', "true");
                var currentUser = JSON.parse(localStorage.getItem('CurrentUser'));
                var _startedActivityCabinaDeSoporte = JSON.parse(localStorage.getItem("startedActivityCabinaDeSoporte/" + currentUser.userId));
                var userCurrentStage = localStorage.getItem("currentStage");
                var messagesToRead = userCurrentStage * 2;
                $scope.senderId = currentUser.userId;
                $scope.messages = JSON.parse(localStorage.getItem('userChat'));
                $scope.currentMessage = "";
                $scope.setToolbar($location.$$path, "Cabina de Soporte");

                $scope.isDisabled = true;
                var _usercourse = JSON.parse(localStorage.getItem('usercourse'));

                $scope.goChat = function () {
                    $scope.currentPage = 2;
                };


                if ($routeParams.moodleid) {
                    var activityIdentifier = parseInt($routeParams.moodleid); //Call this View with a moodleid parameter
                    console.log("$routeParams.moodleid = " + $routeParams.moodleid);
                    console.log("course module id in Chat Controller = " + activityIdentifier);

                    getContentResources(activityIdentifier);

                    var treeActivity = getActivityByActivity_identifier(activityIdentifier, _usercourse);  //Get activity object
                    console.log("El status de la actividad es: " + treeActivity.status);

                    $scope.resetActivityBlockedStatus(); //Copies last version of activity blocked status into model variable

                    if ($rootScope.activityBlocked[activityIdentifier].disabled || treeActivity.status === 1) { //disabled = false for Cabina de Soporte in Stage 1.
                        //Put Call to Remote Service.
                        $scope.isDisabled = true;
                    }

                    var currentChallenge = 0;
                    var currentStage;
                    var coursemoduleid = treeActivity.coursemoduleid; //getCoursemoduleidFromActivity(treeActivity);
                    console.log("Coursemoduleid en Chat = " + coursemoduleid);

                    switch (activityIdentifier) {
                        case 1002:
                            currentChallenge = 4;
                            currentStage = "ZonaDeVuelo";
                            break;
                        case 2022:
                            currentChallenge = 5;
                            currentStage = "ZonaDeNavegacion";
                            break;
                        case 3501:
                            currentChallenge = 5;
                            currentStage = "ZonaDeAterrizaje";
                            break;
                    }
                }

                moodleFactory.Services.GetUserChat(currentUser.userId, currentUser.token, getUserRefreshChatCallback, errorCallback, true);  //Get Messages From Server.
                SignalRFactory.SetCallBackChat(getUserRefreshChatCallback);

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

                        //$scope.finishActivity();

                        if ($location.hash() == 'top') {
                            $scope.scrollToTop('anchor-bottom'); // VERY Important: setting anchor hash value for first time to allow scroll to bottom
                            $anchorScroll();
                        }
                    }, 100);
                }

                $scope.finishActivity = function () {

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
                            console.log("currentActivity =" + JSON.stringify(currentActivity));
                            if (!currentActivity.status) {//The activity has not been finished.
                                var latestCoachAndSenderMessages = 0;
                                /*
                                 var dateStarted = new Date(_startedActivityCabinaDeSoporte.datestarted * 1000);

                                 var latestMessages = _.filter($scope.messages, function (msg) {
                                 return (new Date(msg.messagedate)) > dateStarted;
                                 });

                                 for (var m = 0; m < latestMessages.length; m++) {
                                 var message = latestMessages[m];

                                 if (message.messagesenderid == $scope.senderId) {
                                 var nextMessage = (m + 1) < latestMessages.length ? latestMessages[m + 1] : null;

                                 if (nextMessage && nextMessage.messagesenderid != $scope.senderId) {
                                 latestCoachAndSenderMessages++;
                                 }
                                 }
                                 }
                                 */
                                //if (treeActivity.status) { //(latestCoachAndSenderMessages >= 0) {//The Chat activity has been finished
                                    console.log("REDIRECTING...");
                                    localStorage.removeItem("startedActivityCabinaDeSoporte/" + currentUser.userId);
                                    _setLocalStorageItem("finishCabinaSoporte/" + currentUser.userId, _startedActivityCabinaDeSoporte.activity_identifier);
                                    $location.path(zone + '/CabinaDeSoporte/' + _startedActivityCabinaDeSoporte.activity_identifier);
                                //}
                            }
                        }
                    } else {
                        console.log("ELSE");
                        $location.path(zone + '/CabinaDeSoporte/' + finishCabinaSoporte);
                    }
                };
                /*
                 $scope.back = function () {
                 var userCurrentStage = localStorage.getItem("currentStage");
                 $location.path('/ZonaDeVuelo/Dashboard/' + userCurrentStage + '/4');
                 };


                function getUserChatCallback() {
                }

                 function triggerAndroidKeyboardHide() {
                 angular.element('#chatMessages').trigger('tap');
                 $anchorScroll();
                 }
                 */

                function errorCallback() {
                }
            }

            $scope.$on("$routeChangeStart", function (next, current) {
                SignalRFactory.SetCallBackChat($scope.getUserChat);
            });

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
                /*
                var stageClosingContent = "";
                if (activityIdentifierId > 999 && activityIdentifierId < 2000)
                    stageClosingContent = "ZonaDeVueloClosing";
                else if (activityIdentifierId > 1999 && activityIdentifierId < 3000)
                    stageClosingContent = "ZonaDeNavegacionClosing";
                else
                    stageClosingContent = "ZonaDeAterrizajeClosing";

                drupalFactory.Services.GetContent(stageClosingContent, function (data, key) {
                    _loadedResources = true;
                    $scope.closingContent = data.node;
                }, function () {
                    _loadedResources = true;
                }, false);
                */
            }
        }
    ]);
