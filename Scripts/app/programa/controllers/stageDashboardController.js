angular
    .module('incluso.stage.dashboardcontroller', ['ngSanitize'])
    .controller('stageDashboardController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        '$filter',
        '$anchorScroll',
        '$window',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal, $filter, $anchorScroll, $window) {
            $rootScope.dontShowRobot = false;
            var _loadedResources = false;
            var _pageLoaded = true;
            /* $routeParams.stageId */
            _timeout = $timeout;
            _httpFactory = $http;
            $scope.Math = window.Math;
            $scope.$emit('ShowPreloader'); //show preloader
            $scope.model = JSON.parse(localStorage.getItem("usercourse"));
            $scope.resetActivityBlockedStatus(); //Copies last version of activity blocked status into model variable

            if($rootScope.retoMultipleTerminado == "No") {
                $rootScope.activityBlocked[1049].disabled = true;
            }else{}

            // ---- Update Chat Status -----------------------------------------------
            function offlineCallback() {
                $timeout(function () {
                    $location.path("/Offline");
                }, 1000);
            }

            
           
            $scope.setToolbar($location.$$path, "");

            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = true;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
            $scope.scrollToTop();

            $scope.activitiesCompletedInCurrentStage = [];
            $scope.isCollapsed = false;
            $scope.idEtapa = $routeParams['stageId'] - 1; //We are in stage stageId, taken from URL
            $scope.idReto = $routeParams['challenge'];
            $scope.thisStage = $scope.model.stages[$scope.idEtapa];
            $scope.nombreEtapaActual = $scope.thisStage.sectionname;
            _setLocalStorageItem("userCurrentStage", $routeParams['stageId']);

            getContentResources($scope.thisStage.activity_identifier);

            setTimeout(function () {
                var hits = 1;

                //Carrusel de retos
                var owl2 = $("#owl-demo2");

                owl2.owlCarousel({
                    navigation: false,
                    pagination: false,
                    //paginationSpeed: 1000,
                    goToFirstSpeed: 2000,
                    singleItem: true,
                    autoHeight: true,
                    touchDrag: true,
                    mouseDrag: false,
                    transitionStyle: "fade",
                    afterMove: callback1
                });

                //Carrusel de Actividades
                var owl = $("#owl-demo");

                owl.owlCarousel({
                    navigation: false,
                    pagination: false,
                    //paginationSpeed: 1000,
                    goToFirstSpeed: 2000,
                    singleItem: true,
                    autoHeight: true,
                    touchDrag: true,
                    mouseDrag: false,
                    transitionStyle: "fade",
                    afterMove: callback2
                });

                this.currentItem = $scope.idReto;
                var currentItem;

                owl.trigger("owl.goTo", $scope.idReto);
                $("span#index").text(($scope.idReto + 1));

                owl2.trigger("owl.goTo", $scope.idReto);
                $("span#index").text(($scope.idReto + 1));

                function callback1(event) {
                    var item = this.currentItem;
                    currentItem = parseInt(this.owl.currentItem);
                    owl2.trigger("owl.goTo", item);
                    owl.trigger("owl.goTo", item);
                    $("span#index").text((item + 1));
                }

                function callback2(event) {
                    item = this.currentItem;
                    owl.trigger("owl.goTo", item);
                    owl2.trigger("owl.goTo", item);
                    $("span#index").text((item + 1));
                }

                $("#prev").click(function (ev) {
                    if (currentItem) {
                        owl.trigger('owl.goTo', currentItem - 1);
                        owl2.trigger('owl.goTo', currentItem - 1);
                    }
                    else {
                        owl.trigger('owl.prev');
                        owl2.trigger('owl.prev');
                    }
                    ev.preventDefault();
                });
                $("#next").click(function (ev) {
                    if (currentItem) {
                        owl.trigger('owl.goTo', currentItem + 1);
                        owl2.trigger('owl.goTo', currentItem + 1);
                    }
                    else {
                        owl.trigger('owl.next');
                        owl2.trigger('owl.next');
                    }
                    ev.preventDefault();
                });

            }, 1000);

            //Opens stage welcome message if first time visit
            $scope.openModal_StageFirstTime = function (size) {
                var modalInstance = $modal.open({
                    animation: false, //$scope.animationsEnabled,
                    templateUrl: 'OpeningStageModal.html',
                    controller: 'OpeningStage1',
                    size: size,
                    windowClass: 'user-help-modal dashboard-stage-intro'
                });
            };

            $scope.openModal_CloseChallenge = function (size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'ClosingStageOneChallengeModal.html',
                    controller: 'closingStageOneChallengeController',
                    size: size,
                    windowClass: 'closing-stage-modal user-help-modal'
                });
            };

            $scope.openModal_CloseStage = function (size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'ClosingStageModal.html',
                    controller: 'closingStageController',
                    size: size,
                    windowClass: 'closing-stage-modal user-help-modal'
                });

            };

            //Updated stage first time flag in scope, local storage and server
            $scope.updateStageFirstTime = function () {
                //Update model
                $scope.thisStage.firsttime = 0;
                $scope.model.stages[$scope.idEtapa].firsttime = 0;
                //Update local storage
                var userCourse = moodleFactory.Services.GetCacheJson("usercourse");
                if (userCourse != {}) {
                    userCourse.stages[$scope.idEtapa].firsttime = 0;
                    _setLocalStorageJsonItem("usercourse", userCourse);
                }
                //Update back-end
                var dataModel = {
                    stages: [
                        {
                            firstTime: 0,
                            section: $scope.thisStage.section
                        }
                    ]
                };

                moodleFactory.Services.PutAsyncFirstTimeInfo(_getItem("userId"), dataModel, function(){}, function (obj) {
                    $scope.$emit('HidePreloader');
                    if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                      $timeout(function () {
                        $location.path('/Offline'); //This behavior could change
                      }, 1);
                    } else {//Another kind of Error happened
                      $timeout(function () {
                          console.log("Another kind of Error happened");
                          $scope.$emit('HidePreloader');
                          $location.path('/connectionError');
                      }, 1);
                    }
                });

            };

            //Load challenges images
            $scope.retosIconos = {
                "Exploración inicial": "assets/images/challenges/stage-1/img-evaluacion-inicial.svg",
                "Cuarto de recursos": "assets/images/challenges/stage-1/img-cuarto-recursos.svg",
                "Conócete": "assets/images/challenges/stage-1/img-conocete.svg",
                "Mis sueños": "assets/images/challenges/stage-1/img-mis-suenos.svg",
                "Cabina de soporte": "assets/images/challenges/stage-1/img-cabina-soporte.svg",
                "Retroalimentación": "assets/images/challenges/stage-1/img-challenge-feedback.svg",
                "Exploración final": "assets/images/challenges/stage-1/img-evaluacion-final.svg"
            };

            $scope.challengeDescription = {
                "Exploración inicial": "Explora más sobre ti y tus sueños e identifica qué has estado haciendo para hacerlos realidad",
                "Cuarto de recursos": "Descubre más y métele velocidad a tus sueños",
                "Conócete": "Juega y descubre tus inteligencias",
                "Mis sueños": "Cada sueño en su lugar",
                "Cabina de soporte": "Contacta a tu coach",
                "Exploración final": "Explora qué tanto descubriste en la Zona de Vuelo"
            };

            // this is the propper way, but since owl isn't part of angular framework, it is rendered afterwards angular finishes
            $scope.$on('$viewContentLoaded', function () {
                //$scope.$emit('HidePreloader'); //hide preloader
            });
            // this is the dirty way to hide owl's carousel rendering process while user waits
            $timeout(function () {
                if (_loadedResources && _pageLoaded) {
                    $scope.$emit('HidePreloader')
                }
                ;
            }, 2000);

            $scope.playVideo = function (videoAddress, videoName) {
                playVideo(videoAddress, videoName);
            };

            $scope.startActivity = function (activity, index, parentIndex) {
                var quizIdentifiers = ["1001", "1005", "1006", "1007", "1009"];
                var isQuiz = false;

                if (_activityBlocked[activity.activity_identifier].disabled) return false;
                var url = _.filter(_activityRoutes, function (x) {
                    return x.id == activity.activity_identifier
                })[0].url;

                if (url) {

                    if (_compareSyncDeviceVersions()) {
                        var activityId = activity.activity_identifier;
                        var timeStamp = $filter('date')(new Date(), 'MM/dd/yyyy HH:mm:ss');
                        logStartActivityAction(activityId, timeStamp, function (obj) {
                            $scope.$emit('HidePreloader');
                            if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                              $timeout(function () {
                                $location.path('/Offline'); //This behavior could change
                              }, 1);
                            } else {//Another kind of Error happened
                              $timeout(function () {
                                  console.log("Another kind of Error happened");
                                  $scope.$emit('HidePreloader');
                                  $location.path('/connectionError');
                              }, 1);
                            }
                        });

                        if (quizIdentifiers.indexOf(activity.activity_identifier) > -1) {//If the activity is a Quiz...
                            $rootScope.cancelDisabled = true;
                            isQuiz = true;
                            $rootScope.quizIdentifier = activity.activity_identifier;
                            $rootScope.quizUrl = url;
                            $rootScope.openQuizModal();  // turns on Quiz Modal
                            // $scope.$apply();
                        }

                         $location.path(url);
                        //if (!isQuiz) {
                        //    $location.path(url);
                        //}


                    } else {
                        $scope.openUpdateAppModal();
                    }
                }
            };

            $scope.getCurrentStatusOfActivity = function (coursemoduleid) {
                var activity = _getActivityByCourseModuleId(coursemoduleid);
                return activity.status;
            };

            function loadController() {
                if ($scope.thisStage.firsttime) {
                    $scope.openModal_StageFirstTime();
                    $scope.updateStageFirstTime();
                }

                var challengeCompletedId = _closeChallenge($scope.idEtapa, function (obj) {
                    $scope.$emit('HidePreloader');
                    if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                      $timeout(function () {
                        $location.path('/Offline'); //This behavior could change
                      }, 1);
                    } else {//Another kind of Error happened
                      $timeout(function () {
                          console.log("Another kind of Error happened");
                          $scope.$emit('HidePreloader');
                          $location.path('/connectionError');
                      }, 1);
                    }
                });
                
                //Exclude challenges initial and final from showing modal robot
                var challengeExploracionInicial = 140;
                var challengeExploracionFinal = 152;
                if (challengeCompletedId && (challengeCompletedId != challengeExploracionInicial) && (challengeCompletedId != challengeExploracionFinal)) {
                    showClosingChallengeRobot(challengeCompletedId);
                } else {
                    localStorage.removeItem("challengeMessage");
                }


                if (_tryCloseStage($scope.idEtapa)) {
                    $scope.openModal_CloseStage();
                    moodleFactory.Services.PostGeolocation(1);
                }

                //Update progress
                var userid = localStorage.getItem("userId");
                var user = JSON.parse(localStorage.getItem("Perfil/" + userid));
                $scope.model = JSON.parse(localStorage.getItem("usercourse"));
                var progress = moodleFactory.Services.RefreshProgress($scope.model, user);
                $scope.model = progress.course;
                _setLocalStorageJsonItem("usercourse", $scope.model);
                $scope.stageProgress = $scope.model.stages[$scope.idEtapa].stageProgress;

                _progressNotification(function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      console.log("Another kind of Error happened");
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            });

            }

            function getContentResources(activityIdentifierId) {
                drupalFactory.Services.GetContent(activityIdentifierId, function (data, key) {
                    _loadedResources = true;
                    $scope.contentResources = data.node;
                    loadController();
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

            function showClosingChallengeRobot(challengeCompletedId) {
                $scope.robotMessages = [
                    {
                        title: $scope.contentResources.robot_title_challenge_one,
                        message: $scope.contentResources.robot_challenge_one,
                        read: "false",
                        challengeId: 113
                    },
                    {
                        title: $scope.contentResources.robot_title_challenge_two,
                        message: $scope.contentResources.robot_challenge_two,
                        read: "false",
                        challengeId: 114
                    },
                    {
                        title: $scope.contentResources.robot_title_challenge_thre,
                        message: $scope.contentResources.robot_challenge_three,
                        read: "false",
                        challengeId: 115
                    },
                    {
                        title: $scope.contentResources.robot_title_challenge_four,
                        message: $scope.contentResources.robot_challenge_four,
                        read: "false",
                        challengeId: 262
                    }];


                $scope.actualMessage = _.findWhere($scope.robotMessages, {read: "false", challengeId: challengeCompletedId});
                if ($scope.actualMessage) {
                    _setLocalStorageItem("challengeMessage", JSON.stringify($scope.actualMessage));
                    $scope.openModal_CloseChallenge();
                }
            }

        }]).controller('closingStageOneChallengeController', function ($scope, $modalInstance) {
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    var challengeMessage = JSON.parse(localStorage.getItem("challengeMessage"));

    $scope.actualMessage = challengeMessage;

}).controller('OpeningStage1', function ($scope, $modalInstance) {//To show Opening Stage Robot
    drupalFactory.Services.GetContent("3000", function (data, key) {

        if (data.node != null) {
            $scope.title = data.node.titulo_bienvenida_robot;
            $scope.message = data.node.robot_stage_welcome;
        }
    }, function () {}, false);

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

}).controller('closingStageController', function ($scope, $modalInstance, $location) {
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
        $location.path('/ProgramaDashboard');  //Redirect to dashboard inicio.
    };

    drupalFactory.Services.GetContent("3000", function (data, key) {

        if (data.node != null) {
            $scope.title = data.node.titulo_cierre_robot;
            $scope.message = data.node.robot_stage_close;
        }
    }, function () {}, false);

    $scope.navigateToDashboard = function () {
        $modalInstance.dismiss('cancel');
        $location.path('/ProgramaDashboard');
    };
    _setLocalStorageItem('robotEndStageShown', true);
});
