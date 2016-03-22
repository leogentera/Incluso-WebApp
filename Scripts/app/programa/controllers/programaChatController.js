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
                //$scope.currentPage = 1;

                var currentUser = JSON.parse(localStorage.getItem('CurrentUser'));
                var _startedActivityCabinaDeSoporte = JSON.parse(localStorage.getItem("startedActivityCabinaDeSoporte/" + currentUser.userId));
                var userCurrentStage = localStorage.getItem("currentStage");
                var messagesToRead = userCurrentStage * 2;
                $scope.senderId = currentUser.userId;
                //$scope.messages = JSON.parse(localStorage.getItem('userChat')); //DUPLICATED LINE
                $scope.currentMessage = "";
                $scope.setToolbar($location.$$path, "Cabina de Soporte");

                $scope.isDisabled = true;
                var _usercourse = JSON.parse(localStorage.getItem('usercourse'));

                if ($routeParams.moodleid) {
                    var activityIdentifier = parseInt($routeParams.moodleid); //Call this View with a moodleid parameter
                    getContentResources(activityIdentifier);
                    var treeActivity = getActivityByActivity_identifier(activityIdentifier, _usercourse);  //Get activity object
                    console.log("...Starting Chat With ActivityIdentifier : " + activityIdentifier + "/" + treeActivity.coursemoduleid);
                    console.log("El status de la actividad es: " + treeActivity.status);

                    $scope.resetActivityBlockedStatus(); //Copies last version of activity blocked status into model variable

                    if (!$rootScope.activityBlocked[activityIdentifier].disabled && treeActivity.status === 0) { //disabled = false for Cabina de Soporte in Stage 1.
                        $scope.isDisabled = false;  //Button "CONTINUAR" will be available.
                    }
                }

                //Get Messages From Server.
                moodleFactory.Services.GetUserChat(currentUser.userId, currentUser.token, getUserRefreshChatCallback, errorCallback, true);
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

                        if ($scope.messages && $scope.messages.length >= 1) {
                            // -- Update First Message with <img> tag
                            var imgPath;
                            var currentUser = JSON.parse(localStorage.getItem('CurrentUser'));
                            var profile = JSON.parse(localStorage.getItem('Perfil/' + currentUser.userId));

                            if (!profile.strengths[0]) {
                                profile.strengths[0] = "No strength 1";
                            }

                            if (!profile.strengths[1]) {
                                profile.strengths[1] = "No strength 2";
                            }

                            if (!profile.strengths[2]) {
                                profile.strengths[2] = "No strength 3";
                            }

                            if (currentUser.shield == "") {
                                imgPath = "<img src='assets/images/badges/img-badge-placeholder.svg'>";
                            } else {
                                imgPath = "<img src='assets/images/badges/img-" + currentUser.shield.trim().toLowerCase() + ".svg'>";
                            }

                            //$scope.messages[0].messagetext = "Hola " + "<span style='color:yellow;'>" + currentUser.firstname.toUpperCase() + "</span>"

                            $scope.messages[0].messagetext = $scope.messages[0].messagetext.replace("[name]", currentUser.firstname.toUpperCase());
                            $scope.messages[0].messagetext = $scope.messages[0].messagetext.replace("[s0]", profile.strengths[0].toUpperCase());
                            $scope.messages[0].messagetext = $scope.messages[0].messagetext.replace("[s1]", profile.strengths[1].toUpperCase());
                            $scope.messages[0].messagetext = $scope.messages[0].messagetext.replace("[s2]", profile.strengths[2].toUpperCase());
                            $scope.messages[0].messagetext = $scope.messages[0].messagetext.replace("[shield]", imgPath);
                            // -----
                        }

                        localStorage.setItem("chatRead", "true");   //Turn-off popup.
                        //localStorage.setItem("chatAmountRead", $scope.messages.length);  //Update amount of readed messages.

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
