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
        function ($rootScope, $scope, $location, $anchorScroll, $window, $http, $filter, $modal) {
            // To handle page reloads
            _httpFactory = $http;

            if ($location.$$path.split('/')[1]) {
                $scope.loading = true;
            } else {
                $scope.loading = false;
            }

            $scope.loaderRandom = function () {
                $scope.spinnerShow = Math.floor((Math.random() * 4));
                setInterval(function () { 
                    if(!$("#spinner").is(':visible'))
                         $scope.spinnerShow = Math.floor((Math.random() * 4));
                }, 200);
            };

            var classdisable;

            $scope.sideToggle = function (outside) {
                getProgress();

                if (!outside)
                    $rootScope.sidebar = !$rootScope.sidebar;
                else
                    $rootScope.sidebar = false;
            };

            /* redirect to another page */
            $scope.navigateTo = function (url, sideToggle, activityId) {

                /* Check if current version is the most recent */
                if (!_compareSyncDeviceVersions()) {
                    $scope.openUpdateAppModal();
                } else {
                    if (activityId != undefined && activityId > 0 && _activityBlocked[activityId] && _activityBlocked[activityId].disabled) {
                        return false;
                    }

                    if (activityId) {
                        var timeStamp = $filter('date')(new Date(), 'MM/dd/yyyy HH:mm:ss');
                        logStartActivityAction(activityId, timeStamp);
                    }

                    $location.path(url);

                    if (sideToggle == "sideToggle")
                        $rootScope.sidebar = !$rootScope.sidebar;
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

                    moodleFactory.Services.PutAsyncFirstTimeInfo(_getItem("userId"), dataModel, function () {
                    }, function () {
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
                    controller: function ($scope, $modalInstance) {
                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    },
                    size: size,
                    windowClass: 'user-help-modal dashboard-programa'
                });
            };

            /* redirect to profile */
            $scope.navigateToMyProfile = function () {
                $scope.$emit('ShowPreloader');
                $location.path("Perfil/" + moodleFactory.Services.GetCacheObject("userId"));
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
                    if ($location.path().substr(0, path.length) === path)
                        return "active disabled";
                    else
                        return "";
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
                $scope.loading = true;
            };
            var _hidePreloader = function () {
                $scope.loading = false;
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
                var readChatNotification = localStorage.getItem('chatRead');
                if ($scope.pageName == 'Chat' || readChatNotification == "true" || readChatNotification == undefined) {
                    return false;
                } else {
                    var userChat = JSON.parse(localStorage.getItem('userChat'));
                    if (userChat && userChat.length >= 1) {
                        var userId = localStorage.getItem('userId');

                        var lastMessage = _.max(userChat, function (chat) {
                            return chat.messagedate;
                        });

                        if (lastMessage.messagesenderid != userId) {
                            return true;
                        }
                    } else {
                        return false;
                    }
                }
            };

            //Load activity block status into binding model
            $scope.resetActivityBlockedStatus = function () {
                if (!_activityBlocked || !_activityBlocked.length || _activityBlocked.length <= 0) {
                    _activityBlocked = moodleFactory.Services.GetCacheJson("activityblocked");
                }
                $rootScope.activityBlocked = _activityBlocked;
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
            }


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
        } ]);