/* Main controller, all other controllers inherit from this one */
angular
    .module('incluso.home', [])
    .controller('homeCtrl', [
        '$rootScope',
        '$scope',
        '$location',
        '$anchorScroll',
        '$window',
        '$http',
        '$filter',
        '$modal',
        '$timeout',
        function ($rootScope, $scope, $location, $anchorScroll, $window, $http, $filter, $modal, $timeout) {
            
            $rootScope.OAUTH_ENABLED = false;
            $rootScope.loadedItem = 0;
            $rootScope.totalLoads = 16;
            $rootScope.loaderForLogin = false;
            progressBar.set(0);
            var arrayForTimeouts = [];
            $rootScope.globalTimeOut = 120000;

            function myLoop (inf, up) {//To fill the interval between download chunks.
                var i;

                for (i = inf; i < up; i++) {//Set the new cicles for the loader bar.
                    arrayForTimeouts[i] = setTimeout(function() {
                        progressBar.set(i); //Update progress

                        if (i == 100) {//When load is complete.
                            $timeout(function(){
                                $scope.$emit('HidePreloader');
                                $rootScope.loadedItem = 0;
                                $rootScope.loaderForLogin = false;
                                $scope.loaderRandom(); //Reinit Preloader
                            }, 1000);
                        }
                    }, 10);
                }
            }

            $scope.incLoadedItem = function() {
                if ($rootScope.loaderForLogin) {
                    var infValue = Math.floor($rootScope.loadedItem/$rootScope.totalLoads*100);
                    $rootScope.loadedItem++;
                    var upperValue = Math.floor($rootScope.loadedItem/$rootScope.totalLoads*100);
                    myLoop(infValue, upperValue);
                }
            };
            
            // To handle page reloads
            _httpFactory = $http;

            if ($location.$$path.split('/')[1]) {
                $rootScope.loading = true;
            } else {
                $rootScope.loading = false;
            }

            $scope.loaderRandom = function () {
                if ($rootScope.loaderForLogin) {//Show Login Preloader
                    $rootScope.spinnerShow = 0;

                } else {//Pick another preloader, 1 - 4
                    var rndIndex = Math.floor(Math.random() * 4) + 1;
                    $rootScope.spinnerShow = rndIndex;
                }
            };

            var classdisable;

            $scope.sideToggle = function (outside) {
                getProgress();

                if (!outside)
                    $rootScope.sidebar = !$rootScope.sidebar;
                else
                    $rootScope.sidebar = false;
            };

            $rootScope.openQuizModal = function (size) {
                var modalInstance = $modal.open({
                    animation: false,
                    backdrop: false,
                    templateUrl: 'quizModal.html',
                    controller: 'quizModalController',
                    size: size,
                    windowClass: 'user-help-modal opening-stage-modal'
                });

                modalInstance.result.finally(function () {
                    $scope.$emit('ShowPreloader');
                    $timeout(function () {
                        $scope.$emit('HidePreloader');
                    }, 1500);
                });
            };

            /* redirect to another page */
            $scope.navigateTo = function (url, sideToggle, activityId) {
                var quizIdentifiers = ["1005", "1006", "1007", "1009", "2007", "2016", "2023"];
                var isQuiz = false;

                /* Check if current version is the most recent */
                if (!_compareSyncDeviceVersions()) {
                    $scope.openUpdateAppModal();
                } else {
                    if (activityId != undefined && activityId > 0 && _activityBlocked[activityId] && _activityBlocked[activityId].disabled) {
                        return false;
                    }

                    if (activityId) {
                        var timeStamp = $filter('date')(new Date(), 'MM/dd/yyyy HH:mm:ss');

                        logStartActivityAction(activityId, timeStamp, function(obj) {
							$scope.$emit('HidePreloader');
							if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
							  $timeout(function () {
								$location.path('/Offline'); //This behavior could change
							  }, 1);
							} else {//Another kind of Error happened
								$timeout(function () {								
									$scope.$emit('HidePreloader');
									$location.path('/connectionError');
								}, 1);
							}
						});

                        if (quizIdentifiers.indexOf(activityId.toString()) > -1) {//If the activity is a Quiz...
                            isQuiz = true;
                            $rootScope.quizIdentifier = activityId.toString();
                            $rootScope.quizUrl = url;
                            $rootScope.openQuizModal();  // turns on robot
                        }
                    }

                    if (sideToggle == "sideToggle") {
                        $rootScope.sidebar = !$rootScope.sidebar;
                    }

                    $location.path(url);
                    //if (!isQuiz) {
                    //    $location.path(url);
                    //}
                }
            };

            $scope.navigateToStageDashboard = function (url, sideToggle, activityId) {
                if (activityId != undefined && activityId > 0 && _activityBlocked[activityId] && _activityBlocked[activityId].disabled) {
                    return false;
                }

                var userCourse = moodleFactory.Services.GetCacheJson("usercourse");

                //Check if first time with course
                if (userCourse.firsttime) {
                    $scope.welcomeoOpenModal();

                    //Update model
                    userCourse.firsttime = 0;
                    _setLocalStorageJsonItem("usercourse", userCourse);

                    //Update back-end
                    var dataModel = {
                        firstTime: userCourse.firsttime,
                        courseId: userCourse.courseid
                    };

                    moodleFactory.Services.PutAsyncFirstTimeInfo(_getItem("userId"), dataModel, function () {}, function (obj) {
						$scope.$emit('HidePreloader');
						if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
						  $timeout(function () {
							$location.path('/Offline'); //This behavior could change
						  }, 1);
						} else {//Another kind of Error happened
						  $timeout(function () {
									$scope.$emit('HidePreloader');
									$location.path('/connectionError');
								}, 1);
						}
					});
                }

                //Update current stage
                for (var i = 0; i < userCourse.stages.length; i++) {
                    var uc = userCourse.stages[i];
                    _setLocalStorageJsonItem("stage", uc);

                    if (uc.status === 0) {
                        break;
                    }
                }

                $scope.navigateTo(url, sideToggle, activityId);
            };

            //Open Welcome Message modal
            $scope.welcomeoOpenModal = function (size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'programWelcome.html',
                    controller: 'WelcomeAboardFromMenu',
                    size: size,
                    windowClass: 'user-help-modal dashboard-programa'
                });
            };

            /* redirect to profile */
            $scope.navigateToMyProfile = function () {
                $rootScope.loaderForLogin = false;

                $timeout(function(){
                    $location.path("Perfil/" + moodleFactory.Services.GetCacheObject("userId"));
                }, 10);
            };

            $scope.setToolbar = function (url, name) {
                //Set toolbar color and text based on path
                //Default/global is orange
                $rootScope.showToolbar = true;
                $rootScope.navbarOrange = true;
                $rootScope.navbarBlue = false;
                $rootScope.navbarPink = false;
                $rootScope.navbarGreen = false;
                $rootScope.pageName = name;
                //Stage 1 is blue
                if (url.indexOf("/ZonaDeVuelo") === 0) {
                    $rootScope.navbarOrange = false;
                    $rootScope.navbarBlue = true;
                    $rootScope.navbarPink = false;
                    $rootScope.navbarGreen = false;
                    //$rootScope.pageName = "Zona de Vuelo";
                    name != '' ? $rootScope.pageName = name : $rootScope.pageName = "Zona de Vuelo";
                    //$("#menuton span").text('Zona de Vuelo');
                } //Stage 2 is green
                if (url.indexOf("/ZonaDeNavegacion") === 0) {
                    $rootScope.navbarOrange = false;
                    $rootScope.navbarBlue = false;
                    $rootScope.navbarPink = false;
                    $rootScope.navbarGreen = true;
                    //$rootScope.pageName = "Zona de Navegación";
                    name != '' ? $rootScope.pageName = name : $rootScope.pageName = "Zona de Navegación";

                } //Stage 3 is pink
                if (url.indexOf("/ZonaDeAterrizaje") === 0) {
                    $rootScope.navbarOrange = false;
                    $rootScope.navbarBlue = false;
                    $rootScope.navbarPink = true;
                    $rootScope.navbarGreen = false;
                    //$rootScope.pageName = "Zona de Aterrizaje";
                    name != '' ? $rootScope.pageName = name : $rootScope.pageName = "Zona de Aterrizaje";
                }

            };
            
            $scope.toolbarOptionActive = function (path) {

                if (path.constructor === Array) {
                    classdisable = "";
                    for (i = 0; i < path.length; i++) {

                        if (path[i] == "/Perfil/Editar" || path[i] == "/Perfil" || path[i] == "/Perfil/ConfigurarPrivacidad" || path[i] == "/Juegos/Avatar") {
                            path[i] = path[i] + "/" + moodleFactory.Services.GetCacheObject("userId");
                        }

                        if ($location.path() === path[i] || $location.path().substr(0, 8) === path[i]) {
                            classdisable = "active disabled";
                        }
                    }

                    return classdisable;

                } else {
                    if ($location.path().substr(0, path.length) === path) {
                        return "active disabled";
                    } else {
                        return "";
                    }

                }
            };

            /* play video from main dashboard */
            $scope.playVideo = function (videoAddress, videoName) {
                playVideo(videoAddress, videoName);
            };

            $scope.scrollToTop = function (element) {
                $location.hash(element);
                $anchorScroll();
            };

            /* scroll to top function and listener */
            $scope.scrollTo = function (element) {
                $location.hash('top');
                $anchorScroll();
            };
            $scope.$on('scrollTop', $scope.scrollTo);

            /* Preloader default callbacks and listeners */
            var _showPreloader = function () {
                $scope.loaderRandom();
                $rootScope.loading = true;
            };
            var _hidePreloader = function () {
                $rootScope.loading = false;
            };
            $scope.$on('ShowPreloader', _showPreloader);
            $scope.$on('HidePreloader', _hidePreloader);

            $scope.showNotification = function () {

                if ($scope.pageName == 'Notificaciones') {
                    return false;
                } else {
                    var userNotifications = JSON.parse(localStorage.getItem('notifications'));
                    //var countNotificationsUnread = _.where(userNotifications, {read: false}).length;
                    var countNotificationsUnread = _.filter(userNotifications, function (notif) {
                        return (notif.status == "won" && notif.seen_date == null);
                    });
                    $rootScope.totalNotifications = countNotificationsUnread.length;
                    return countNotificationsUnread.length > 0;
                }
            };

            $scope.showChatNotification = function () {

                var chatRead = localStorage.getItem('chatRead/' + localStorage.getItem("userId"));

                if ($scope.pageName == 'Chat' || chatRead == "true" || chatRead == undefined) {
                    return false;
                } else {

                    if (chatRead == "false") {
                        return true;
                    }
                }
            };

            //Load activity block status into binding model
            $scope.resetActivityBlockedStatus = function () {
                if (!_activityBlocked || !_activityBlocked.length || _activityBlocked.length <= 0) {
                    _activityBlocked = moodleFactory.Services.GetCacheJson("activityblocked");
                }
                $rootScope.activityBlocked = _activityBlocked;
                if($rootScope.retoMultipleTerminado == "No") {
                    $rootScope.activityBlocked[1049].disabled = true;
                }
            };

            $scope.resetActivityBlockedStatus();

            $scope.leftVisible = false;
            $scope.rightVisible = false;

            $scope.close = function () {
                $scope.leftVisible = false;
                $scope.rightVisible = false;
            };

            $scope.showLeft = function (e) {
                $scope.leftVisible = true;
                e.stopPropagation();
            };

            $scope.showRight = function (e) {
                $scope.rightVisible = true;
                e.stopPropagation();
            };

            $rootScope.$on("documentClicked", _close);
            $rootScope.$on("escapePressed", _close);

            function _close() {
                $scope.$apply(function () {
                    $scope.close();
                });
            }

            function getProgress() {
                $scope.showDiploma = false;

                var usercourse = moodleFactory.Services.GetCacheJson("usercourse");

                if ($rootScope.showToolbar && usercourse) {
                    if (usercourse.globalProgress == 100) {
                        $scope.showDiploma = true;
                    }
                }
            }

            //Open Welcome Message modal
            $scope.openUpdateAppModal = function (size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'updateApp.html',
                    controller: function ($scope, $modalInstance) {

                        $scope.updateApp = function () {
                            if (window.mobilecheck()) {
                                cordova.exec(function () {
                                }, function () {
                                }, "CallToAndroid", "restart", []);
                            }
                        };
                    },
                    size: size,
                    windowClass: 'user-help-modal dashboard-programa'
                });
            };


            /* checks if user has internet connection */
            $scope.validateConnection = function (connectedCallback, offlineCallback) {
                _forceUpdateConnectionStatus(function () {

                    if (_isDeviceOnline) {
                        connectedCallback();
                    } else {
                        offlineCallback();
                    }

                }, function () {
                    offlineCallback();
                });
            };

            
        } ]).controller('WelcomeAboardFromMenu', function ($scope, $modalInstance) {//To show Inclubot from MENU.
    drupalFactory.Services.GetContent("robot-inclubot", function (data, key) {

        if (data.node != null) {
            $scope.title = data.node.titulo;
            $scope.message = data.node.mensaje;
        }
    }, function () {}, false);

    $scope.cancel = function () {
        $scope.$emit('ShowPreloader');
        $modalInstance.dismiss('cancel');
    };
}).controller('quizModalController', function ($scope, $rootScope, $modalInstance, $location, $timeout) {

    drupalFactory.Services.GetContent($rootScope.quizIdentifier, function (data, key) {

            if (data.node && data.node.titulo_quiz && data.node.instrucciones) {
                $scope.title = data.node.titulo_quiz;
                $scope.instructions = data.node.instrucciones;
                // $scope.$apply();
            }

            _loadedResources = true;

        }, function () {
            _loadedResources = true;
        }, false);

    $scope.cancelModal = function () {
        $modalInstance.dismiss('cancel');
        //
        //$timeout(function(){
        //    $location.path($rootScope.quizUrl);
        //}, 200);
    };
});