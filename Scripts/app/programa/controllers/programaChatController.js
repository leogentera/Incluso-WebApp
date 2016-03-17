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

            $scope.validateConnection(initController, offlineCallback);
            console.log("********  CHAT  *****************");
            function offlineCallback() {
                $timeout(function () {
                    $location.path("/Offline");
                }, 1000);
            }

            function initController() {

                _timeout = $timeout;
                _httpFactory = $http;

                _setLocalStorageItem('chatRead', "true");
                var userId = localStorage.getItem('userId');
                var currentUser = JSON.parse(localStorage.getItem('CurrentUser'));
                var _startedActivityCabinaDeSoporte = JSON.parse(localStorage.getItem("startedActivityCabinaDeSoporte/" + userId));
                var userCurrentStage = localStorage.getItem("currentStage");
                var messagesToRead = userCurrentStage * 2;
                $scope.senderId = userId;
                $scope.messages = JSON.parse(localStorage.getItem('userChat'));
                $scope.currentMessage = "";
                $scope.setToolbar($location.$$path, "Cabina de Soporte");
                $rootScope.showFooter = false;
                $rootScope.showFooterRocks = false;
                $rootScope.showStage1Footer = false;
                $rootScope.showStage2Footer = false;
                $rootScope.showStage3Footer = false;
                $scope.isDisabled = true;
                var _usercourse = JSON.parse(localStorage.getItem('usercourse'));
                var activityIdentifier = parseInt($routeParams.moodleid); //Call this View with a moodleid parameter

                var treeActivity = getActivityByActivity_identifier(activityIdentifier, _usercourse);

                if (treeActivity.status === 0) {//Chat activity has not been finished
                    $scope.isDisabled = false;
                }

                var currentChallenge = 0;
                var currentStage;
                var coursemoduleid = getCoursemoduleidFromActivity(treeActivity);
                console.log("Coursemoduleid en Chat = " + coursemoduleid);

                function getCoursemoduleidFromActivity(obj) {
                    if (obj[0]) {
                        return obj[0].coursemoduleid;
                    } else {
                        return obj.coursemoduleid;
                    }
                }

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

                console.log("course module id in Chat Controller = " + activityIdentifier);

                moodleFactory.Services.GetUserChat(userId, currentUser.token, getUserRefreshChatCallback, errorCallback, true);
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

                    var finishCabinaSoporte = ""; //localStorage.getItem("finishCabinaSoporte/" + userId);
                    var zone = '/ZonaDeVuelo';

                    if (userCurrentStage == 2) {
                        zone = '/ZonaDeNavegacion';
                    }
                    else if (userCurrentStage == 3) {
                        zone = '/ZonaDeAterrizaje';
                    }

                    if (!finishCabinaSoporte) {
                        console.log("_startedActivityCabinaDeSoporte = " + _startedActivityCabinaDeSoporte);
                        if (true) {//_startedActivityCabinaDeSoporte) {
                            var currentActivity = _getActivityByCourseModuleId(68, _usercourse);
                            console.log("currentActivity =" + JSON.stringify(currentActivity));
                            if (!currentActivity.status) {//The activity has not been finished.
                                //var dateStarted = new Date(_startedActivityCabinaDeSoporte.datestarted * 1000);
                                var latestCoachAndSenderMessages = 0;
                                /*
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
                                if (latestCoachAndSenderMessages >= 0) {
                                    console.log("REDIRECTING...");
                                    localStorage.removeItem("startedActivityCabinaDeSoporte/" + userId);
                                    _setLocalStorageItem("finishCabinaSoporte/" + userId, 1002); //_startedActivityCabinaDeSoporte.activity_identifier);
                                    $location.path(zone + '/CabinaDeSoporte/' + 1002); //_startedActivityCabinaDeSoporte.activity_identifier);
                                }
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
                 */

                function getUserChatCallback() {
                }

                function errorCallback() {
                }

                function triggerAndroidKeyboardHide() {
                    angular.element('#chatMessages').trigger('tap');
                    $anchorScroll();
                }
            }

            $scope.$on("$routeChangeStart", function (next, current) {
                SignalRFactory.SetCallBackChat($scope.getUserChat);
            });
        }
    ]);
