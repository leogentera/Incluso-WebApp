angular
    .module('incluso.stage.dashboardcontroller', [])
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
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal, $filter) {
            var _loadedResources = false;
            var _pageLoaded = true;
            /* $routeParams.stageId */
            _timeout = $timeout;
            _httpFactory = $http;
            $scope.Math = window.Math;
            $scope.$emit('ShowPreloader'); //show preloader
            $scope.model = JSON.parse(localStorage.getItem("usercourse"));
            $scope.resetActivityBlockedStatus(); //Copies last version of activity blocked status into model variable

            // ---- Update Chat Status -----------------------------------------------
            function offlineCallback() {
                $timeout(function () {
                    $location.path("/Offline");
                }, 1000);
            }

            function getUserChatCallback() {
                //Make the pop-up appear in Chat Icon.
                console.log("POPs !!!");
                localStorage.setItem("chatRead/" + localStorage.getItem("userId"), "false"); //Turn-on chat pop-up.
            }

            function errorCallback() {
            }

            var fireService = false;
            $scope.messages = JSON.parse(localStorage.getItem('userChat'));
            if ($scope.messages && $scope.messages.length ==  0) {
                fireService = true;
            }

            if (!$rootScope.activityBlocked["1002"].disabled && fireService) { //disabled = false for Cabina de Soporte in Stage 1.
                console.log("******************************************* FIRING CHAT SERVICE STAGE 1");
                //Put Call to Remote Service.
                $scope.validateConnection(function () {

                    var currentUser = JSON.parse(localStorage.getItem('CurrentUser'));
                    var profile = JSON.parse(localStorage.getItem('Perfil/' + currentUser.userId));

                    if (!profile.strengths[0]) {
                        profile.strengths[0] = "---";
                    }

                    if (!profile.strengths[1]) {
                        profile.strengths[1] = "---";
                    }

                    if (!profile.strengths[2]) {
                        profile.strengths[2] = "---";
                    }

                    if (currentUser.gender == "Masculino") {
                        var l1 = profile.strengths.indexOf("Linguistica");
                        var l2 = profile.strengths.indexOf("Lingüística");
                        var m1 = profile.strengths.indexOf("Matematica");
                        var m2 = profile.strengths.indexOf("Matemática");

                        if (l1 > -1) {
                            profile.strengths[l1] = "Lingüístico"
                        }

                        if (l2 > -1) {
                            profile.strengths[l2] = "Lingüístico"
                        }

                        if (m1 > -1) {
                            profile.strengths[m1] = "Matemático"
                        }

                        if (m2 > -1) {
                            profile.strengths[m2] = "Matemático"
                        }

                        if (currentUser.shield == "Linguistica") {
                            currentUser.shield = "Lingüístico";
                        }

                        if (currentUser.shield == "Matematica") {
                            currentUser.shield = "Matemático";
                        }
                    }

                    if (currentUser.gender == "Femenino") {
                        var l1 = profile.strengths.indexOf("Linguistica");
                        var m1 = profile.strengths.indexOf("Matematica");

                        if (l1 > -1) {
                            profile.strengths[l1] = "Lingüística";
                        }

                        if (m1 > -1) {
                            profile.strengths[m1] = "Matemática";
                        }

                        if (currentUser.shield == "Linguistica") {
                            currentUser.shield = "Lingüística";
                        }

                        if (currentUser.shield == "Matematica") {
                            currentUser.shield = "Matemática";
                        }
                    }

                    if (currentUser.shield == "") {
                        currentUser.shield = "--";
                    }

                    var messageText = "Hola " + currentUser.firstname + ",\n\n Durante tu primer aventura te enfrentaste ";
                    messageText += "a retos que te llevaron a encontrar tus fortalezas, a conocer más de tí, descubriste lo valioso ";
                    messageText += "de contar con sueños de ser, tener y hacer. Sabemos que eres " + profile.strengths[0] + ", " + profile.strengths[1] + ", " + profile.strengths[2] + " y te ";
                    messageText += "distingues en la comunidad como " + currentUser.shield + ".\n\n";
                    messageText += "¡Hoy estas más cerca de la meta para poder lograrlo!\n\n";
                    messageText += "Compartiste tus gustos y cualidades, eso que te hace diferente a los demás ";
                    messageText += "capitanes y hallaste que en lo divertido también hay algo nuevo que descubrir.";
                    messageText += "Capitán estás a punto de terminar la zona de vuelo.\n\n";
                    messageText += "¡Sigue adelante!";

                    var newMessage = {
                        "messagetext": messageText,
                        "sendAsCouch": true
                    };

                    // time out to avoid android lag on fully hiding keyboard
                    $timeout(function () {
                        $scope.messages.push(newMessage);
                        _setLocalStorageItem('userChat', JSON.stringify($scope.messages)); //Save to LS.

                        moodleFactory.Services.PutUserChat(currentUser.userId, newMessage, getUserChatCallback, errorCallback);
                    }, 1000);

                }, offlineCallback);
            } else { console.log("Message has been written BEFORE for Stage 1 OR activity is Blocked");}
            // --------------------------------------------------------------------------------------

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
                    controller: 'OpeningStageController',
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

                moodleFactory.Services.PutAsyncFirstTimeInfo(_getItem("userId"), dataModel, function () {
                }, function () {
                });

            };

            //Load challenges images
            $scope.retosIconos = {
                "Exploración inicial": "assets/images/challenges/stage-1/img-evaluacion-inicial.svg",
                "Cuarto de recursos": "assets/images/challenges/stage-1/img-cuarto-recursos.svg",
                "Conócete": "assets/images/challenges/stage-1/img-conocete.svg",
                "Mis sueños": "assets/images/challenges/stage-1/img-mis-suenos.svg",
                "Cabina de soporte": "assets/images/challenges/stage-1/img-cabina-soporte.svg",
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

                if (_activityBlocked[activity.activity_identifier].disabled) return false;
                var url = _.filter(_activityRoutes, function (x) {
                    return x.id == activity.activity_identifier
                })[0].url;
                console.log(url);
                //Store an Index of the chosen menu item.
                _setLocalStorageJsonItem("owlIndex", parentIndex);

                if (url) {

                    if (_compareSyncDeviceVersions()) {
                        var activityId = activity.activity_identifier;
                        var timeStamp = $filter('date')(new Date(), 'MM/dd/yyyy HH:mm:ss');
                        logStartActivityAction(activityId, timeStamp);
                        $location.path(url);
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

                var challengeCompletedId = _closeChallenge($scope.idEtapa);

                _coachNotification($scope.idEtapa);

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

                _progressNotification();

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

                //console.log("show closing challengeRobot");
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
                        challengeId: 116
                    }];


                $scope.actualMessage = _.findWhere($scope.robotMessages, {read: "false", challengeId: challengeCompletedId});
                if ($scope.actualMessage) {
                    _setLocalStorageItem("challengeMessage", JSON.stringify($scope.actualMessage));
                    //console.log($scope.actualMessage);
                    $scope.openModal_CloseChallenge();
                }
            }

        }]).controller('closingStageOneChallengeController', function ($scope, $modalInstance) {
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    var challengeMessage = JSON.parse(localStorage.getItem("challengeMessage"));

    $scope.actualMessage = challengeMessage;

}).controller('closingStageController', function ($scope, $modalInstance, $location) {
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
        $location.path('/ProgramaDashboard');  //Redirect to dashboard inicio.
    };

    $scope.robotMessages = {
        title: "Cierre Zona de Vuelo",
        message: "¡Muy bien! Recuperaste todas las piezas para reparar la nave y continuar el viaje. Recuerda, los sueños son el motor principal de tu nave ¡Ahora tu aventura ya tiene un rumbo!"
    };

    $scope.navigateToDashboard = function () {
        $modalInstance.dismiss('cancel');
        $location.path('/ProgramaDashboard');
    };
    _setLocalStorageItem('robotEndStageShown', true);
});
