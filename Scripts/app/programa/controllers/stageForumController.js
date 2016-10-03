angular
    .module('incluso.stage.forumcontroller', [])
    .controller('stageForumController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$anchorScroll',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal) {
            var _loadedResources = false;
            var _pageLoaded = false;
            _httpFactory = $http;
            _timeout = $timeout;
            $scope.$emit('ShowPreloader');
            $scope.validateConnection(initController, offlineCallback);

            function offlineCallback() {
                $timeout(function () {
                    $location.path("/Offline");
                }, 1000);
            }

            function initController() {

                $scope.scrollToTop();
                var selectedDiscussionId = null;

                $scope.openModal_CloseChallenge = function (size) {
                    var modalInstance = $modal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'ClosingChallengeModal.html',
                        controller: 'closingChallengeController',
                        size: size,
                        windowClass: 'closing-stage-modal user-help-modal'
                    });
                };

                $rootScope.showFooter = true;
                $rootScope.showFooterRocks = false;
                $rootScope.showStage1Footer = false;
                $rootScope.showStage2Footer = false;
                $rootScope.showStage3Footer = false;

                $scope.model = moodleFactory.Services.GetCacheJson("usercourse");
                var CurrentUser = moodleFactory.Services.GetCacheJson("CurrentUser");
                var userId = moodleFactory.Services.GetCacheObject('userId');

                $scope.moodleId = getMoodleIdFromTreeActivity($routeParams.activityId);
                $scope.currentActivity = JSON.parse(moodleFactory.Services.GetCacheObject("forum/" + $scope.moodleId));
                getContentResources($routeParams.activityId);

                var redirectOnShield = function () {
                    var activityFromTree = getActivityByActivity_identifier($routeParams.activityId);
                    var logicForumTopicsUrl = '/ZonaDeVuelo/Conocete/ZonaDeContacto/Logicos/Topicos/' + $routeParams.activityId + '/' + activityFromTree.activities[0].coursemoduleid;
                    var artisticForumTopicsUrl = '/ZonaDeVuelo/Conocete/ZonaDeContacto/Artisticos/Topicos/' + $routeParams.activityId + '/' + activityFromTree.activities[1].coursemoduleid;

                    var shields = [
                        {name: 'Musical', category: 'artistico'},
                        {name: 'Interpersonal', category: 'artistico'},
                        {name: 'Naturalista', category: 'logico'},
                        {name: 'Intrapersonal', category: 'logico'},
                        {name: 'Corporal', category: 'artistico'},
                        {name: 'Espacial', category: 'artistico'},
                        {name: 'Matematica', category: 'logico'},
                        {name: 'Linguistica', category: 'logico'}
                    ];
                    var shield = JSON.parse(localStorage.getItem('Perfil/' + userId)).shield;
                    if (shield && shield != '') {

                        var shieldCategory = _.find(shields, function (s) {
                            return s.name.toUpperCase() == shield.toUpperCase();
                        });

                        if (shieldCategory) {

                            if (shieldCategory.category == "logico") {
                                $scope.moodleId = 147;
                                $location.path(logicForumTopicsUrl);
                            } else if (shieldCategory.category == "artistico") {
                                $scope.moodleId = 148;
                                $location.path(artisticForumTopicsUrl);
                            }
                        }
                    } else {
                        var userCurrentStage = localStorage.getItem("currentStage");
                        $location.path('/ZonaDeVuelo/Dashboard/' + userCurrentStage + '/0');
                    }
                };

                if (parseInt($routeParams.activityId) === 1049) {
                    redirectOnShield();
                }

                function getContentResources(activityIdentifierId) {
                    drupalFactory.Services.GetContent(activityIdentifierId, function (data, key) {
                        _loadedResources = true;
                        $scope.setToolbar($location.$$path, data.node.tool_bar_title);
                        $scope.backButtonText = data.node.back_button_text;
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

                function getDataAsync() {
                    $scope.moodleId != 149 ? moodleFactory.Services.GetAsyncForumDiscussions($scope.moodleId, CurrentUser.token, getForumDiscussionsCallback, function (obj) {
                        _pageLoaded = true;
                        if (_loadedResources && _pageLoaded) {
                            $scope.$emit('HidePreloader')
                        }
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
                    }, true) : '';

                    if ($scope.moodleId == 149) {
                        _pageLoaded = true;
                        if (_loadedResources && _pageLoaded) {
                            $scope.$emit('HidePreloader')
                        }
                    }
                }

                function ModifyActivityByCourseModuleId(coursemoduleid, userCourse) {
                    var matchingActivity = null;
                    var breakAll = false;
                    var numElems;

                    for (var stageIndex = 0; stageIndex < userCourse.stages.length; stageIndex++) {
                        var stage = userCourse.stages[stageIndex];
                        for (var challengeIndex = 0; challengeIndex < stage.challenges.length; challengeIndex++) {
                            var challenge = stage.challenges[challengeIndex];

                            for (var activityIndex = 0; activityIndex < challenge.activities.length; activityIndex++) {
                                var activity = challenge.activities[activityIndex];

                                if (activity.coursemoduleid == coursemoduleid) {
                                    matchingActivity = activity;

                                    //Locate the children activity by means of the coursemoduleId.
                                    var activitiesArray = activity.activities;

                                    if (activitiesArray === undefined) {
                                        numElems = 0;
                                    } else {
                                        numElems = activitiesArray.length;
                                    }

                                    var childActivityIndex;
                                    var childActivity;
                                    var childCourseModuleId;
                                    var parentCourseModuleId;

                                    if (numElems > 0) { //...Find the child subactivity...
                                        for (childActivityIndex = 0; childActivityIndex < numElems; childActivityIndex++) {
                                            childActivity = activitiesArray[childActivityIndex];
                                            childCourseModuleId = childActivity.coursemoduleid;

                                            if (childCourseModuleId === parseInt($scope.moodleId)) {
                                                if (childActivity.firsttime) {// A never accessed forum.
                                                    updateStageFirstTime(childCourseModuleId, stageIndex, challengeIndex, activityIndex, childActivityIndex);
                                                    breakAll = true;
                                                }
                                            }
                                        }
                                    } else {//Check the status of the parent Activity.
                                        parentCourseModuleId = activity.coursemoduleid;

                                        if (parentCourseModuleId === parseInt($scope.moodleId)) {
                                            if (activity.firsttime) {// A never accessed forum.
                                                updateStageFirstTime(parentCourseModuleId, stageIndex, challengeIndex, activityIndex, -1);
                                                breakAll = true;
                                            }
                                        }
                                    }

                                    breakAll = true;
                                    break;
                                }
                            }

                            if (breakAll)
                                break;
                        }
                        if (breakAll)
                            break;
                    }
                }

                //Updated stage first time flag in scope, local storage and server.
                function updateStageFirstTime(childCourseModuleId, stageIndex, challengeIndex, activityIndex, childActivityIndex) {

                    $scope.openModal_CloseChallenge();   // Show first-time robot.
                    var childActivity;

                    if (childActivityIndex == -1) {//There are no "child" activities.
                        childActivity = $scope.model.stages[stageIndex].challenges[challengeIndex].activities[activityIndex];
                    } else {
                        childActivity = $scope.model.stages[stageIndex].challenges[challengeIndex].activities[activityIndex].activities[childActivityIndex];
                    }

                    childActivity.firsttime = 0;  //Put firsttime key in children activity to 0.
                    _setLocalStorageJsonItem("usercourse", $scope.model);

                    var dataModel = {
                        activity: childCourseModuleId
                    };

                    moodleFactory.Services.PutAsyncFirstTimeInfoForForums(userId, CurrentUser.token, dataModel, function(){}, function (obj) {
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

                function getForumDiscussionsCallback(data, key) {
                    $scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("forum/" + $scope.moodleId));

                    var currentDiscussionIds = [];
                    for (var d = 0; d < data.discussions.length; d++) {
                        currentDiscussionIds.push(data.discussions[d].discussion);
                    }
                    localStorage.setItem("currentDiscussionIds", JSON.stringify(currentDiscussionIds));

                    _pageLoaded = true;
                    if (_loadedResources && _pageLoaded) {
                        $scope.$emit('HidePreloader')
                    }
                }

                getDataAsync();

                var fatherCourseModuleId;

                switch (parseInt($scope.moodleId)) {
                    case 64:
                        fatherCourseModuleId = 151;
                        break;
                    case 73:
                        fatherCourseModuleId = 73;
                        break;
                    case 147:
                        fatherCourseModuleId = 149;
                        break;
                    case 148:
                        fatherCourseModuleId = 149;
                        break;
                    case 179:
                        fatherCourseModuleId = 178;
                        break;
                    case 85:
                        fatherCourseModuleId = 197;
                        break;
                    case 93:
                        fatherCourseModuleId = 212;
                        break;
                    case 91:
                        fatherCourseModuleId = 216;
                        break;
                }

                ModifyActivityByCourseModuleId(fatherCourseModuleId, $scope.model);

                $scope.showComentarios = function (discussionId) {
                    selectedDiscussionId = discussionId;
                    $scope.validateConnection(showComentariosConnectedCallback, offlineCallback);
                };

                function showComentariosConnectedCallback() {

                    var discussionId = selectedDiscussionId;
                    var moodleId = $routeParams.moodleId;
                    !moodleId ? moodleId = getMoodleIdFromTreeActivity($routeParams.activityId) : '';

                    $timeout(function() {
                        switch (parseInt(moodleId)) {
                            case 64:
                                $location.path("/ZonaDeVuelo/Conocete/PuntoDeEncuentro/Comentarios/" + $routeParams.activityId + "/" + discussionId);
                                break;
                            case 73:
                                $location.path("/ZonaDeVuelo/MisSuenos/PuntosDeEncuentro/Comentarios/" + $routeParams.activityId + "/" + discussionId);
                                break;
                            case 147:
                                $location.path("/ZonaDeVuelo/Conocete/ZonaDeContacto/Logicos/Comentarios/" + $routeParams.activityId + "/" + discussionId + "/" + $routeParams.moodleId);
                                break;
                            case 148:
                                $location.path("/ZonaDeVuelo/Conocete/ZonaDeContacto/Artisticos/Comentarios/" + $routeParams.activityId + "/" + discussionId + "/" + $routeParams.moodleId);
                                break;
                            case 179:
                                $location.path("/ZonaDeNavegacion/Transformate/PuntoDeEncuentro/Comentarios/" + $routeParams.activityId + "/" + discussionId);
                                break;
                            case 85:
                                $location.path("/ZonaDeNavegacion/ProyectaTuVida/PuntoDeEncuentro/Comentarios/" + $routeParams.activityId + "/" + discussionId);
                                break;
                            case 93:
                                $location.path("/ZonaDeAterrizaje/EducacionFinanciera/PuntoDeEncuentro/Comentarios/" + $routeParams.activityId + "/" + discussionId);
                                break;
                            case 91:
                                $location.path("/ZonaDeAterrizaje/MapaDelEmprendedor/PuntoDeEncuentro/Comentarios/" + $routeParams.activityId + "/" + discussionId);
                                break;
                        }
                    }, 500);
                }

                $scope.back = function (size) {

                    setTimeout(function () {
                        var modalInstance = $modal.open({
                            animation: $scope.animationsEnabled,
                            templateUrl: 'tutorialModal.html',
                            controller: 'tutorialController',
                            size: size,
                            windowClass: 'user-help-modal'
                        });
                    }, 1000);

                    switch (Number($routeParams.activityId)) {
                        case 1010:
                            $location.path('/ZonaDeVuelo/Dashboard/1/' + 2);
                            break;
                        case 1008:
                            $location.path('/ZonaDeVuelo/Dashboard/1/' + 3);
                            break;
                        case 1049:
                            $location.path('/ZonaDeVuelo/Dashboard/1/' + 2);
                            break;
                        case 2030:
                            $location.path("/ZonaDeNavegacion/Dashboard/2/" + 2);
                            break;
                        case 2026:
                            $location.path("/ZonaDeNavegacion/Dashboard/2/" + 4);
                            break;
                        case 3304:
                            $location.path("/ZonaDeAterrizaje/Dashboard/3/" + 2);
                            break;
                        case 3404:
                            $location.path("/ZonaDeAterrizaje/Dashboard/3/" + 3);
                            break;
                        default:
                            $location.path('/ProgramaDashboard');
                            break;
                    }

                };


            }

        }]).
controller('closingChallengeController', ['$scope', '$modalInstance', '$routeParams', function ($scope, $modalInstance, $routeParams) {
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    drupalFactory.Services.GetContent("1049147", function (data, key) {

        if (data.node != null) {
            $scope.title = data.node.titulo;
            $scope.instructions = data.node.mensaje;
        }
    }, function (obj) {
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
                            }, false);

    var challengeMessage = JSON.parse(localStorage.getItem("challengeMessage"));

}]).controller('tutorialController', ['$scope', '$modalInstance',function ($scope, $modalInstance) {
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);